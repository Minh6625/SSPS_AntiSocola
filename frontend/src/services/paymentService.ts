/**
 * PAYMENT SERVICE - Quản lý thanh toán SePay
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/payment`,
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
  console.error('API Error:', error);
  
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    // Log full error details
    console.error('Axios error details:', {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      url: axiosError.config?.url,
      method: axiosError.config?.method
    });
    
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    if (axiosError.response?.status === 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    
    if (axiosError.response?.status === 403) {
      return 'Không có quyền truy cập. Vui lòng kiểm tra lại.';
    }
    
    if (axiosError.response?.status === 500) {
      return 'Lỗi server. Vui lòng thử lại sau.';
    }
    
    if (axiosError.code === 'NETWORK_ERROR') {
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
    }
    
    return `Lỗi API: ${axiosError.response?.status || 'Unknown'} - ${axiosError.message}`;
  }
  
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};

export interface CreatePaymentResponse {
  success: boolean;
  paymentCode: string;
  amount: number;
  a4Pages: number;
  a3Pages: number;
  qrUrl: string;
  bankName: string;
  bankAccount: string;
  accountName: string;
  expiresAt: string;
  message: string;
}

export interface PaymentStatus {
  paymentCode: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  amount: number;
  a4Pages: number;
  a3Pages: number;
  createdAt: string;
  expiresAt: string;
  completedAt?: string;
}

export interface PaymentNotification {
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  message: string;
  transactionCode: string;
  amount: number;
  studentId: string;
  a4Pages: number;
  a3Pages: number;
  newA4Balance: number;
  newA3Balance: number;
  timestamp: string;
}

export const paymentService = {
  /**
   * POST /api/payment/create
   * Tạo giao dịch thanh toán mới
   */
  async createPayment(a4Pages: number, a3Pages: number): Promise<CreatePaymentResponse> {
    try {
      console.log('Creating payment request:', { a4Pages, a3Pages });
      console.log('API Base URL:', API_BASE_URL);
      
      const response = await apiClient.post<CreatePaymentResponse>('/create', { a4Pages, a3Pages });
      
      console.log('Payment response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Tạo giao dịch thất bại');
      }
      
      return response.data;
    } catch (error) {
      console.error('Create payment error:', error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * GET /api/payment/status/{paymentCode}
   * Kiểm tra trạng thái thanh toán
   */
  async getPaymentStatus(paymentCode: string): Promise<PaymentStatus> {
    try {
      const response = await apiClient.get<PaymentStatus>(`/status/${paymentCode}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * GET /api/payment/pending
   * Lấy danh sách giao dịch đang chờ
   */
  async getPendingPayments(): Promise<PaymentStatus[]> {
    try {
      const response = await apiClient.get<PaymentStatus[]>('/pending');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * DELETE /api/payment/cancel/{paymentCode}
   * Hủy giao dịch đang chờ
   */
  async cancelPayment(paymentCode: string): Promise<void> {
    try {
      await apiClient.delete(`/cancel/${paymentCode}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
