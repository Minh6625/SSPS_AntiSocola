export interface Notification {
  notificationId: number;
  recipientId: string;
  title: string;
  message: string;
  notificationType: 'Info' | 'Warning' | 'Error' | 'Success';
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  totalPages: number;
  totalElements: number;
  currentPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
