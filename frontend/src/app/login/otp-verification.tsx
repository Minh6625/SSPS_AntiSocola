'use client';

import { useState } from 'react';
import { authService } from '@/services/authService';

interface OtpVerificationProps {
  email: string;
  otpCode?: string;
  rememberDevice?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OtpVerification({
  email,
  otpCode,
  rememberDevice = false,
  onSuccess,
  onCancel,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('OTP phải là 6 chữ số');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.verifyOtp({
        email,
        otpCode: otp,
        deviceId: localStorage.getItem('deviceId') || undefined,
        rememberDevice: rememberDevice || false,
      });

      if (result.status === 200) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực OTP</h2>
        <p className="text-gray-600 text-sm mb-6">
          Chúng tôi đã gửi mã OTP đến <span className="font-semibold">{email}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {otpCode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <span className="font-semibold">Test Account:</span> OTP = {otpCode}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mã OTP (6 chữ số)
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
          >
            Hủy
          </button>
        </form>
      </div>
    </div>
  );
}
