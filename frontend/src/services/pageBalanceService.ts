/**
 * PAGE BALANCE SERVICE - Quản lý số dư trang in
 */

import axios, { AxiosError } from 'axios';
import { PageTransactionResponse, PageBalanceResponse } from '@/types/pageBalance';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/page-balance`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add Authorization header
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error Handler
const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

export const pageBalanceService = {
  /**
   * GET /api/page-balance
   * Lấy số dư trang in hiện tại
   */
  async getBalance(): Promise<PageBalanceResponse> {
    try {
      const response = await apiClient.get<PageBalanceResponse>('/');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * GET /api/page-balance/transactions
   * Lấy lịch sử giao dịch trang in
   * 
   * Query params:
   * - page: số trang (0-indexed)
   * - size: số item mỗi trang (default: 10)
   * - type: lọc theo loại (ALLOCATED, PURCHASED, DEDUCTED)
   * - startDate: lọc từ ngày (format: YYYY-MM-DD)
   * - endDate: lọc đến ngày (format: YYYY-MM-DD)
   */
  async getTransactions(
    page: number = 0,
    size: number = 10,
    filters?: {
      type?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PageTransactionResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      if (filters?.type) {
        params.append('type', filters.type);
      }
      if (filters?.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate);
      }

      const response = await apiClient.get<PageTransactionResponse>(
        `/transactions?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * POST /api/page-balance/purchase
   * Mua thêm trang in
   * 
   * Request: { pages: number }
   * Response: { message, newBalance, totalA4Equivalent }
   */
  async purchasePages(pages: number): Promise<any> {
    try {
      const response = await apiClient.post('/purchase', { pages });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
