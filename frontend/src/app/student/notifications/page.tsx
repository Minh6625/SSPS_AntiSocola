'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/StudentLayout';
import { notificationService } from '@/services/notificationService';
import { Notification } from '@/types/notification';

// Icons
const BellIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const CheckAllIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Notification type icons with backgrounds
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Success':
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    case 'Error':
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    case 'Warning':
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'Success': return { text: 'Thành công', color: 'bg-green-100 text-green-700' };
    case 'Error': return { text: 'Lỗi', color: 'bg-red-100 text-red-700' };
    case 'Warning': return { text: 'Cảnh báo', color: 'bg-yellow-100 text-yellow-700' };
    default: return { text: 'Thông tin', color: 'bg-blue-100 text-blue-700' };
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, [currentPage]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(currentPage, 10);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      window.dispatchEvent(new Event('notification-update'));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      window.dispatchEvent(new Event('notification-update'));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;


  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <BellIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {unreadCount > 0 
                  ? <span>Bạn có <span className="font-semibold text-blue-600">{unreadCount}</span> thông báo chưa đọc</span>
                  : 'Tất cả thông báo đã được đọc'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filter buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                  filter === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                  filter === 'unread' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
              >
                <CheckAllIcon />
                <span className="hidden sm:inline">Đọc tất cả</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
              </p>
              <p className="text-gray-400 text-sm mt-1">Các thông báo mới sẽ xuất hiện ở đây</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const typeLabel = getTypeLabel(notification.notificationType);
                const isUnread = !notification.isRead;
                
                return (
                  <div
                    key={notification.notificationId}
                    onClick={() => isUnread && handleMarkAsRead(notification.notificationId)}
                    className={`p-5 transition cursor-pointer relative ${
                      isUnread 
                        ? 'bg-gradient-to-r from-blue-50 to-white border-l-4 border-l-blue-500 hover:from-blue-100 hover:to-blue-50' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      {getNotificationIcon(notification.notificationType)}
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className={`font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeLabel.color}`}>
                                {typeLabel.text}
                              </span>
                              {isUnread && (
                                <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                  Mới
                                </span>
                              )}
                              {!isUnread && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Đã đọc
                                </span>
                              )}
                            </div>
                            <p className={`text-sm leading-relaxed ${isUnread ? 'text-gray-700' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-xs whitespace-nowrap ${isUnread ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                              {formatDate(notification.createdAt)}
                            </span>
                            {isUnread && (
                              <span className="text-xs text-blue-500 hover:text-blue-700">Click để đọc</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Trước
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`w-8 h-8 text-sm font-medium rounded-lg transition ${
                      currentPage === i
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                Sau
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
