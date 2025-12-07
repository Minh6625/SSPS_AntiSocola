/**
 * AUTH SERVICE - Login, OTP Verification, Token Management
 */

import axios, { AxiosError } from 'axios';

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

// Axios instance
const authClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Để gửi/nhận cookies
});

// Add Authorization header từ localStorage
authClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
      
      const response = await authClient.post<LoginResponse>('/login', {
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

      // Thành công (200) - Lưu token
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('deviceId', deviceId);
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
      const response = await authClient.post<LoginResponse>('/verify-otp', {
        email: request.email,
        otpCode: request.otpCode,
        deviceId: request.deviceId,
        rememberDevice: request.rememberDevice ?? false,
      });

      // Lưu token
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userEmail', response.data.email);
        localStorage.setItem('userRole', response.data.role);
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
      const response = await authClient.post<{ accessToken: string }>('/refresh-token', {
        refreshToken,
      });

      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }

      return response.data;
    } catch (error) {
      this.logout();
      throw new Error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
    }
  },

  /**
   * Logout - Xóa tokens
   */
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('deviceId');
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
    };
  },
};
