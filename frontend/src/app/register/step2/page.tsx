'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface FieldErrors {
  otpCode?: string;
  general?: string;
}

export default function RegisterStep2Page() {
  const router = useRouter();
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [registrationToken, setRegistrationToken] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    // Get registration token and email from localStorage
    const token = localStorage.getItem('registrationToken');
    const storedEmail = localStorage.getItem('registrationEmail');

    if (!token || !storedEmail) {
      router.push('/register/step1');
      return;
    }

    // Trim whitespace and newlines
    setRegistrationToken(token.trim());
    setEmail(storedEmail.trim());
  }, [router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    if (!otpCode) {
      errors.otpCode = 'Mã OTP không được để trống';
    } else if (!otpCode.match(/^[0-9]{6}$/)) {
      errors.otpCode = 'OTP phải là 6 chữ số';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(value);
    if (fieldErrors.otpCode) {
      setFieldErrors({ ...fieldErrors, otpCode: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-registration-otp`,
        {
          email: email.trim(),
          otpCode: otpCode.trim(),
          registrationToken: registrationToken.trim(),
        }
      );

      // Success - Clear localStorage and redirect to login
      localStorage.removeItem('registrationToken');
      localStorage.removeItem('registrationEmail');

      // Show success and redirect
      alert(response.data.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      router.push('/login');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Xác thực OTP thất bại. Vui lòng thử lại.';
      
      setFieldErrors({
        general: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendMessage('');

    try {
      // Call initiate-registration again to resend OTP
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/initiate-registration`,
        {
          email,
          // Need to get other data from somewhere - for now just resend
        }
      );

      setResendMessage('OTP mới đã được gửi đến email của bạn!');
      setResendCountdown(60); // 60 seconds countdown
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          'Gửi lại OTP thất bại. Vui lòng thử lại.';
      setResendMessage(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            ✨ Xác thực Email ✨
          </h1>
          <p className="text-gray-500 text-sm mt-2">Bước 2: Nhập mã OTP</p>
          <p className="text-gray-600 text-sm mt-3">
            Chúng tôi đã gửi mã OTP đến <span className="font-semibold">{email}</span>
          </p>
        </div>

        {/* General Error Message */}
        {fieldErrors.general && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{fieldErrors.general}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {resendMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-700">{resendMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Mã OTP (6 chữ số)
            </label>
            <input
              type="text"
              value={otpCode}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              className={`w-full px-4 py-4 text-center text-2xl font-bold tracking-widest border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                fieldErrors.otpCode ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {fieldErrors.otpCode && <p className="text-red-500 text-sm mt-2">{fieldErrors.otpCode}</p>}
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <span className="font-semibold">Mẹo:</span> Kiểm tra thư mục Spam nếu không thấy email
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Xác thực OTP
              </>
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-3">Không nhận được OTP?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || resendCountdown > 0}
              className="text-blue-600 font-semibold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendCountdown > 0 ? (
                `Gửi lại sau ${resendCountdown}s`
              ) : resendLoading ? (
                'Đang gửi...'
              ) : (
                'Gửi lại OTP'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600 text-sm">
            Quay lại{' '}
            <a href="/register/step1" className="text-blue-600 font-semibold hover:underline">
              Bước 1
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
