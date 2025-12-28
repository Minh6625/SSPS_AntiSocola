/**
 * FORGOT PASSWORD SERVICE - Quên mật khẩu & Đặt lại mật khẩu
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
  resetToken: string;
  otpExpirationMinutes: number;
  timestamp: number;
}

export interface ResetPasswordRequest {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  email: string;
  userId: string;
  timestamp: number;
}

export interface ForgotPasswordError {
  error: string;
  timestamp: number;
}

// Axios instance
const authClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Password validation - Yêu cầu: ít nhất 8 ký tự, 1 chữ thường, 1 chữ hoa, 1 số
export const passwordValidation = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/,

  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.minLength) {
      errors.push(`Ít nhất ${this.minLength} ký tự`);
    }
    if (!this.hasLowercase.test(password)) {
      errors.push('Ít nhất 1 chữ thường (a-z)');
    }
    if (!this.hasUppercase.test(password)) {
      errors.push('Ít nhất 1 chữ hoa (A-Z)');
    }
    if (!this.hasNumber.test(password)) {
      errors.push('Ít nhất 1 chữ số (0-9)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export const forgotPasswordService = {
  /**
   * POST /auth/forgot-password
   * Gửi OTP đến email để reset mật khẩu
   */
  async sendOtp(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await authClient.post<ForgotPasswordResponse>('/forgot-password', {
        email,
      });
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ForgotPasswordError>;
      throw new Error(
        axiosError.response?.data?.error || 'Gửi OTP thất bại. Vui lòng thử lại.'
      );
    }
  },

  /**
   * POST /auth/verify-password-reset-otp
   * Xác thực OTP và đặt mật khẩu mới
   */
  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const response = await authClient.post<ResetPasswordResponse>('/verify-password-reset-otp', data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ForgotPasswordError>;
      throw new Error(
        axiosError.response?.data?.error || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'
      );
    }
  },
};
