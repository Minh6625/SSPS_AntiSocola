'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface FieldErrors {
  email?: string;
  studentId?: string;
  fullName?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

export default function RegisterStep1Page() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    studentId: '',
    fullName: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email không được để trống';
    } else if (!formData.email.match(/.*@siu\.edu\.vn$/)) {
      errors.email = 'Email phải là địa chỉ @siu.edu.vn';
      console.debug('❌ Email validation failed:', formData.email);
    } else {
      console.debug('✅ Email valid:', formData.email);
    }

    // Student ID validation
    if (!formData.studentId) {
      errors.studentId = 'MSSV không được để trống';
    } else if (!formData.studentId.match(/^[0-9]{11}$/)) {
      errors.studentId = 'MSSV phải là 11 chữ số';
      console.debug('❌ Student ID validation failed:', formData.studentId, 'Length:', formData.studentId.length);
    } else {
      console.debug('✅ Student ID valid:', formData.studentId);
    }

    // Full name validation
    if (!formData.fullName) {
      errors.fullName = 'Họ và tên không được để trống';
    } else if (formData.fullName.length < 2) {
      errors.fullName = 'Họ và tên phải từ 2 ký tự trở lên';
      console.debug('❌ Full name validation failed:', formData.fullName, 'Length:', formData.fullName.length);
    } else {
      console.debug('✅ Full name valid:', formData.fullName);
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
      console.debug('❌ Password too short:', formData.password, 'Length:', formData.password.length);
    } else if (!formData.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)) {
      errors.password = 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
      console.debug('❌ Password strength validation failed:', formData.password);
      console.debug('  - Has lowercase:', /[a-z]/.test(formData.password));
      console.debug('  - Has uppercase:', /[A-Z]/.test(formData.password));
      console.debug('  - Has digit:', /\d/.test(formData.password));
    } else {
      console.debug('✅ Password valid:', '***');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      console.debug('❌ Confirm password mismatch');
      console.debug('  - Password:', formData.password);
      console.debug('  - Confirm:', formData.confirmPassword);
    } else {
      console.debug('✅ Confirm password valid');
    }

    // Terms validation
    if (!agreedToTerms) {
      errors.terms = 'Vui lòng đồng ý với điều khoản dịch vụ';
      console.debug('❌ Terms not agreed');
    } else {
      console.debug('✅ Terms agreed');
    }

    console.debug('📋 Validation result:', Object.keys(errors).length === 0 ? 'PASS' : 'FAIL', errors);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error cho field này khi user nhập
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: undefined,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.debug('📝 Form data:', {
      email: formData.email,
      studentId: formData.studentId,
      fullName: formData.fullName,
      password: '***',
      confirmPassword: '***',
      agreedToTerms,
    });

    // Validate form
    if (!validateForm()) {
      console.debug('❌ Form validation failed');
      return;
    }

    console.debug('✅ Form validation passed, sending to backend...');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/initiate-registration`,
        formData
      );
      
      console.debug('✅ Registration initiated successfully:', response.data);

      // Success - Save registration token and redirect to step 2
      localStorage.setItem('registrationToken', response.data.registrationToken.trim());
      localStorage.setItem('registrationEmail', response.data.email.trim());
      
      router.push('/register/step2');
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      console.debug('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.response?.data?.error,
        fullError: err.response?.data,
      });
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message ||
                          'Đăng ký thất bại. Vui lòng thử lại.';
      
      setFieldErrors({
        general: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            ✨ Tham gia HCMSIU SSPS ✨
          </h1>
          <p className="text-gray-500 text-sm mt-2">Bước 1: Nhập thông tin đăng ký</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Địa chỉ Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@siu.edu.vn"
                className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {fieldErrors.email && <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>}
          </div>

          {/* Student ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mã sinh viên
            </label>
            <div className="relative">
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                placeholder="e.g., 19123456789"
                className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.studentId ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
            </div>
            {fieldErrors.studentId && <p className="text-red-500 text-sm mt-1">{fieldErrors.studentId}</p>}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Họ và tên
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g., Nguyen Van A"
                className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {fieldErrors.fullName && <p className="text-red-500 text-sm mt-1">{fieldErrors.fullName}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ít nhất 8 ký tự"
                className={`w-full px-4 py-3 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M15.171 13.576l1.414 1.414a1 1 0 00.707-.293 1 1 0 00-.707-1.707l-1.414-1.414" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-sm mt-1">{fieldErrors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu của bạn"
                className={`w-full px-4 py-3 pl-10 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M15.171 13.576l1.414 1.414a1 1 0 00.707-.293 1 1 0 00-.707-1.707l-1.414-1.414" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start p-3 rounded-lg bg-blue-50 border border-blue-200">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (e.target.checked && fieldErrors.terms) {
                  setFieldErrors({ ...fieldErrors, terms: undefined });
                }
              }}
              className="mt-1 w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              Tôi đồng ý với{' '}
              <a href="#" className="font-semibold hover:underline">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#" className="font-semibold hover:underline">
                Chính sách bảo mật
              </a>
            </label>
          </div>
          {fieldErrors.terms && <p className="text-red-500 text-sm">{fieldErrors.terms}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Tiếp tục
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Đã có tài khoản?{' '}
            <a href="/login" className="text-blue-600 font-semibold hover:underline">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
