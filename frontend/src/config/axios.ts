/**
 * Axios Configuration with Token Refresh Interceptor
 * Tự động refresh access token khi gặp lỗi 401
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Flag để tránh refresh loop
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Add access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Auto refresh token on 401 or 403
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Bỏ qua refresh token cho endpoint refresh-token và login
    const isAuthEndpoint = originalRequest.url?.includes('/auth/refresh-token') || 
                          originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/verify-otp') ||
                          originalRequest.url?.includes('/auth/register');

    // Nếu lỗi 401 HOẶC 403 và chưa retry và không phải auth endpoint
    const isUnauthorized = error.response?.status === 401 || error.response?.status === 403;
    
    if (isUnauthorized && !originalRequest._retry && !isAuthEndpoint) {
      console.log(`[AXIOS] ${error.response?.status} Error detected, attempting token refresh...`);
      if (isRefreshing) {
        console.log('[AXIOS] Already refreshing, queueing request...');
        // Đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Lấy refresh token từ cookie (backend đã set) hoặc localStorage (fallback)
        const refreshToken = getCookie('refreshToken') || localStorage.getItem('refreshToken');
        console.log('[AXIOS] Refresh token from cookie/storage:', refreshToken ? 'EXISTS' : 'MISSING');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        console.log('[AXIOS] Calling refresh API...');
        // Gọi API refresh với withCredentials để gửi cookie
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`, 
          { refreshToken },
          { withCredentials: true }
        );

        const newAccessToken = response.data.accessToken;
        console.log('[AXIOS] Token refresh successful!');
        localStorage.setItem('accessToken', newAccessToken);

        // Update token cho các request đang đợi
        processQueue(null, newAccessToken);

        // Retry original request với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('[AXIOS] Token refresh failed:', refreshError);
        processQueue(refreshError as Error, null);

        // Refresh failed → logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userFullName');

        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
