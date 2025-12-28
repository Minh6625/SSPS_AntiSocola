/**
 * ADMIN TRANSACTION SERVICE - Quản lý giao dịch cho SPSO
 */

import axios, { AxiosError } from 'axios';
import { AdminTransaction, AdminTransactionResponse, TransactionFilter } from '@/types/adminTransaction';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/admin/transactions`,
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
    const axiosError = error as AxiosError<{ message?: string }>;
    if (axiosError.response?.status === 403) {
      return 'Bạn không có quyền truy cập chức năng này';
    }
    if (axiosError.response?.status === 401) {
      return 'Phiên đăng nhập đã hết hạn';
    }
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

export const adminTransactionService = {
  /**
   * GET /api/admin/transactions
   * Lấy danh sách tất cả giao dịch với filter và pagination
   */
  async getTransactions(
    page: number = 0,
    size: number = 10,
    filters?: TransactionFilter
  ): Promise<AdminTransactionResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());

      if (filters?.keyword) {
        params.append('keyword', filters.keyword);
      }
      if (filters?.type) {
        params.append('type', filters.type);
      }
      if (filters?.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters?.endDate) {
        params.append('endDate', filters.endDate);
      }

      const response = await apiClient.get<AdminTransactionResponse>(`?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * GET /api/admin/transactions/{id}
   * Lấy chi tiết một giao dịch
   */
  async getTransactionById(id: number): Promise<AdminTransaction> {
    try {
      const response = await apiClient.get<AdminTransaction>(`/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * GET /api/admin/transactions/stats
   * Lấy thống kê giao dịch
   */
  async getStats(): Promise<AdminTransactionResponse> {
    try {
      const response = await apiClient.get<AdminTransactionResponse>('/stats');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
