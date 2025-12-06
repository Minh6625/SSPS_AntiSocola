/**
 * API SERVICE LAYER - Gọi Backend API
 */

import axios, { AxiosError } from 'axios';
import { User, UserCreateDTO, ErrorResponse } from '@/types/user';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080/api';

// Axios instance với cấu hình chung
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error Handler
const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }
  return 'An unexpected error occurred';
};

// User Service
export const userService = {
  /**
   * Lấy tất cả users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>('/users');
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Lấy user theo ID
   */
  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Tạo mới user
   */
  async createUser(data: UserCreateDTO): Promise<User> {
    try {
      const response = await apiClient.post<User>('/users', data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Cập nhật user
   */
  async updateUser(id: number, data: UserCreateDTO): Promise<User> {
    try {
      const response = await apiClient.put<User>(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Xóa user
   */
  async deleteUser(id: number): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};
