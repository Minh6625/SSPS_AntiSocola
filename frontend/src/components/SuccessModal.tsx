'use client';

import { useEffect } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  redirectUrl?: string;
}

export default function SuccessModal({
  isOpen,
  title,
  message,
  onClose,
  redirectUrl,
}: SuccessModalProps) {
  useEffect(() => {
    if (isOpen && redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, redirectUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{title}</h2>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">{message}</p>

        {/* Progress Bar */}
        {redirectUrl && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
              <div className="bg-green-600 h-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Đang chuyển hướng...</p>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-200"
        >
          {redirectUrl ? 'Đóng' : 'Xác nhận'}
        </button>
      </div>
    </div>
  );
}
