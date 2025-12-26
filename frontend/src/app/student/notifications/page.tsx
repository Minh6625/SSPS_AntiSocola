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

const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

// Get notification style based on type - với gradient từ dưới lên
const getNotificationStyle = (type: string, isRead: boolean) => {
  // Icon luôn giữ màu theo loại, chỉ nền thay đổi
  const getIconStyle = () => {
    switch (type) {
      case 'Success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-500',
          iconBorder: 'border-green-300',
        };
      case 'Error':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-500',
          iconBorder: 'border-red-300',
        };
      case 'Warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          iconBorder: 'border-yellow-300',
        };
      default: // Info - xanh nước biển
        return {
          iconBg: 'bg-sky-100',
          iconColor: 'text-sky-500',
          iconBorder: 'border-sky-300',
        };
    }
  };

  const iconStyle = getIconStyle();

  // Đã đọc = nền trắng, chưa đọc = gradient từ dưới lên
  if (isRead) {
    return {
      bgStyle: { background: 'white' },
      ...iconStyle,
    };
  }

  // Chưa đọc - có gradient (xanh lá -> xanh dương cho Success, các loại khác tương tự)
  let bgStyle = { background: 'white' };
  switch (type) {
    case 'Success':
      // Gradient mượt: xanh lá nhạt (dưới) -> xanh dương rất nhạt (trên)
      bgStyle = { background: 'linear-gradient(to top, rgba(220, 252, 231, 0.6) 0%, rgba(224, 242, 254, 0.4) 60%, rgba(240, 249, 255, 0.2) 100%)' };
      break;
    case 'Error':
      // Gradient mượt: đỏ nhạt (dưới) -> hồng rất nhạt (trên)
      bgStyle = { background: 'linear-gradient(to top, rgba(254, 226, 226, 0.6) 0%, rgba(252, 231, 243, 0.4) 60%, rgba(253, 242, 248, 0.2) 100%)' };
      break;
    case 'Warning':
      // Gradient mượt: vàng nhạt (dưới) -> cam rất nhạt (trên)
      bgStyle = { background: 'linear-gradient(to top, rgba(254, 243, 199, 0.6) 0%, rgba(255, 237, 213, 0.4) 60%, rgba(255, 247, 237, 0.2) 100%)' };
      break;
    default: // Info
      // Gradient mượt: xanh nước nhạt (dưới) -> tím rất nhạt (trên)
      bgStyle = { background: 'linear-gradient(to top, rgba(224, 242, 254, 0.6) 0%, rgba(224, 231, 255, 0.4) 60%, rgba(238, 242, 255, 0.2) 100%)' };
      break;
  }

  return {
    bgStyle,
    ...iconStyle,
  };
};

// Get icon based on type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Success':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'Error':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'Warning':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    default: // Info
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      setTotalElements(response.totalElements);
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

  // Filter notifications
  let filteredNotifications = notifications;
  
  // Filter by read status
  if (filter === 'unread') {
    filteredNotifications = filteredNotifications.filter(n => !n.isRead);
  }
  
  // Filter by status type
  if (statusFilter !== 'all') {
    filteredNotifications = filteredNotifications.filter(n => n.notificationType === statusFilter);
  }
  
  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredNotifications = filteredNotifications.filter(n => 
      n.title.toLowerCase().includes(query) || 
      n.message.toLowerCase().includes(query)
    );
  }

  const pageSize = 10;
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <BellIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
            <p className="text-gray-500 text-sm">
              Bạn có <span className="text-blue-600 font-medium">{unreadCount}</span> thông báo chưa đọc
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Nhập tên tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Right side filters */}
          <div className="flex items-center gap-3">
            {/* Status dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Trạng thái</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">Tất cả</option>
                <option value="Success">Thành công</option>
                <option value="Error">Lỗi</option>
                <option value="Warning">Cảnh báo</option>
                <option value="Info">Thông tin</option>
              </select>
            </div>

            {/* Filter buttons */}
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                filter === 'all'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                filter === 'unread'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>

            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <CheckIcon />
                Đọc tất cả
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl p-16 text-center border border-gray-100">
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
            filteredNotifications.map((notification) => {
              const style = getNotificationStyle(notification.notificationType, notification.isRead);
              const isUnread = !notification.isRead;

              return (
                <div
                  key={notification.notificationId}
                  onClick={() => isUnread && handleMarkAsRead(notification.notificationId)}
                  style={style.bgStyle}
                  className="rounded-xl p-4 cursor-pointer transition hover:shadow-md border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 ${style.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 ${style.iconColor} border ${style.iconBorder}`}>
                      {getNotificationIcon(notification.notificationType)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-500'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${isUnread ? 'text-gray-600' : 'text-gray-400'}`}>
                        {notification.message}
                      </p>
                    </div>

                    {/* Time */}
                    <div className="text-right flex-shrink-0">
                      <span className={`text-xs ${isUnread ? 'text-gray-500' : 'text-gray-400'}`}>
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-500">
              Hiển thị {startItem}-{endItem} trong tổng số {totalElements} thông báo
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i;
                if (totalPages > 5) {
                  if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
