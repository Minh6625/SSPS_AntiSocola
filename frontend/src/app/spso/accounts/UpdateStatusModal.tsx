'use client';

import { useState } from 'react';
import { accountManagementService, AccountListDTO } from '@/services/accountManagementService';

interface Props {
  account: AccountListDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateStatusModal({ account, onClose, onSuccess }: Props) {
  const [status, setStatus] = useState<'Active' | 'Inactive'>(account.status as any);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === account.status) {
      setError('Vui lòng chọn trạng thái khác');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await accountManagementService.updateAccountStatus({
        userId: account.userId,
        status,
        reason,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Cập nhật trạng thái</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Tài khoản</p>
            <p className="font-medium text-gray-900 text-sm">{account.fullName}</p>
            <p className="text-xs text-gray-500">{account.userId} - {account.userType}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái mới
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={status === 'Active'}
                  onChange={() => setStatus('Active')}
                  className="text-indigo-600"
                />
                <div>
                  <span className="font-medium text-gray-900 text-sm">Hoạt động</span>
                  <p className="text-xs text-gray-500">Có thể đăng nhập và sử dụng</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={status === 'Inactive'}
                  onChange={() => setStatus('Inactive')}
                  className="text-indigo-600"
                />
                <div>
                  <span className="font-medium text-gray-900 text-sm">Không hoạt động</span>
                  <p className="text-xs text-gray-500">Tạm khóa, không thể đăng nhập</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do (tùy chọn)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="Nhập lý do thay đổi..."
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Đang xử lý...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
