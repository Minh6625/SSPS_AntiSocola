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
  const printerId = searchParams.get('printerId');

  // Data
  const [document, setDocument] = useState<DocumentResponse | null>(null);
  const [printer, setPrinter] = useState<Printer | null>(null);
  const [pageBalance, setPageBalance] = useState<PageBalance | null>(null);

  // Configuration
  const [paperSize, setPaperSize] = useState<'A4' | 'A3'>('A4');
  const [pageRangeType, setPageRangeType] = useState<'all' | 'custom'>('all');
  const [pageRangeInput, setPageRangeInput] = useState('');
  const [duplex, setDuplex] = useState(true);
  const [copies, setCopies] = useState(1);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pageRangeError, setPageRangeError] = useState<string | null>(null);

  // Load document, printer, and balance
  useEffect(() => {
    const loadData = async () => {
      if (!documentId || !printerId) {
        setError('Thiếu thông tin tài liệu hoặc máy in');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load document
        const docResponse = await documentService.getDocumentById(parseInt(documentId));
        setDocument(docResponse);

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
  }, [documentId, printerId]);

  // Calculate pages in real-time
  const calculation = useCallback(() => {
    if (!document) return { totalPages: 0, pagesA4Equivalent: 0, balanceBefore: 0, balanceAfter: 0, hasEnoughBalance: false };

    const documentPages = document.totalPages || 10; // Assume 10 if not available
    const pageRange = pageRangeType === 'custom' ? pageRangeInput : undefined;
    
    const pagesA4Equivalent = printJobService.calculatePages(
      documentPages,
      paperSize,
      duplex,
      copies,
      pageRange
    );

    const balanceBefore = pageBalance?.totalA4Equivalent
      ?? (pageBalance ? pageBalance.a4 + pageBalance.a3 * 2 : 0);
    const balanceAfter = balanceBefore - pagesA4Equivalent;
    const hasEnoughBalance = balanceAfter >= 0;

    return {
      totalPages: documentPages,
      pagesA4Equivalent,
      balanceBefore,
      balanceAfter,
      hasEnoughBalance,
    };
  }, [document, paperSize, pageRangeType, pageRangeInput, duplex, copies, pageBalance]);

  const calc = calculation();

  // Validate page range
  useEffect(() => {
    if (pageRangeType === 'custom' && pageRangeInput) {
      const validation = printJobService.validatePageRange(pageRangeInput, document?.totalPages || 100);
      setPageRangeError(validation.valid ? null : validation.error || null);
    } else {
      setPageRangeError(null);
    }
  }, [pageRangeInput, pageRangeType, document]);

  // Submit print job
  const handleSubmit = async () => {
    if (!documentId || !printerId || !document) {
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
      await printJobService.submitPrintJob({
        documentId: parseInt(documentId),
        printerId: printerId,
        paperSize,
        pageRange: pageRangeType === 'custom' ? pageRangeInput : undefined,
        duplex,
        copies,
      });

      alert('Gửi lệnh in thành công!');
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

  if (error || !document || !printer) {
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
              <h3 className="font-semibold text-gray-800 mb-3">Tài liệu</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{document.originalFileName}</p>
                  <p className="text-sm text-gray-500">
                    {document.fileExtension} • {(document.fileSizeKB / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
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
                  <div className="ml-6">
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
