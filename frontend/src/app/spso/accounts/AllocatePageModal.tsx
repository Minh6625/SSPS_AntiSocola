'use client';

import { useState } from 'react';
import { accountManagementService, AccountListDTO } from '@/services/accountManagementService';

interface Props {
  account: AccountListDTO;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AllocatePageModal({ account, onClose, onSuccess }: Props) {
  const [a4Pages, setA4Pages] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (a4Pages <= 0) {
      setError('Vui lòng nhập số trang cần cấp');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await accountManagementService.allocatePages({
        studentId: account.userId,
        a4Pages,
        a3Pages: 0,
        reason,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Không thể cấp trang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Cấp trang A4</h2>
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
            <p className="text-xs text-gray-500">Sinh viên</p>
            <p className="font-medium text-gray-900 text-sm">{account.fullName}</p>
            <p className="text-xs text-gray-500">{account.userId}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số trang A4
            </label>
            <input
              type="number"
              min="1"
              value={a4Pages}
              onChange={(e) => setA4Pages(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Nhập số trang"
            />
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
              placeholder="Nhập lý do cấp trang..."
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
              {loading ? 'Đang xử lý...' : 'Cấp trang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
