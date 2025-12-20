'use client';

import { useState, useEffect } from 'react';
import { accountManagementService, AccountDetailDTO } from '@/services/accountManagementService';

interface Props {
  userId: string;
  onClose: () => void;
}

export default function AccountDetailModal({ userId, onClose }: Props) {
  const [account, setAccount] = useState<AccountDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await accountManagementService.getAccountDetail(userId);
        setAccount(data);
      } catch (err: any) {
        setError(err.message || 'Không thể tải thông tin tài khoản');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [userId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getRoleLabel = (userType: string) => {
    const labels: Record<string, string> = {
      Student: 'Sinh viên',
      SPSO: 'SPSO',
      Admin: 'Admin',
    };
    return labels[userType] || userType;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      Active: 'Hoạt động',
      Inactive: 'Không hoạt động',
      Suspended: 'Bị khóa',
    };
    return labels[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Chi tiết tài khoản</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-red-600 text-center py-8">{error}</div>
          ) : account ? (
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">User ID</label>
                    <p className="font-medium text-gray-900">{account.userId}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Họ tên</label>
                    <p className="font-medium text-gray-900">{account.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium text-gray-900">{account.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Số điện thoại</label>
                    <p className="font-medium text-gray-900">{account.phoneNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Loại tài khoản</label>
                    <p className="font-medium text-gray-900">{getRoleLabel(account.userType)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Trạng thái</label>
                    <p className="font-medium text-gray-900">{getStatusLabel(account.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Ngày tạo</label>
                    <p className="font-medium text-gray-900">{formatDate(account.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Đăng nhập lần cuối</label>
                    <p className="font-medium text-gray-900">{formatDate(account.lastLogin)}</p>
                  </div>
                </div>
              </div>

              {/* Thông tin trang in (chỉ hiển thị với Student) */}
              {account.userType === 'Student' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin trang in</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <label className="text-sm text-blue-600">Số dư A4</label>
                      <p className="text-2xl font-bold text-blue-700">{account.a4Balance ?? 0}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <label className="text-sm text-green-600">Số dư A3</label>
                      <p className="text-2xl font-bold text-green-700">{account.a3Balance ?? 0}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <label className="text-sm text-purple-600">Tổng quy đổi A4</label>
                      <p className="text-2xl font-bold text-purple-700">{account.totalA4Equivalent ?? 0}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <label className="text-sm text-orange-600">Tổng lần in</label>
                      <p className="text-2xl font-bold text-orange-700">{account.totalPrintJobs ?? 0}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Tổng trang đã in</label>
                      <p className="font-medium text-gray-900">{account.totalPagesPrinted ?? 0}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Lần in cuối</label>
                      <p className="font-medium text-gray-900">{formatDate(account.lastPrintTime)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
