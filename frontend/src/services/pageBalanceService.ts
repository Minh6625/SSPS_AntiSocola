/**
 * PAGE BALANCE SERVICE - Lấy số dư trang in
 */

import axios, { AxiosError } from 'axios';
import { PageBalanceResponse, PageBalanceError } from '@/types/pageBalance';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Axios instance
const pageBalanceClient = axios.create({
  baseURL: `${API_BASE_URL}/page-balance`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add Authorization header từ localStorage
pageBalanceClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[PageBalance] Token added to request:', token.substring(0, 20) + '...');
    } else {
      console.warn('[PageBalance] No token found in localStorage');
    }
  }
  return config;
});

// Add response interceptor để log errors
pageBalanceClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[PageBalance] API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export const pageBalanceService = {
  /**
   * GET /page-balance
   * Lấy số dư trang của sinh viên hiện tại
   * 
   * Response: { pagesA4, pagesA3, totalA4Equivalent, lastUpdated }
   */
  async getPageBalance(): Promise<PageBalanceResponse> {
    try {
      console.log('[PageBalance] Fetching page balance...');
      const response = await pageBalanceClient.get<PageBalanceResponse>('/');
      console.log('[PageBalance] Success:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[PageBalance] Full error:', error);
      
      // Nếu là AxiosError
      if (error.response) {
        console.error('[PageBalance] Response status:', error.response.status);
        console.error('[PageBalance] Response data:', error.response.data);
        
        if (error.response.status === 401) {
          throw new Error('Phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
        }
        
        if (error.response.status === 404) {
          throw new Error('Không tìm thấy số dư trang.');
        }
        
        throw new Error(error.response.data?.error || `Lỗi ${error.response.status}`);
      }
      
      // Nếu là lỗi khác
      throw new Error(error.message || 'Lỗi khi lấy số dư trang');
    }
  },
};
