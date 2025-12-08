// Auth related types

export interface RegisterRequest {
  email: string;
  studentId: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  email: string;
  fullName: string;
  timestamp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceId?: string;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  email?: string;
  fullName?: string;
  userType?: string;
  requireOtp?: boolean;
  message?: string;
  otpCode?: string;
}

export interface ErrorResponse {
  error: string;
  status?: number;
  timestamp?: number;
}
