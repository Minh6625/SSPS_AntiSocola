'use client';

import { useState, useEffect } from 'react';
import { studentManagementService, StudentDetailDTO, PrintLogDTO, PageResponse } from '@/services/studentManagementService';

interface Props {
  studentId: string;
  onClose: () => void;
}

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function StudentDetailModal({ studentId, onClose }: Props) {
  const [student, setStudent] = useState<StudentDetailDTO | null>(null);
  const [printHistory, setPrintHistory] = useState<PrintLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentData, historyData] = await Promise.all([
          studentManagementService.getStudentDetail(studentId),
          studentManagementService.getStudentPrintHistory(studentId, 1, 10),
        ]);
        setStudent(studentData);
        setPrintHistory(historyData.content);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin sinh viên');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Suspended: 'bg-red-100 text-red-800',
      Success: 'bg-green-100 text-green-800',
      Failed: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Chi tiết sinh viên</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-gray-500">Đang tải...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : student ? (
            <>
              {/* Tabs */}
              <div className="px-6 pt-4 border-b border-gray-200">
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
                      activeTab === 'info'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Thông tin
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition ${
                      activeTab === 'history'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Lịch sử in
                  </button>
                </div>
              </div>

              {activeTab === 'info' ? (
                <div className="p-6 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase">MSSV</label>
                      <p className="font-medium text-gray-900">{student.studentId}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Họ tên</label>
                      <p className="font-medium text-gray-900">{student.fullName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Email</label>
                      <p className="text-gray-700">{student.email}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Số điện thoại</label>
                      <p className="text-gray-700">{student.phoneNumber || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Trạng thái</label>
                      <p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(student.status)}`}>
                          {student.status === 'Active' ? 'Hoạt động' : 
                           student.status === 'Inactive' ? 'Không hoạt động' : 'Bị khóa'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Ngày tạo</label>
                      <p className="text-gray-700">{formatDate(student.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase">Đăng nhập lần cuối</label>
                      <p className="text-gray-700">{formatDate(student.lastLogin)}</p>
                    </div>
                  </div>

                  {/* Page Balance */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-indigo-900 mb-3">Số dư trang in</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-indigo-600">{student.a4Balance}</p>
                        <p className="text-xs text-gray-500">Trang A4</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-indigo-600">{student.a3Balance}</p>
                        <p className="text-xs text-gray-500">Trang A3</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{student.totalA4Equivalent}</p>
                        <p className="text-xs text-gray-500">Tổng quy đổi A4</p>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Thống kê in ấn</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xl font-bold text-gray-900">{student.totalPrintJobs}</p>
                        <p className="text-xs text-gray-500">Tổng số lần in</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">{student.totalPagesPrinted}</p>
                        <p className="text-xs text-gray-500">Tổng trang đã in</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">{formatDate(student.lastPrintTime)}</p>
                        <p className="text-xs text-gray-500">Lần in gần nhất</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  {printHistory.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">Chưa có lịch sử in</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Tài liệu</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Khổ giấy</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Số trang</th>
                            <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Trạng thái</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Thời gian</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {printHistory.map((log) => (
                            <tr key={log.logId}>
                              <td className="px-4 py-2 text-gray-900 max-w-[200px] truncate">
                                {log.documentName}
                              </td>
                              <td className="px-4 py-2 text-center text-gray-700">{log.paperSize}</td>
                              <td className="px-4 py-2 text-center text-gray-700">{log.pagesPrinted}</td>
                              <td className="px-4 py-2 text-center">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(log.status)}`}>
                                  {log.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-gray-500 text-xs">{formatDate(log.printTime)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
