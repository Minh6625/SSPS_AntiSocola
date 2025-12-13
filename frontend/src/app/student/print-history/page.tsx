'use client';

import { useState, useEffect } from 'react';
import { printJobService } from '@/services/printJobService';
import { documentService } from '@/services/documentService';
import { PrintJob } from '@/types/printJob';
import StudentLayout from '@/components/StudentLayout';

// Icon components
const SearchIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MoreVerticalIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="12" cy="8" r="1" fill="currentColor" />
    <circle cx="12" cy="16" r="1" fill="currentColor" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PrinterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const LayersIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const PaletteIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" />
    <circle cx="17.5" cy="10.5" r=".5" />
    <circle cx="8.5" cy="7.5" r=".5" />
    <circle cx="6.5" cy="12.5" r=".5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const HashIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function PrintHistoryPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<PrintJob | null>(null);
  const [documents, setDocuments] = useState<Record<number, string>>({});
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  
  // Filter states
  const [dateFilter, setDateFilter] = useState('');
  const [printerFilter, setPrinterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPrintHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobs, dateFilter, printerFilter, statusFilter, searchQuery]);

  const loadPrintHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await printJobService.getMyPrintJobs();
      setJobs(data);
      
      // Fetch document names
      const docIds = [...new Set(data.map(j => j.documentId))];
      const docMap: Record<number, string> = {};
      
      await Promise.all(
        docIds.map(async (docId) => {
          try {
            const doc = await documentService.getDocumentById(docId);
            docMap[docId] = doc.originalFileName || doc.fileName;
          } catch {
            docMap[docId] = `Tài liệu #${docId}`;
          }
        })
      );
      
      setDocuments(docMap);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setError(error.response?.data?.message || error.message || 'Không thể tải lịch sử in');
      console.error('Error loading print history:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    if (dateFilter) {
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.submittedAt).toISOString().split('T')[0];
        return jobDate === dateFilter;
      });
    }

    if (printerFilter && printerFilter !== 'all') {
      filtered = filtered.filter(job => job.printerId === printerFilter);
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(job => job.jobStatus === statusFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(job => {
        const docName = documents[job.documentId] || '';
        return docName.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    setFilteredJobs(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-600';
      case 'Pending':
        return 'bg-yellow-50 text-yellow-600';
      case 'Printing':
        return 'bg-blue-50 text-blue-600';
      case 'Failed':
        return 'bg-red-50 text-red-600';
      case 'Cancelled':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'Thành công';
      case 'Pending':
        return 'Đang chờ';
      case 'Printing':
        return 'Đang in';
      case 'Failed':
        return 'Thất bại';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleCancelJob = async (jobId: number) => {
    if (!confirm('Bạn có chắc muốn hủy job in này?')) return;

    try {
      await printJobService.cancelPrintJob(jobId);
      alert('Đã hủy job thành công!');
      loadPrintHistory();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      alert(error.response?.data?.message || error.message || 'Không thể hủy job');
    }
  };

  const uniquePrinters = Array.from(new Set(jobs.map(j => j.printerId)));

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadPrintHistory}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Thử lại
          </button>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardIcon />
            Lịch sử in
          </h1>
        </div>

        {/* Statistics Cards - Đưa lên đầu */}
        {jobs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Tổng job</div>
              <div className="text-3xl font-bold text-blue-600">{jobs.length}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Hoàn thành</div>
              <div className="text-3xl font-bold text-green-600">
                {jobs.filter(j => j.jobStatus === 'Completed').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Đang chờ</div>
              <div className="text-3xl font-bold text-yellow-600">
                {jobs.filter(j => j.jobStatus === 'Pending').length}
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="text-sm font-medium text-gray-600 mb-1">Thất bại</div>
              <div className="text-3xl font-bold text-red-600">
                {jobs.filter(j => j.jobStatus === 'Failed').length}
              </div>
            </div>
          </div>
        )}

        {/* Filter + Table Container */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 mb-4 flex justify-center">
              <FileTextIcon />
            </div>
            <p className="text-gray-600 text-lg">Không tìm thấy lịch sử in</p>
            <p className="text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc in tài liệu mới</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-4 relative">
            {/* Filters - Thẻ riêng */}
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <SearchIcon />
                    Tìm kiếm
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nhập tên tài liệu..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon />
                    Ngày
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <PrinterIcon />
                    Máy in
                  </label>
                  <select
                    value={printerFilter}
                    onChange={(e) => setPrinterFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Tất cả</option>
                    {uniquePrinters.map(printer => (
                      <option key={printer} value={printer}>{printer}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                    <CheckCircleIcon />
                    Trạng thái
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Tất cả</option>
                    <option value="Completed">Thành công</option>
                    <option value="Pending">Đang chờ</option>
                    <option value="Printing">Đang in</option>
                    <option value="Failed">Thất bại</option>
                    <option value="Cancelled">Đã hủy</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table - Thẻ riêng */}
            <div className="rounded-lg overflow-hidden shadow-md">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-blue-500 text-white">
                    <th className="px-6 py-3 text-left text-sm font-semibold">Ngày</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Tài liệu</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Máy in</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Số trang</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredJobs.map((job, index) => {
                    const isLastThree = index >= filteredJobs.length - 3;
                    return (
                      <tr key={job.jobId} className="hover:bg-gray-50 relative">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(job.submittedAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <FileIcon />
                            <span className="truncate max-w-xs" title={documents[job.documentId] || `Tài liệu #${job.documentId}`}>
                              {documents[job.documentId] || `Tài liệu #${job.documentId}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {job.printerId}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(job.jobStatus)}`}>
                            {getStatusText(job.jobStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {job.totalPagesToPrint} trang
                        </td>
                        <td className="px-4 py-4">
                          <div 
                            className="relative"
                            onMouseEnter={() => setOpenDropdown(job.jobId)}
                            onMouseLeave={() => setOpenDropdown(null)}
                          >
                            <div className="flex justify-center p-0.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                              <MoreVerticalIcon />
                            </div>
                            
                            {openDropdown === job.jobId && (
                              <>
                                {/* Bridge để nối icon và menu */}
                                <div className={`absolute right-0 left-0 ${isLastThree ? 'bottom-0 h-12' : 'top-0 h-12'}`} />
                                
                                <div 
                                  className={`absolute right-0 ${isLastThree ? 'bottom-full mb-1' : 'top-full mt-1'} w-48 bg-white rounded-lg shadow-2xl border border-gray-300`}
                                  style={{
                                    zIndex: 9999
                                  }}
                                >
                                  <button
                                    onClick={() => {
                                      setSelectedJob(job);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors rounded-t-lg text-left"
                                  >
                                    <EyeIcon />
                                    Xem chi tiết
                                  </button>
                                  {(job.jobStatus === 'Pending' || job.jobStatus === 'Printing') && (
                                    <button
                                      onClick={() => {
                                        handleCancelJob(job.jobId);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-b-lg text-left"
                                    >
                                      <XCircleIcon />
                                      Hủy job
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardIcon />
                  Chi tiết nhật ký
                </h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              {/* Body - 2 columns layout */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="text-blue-500"><CalendarIcon /></span>
                        <span>Ngày</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(selectedJob.submittedAt)}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="text-blue-500"><UserIcon /></span>
                        <span>Sinh viên</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedJob.studentId}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="text-blue-500"><PrinterIcon /></span>
                        <span>Máy in</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedJob.printerId}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="text-blue-500"><LayersIcon /></span>
                        <span>Kiểu in</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedJob.isSingleSided ? 'In 1 mặt' : 'In 2 mặt'}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="text-blue-500"><FileIcon /></span>
                        <span>Loại giấy</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedJob.paperSize}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="text-blue-500"><PaletteIcon /></span>
                        <span>Loại in</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedJob.colorMode === 'Color' ? 'In màu' : 'In đen trắng'}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="text-blue-500"><HashIcon /></span>
                        <span>Tổng số trang</span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedJob.totalPagesToPrint} trang
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <span className="text-blue-500"><CheckCircleIcon /></span>
                        <span>Trạng thái</span>
                      </div>
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedJob.jobStatus)}`}>
                        {getStatusText(selectedJob.jobStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Price */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-blue-500"><DollarIcon /></span>
                      <span>Tổng tiền</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {selectedJob.a4EquivalentPages * 500} đ
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="w-full px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
