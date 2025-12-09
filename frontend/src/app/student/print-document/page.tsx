'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/StudentLayout';
import DocumentUpload from '@/components/DocumentUpload';
import { documentService, DocumentResponse } from '@/services/documentService';

export default function PrintDocumentPage() {
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

  const applyFilters = (source: DocumentResponse[]) => {
    const minKB = sizeMin ? Number(sizeMin) * 1024 : null;
    const maxKB = sizeMax ? Number(sizeMax) * 1024 : null;
    const fromKey = dateFrom ? dateFrom : null; // yyyy-MM-dd
    const toKey = dateTo ? dateTo : null; // yyyy-MM-dd

    const filtered = source.filter((doc) => {
      const uploadKey = doc.uploadDate?.substring(0, 10); // yyyy-MM-dd
      if (fromKey && uploadKey < fromKey) return false;
      if (toKey && uploadKey > toKey) return false;
      if (minKB !== null && doc.fileSizeKB < minKB) return false;
      if (maxKB !== null && doc.fileSizeKB > maxKB) return false;
      if (filterFileType && doc.fileExtension?.toUpperCase() !== filterFileType.toUpperCase()) return false;
      if (searchTerm && !doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

    setDocuments(filtered);
  };

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

  const handleDelete = async (documentId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;

    try {
      await documentService.deleteDocument(documentId);
      alert('Xóa tài liệu thành công');
      loadDocuments(currentPage);
    } catch (error) {
      alert(`Lỗi xóa tài liệu: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
    }
  };

  const handleTabChange = (tab: 'upload' | 'list') => {
    setActiveTab(tab);
    if (tab === 'list' && documents.length === 0) {
      loadDocuments(0);
    }
  };

  // Auto reload when filters change (debounced for search)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDocuments(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [filterFileType, searchTerm]);

  // Apply client-side filters for date/size when those change
  useEffect(() => {
    applyFilters(allDocuments);
  }, [dateFrom, dateTo, sizeMin, sizeMax]);

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-gray-900">In Tài Liệu</h1>
          
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 bg-gray-50/60">
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
          <div className="p-6 bg-white">
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
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{isLoadingDocs ? 'Đang tải dữ liệu...' : `Hiển thị ${documents.length}/${allDocuments.length}`}</span>
                </div>
                {/* Filters */}
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Tìm kiếm</label>
                    <input
                      type="text"
                      placeholder="Nhập tên file..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Loại file</label>
                    <select
                      value={filterFileType}
                      onChange={(e) => setFilterFileType(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Tất cả</option>
                      <option value="PDF">PDF</option>
                      <option value="DOCX">DOCX</option>
                      <option value="XLSX">XLSX</option>
                      <option value="PPTX">PPTX</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Từ ngày</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Đến ngày</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Dung lượng tối thiểu (MB)</label>
                    <input
                      type="number"
                      min="0"
                      value={sizeMin}
                      onChange={(e) => setSizeMin(e.target.value)}
                      placeholder="vd: 0"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Dung lượng tối đa (MB)</label>
                    <input
                      type="number"
                      min="0"
                      value={sizeMax}
                      onChange={(e) => setSizeMax(e.target.value)}
                      placeholder="vd: 50"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

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
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">
                            Tên File
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">
                            Loại
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">
                            Kích Thước
                          </th>
                          <th className="px-6 py-3 text-left font-semibold text-gray-700">
                            Ngày Upload
                          </th>
                          <th className="px-6 py-3 text-center font-semibold text-gray-700">
                            Hành Động
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className="text-gray-800 font-medium truncate max-w-xs" title={doc.fileName}>
                                {doc.fileName || 'Không tên'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                                  doc.fileExtension?.toUpperCase() === 'PDF'
                                    ? 'bg-orange-50 text-orange-700 border-orange-100'
                                    : doc.fileExtension?.toUpperCase() === 'DOCX'
                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                    : doc.fileExtension?.toUpperCase() === 'XLSX'
                                    ? 'bg-green-50 text-green-700 border-green-100'
                                    : 'bg-gray-50 text-gray-700 border-gray-100'
                                }`}
                              >
                                {doc.fileExtension || '--'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {doc.fileSizeKB < 1024
                                ? `${doc.fileSizeKB.toFixed(1)} KB`
                                : `${(doc.fileSizeKB / 1024).toFixed(2)} MB`}
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {new Date(doc.uploadDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleDownload(doc.id)}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                  title="Tải về"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 3v12" />
                                    <path d="m6 12 6 6 6-6" />
                                    <path d="M5 21h14" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => {
                                    alert('Chức năng "Gửi yêu cầu in" sẽ được phát triển!');
                                  }}
                                  className="text-green-600 hover:text-green-800 font-medium text-sm"
                                  title="Gửi yêu cầu in"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9V4h12v5" />
                                    <rect x="6" y="13" width="12" height="8" rx="2" />
                                    <path d="M6 17h0" />
                                    <path d="M18 17h0" />
                                    <path d="M6 13h12" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(doc.id)}
                                  className="text-red-600 hover:text-red-800 font-medium text-sm"
                                  title="Xóa"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h18" />
                                    <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                    <path d="M9 6V4h6v2" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
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
