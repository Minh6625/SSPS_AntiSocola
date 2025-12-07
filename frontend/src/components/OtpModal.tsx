import { useState, useEffect } from 'react';

interface OtpModalProps {
  isOpen: boolean;
  email: string;
  otpCode?: string; // Hiển thị OTP từ server (dùng cho testing)
  onSubmit: (otp: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export function OtpModal({
  isOpen,
  email,
  otpCode,
  onSubmit,
  onCancel,
  isLoading = false,
  errorMessage = '',
}: OtpModalProps) {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [showOtpCode, setShowOtpCode] = useState(!!otpCode);

  // Timer countdown
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return;
    }
    await onSubmit(otp);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Nhập Mã OTP</h2>
          <p className="text-gray-600 text-sm mt-1">Mã xác thực đã được gửi đến</p>
          <p className="text-blue-500 font-medium text-sm">{email}</p>
        </div>

        {/* Display OTP for testing */}
        {showOtpCode && otpCode && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4v2m0 4v2M9 3H5a2 2 0 00-2 2v4a2 2 0 002 2h4V3z" />
              </svg>
              <span className="text-xs font-semibold text-yellow-600 uppercase">Mã OTP (Testing)</span>
            </div>
            <div className="text-center text-2xl font-bold text-yellow-700 font-mono tracking-wider">
              {otpCode}
            </div>
            <p className="text-xs text-yellow-600 mt-2 text-center">
              Đây chỉ dùng cho testing. Trong production sẽ gửi qua email.
            </p>
          </div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* OTP Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Mã OTP (6 chữ số)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={handleOtpChange}
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl font-bold font-mono tracking-widest bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Timer */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Thời gian còn lại:</span>
            <span className={`font-mono font-bold ${timeLeft <= 60 ? 'text-red-500' : 'text-blue-500'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs">
              {errorMessage}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Xác thực...
                </>
              ) : (
                'Xác thực'
              )}
            </button>
          </div>

          {/* Resend Link */}
          <div className="text-center pt-2">
            <button
              type="button"
              className="text-blue-500 hover:text-blue-600 text-xs font-medium"
            >
              Gửi lại mã OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
