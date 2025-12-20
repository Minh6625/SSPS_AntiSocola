'use client';

import { useState } from 'react';
import { studentManagementService, StudentListDTO, AllocatePageResponse } from '@/services/studentManagementService';

interface Props {
  student: StudentListDTO;
  onClose: () => void;
  onSuccess: () => void;
}

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export default function AllocatePageModal({ student, onClose, onSuccess }: Props) {
  const [a4Pages, setA4Pages] = useState(0);
  const [a3Pages, setA3Pages] = useState(0);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AllocatePageResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (a4Pages === 0 && a3Pages === 0) {
      setError('Vui lòng nhập số trang cần cấp');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await studentManagementService.allocatePages({
        studentId: student.studentId,
        a4Pages,
        a3Pages,
        reason: reason || undefined,
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Không thể cấp trang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Cấp trang miễn phí</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        {result ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cấp trang thành công!</h3>
              <p className="text-sm text-gray-500 mt-1">{result.message}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Sinh viên:</span>
                <span className="font-medium">{result.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Đã cấp:</span>
                <span className="font-medium text-green-600">
                  +{result.a4PagesAllocated} A4, +{result.a3PagesAllocated} A3
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Số dư mới:</span>
                <span className="font-medium">
                  {result.newA4Balance} A4, {result.newA3Balance} A3
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tổng quy đổi A4:</span>
                <span className="font-bold text-indigo-600">{result.totalA4Equivalent}</span>
              </div>
            </div>

            <button
              onClick={onSuccess}
              className="w-full mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Student Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-500">Sinh viên</p>
              <p className="font-medium text-gray-900">{student.fullName}</p>
              <p className="text-sm text-gray-500">{student.studentId} - {student.email}</p>
              <p className="text-sm mt-2">
                Số dư hiện tại: <span className="font-medium">{student.a4Balance} A4</span>
                {student.a3Balance > 0 && <span className="font-medium">, {student.a3Balance} A3</span>}
              </p>
            </div>

            {/* A4 Pages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số trang A4
              </label>
              <input
                type="number"
                min="0"
                value={a4Pages}
                onChange={(e) => setA4Pages(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* A3 Pages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số trang A3
              </label>
              <input
                type="number"
                min="0"
                value={a3Pages}
                onChange={(e) => setA3Pages(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do (tùy chọn)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="VD: Cấp trang học kỳ 1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Preview */}
            {(a4Pages > 0 || a3Pages > 0) && (
              <div className="bg-indigo-50 rounded-lg p-3 text-sm">
                <p className="text-indigo-900">
                  Sau khi cấp: <span className="font-medium">{student.a4Balance + a4Pages} A4</span>
                  {(student.a3Balance + a3Pages) > 0 && (
                    <span className="font-medium">, {student.a3Balance + a3Pages} A3</span>
                  )}
                </p>
                <p className="text-indigo-700">
                  Tổng quy đổi A4: {(student.a4Balance + a4Pages) + (student.a3Balance + a3Pages) * 2}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
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
                {loading ? 'Đang xử lý...' : 'Cấp trang'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
