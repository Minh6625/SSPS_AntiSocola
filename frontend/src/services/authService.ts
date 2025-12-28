/**
 * AUTH SERVICE - Login, OTP Verification, Token Management
 */

import axios, { AxiosError } from 'axios';
import apiClient from '@/config/axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Types
export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  requireOtp: boolean;
  message: string;
  otpCode?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
  deviceId?: string;
  rememberDevice?: boolean;
}

export interface AuthError {
  error: string;
  timestamp: string;
}

export interface InitiateRegistrationRequest {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface InitiateRegistrationResponse {
  message: string;
  registrationToken: string;
  email: string;
  otpSent: boolean;
}

export interface VerifyRegistrationOtpRequest {
  email: string;
  otpCode: string;
  registrationToken: string;
}

export interface VerifyRegistrationOtpResponse {
  message: string;
  userId: string;
  email: string;
  fullName: string;
  userType: string;
  accountCreated: boolean;
}

// Axios instance
const authClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Để gửi/nhận cookies
});

// Add Authorization header từ localStorage
authClient.interceptors.request.use((config: any) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function để set cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

// Helper function để xóa cookie
const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const authService = {
  /**
   * Generate device fingerprint (SHA-256 hash)
   * Client-side: UserAgent + IP (mô phỏng) + Screen Resolution + Timezone
   */
  generateDeviceFingerprint(): string {
    const userAgent = navigator.userAgent;
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Mô phỏng SHA-256 (thực tế dùng crypto library)
    // Tạm thời dùng simple hash
    const combined = `${userAgent}|${screenRes}|${timezone}`;
    return btoa(combined); // Base64 encode tạm thời
  },

  /**
   * POST /auth/login
   * Request: { email, password, deviceId }
   * Response: { accessToken, refreshToken, userId, email, fullName, role, requireOtp }
   * 
   * Nếu requireOtp = true → HTTP 202
   * Nếu thành công → HTTP 200 (token trong response + refreshToken trong httpOnly cookie)
   */
  async login(credentials: LoginRequest) {
    try {
      const deviceId = credentials.deviceId || this.generateDeviceFingerprint();
      
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        deviceId,
      });

      // Nếu cần OTP (202 response)
      if (response.status === 202 || response.data.requireOtp) {
        // Lưu deviceId để verify OTP dùng cùng thiết bị
        localStorage.setItem('deviceId', deviceId);

        return {
          status: 202,
          data: response.data,
          message: response.data.message,
        };
      }

      // Thành công (200) - Lưu token vào localStorage VÀ cookies
      if (response.data.accessToken) {
        // Lưu vào localStorage (để dùng trong API calls)
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userFullName', response.data.fullName || '');
        localStorage.setItem('deviceId', deviceId);
        
        // Lưu vào cookies (để middleware có thể đọc)
        setCookie('accessToken', response.data.accessToken, 7);
        setCookie('userRole', response.data.role, 7);
      }

      return {
        status: 200,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      throw new Error(
        axiosError.response?.data?.error || 'Đăng nhập thất bại'
      );
    }
  },

  /**
   * POST /auth/verify-otp
   * Request: { email, otpCode, deviceId, rememberDevice }
   * Response: { accessToken, refreshToken, userId, email, fullName, role }
   */
  async verifyOtp(request: VerifyOtpRequest) {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/verify-otp', {
        email: request.email,
        otpCode: request.otpCode,
        deviceId: request.deviceId,
        rememberDevice: request.rememberDevice ?? false,
      });

      // Lưu token vào localStorage VÀ cookies
      if (response.data.accessToken) {
        // Lưu vào localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('userFullName', response.data.fullName || '');
        
        // Lưu vào cookies (để middleware có thể đọc)
        setCookie('accessToken', response.data.accessToken, 7);
        setCookie('userRole', response.data.role, 7);
      }

      return {
        status: 200,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      throw new Error(
        axiosError.response?.data?.error || 'Xác thực OTP thất bại'
      );
    }
  },

  /**
   * Refresh access token
   * POST /auth/refresh-token
   */
  async refreshToken(refreshToken: string) {
    try {
      const response = await apiClient.post<{ accessToken: string }>('/auth/refresh-token', {
        refreshToken,
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        // Cập nhật cookie
        setCookie('accessToken', response.data.accessToken, 7);
      }

      return response.data;
    } catch {
      this.logout();
      throw new Error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
    }
  },

  /**
   * Logout - Xóa tokens từ localStorage VÀ cookies
   */
  logout() {
    // Xóa localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('deviceId');
    
    // Xóa cookies
    deleteCookie('accessToken');
    deleteCookie('userRole');
  },

  /**
   * Kiểm tra đã login chưa
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Lấy token hiện tại
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  },

  /**
   * Lấy user info từ localStorage
   */
  getUserInfo() {
    if (typeof window === 'undefined') return null;
    return {
      userId: localStorage.getItem('userId'),
      email: localStorage.getItem('userEmail'),
      role: localStorage.getItem('userRole'),
      fullName: localStorage.getItem('userFullName') || undefined,
    };
  },

  /**
   * POST /auth/register
   * Đăng ký tài khoản sinh viên mới
   * 
   * Request: { email, studentId, fullName, password, confirmPassword }
   * Response: { message, userId, email, fullName }
   */
  async register(data: {
    email: string;
    studentId: string;
    fullName: string;
    password: string;
    confirmPassword: string;
  }) {
    try {
      const response = await apiClient.post('/auth/register', data);
      return {
        status: 201,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      
      // Xử lý error từ backend
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      
      // Xử lý validation errors
      if (axiosError.response?.data?.errors) {
        const errors = axiosError.response.data.errors;
        const errorMessages = Object.values(errors).join(', ');
        throw new Error(errorMessages);
      }
      
      throw new Error('Đăng ký thất bại. Vui lòng thử lại.');
    }
  },

  /**
   * POST /auth/initiate-registration
   * BƯỚC 1: Khởi tạo đăng ký - Validate + Gửi OTP
   * 
   * Request: { email, studentId, fullName, password, confirmPassword }
   * Response: { message, registrationToken, email, otpSent }
   */
  async initiateRegistration(data: InitiateRegistrationRequest) {
    try {
      const response = await authClient.post<InitiateRegistrationResponse>(
        '/initiate-registration',
        data
      );
      return {
        status: 200,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      
      throw new Error('Khởi tạo đăng ký thất bại. Vui lòng thử lại.');
    }
  },

  /**
   * POST /auth/verify-registration-otp
   * BƯỚC 2: Xác thực OTP + Tạo tài khoản
   * 
   * Request: { email, otpCode, registrationToken }
   * Response: { message, userId, email, fullName, userType, accountCreated }
   */
  async verifyRegistrationOtp(data: VerifyRegistrationOtpRequest) {
    try {
      const response = await authClient.post<VerifyRegistrationOtpResponse>(
        '/verify-registration-otp',
        data
      );
      return {
        status: 201,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      
      if (axiosError.response?.data?.error) {
        throw new Error(axiosError.response.data.error);
      }
      
      throw new Error('Xác thực OTP thất bại. Vui lòng thử lại.');
    }
  },
};
