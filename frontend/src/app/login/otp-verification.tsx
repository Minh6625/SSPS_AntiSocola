'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface OtpVerificationProps {
  email: string;
  otpCode?: string;
  rememberDevice?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

// Constants
const OTP_EXPIRATION_SECONDS = 5 * 60; // 5 phút
const RESEND_COOLDOWN_SECONDS = 60; // 60 giây cooldown gửi lại

export default function OtpVerification({
  email,
  otpCode,
  rememberDevice = false,
  onSuccess,
  onCancel,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // OTP countdown states
  const [otpCountdown, setOtpCountdown] = useState(OTP_EXPIRATION_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [currentOtpCode, setCurrentOtpCode] = useState(otpCode);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    // Clear messages khi user bắt đầu nhập
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('OTP phải là 6 chữ số');
      return;
    }

    // Check OTP expired on client side
    if (otpCountdown <= 0) {
      setError('Mã OTP đã hết hạn. Vui lòng gửi lại OTP mới.');
      return;
    }

    setLoading(true);
    setError('');

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
      // Hiển thị error message chi tiết từ backend
      setError(err.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP (cần gọi lại login để tạo OTP mới)
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      // Lấy password từ localStorage (đã lưu tạm khi login)
      const savedPassword = sessionStorage.getItem('tempLoginPassword');
      
      if (!savedPassword) {
        setError('Không thể gửi lại OTP. Vui lòng đăng nhập lại.');
        return;
      }

      const result = await authService.login({
        email,
        password: savedPassword,
      });

      if (result.status === 202) {
        // OTP mới đã được gửi - clear tất cả error
        setError('');
        setCurrentOtpCode(result.data?.otpCode);
        setOtpCountdown(OTP_EXPIRATION_SECONDS);
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setOtp(''); // Clear old OTP
        setSuccess('OTP mới đã được gửi đến email của bạn!');
      }
    } catch (err: any) {
      setError(err.message || 'Gửi lại OTP thất bại');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Xác thực OTP</h2>
        <p className="text-gray-600 text-sm mb-4">
          Chúng tôi đã gửi mã OTP đến <span className="font-semibold">{email}</span>
        </p>

        {/* OTP Countdown */}
        {otpCountdown > 0 ? (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <p className="text-sm text-blue-700">
                OTP còn hiệu lực: <span className="font-bold text-blue-800">{formatTime(otpCountdown)}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-orange-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
              <p className="text-sm text-orange-700">
                OTP đã hết hạn. Vui lòng gửi lại OTP mới.
              </p>
            </div>
          </div>
        )}

        {/* Error Message - chỉ hiện khi không có success message */}
        {error && !success && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Test Account OTP Display */}
        {currentOtpCode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-700 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              <p className="text-sm text-yellow-700">
                <span className="font-semibold">Test Account:</span> OTP = <span className="font-mono font-bold">{currentOtpCode}</span>
              </p>
            </div>
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
              disabled={loading}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || otpCountdown <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xác thực...
              </>
            ) : (
              'Xác thực OTP'
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            Hủy
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-4 text-center border-t pt-4">
          <p className="text-gray-600 text-sm mb-2">Không nhận được OTP?</p>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading || resendCooldown > 0}
            className="inline-flex items-center gap-1.5 text-blue-600 font-semibold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
          >
            {resendCooldown > 0 ? (
              `Gửi lại sau ${resendCooldown}s`
            ) : resendLoading ? (
              'Đang gửi...'
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Gửi lại OTP
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
