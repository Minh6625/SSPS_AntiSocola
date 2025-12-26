'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/StudentLayout';
import DocumentUpload from '@/components/DocumentUpload';
import { documentService, DocumentResponse } from '@/services/documentService';
import { systemSettingsService } from '@/services/systemSettingsService';

export default function PrintDocumentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [allDocuments, setAllDocuments] = useState<DocumentResponse[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [filterFileType, setFilterFileType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sizeMin, setSizeMin] = useState(''); // MB
  const [sizeMax, setSizeMax] = useState(''); // MB
  const [sortBy, setSortBy] = useState('Mặc định');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([]);

  // Load allowed file extensions from SystemConfig
  useEffect(() => {
    const loadAllowedExtensions = async () => {
      try {
        const settings = await systemSettingsService.getAllSettings();
        const allowedExts = settings.configs['allowed_file_extensions']?.configValue || 'pdf,docx,pptx,xlsx';
        setAllowedExtensions(allowedExts.toLowerCase().split(',').map((ext: string) => ext.trim()));
      } catch (error) {
        console.error('Failed to load allowed extensions:', error);
        setAllowedExtensions(['pdf', 'docx', 'pptx', 'xlsx']); // Fallback
      }
    };
    loadAllowedExtensions();
  }, []);

  // Check if document extension is allowed
  const isDocumentAllowed = (doc: DocumentResponse): boolean => {
    if (allowedExtensions.length === 0) return true; // Not loaded yet
    return allowedExtensions.includes(doc.fileExtension?.toLowerCase() || '');
  };

  // Fetch documents khi user click tab hoặc change filter
  const loadDocuments = async (page: number = 0) => {
    setIsLoadingDocs(true);
    try {
      const response = await documentService.getDocuments(
        page,
        10,
        filterFileType || undefined,
        searchTerm || undefined
      );
      setAllDocuments(response.content);
      applyFilters(response.content);
      setTotalPages(response.totalPages);
      setCurrentPage(response.currentPage);
    } catch (error) {
      alert(`Lỗi tải tài liệu: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const applyFilters = useCallback((source: DocumentResponse[]) => {
    const minKB = sizeMin ? Number(sizeMin) * 1024 : null;
    const maxKB = sizeMax ? Number(sizeMax) * 1024 : null;
    const fromKey = dateFrom ? dateFrom : null; // yyyy-MM-dd
    const toKey = dateTo ? dateTo : null; // yyyy-MM-dd

    let filtered = source.filter((doc) => {
      const uploadKey = doc.uploadDate?.substring(0, 10); // yyyy-MM-dd
      if (fromKey && uploadKey < fromKey) return false;
      if (toKey && uploadKey > toKey) return false;
      if (minKB !== null && doc.fileSizeKB < minKB) return false;
      if (maxKB !== null && doc.fileSizeKB > maxKB) return false;
      if (filterFileType && doc.fileExtension?.toUpperCase() !== filterFileType.toUpperCase()) return false;
      if (searchTerm && !doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    // Apply sorting
    if (sortBy === 'Ngày mới nhất') {
      filtered = filtered.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    } else if (sortBy === 'Ngày cũ nhất') {
      filtered = filtered.sort((a, b) => new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime());
    } else if (sortBy === 'Kích thước lớn nhất') {
      filtered = filtered.sort((a, b) => b.fileSizeKB - a.fileSizeKB);
    } else if (sortBy === 'Kích thước nhỏ nhất') {
      filtered = filtered.sort((a, b) => a.fileSizeKB - b.fileSizeKB);
    } else if (sortBy === 'Tên file (A-Z)') {
      filtered = filtered.sort((a, b) => a.fileName.localeCompare(b.fileName));
    }

    setDocuments(filtered);
  }, [dateFrom, dateTo, sizeMin, sizeMax, filterFileType, searchTerm, sortBy]);

  const handleUploadSuccess = () => {
    // Load lại danh sách tài liệu sau khi upload thành công
    setActiveTab('list');
    setTimeout(() => loadDocuments(0), 500);
  };

  const handleDownload = async (documentId: number) => {
    try {
      await documentService.downloadDocument(documentId);
    } catch (error) {
      alert(`Lỗi tải file: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  };

  const handleTabChange = (tab: 'upload' | 'list') => {
    setActiveTab(tab);
    if (tab === 'list' && documents.length === 0) {
      loadDocuments(0);
    }
  };

  // Toggle chọn/bỏ chọn document (only if allowed)
  const toggleSelectDocument = (documentId: number) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc && !isDocumentAllowed(doc)) {
      alert(`File ${doc.fileExtension?.toUpperCase()} không còn được phép in. Các loại được phép: ${allowedExtensions.join(', ').toUpperCase()}`);
      return;
    }
    
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  // Chọn/bỏ chọn tất cả (only allowed documents)
  const toggleSelectAll = () => {
    const allowedDocs = documents.filter(doc => isDocumentAllowed(doc));
    if (selectedDocuments.length === allowedDocs.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(allowedDocs.map(doc => doc.id));
    }
  };

  // In nhiều tài liệu
  const handlePrintSelected = () => {
    if (selectedDocuments.length === 0) {
      alert('Vui lòng chọn ít nhất 1 tài liệu');
      return;
    }
    // Chuyển sang trang chọn máy in với documentIds
    router.push(`/student/printers?documentIds=${selectedDocuments.join(',')}`);
  };

  // Auto reload when filters change (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDocuments(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterFileType, searchTerm]);

  // Apply client-side filters for date/size/sort when those change
  useEffect(() => {
    applyFilters(allDocuments);
  }, [allDocuments, applyFilters]);

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                In Tài Liệu
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Tải lên và quản lý tài liệu của bạn</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
            <button
              onClick={() => handleTabChange('upload')}
              className={`flex-1 py-3 px-6 text-sm font-medium transition ${
                activeTab === 'upload'
                  ? 'text-blue-600 border-b-2 border-blue-500 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tải Tài Liệu Lên
            </button>
            <button
              onClick={() => handleTabChange('list')}
              className={`flex-1 py-3 px-6 text-sm font-medium transition ${
                activeTab === 'list'
                  ? 'text-blue-600 border-b-2 border-blue-500 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Danh Sách Tài Liệu
            </button>
          </div>

          {/* Content */}
          <div className="p-6 bg-gradient-to-br from-gray-50/30 via-white to-blue-50/20">
            {/* Tab: Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <DocumentUpload
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={(error) => console.error('Upload error:', error)}
                />

                {/* Info Box */}
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">Lưu ý nhanh</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Hỗ trợ: PDF, DOCX, PPTX, XLSX. Tối đa 50MB.</li>
                    <li>Sau khi tải lên, chọn tab Danh sách để tải xuống hoặc gửi in.</li>
                    <li>Giữ tên file ngắn gọn, dễ nhớ để tìm kiếm nhanh.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab: List */}
            {activeTab === 'list' && (
              <div className="space-y-4">
                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900">Danh Sách Tài Liệu</h2>

                {/* Filters Container with border and background */}
                <div className="border border-blue-200 bg-blue-50/30 rounded-lg p-4 space-y-3">
                  {/* Filters Row 1: Tìm kiếm + Sắp xếp + Loại file */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="8"/>
                          <path d="m21 21-4.35-4.35"/>
                        </svg>
                        Tìm kiếm tài liệu
                      </label>
                      <input
                        type="text"
                        placeholder="Nhập tên file cần tìm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 6h18M7 12h10M10 18h4"/>
                        </svg>
                        Sắp xếp theo
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                      >
                        <option value="Mặc định">Mặc định</option>
                        <option value="Ngày mới nhất">Ngày mới nhất</option>
                        <option value="Ngày cũ nhất">Ngày cũ nhất</option>
                        <option value="Kích thước lớn nhất">Kích thước lớn nhất</option>
                        <option value="Kích thước nhỏ nhất">Kích thước nhỏ nhất</option>
                        <option value="Tên file (A-Z)">Tên file (A-Z)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700">Loại file</label>
                      <select
                        value={filterFileType}
                        onChange={(e) => setFilterFileType(e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                      >
                        <option value="">Tất cả</option>
                        <option value="PDF">PDF</option>
                        <option value="DOCX">DOCX</option>
                        <option value="XLSX">XLSX</option>
                        <option value="PPTX">PPTX</option>
                      </select>
                    </div>
                  </div>

                  {/* Filters Row 2: Từ ngày + Đến ngày + Min + Max */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Từ ngày
                      </label>
                      <input
                        type="text"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Đến ngày
                      </label>
                      <input
                        type="text"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700">Dung lượng tối thiểu (MB)</label>
                      <input
                        type="number"
                        min="0"
                        value={sizeMin}
                        onChange={(e) => setSizeMin(e.target.value)}
                        placeholder="0"
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-gray-700">Dung lượng tối đa (MB)</label>
                      <input
                        type="number"
                        min="0"
                        value={sizeMax}
                        onChange={(e) => setSizeMax(e.target.value)}
                        placeholder="50"
                        className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons and Info Bar */}
                {!isLoadingDocs && documents.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Hiển thị <span className="font-semibold">{documents.length}/{allDocuments.length}</span> tài liệu
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        <span className="font-semibold">{selectedDocuments.length}</span> đã chọn
                      </span>
                      <button
                        onClick={() => {
                          if (selectedDocuments.length === 0) {
                            alert('Vui lòng chọn ít nhất 1 tài liệu');
                            return;
                          }
                          selectedDocuments.forEach(id => handleDownload(id));
                        }}
                        disabled={selectedDocuments.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17"/>
                        </svg>
                        Tải về
                      </button>
                      <button
                        onClick={handlePrintSelected}
                        disabled={selectedDocuments.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        In {selectedDocuments.length > 0 && `${selectedDocuments.length} `}tài liệu
                      </button>
                      <button
                        onClick={() => {
                          if (selectedDocuments.length === 0) {
                            alert('Vui lòng chọn ít nhất 1 tài liệu');
                            return;
                          }
                          if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedDocuments.length} tài liệu?`)) return;
                          
                          Promise.all(selectedDocuments.map(id => 
                            documentService.deleteDocument(id)
                          ))
                          .then(() => {
                            alert('Xóa tài liệu thành công');
                            setSelectedDocuments([]);
                            loadDocuments(currentPage);
                          })
                          .catch(error => {
                            alert(`Lỗi xóa tài liệu: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
                          });
                        }}
                        disabled={selectedDocuments.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Xóa
                      </button>
                    </div>
                  </div>
                )}

                {/* Documents Table */}
                {isLoadingDocs ? (
                  <div className="flex justify-center py-12">
                    <p className="text-gray-600">Đang tải tài liệu...</p>
                  </div>
                ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 text-lg font-medium">Chưa có tài liệu</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Tải lên tài liệu đầu tiên để bắt đầu.
                      </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-center w-12">
                            <input
                              type="checkbox"
                              checked={documents.filter(doc => isDocumentAllowed(doc)).length > 0 && 
                                       selectedDocuments.length === documents.filter(doc => isDocumentAllowed(doc)).length}
                              onChange={toggleSelectAll}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">
                            TÊN FILE
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">
                            LOẠI
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">
                            KÍCH THƯỚC
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">
                            SỐ TRANG
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase text-xs">
                            NGÀY
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {documents.map((doc) => {
                          const isAllowed = isDocumentAllowed(doc);
                          const isSelected = selectedDocuments.includes(doc.id);
                          
                          return (
                          <tr 
                            key={doc.id} 
                            className={`border-b border-gray-100 transition ${
                              isAllowed ? 'hover:bg-gray-50' : 'bg-gray-100 opacity-60'
                            }`}
                          >
                            <td className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectDocument(doc.id)}
                                disabled={!isAllowed}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${isAllowed ? 'text-gray-900' : 'text-gray-500'}`} title={doc.fileName}>
                                  {doc.fileName || 'Không tên'}
                                </span>
                                {!isAllowed && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd"/>
                                    </svg>
                                    Không cho phép
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-block px-2.5 py-1 rounded text-xs font-semibold uppercase ${
                                  doc.fileExtension?.toUpperCase() === 'PDF'
                                    ? 'bg-red-100 text-red-700'
                                    : doc.fileExtension?.toUpperCase() === 'DOCX'
                                    ? 'bg-blue-100 text-blue-700'
                                    : doc.fileExtension?.toUpperCase() === 'XLSX'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}
                              >
                                {doc.fileExtension || '--'}
                              </span>
                            </td>
                            <td className={`px-4 py-3 ${isAllowed ? 'text-gray-700' : 'text-gray-500'}`}>
                              {doc.fileSizeKB < 1024
                                ? `${doc.fileSizeKB.toFixed(1)} KB`
                                : `${(doc.fileSizeKB / 1024).toFixed(1)} KB`}
                            </td>
                            <td className={`px-4 py-3 ${isAllowed ? 'text-gray-700' : 'text-gray-500'}`}>
                              {doc.totalPages ? `${doc.totalPages} trang` : '--'}
                            </td>
                            <td className={`px-4 py-3 ${isAllowed ? 'text-gray-700' : 'text-gray-500'}`}>
                              {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('en-GB').replace(/\//g, '/') : '--'}
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => loadDocuments(Math.max(0, currentPage - 1))}
                      disabled={currentPage === 0}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      ← Trước
                    </button>
                    <span className="flex items-center px-4">
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => loadDocuments(Math.min(totalPages - 1, currentPage + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sau →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
