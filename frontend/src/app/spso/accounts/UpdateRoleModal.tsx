'use client';

import { useState } from 'react';
import { accountManagementService, AccountListDTO } from '@/services/accountManagementService';

interface Props {
  account: AccountListDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateRoleModal({ account, onClose, onSuccess }: Props) {
  const [newRole, setNewRole] = useState<'Student' | 'SPSO' | 'Admin'>(account.userType);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newRole === account.userType) {
      setError('Vui lòng chọn role khác');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await accountManagementService.updateAccountRole({
        userId: account.userId,
        newRole,
        reason,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Không thể đổi role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Đổi role tài khoản</h2>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Tài khoản</p>
            <p className="font-medium text-gray-900">{account.fullName}</p>
            <p className="text-sm text-gray-500">{account.userId}</p>
            <p className="text-sm mt-1">
              Role hiện tại: <span className="font-medium text-indigo-600">{account.userType}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role mới
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value="Student"
                  checked={newRole === 'Student'}
                  onChange={() => setNewRole('Student')}
                  className="text-indigo-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Sinh viên (Student)</span>
                  <p className="text-sm text-gray-500">Có thể in tài liệu, xem lịch sử in</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value="SPSO"
                  checked={newRole === 'SPSO'}
                  onChange={() => setNewRole('SPSO')}
                  className="text-indigo-600"
                />
                <div>
                  <span className="font-medium text-gray-900">SPSO</span>
                  <p className="text-sm text-gray-500">Quản lý máy in, tài khoản, xem báo cáo</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="role"
                  value="Admin"
                  checked={newRole === 'Admin'}
                  onChange={() => setNewRole('Admin')}
                  className="text-indigo-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Admin</span>
                  <p className="text-sm text-gray-500">Toàn quyền quản trị hệ thống</p>
                </div>
              </label>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
            <strong>Lưu ý:</strong> Việc đổi role sẽ ảnh hưởng đến quyền truy cập của tài khoản. 
            {newRole === 'Student' && account.userType !== 'Student' && (
              <span> Nếu đổi sang Student, hệ thống sẽ tự động tạo số dư trang in.</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do (tùy chọn)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nhập lý do thay đổi..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đổi role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
