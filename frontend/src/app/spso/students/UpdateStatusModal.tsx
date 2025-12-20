'use client';

import { useState } from 'react';
import { studentManagementService, StudentListDTO, UpdateStatusResponse } from '@/services/studentManagementService';

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

type StatusType = 'Active' | 'Inactive' | 'Suspended';

const statusOptions: { value: StatusType; label: string; description: string; color: string }[] = [
  { 
    value: 'Active', 
    label: 'Hoạt động', 
    description: 'Sinh viên có thể sử dụng hệ thống bình thường',
    color: 'border-green-500 bg-green-50'
  },
  { 
    value: 'Inactive', 
    label: 'Không hoạt động', 
    description: 'Tài khoản bị vô hiệu hóa, không thể đăng nhập',
    color: 'border-gray-500 bg-gray-50'
  },
  { 
    value: 'Suspended', 
    label: 'Bị khóa', 
    description: 'Tài khoản bị khóa do vi phạm quy định',
    color: 'border-red-500 bg-red-50'
  },
];

export default function UpdateStatusModal({ student, onClose, onSuccess }: Props) {
  const [status, setStatus] = useState<StatusType>(student.status as StatusType);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UpdateStatusResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status === student.status) {
      setError('Vui lòng chọn trạng thái khác');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await studentManagementService.updateStudentStatus({
        studentId: student.studentId,
        status,
        reason: reason || undefined,
      });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statusValue: string) => {
    const styles: Record<string, string> = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-gray-100 text-gray-800',
      Suspended: 'bg-red-100 text-red-800',
    };
    return styles[statusValue] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statusValue: string) => {
    const labels: Record<string, string> = {
      Active: 'Hoạt động',
      Inactive: 'Không hoạt động',
      Suspended: 'Bị khóa',
    };
    return labels[statusValue] || statusValue;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Cập nhật trạng thái</h2>
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
              <h3 className="text-lg font-semibold text-gray-900">Cập nhật thành công!</h3>
              <p className="text-sm text-gray-500 mt-1">{result.message}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Sinh viên:</span>
                <span className="font-medium">{result.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Trạng thái cũ:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(result.previousStatus)}`}>
                  {getStatusLabel(result.previousStatus)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Trạng thái mới:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(result.newStatus)}`}>
                  {getStatusLabel(result.newStatus)}
                </span>
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
                Trạng thái hiện tại: 
                <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(student.status)}`}>
                  {getStatusLabel(student.status)}
                </span>
              </p>
            </div>

            {/* Status Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn trạng thái mới
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                      status === option.value ? option.color : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={status === option.value}
                      onChange={(e) => setStatus(e.target.value as StatusType)}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lý do {status === 'Suspended' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder={status === 'Suspended' ? 'Nhập lý do khóa tài khoản...' : 'Nhập lý do (tùy chọn)...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required={status === 'Suspended'}
              />
            </div>

            {/* Warning */}
            {status === 'Suspended' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                ⚠️ Sinh viên sẽ không thể đăng nhập và sử dụng hệ thống sau khi bị khóa.
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
                disabled={loading || status === student.status}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
