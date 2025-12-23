import axiosInstance from '@/config/axios';
import { NotificationResponse, ApiResponse } from '@/types/notification';

export const notificationService = {
  // Lấy danh sách thông báo
  getNotifications: async (page: number = 0, size: number = 10): Promise<NotificationResponse> => {
    const response = await axiosInstance.get<ApiResponse<NotificationResponse>>(
      `/notifications?page=${page}&size=${size}`
    );
    return response.data.data;
  },

  // Lấy số thông báo chưa đọc
  getUnreadCount: async (): Promise<number> => {
    const response = await axiosInstance.get<ApiResponse<{ unreadCount: number }>>(
      '/notifications/unread-count'
    );
    return response.data.data.unreadCount;
  },

  // Đánh dấu 1 thông báo đã đọc
  markAsRead: async (notificationId: number): Promise<void> => {
    await axiosInstance.put(`/notifications/${notificationId}/read`);
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async (): Promise<number> => {
    const response = await axiosInstance.put<ApiResponse<{ markedCount: number }>>(
      '/notifications/read-all'
    );
    return response.data.data.markedCount;
  },
};
