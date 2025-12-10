'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StudentLayout from '@/components/StudentLayout';
import { documentService } from '@/services/documentService';
import { printerService } from '@/services/printerService';
import { printJobService } from '@/services/printJobService';
import { Printer } from '@/types/printer';
import { DocumentResponse } from '@/services/documentService';
import { PageBalance } from '@/types/printJob';

export default function PrintConfigurePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');
  const documentIds = searchParams.get('documentIds');
  const printerId = searchParams.get('printerId');

  // Data
  const [document, setDocument] = useState<DocumentResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [printer, setPrinter] = useState<Printer | null>(null);
  const [pageBalance, setPageBalance] = useState<PageBalance | null>(null);

  // Configuration
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4');
  const [pageRangeType, setPageRangeType] = useState<'all' | 'custom'>('all');
  const [pageRangeInput, setPageRangeInput] = useState('');
  const [documentPageRanges, setDocumentPageRanges] = useState<{[key: number]: string}>({});
  const [duplex, setDuplex] = useState(true);
  const [colorMode, setColorMode] = useState<'bw' | 'color' | 'partial'>('bw');
  const [colorPageRange, setColorPageRange] = useState('');
  const [documentColorRanges, setDocumentColorRanges] = useState<{[key: number]: string}>({});
  const [copies, setCopies] = useState(1);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageRangeError, setPageRangeError] = useState<string | null>(null);

  // Load document, printer, and balance
  useEffect(() => {
    const loadData = async () => {
      if ((!documentId && !documentIds) || !printerId) {
        setError('Thiếu thông tin tài liệu hoặc máy in');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load document(s)
        if (documentIds) {
          // Multiple documents
          const ids = documentIds.split(',').map(id => parseInt(id.trim()));
          const docPromises = ids.map(id => documentService.getDocumentById(id));
          const docsResponse = await Promise.all(docPromises);
          setDocuments(docsResponse);
          setDocument(null);
          
          // Initialize page ranges for each document
          const initialRanges: {[key: number]: string} = {};
          const initialColorRanges: {[key: number]: string} = {};
          docsResponse.forEach(doc => {
            initialRanges[doc.id] = '';
            initialColorRanges[doc.id] = '';
          });
          setDocumentPageRanges(initialRanges);
          setDocumentColorRanges(initialColorRanges);
        } else if (documentId) {
          // Single document
          const docResponse = await documentService.getDocumentById(parseInt(documentId));
          console.log('[DEBUG] Document response:', docResponse);
          console.log('[DEBUG] fileSizeKB value:', docResponse?.fileSizeKB);
          console.log('[DEBUG] fileSizeKB type:', typeof docResponse?.fileSizeKB);
          setDocument(docResponse);
          setDocuments([]);
        }

        // Load printer by id
        const printerResponse = await printerService.getPrinterById(printerId);
        setPrinter(printerResponse);

        // Load page balance
        const balanceResponse = await printJobService.getPageBalance();
        setPageBalance(balanceResponse);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [documentId, documentIds, printerId]);

  // Calculate pages in real-time
  const calculation = useCallback(() => {
    const allDocs = documents.length > 0 ? documents : (document ? [document] : []);
    if (allDocs.length === 0) return { totalPages: 0, pagesA4Equivalent: 0, balanceBefore: 0, balanceAfter: 0, hasEnoughBalance: false };

    let totalPagesA4Equivalent = 0;
    let totalDocumentPages = 0;

    allDocs.forEach(doc => {
      const documentPages = doc.totalPages || 10;
      totalDocumentPages += documentPages;
      
      // Use individual page range for each document if available
      const pageRange = pageRangeType === 'custom' 
        ? (documents.length > 1 ? documentPageRanges[doc.id] : pageRangeInput)
        : undefined;
      
      const pagesA4Equivalent = printJobService.calculatePages(
        documentPages,
        paperSize,
        duplex,
        copies,
        pageRange || undefined
      );
      totalPagesA4Equivalent += pagesA4Equivalent;
    });

    const balanceBefore = pageBalance?.totalA4Equivalent
      ?? (pageBalance ? pageBalance.a4 + pageBalance.a3 * 2 : 0);
    const balanceAfter = balanceBefore - totalPagesA4Equivalent;
    const hasEnoughBalance = balanceAfter >= 0;

    return {
      totalPages: totalDocumentPages,
      pagesA4Equivalent: totalPagesA4Equivalent,
      balanceBefore,
      balanceAfter,
      hasEnoughBalance,
    };
  }, [document, documents, paperSize, pageRangeType, pageRangeInput, documentPageRanges, duplex, copies, pageBalance]);

  const calc = calculation();

  // Validate page range
  useEffect(() => {
    if (pageRangeType === 'custom') {
      if (documents.length > 1) {
        // Validate each document's page range
        let hasError = false;
        documents.forEach(doc => {
          const range = documentPageRanges[doc.id];
          if (range && range.trim()) {
            const validation = printJobService.validatePageRange(range, doc.totalPages || 100);
            if (!validation.valid) {
              hasError = true;
            }
          }
        });
        setPageRangeError(hasError ? 'Một hoặc nhiều range không hợp lệ' : null);
      } else if (pageRangeInput) {
        // Single document
        const allDocs = document ? [document] : [];
        const maxPages = allDocs.length > 0 ? (allDocs[0].totalPages || 100) : 100;
        const validation = printJobService.validatePageRange(pageRangeInput, maxPages);
        setPageRangeError(validation.valid ? null : validation.error || null);
      } else {
        setPageRangeError(null);
      }
    } else {
      setPageRangeError(null);
    }
  }, [pageRangeInput, documentPageRanges, pageRangeType, document, documents]);

  // Submit print job
  const handleSubmit = async () => {
    const allDocs = documents.length > 0 ? documents : (document ? [document] : []);
    if (allDocs.length === 0 || !printerId) {
      alert('Thiếu thông tin');
      return;
    }

    if (!calc.hasEnoughBalance) {
      alert('Số dư trang không đủ. Vui lòng mua thêm trang.');
      return;
    }

    if (pageRangeError) {
      alert('Vui lòng kiểm tra lại trang cần in');
      return;
    }

    setSubmitting(true);
    try {
      // Submit print job for each document
      const promises = allDocs.map(doc => {
        // Use individual page range for each document if available
        const pageRange = pageRangeType === 'custom'
          ? (documents.length > 1 ? documentPageRanges[doc.id] : pageRangeInput)
          : undefined;
        
        // Determine color mode and color page range
        let finalColorMode: 'BW' | 'COLOR' = 'BW';
        let finalColorPageRange: string | undefined = undefined;
        
        if (colorMode === 'color') {
          finalColorMode = 'COLOR';
        } else if (colorMode === 'partial') {
          finalColorMode = 'BW'; // Base mode is BW
          finalColorPageRange = documents.length > 1 
            ? documentColorRanges[doc.id] 
            : colorPageRange;
        }
        
        return printJobService.submitPrintJob({
          documentId: doc.id,
          printerId: printerId,
          paperSize,
          pageRange: pageRange || undefined,
          duplex,
          copies,
          colorMode: finalColorMode,
          colorPageRange: finalColorPageRange || undefined,
        });
      });

      await Promise.all(promises);

      alert(`Gửi lệnh in thành công cho ${allDocs.length} tài liệu!`);
      router.push('/student/print-history');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gửi lệnh in thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error || (!document && documents.length === 0) || !printer) {
    return (
      <StudentLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error || 'Không tìm thấy thông tin'}
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Quay lại
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Wizard Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {/* Step 1 */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Chọn tài liệu</span>
              </div>

              <div className="w-12 h-0.5 bg-green-500"></div>

              {/* Step 2 */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">Chọn máy in</span>
              </div>

              <div className="w-12 h-0.5 bg-blue-500"></div>

              {/* Step 3 */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">Cấu hình</span>
              </div>

              <div className="w-12 h-0.5 bg-gray-300"></div>

              {/* Step 4 */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Xác nhận</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                {documents.length > 0 ? `Tài liệu (${documents.length})` : 'Tài liệu'}
              </h3>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div key={doc.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{doc.originalFileName || doc.fileName}</p>
                        <p className="text-xs text-gray-500">
                          {doc.fileExtension} • {doc.fileSizeKB ? (doc.fileSizeKB / 1024).toFixed(2) : '0.00'} MB • {doc.totalPages || 10} trang
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : document ? (
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{document.originalFileName}</p>
                    <p className="text-sm text-gray-500">
                      {document.fileExtension} • {document.fileSizeKB ? (document.fileSizeKB / 1024).toFixed(2) : '0.00'} MB
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Printer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Máy in</h3>
                <button
                  onClick={() => router.push(`/student/printers?documentId=${documentId}`)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Đổi máy in
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{printer.printerName}</p>
                  <p className="text-sm text-gray-500">
                    {printer.campus} - {printer.building} - {printer.roomNumber}
                  </p>
                </div>
              </div>
            </div>

            {/* Paper Size */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Khổ giấy</h3>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paperSize"
                    value="A4"
                    checked={paperSize === 'A4'}
                    onChange={() => setPaperSize('A4')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">A4 (210 × 297 mm)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paperSize"
                    value="A3"
                    checked={paperSize === 'A3'}
                    onChange={() => setPaperSize('A3')}
                    className="w-4 h-4 text-blue-600"
                    disabled={!printer.paperSizes?.includes('A3')}
                  />
                  <span className={printer.paperSizes?.includes('A3') ? 'text-gray-700' : 'text-gray-400'}>
                    A3 (297 × 420 mm)
                  </span>
                </label>
              </div>
            </div>

            {/* Page Range */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Trang cần in</h3>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pageRange"
                    checked={pageRangeType === 'all'}
                    onChange={() => setPageRangeType('all')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Tất cả trang</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pageRange"
                    checked={pageRangeType === 'custom'}
                    onChange={() => setPageRangeType('custom')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">Tùy chọn</span>
                </label>
                {pageRangeType === 'custom' && (
                  <div className="ml-6 space-y-3">
                    {documents.length > 1 ? (
                      // Multiple documents - show input for each
                      <div className="space-y-3">
                        <p className="text-sm text-blue-600 font-medium">
                          Nhập trang cần in cho từng file:
                        </p>
                        {documents.map((doc, index) => {
                          const range = documentPageRanges[doc.id] || '';
                          const validation = range && range.trim() 
                            ? printJobService.validatePageRange(range, doc.totalPages || 100)
                            : { valid: true };
                          
                          return (
                            <div key={doc.id} className="border-l-2 border-blue-300 pl-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {index + 1}. {doc.originalFileName || doc.fileName}
                                <span className="text-gray-500 ml-2">({doc.totalPages || 10} trang)</span>
                              </label>
                              <input
                                type="text"
                                value={range}
                                onChange={(e) => setDocumentPageRanges({
                                  ...documentPageRanges,
                                  [doc.id]: e.target.value
                                })}
                                placeholder={`VD: 1-${doc.totalPages || 10}`}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  !validation.valid ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {!validation.valid && (
                                <p className="text-xs text-red-600 mt-1">{validation.error}</p>
                              )}
                              {!range && (
                                <p className="text-xs text-gray-500 mt-1">Để trống = in tất cả trang</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Single document - single input
                      <div>
                        <input
                          type="text"
                          value={pageRangeInput}
                          onChange={(e) => setPageRangeInput(e.target.value)}
                          placeholder="VD: 1-5,10,15-20"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            pageRangeError ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {pageRangeError && (
                          <p className="text-sm text-red-600 mt-1">{pageRangeError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Nhập các trang cách nhau bởi dấu phẩy. VD: 1-5,10,15-20
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Duplex */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">In 2 mặt</h3>
                  <p className="text-sm text-gray-500">Tiết kiệm giấy và chi phí</p>
                </div>
                <label className="relative inline-block w-12 h-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={duplex}
                    onChange={(e) => setDuplex(e.target.checked)}
                    disabled={!printer.duplexPrinting}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 peer-disabled:opacity-50 transition"></div>
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full peer-checked:translate-x-6 transition"></div>
                </label>
              </div>
            </div>

            {/* Color Printing */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Màu sắc</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={colorMode === 'bw'}
                    onChange={() => setColorMode('bw')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700">
                    <span className="font-medium">Đen trắng</span>
                    <span className="text-sm text-gray-500 ml-2">(Tất cả trang)</span>
                  </span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={colorMode === 'color'}
                    onChange={() => setColorMode('color')}
                    disabled={!printer.colorPrinting}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className={printer.colorPrinting ? 'text-gray-700' : 'text-gray-400'}>
                    <span className="font-medium">Màu</span>
                    <span className="text-sm text-gray-500 ml-2">(Tất cả trang)</span>
                    {!printer.colorPrinting && <span className="text-xs text-red-500 ml-2">(Không hỗ trợ)</span>}
                  </span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="colorMode"
                    checked={colorMode === 'partial'}
                    onChange={() => setColorMode('partial')}
                    disabled={!printer.colorPrinting}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className={printer.colorPrinting ? 'text-gray-700' : 'text-gray-400'}>
                    <span className="font-medium">Màu cho một số trang</span>
                    {!printer.colorPrinting && <span className="text-xs text-red-500 ml-2">(Không hỗ trợ)</span>}
                  </span>
                </label>
                
                {colorMode === 'partial' && (
                  <div className="ml-6 space-y-3">
                    {documents.length > 1 ? (
                      // Multiple documents
                      <div className="space-y-3">
                        <p className="text-sm text-blue-600 font-medium">
                          Nhập trang cần in màu cho từng file:
                        </p>
                        {documents.map((doc, index) => {
                          const range = documentColorRanges[doc.id] || '';
                          const validation = range && range.trim() 
                            ? printJobService.validatePageRange(range, doc.totalPages || 100)
                            : { valid: true };
                          
                          return (
                            <div key={doc.id} className="border-l-2 border-blue-300 pl-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                {index + 1}. {doc.originalFileName || doc.fileName}
                                <span className="text-gray-500 ml-2">({doc.totalPages || 10} trang)</span>
                              </label>
                              <input
                                type="text"
                                value={range}
                                onChange={(e) => setDocumentColorRanges({
                                  ...documentColorRanges,
                                  [doc.id]: e.target.value
                                })}
                                placeholder={`VD: 1,3-5 (để trống = không in màu)`}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                  !validation.valid ? 'border-red-500' : 'border-gray-300'
                                }`}
                              />
                              {!validation.valid && (
                                <p className="text-xs text-red-600 mt-1">{validation.error}</p>
                              )}
                              {!range && (
                                <p className="text-xs text-gray-500 mt-1">Để trống = tất cả trang đen trắng</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Single document
                      <div>
                        <input
                          type="text"
                          value={colorPageRange}
                          onChange={(e) => setColorPageRange(e.target.value)}
                          placeholder="VD: 1,3-5,10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Nhập các trang cần in màu. Các trang khác sẽ in đen trắng.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {(colorMode === 'color' || colorMode === 'partial') && printer.colorPrinting && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ In màu tiêu tốn nhiều mực hơn
                  </div>
                )}
              </div>
            </div>

            {/* Copies */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Số bản copy</h3>
              <input
                type="number"
                min="1"
                max="10"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Tối đa 10 bản</p>
            </div>
          </div>

          {/* Right: Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-sm border border-blue-200 p-6 sticky top-6">
              <h3 className="font-semibold text-gray-800 mb-4">Tổng quan</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Tổng số trang</p>
                  <p className="text-2xl font-bold text-gray-800">{calc.totalPages} trang</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Trang A4 tương đương</p>
                  <p className="text-2xl font-bold text-blue-600">{calc.pagesA4Equivalent} trang</p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">Số dư hiện tại</p>
                  <p className="text-xl font-semibold text-gray-800">{calc.balanceBefore} trang A4</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Số dư sau khi in</p>
                  <p className={`text-xl font-semibold ${calc.hasEnoughBalance ? 'text-green-600' : 'text-red-600'}`}>
                    {calc.balanceAfter} trang A4
                  </p>
                </div>

                {!calc.hasEnoughBalance && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    ⚠️ Số dư không đủ. Vui lòng{' '}
                    <a href="/student/page-balance" className="font-semibold underline">
                      mua thêm trang
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={!calc.hasEnoughBalance || submitting || !!pageRangeError}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    calc.hasEnoughBalance && !submitting && !pageRangeError
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submitting ? 'Đang gửi...' : 'Xác nhận in'}
                </button>
                <button
                  onClick={() => router.back()}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
