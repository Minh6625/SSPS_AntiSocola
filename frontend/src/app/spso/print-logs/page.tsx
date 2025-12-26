'use client';

import { useState, useEffect, useCallback } from 'react';
import { printLogService, PrintLogDTO, PrintLogFilter, PrintLogStatsDTO, PageResponse } from '@/services/printLogService';
import { printerService } from '@/services/printerService';

interface PrinterOption {
  printerId: string;
  printerName: string;
}

export default function PrintLogsPage() {
  // State
  const [logs, setLogs] = useState<PrintLogDTO[]>([]);
  const [stats, setStats] = useState<PrintLogStatsDTO | null>(null);
  const [printers, setPrinters] = useState<PrinterOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState<PrintLogDTO | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState<PrintLogFilter>({
    studentSearch: '',
    printerId: '',
    status: '',
    startDate: '',
    endDate: '',
    documentName: '',
    sortBy: 'printTime',
    sortDirection: 'DESC',
  });

  const [tempFilters, setTempFilters] = useState<PrintLogFilter>(filters);

  // Load printers for filter dropdown
  useEffect(() => {
    loadPrinters();
  }, []);

  // Load data when filters or page changes
  useEffect(() => {
    loadPrintLogs();
  }, [currentPage, pageSize, filters]);

  const loadPrinters = async () => {
    try {
      const data = await printerService.getPrinters({}, 0, 100);
      setPrinters(data.content.map((p: any) => ({ printerId: p.printerId, printerName: p.printerName })));
    } catch (err) {
      console.error('Failed to load printers:', err);
    }
  };

  const loadPrintLogs = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      // Format dates for API (yyyy-MM-dd HH:mm:ss)
      const formattedFilters = { ...filters };
      if (formattedFilters.startDate) {
        // Convert from datetime-local format to API format
        formattedFilters.startDate = formattedFilters.startDate.replace('T', ' ');
        if (!formattedFilters.startDate.includes(':00:00')) {
          formattedFilters.startDate = formattedFilters.startDate.slice(0, 16).replace('T', ' ') + ':00';
        }
      }
      if (formattedFilters.endDate) {
        formattedFilters.endDate = formattedFilters.endDate.replace('T', ' ');
        if (!formattedFilters.endDate.includes(':00:00')) {
          formattedFilters.endDate = formattedFilters.endDate.slice(0, 16).replace('T', ' ') + ':00';
        }
      }

      const [logsData, statsData] = await Promise.all([
        printLogService.getPrintLogs({
          ...formattedFilters,
          page: currentPage,
          size: pageSize,
        }),
        printLogService.getPrintLogStats(formattedFilters),
      ]);
      
      setLogs(logsData.content || []);
      setTotalPages(logsData.totalPages || 0);
      setTotalElements(logsData.totalElements || 0);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading print logs:', err);
      setError(err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
      setLogs([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(0);
  };

  const handleResetFilters = () => {
    const resetFilters: PrintLogFilter = {
      studentSearch: '',
      printerId: '',
      status: '',
      startDate: '',
      endDate: '',
      documentName: '',
      sortBy: 'printTime',
      sortDirection: 'DESC',
    };
    setTempFilters(resetFilters);
    setFilters(resetFilters);
    setCurrentPage(0);
  };

  const handleExportExcel = async () => {
    try {
      const blob = await printLogService.exportToExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `print-logs-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Xuất Excel thất bại. Vui lòng thử lại.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Failed': return 'bg-red-100 text-red-700';
      case 'Cancelled': return 'bg-gray-100 text-gray-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Printing': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Success': return 'Hoàn thành';
      case 'Completed': return 'Hoàn thành';
      case 'Failed': return 'Thất bại';
      case 'Cancelled': return 'Đã hủy';
      case 'Pending': return 'Đang chờ';
      case 'Printing': return 'Đang in';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="14 3 14 9 20 9" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Nhật ký in</h1>
              <p className="text-sm text-gray-500">Quản lý và theo dõi tất cả hoạt động in ấn</p>
            </div>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Xuất Excel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-indigo-500">
              <p className="text-xs text-gray-500">Tổng</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalLogs}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <p className="text-xs text-gray-500">Hoàn thành</p>
              <p className="text-xl font-bold text-green-600">{stats.completedLogs}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
              <p className="text-xs text-gray-500">Đã hủy</p>
              <p className="text-xl font-bold text-red-600">{stats.cancelledLogs}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
              <p className="text-xs text-gray-500">Đang chờ</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pendingLogs}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-xs text-gray-500">Đang in</p>
              <p className="text-xl font-bold text-blue-600">{stats.printingLogs}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
              <p className="text-xs text-gray-500">Tổng trang</p>
              <p className="text-xl font-bold text-purple-600">{stats.totalPages}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">Bộ lọc</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Student Search */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sinh viên</label>
              <input
                type="text"
                placeholder="MSSV, tên hoặc email..."
                value={tempFilters.studentSearch || ''}
                onChange={(e) => setTempFilters({ ...tempFilters, studentSearch: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Printer */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Máy in</label>
              <select
                value={tempFilters.printerId || ''}
                onChange={(e) => setTempFilters({ ...tempFilters, printerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tất cả máy in</option>
                {printers.map((p) => (
                  <option key={p.printerId} value={p.printerId}>{p.printerName}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Trạng thái</label>
              <select
                value={tempFilters.status || ''}
                onChange={(e) => setTempFilters({ ...tempFilters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Đang chờ</option>
                <option value="Printing">Đang in</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Failed">Thất bại</option>
                <option value="Cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Document Name */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tên tài liệu</label>
              <input
                type="text"
                placeholder="Tìm theo tên file..."
                value={tempFilters.documentName || ''}
                onChange={(e) => setTempFilters({ ...tempFilters, documentName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Từ ngày</label>
              <input
                type="datetime-local"
                value={tempFilters.startDate?.replace(' ', 'T').slice(0, 16) || ''}
                onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value ? e.target.value.replace('T', ' ') + ':00' : '' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Đến ngày</label>
              <input
                type="datetime-local"
                value={tempFilters.endDate?.replace(' ', 'T').slice(0, 16) || ''}
                onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value ? e.target.value.replace('T', ' ') + ':00' : '' })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sắp xếp theo</label>
              <select
                value={tempFilters.sortBy || 'printTime'}
                onChange={(e) => setTempFilters({ ...tempFilters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="printTime">Thời gian in</option>
                <option value="studentName">Tên sinh viên</option>
                <option value="pagesPrinted">Số trang</option>
                <option value="status">Trạng thái</option>
              </select>
            </div>

            {/* Sort Direction */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Thứ tự</label>
              <select
                value={tempFilters.sortDirection || 'DESC'}
                onChange={(e) => setTempFilters({ ...tempFilters, sortDirection: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="DESC">Mới nhất</option>
                <option value="ASC">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
            >
              Áp dụng bộ lọc
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              Đặt lại
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Danh sách nhật ký ({totalElements} bản ghi)
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
                className="px-2 py-1 border border-gray-200 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">ID</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Sinh viên</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Tài liệu</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Máy in</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Khổ giấy</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Số trang</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Thời gian</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Thời lượng</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-2 py-2 text-left font-semibold text-gray-600">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-2 py-12 text-center text-gray-500">
                        Không có dữ liệu nhật ký in
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.logId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-2 py-2 text-gray-600">#{log.logId}</td>
                        <td className="px-2 py-2">
                          <div>
                            <p className="font-medium text-gray-800">{log.studentName || log.studentId}</p>
                            <p className="text-xs text-gray-500">{log.studentEmail}</p>
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <p className="text-gray-700 truncate max-w-[140px]" title={log.documentName}>
                            {log.documentName}
                          </p>
                          <p className="text-xs text-gray-400">{log.fileType?.toUpperCase()}</p>
                        </td>
                        <td className="px-2 py-2">
                          <p className="text-gray-700">{log.printerName || log.printerId}</p>
                          <p className="text-xs text-gray-400">{log.printerLocation}</p>
                        </td>
                        <td className="px-2 py-2 text-gray-600">{log.paperSize}</td>
                        <td className="px-2 py-2">
                          <p className="text-gray-800 font-medium">{log.pagesPrinted}</p>
                          <p className="text-xs text-gray-400">A4: {log.a4EquivalentUsed}</p>
                        </td>
                        <td className="px-2 py-2 text-gray-600">{formatDate(log.printTime)}</td>
                        <td className="px-2 py-2 text-gray-600">{formatDuration(log.durationSeconds)}</td>
                        <td className="px-2 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            {getStatusDisplay(log.status)}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} / {totalElements}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Đầu
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Trước
                </button>
                <span className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-medium">
                  {currentPage + 1}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sau
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1.5 border border-gray-200 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Cuối
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Chi tiết nhật ký #{selectedLog.logId}</h3>
                <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Sinh viên</p>
                    <p className="font-medium text-gray-800">{selectedLog.studentName}</p>
                    <p className="text-sm text-gray-500">{selectedLog.studentEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Máy in</p>
                    <p className="font-medium text-gray-800">{selectedLog.printerName}</p>
                    <p className="text-sm text-gray-500">{selectedLog.printerLocation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tài liệu</p>
                    <p className="font-medium text-gray-800">{selectedLog.documentName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Loại file</p>
                    <p className="font-medium text-gray-800">{selectedLog.fileType?.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Khổ giấy</p>
                    <p className="font-medium text-gray-800">{selectedLog.paperSize}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Số trang</p>
                    <p className="font-medium text-gray-800">{selectedLog.pagesPrinted} (A4: {selectedLog.a4EquivalentUsed})</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Thời gian in</p>
                    <p className="font-medium text-gray-800">{formatDate(selectedLog.printTime)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Thời lượng</p>
                    <p className="font-medium text-gray-800">{formatDuration(selectedLog.durationSeconds)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Trạng thái</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                      {getStatusDisplay(selectedLog.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Job ID</p>
                    <p className="font-medium text-gray-800">#{selectedLog.jobId}</p>
                  </div>
                </div>
                {selectedLog.errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-600 font-medium">Lỗi:</p>
                    <p className="text-sm text-red-700">{selectedLog.errorMessage}</p>
                  </div>
                )}
              </div>
              <div className="p-5 border-t border-gray-100">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
