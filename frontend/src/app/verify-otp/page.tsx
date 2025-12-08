'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService, type VerifyOtpRequest } from '@/services/authService';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const deviceId = searchParams.get('deviceId') || '';

  const [otpCode, setOtpCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    if (!email || !deviceId) {
      setError('Thông tin không hợp lệ. Vui lòng đăng nhập lại.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await authService.verifyOtp({
        email,
        otpCode,
        deviceId,
        rememberDevice,
      } as VerifyOtpRequest);

      if (result.status === 200) {
        // Redirect to student dashboard
        router.push('/student/dashboard');
      }
    } catch (err) {
      setError((err as Error).message || 'Xác thực OTP thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setIsLoading(true);

    try {
      // TODO: Gọi API resend OTP khi backend sẵn sàng
      // await authService.resendOtp(email);
      
      // Tạm thời: giả lập
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTimeLeft(600);
      setOtpCode('');
      // Toast: 'OTP đã được gửi lại'
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          'radial-gradient(circle at top left, rgba(59, 130, 246, 0.4) 0%, transparent 50%), ' +
          'radial-gradient(circle at top right, rgba(96, 165, 250, 0.3) 0%, transparent 50%), ' +
          'radial-gradient(circle at bottom left, rgba(147, 197, 253, 0.3) 0%, transparent 50%), ' +
          'radial-gradient(circle at bottom right, rgba(191, 219, 254, 0.2) 0%, transparent 50%), #ffffff',
      }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Xác thực OTP</h1>
          <p className="text-gray-600">
            Chúng tôi đã gửi mã xác thực đến <br />
            <span className="font-semibold text-gray-800">{email}</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                Nhập 6 chữ số từ email được gửi tới {email}
              </p>
            </div>

            {/* Remember Device Checkbox */}
            <div className="flex items-center">
              <input
                id="rememberDevice"
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="rememberDevice" className="ml-2 text-sm text-gray-700">
                Ghi nhớ thiết bị này (7 ngày)
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6 || timeLeft === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang xác thực...
                </>
              ) : (
                'Xác thực OTP'
              )}
            </button>
          </form>

          {/* Timer & Resend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {timeLeft > 0 ? (
                  <>
                    Hết hạn sau: <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
                  </>
                ) : (
                  <span className="text-red-600 font-semibold">Mã OTP đã hết hạn</span>
                )}
              </span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading || timeLeft > 300} // Cho phép resend khi còn < 5 phút
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-semibold"
              >
                {isLoading ? 'Đang gửi...' : 'Gửi lại'}
              </button>
            </div>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
