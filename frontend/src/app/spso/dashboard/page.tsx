'use client';

import { useState, useEffect } from 'react';
import SPSOLayout from '@/components/SPSOLayout';
import { printLogService, PrintLogDTO, PrintLogStatsDTO } from '@/services/printLogService';

export default function SPSODashboard() {
  const [stats, setStats] = useState<PrintLogStatsDTO | null>(null);
  const [recentLogs, setRecentLogs] = useState<PrintLogDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [statsData, logsData] = await Promise.all([
        printLogService.getPrintLogStats({}),
        printLogService.getPrintLogs({ page: 0, size: 5, sortBy: 'printTime', sortDirection: 'DESC' }),
      ]);
      setStats(statsData);
      setRecentLogs(logsData.content);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
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
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SPSOLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </SPSOLayout>
    );
  }

  return (
    <SPSOLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard SPSO</h1>
            <p className="text-sm text-gray-500">Tổng quan hệ thống in ấn</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng lệnh in</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalLogs || 0}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Hoàn thành</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.completedLogs || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Thất bại</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.failedLogs || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tổng trang in</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalPages || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Đang chờ</p>
                <p className="text-xl font-bold text-gray-800">{stats?.pendingLogs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Đang in</p>
                <p className="text-xl font-bold text-gray-800">{stats?.printingLogs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Đã hủy</p>
                <p className="text-xl font-bold text-gray-800">{stats?.cancelledLogs || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Print Logs */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Nhật ký in gần đây</h2>
            <a href="/spso/print-logs" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              Xem tất cả →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Sinh viên</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Tài liệu</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Máy in</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Số trang</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Thời gian</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                      Chưa có dữ liệu nhật ký in
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.logId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div>
                          <p className="font-medium text-gray-800">{log.studentName || log.studentId}</p>
                          <p className="text-xs text-gray-500">{log.studentEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-700 truncate max-w-[200px]" title={log.documentName}>
                          {log.documentName}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-700">{log.printerName || log.printerId}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-700">{log.pagesPrinted}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-gray-600 text-xs">{formatDate(log.printTime)}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {getStatusDisplay(log.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SPSOLayout>
  );
}
