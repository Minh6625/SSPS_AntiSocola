'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import { notificationService } from '@/services/notificationService';
import Link from 'next/link';
import FloatingButtons from './FloatingButtons';
import MaintenanceCheck from './MaintenanceCheck';

interface LayoutProps {
  children: React.ReactNode;
}

type UserInfo = {
  userId?: string | null;
  email?: string | null;
  role?: string | null;
  fullName?: string | null;
};

interface MenuItem {
  name: string;
  icon: React.ReactElement;
  href: string;
  submenu?: Array<{ name: string; href: string }>;
}

interface NotificationItem {
  notificationId: number;
  title: string;
  message: string;
  notificationType: 'Info' | 'Warning' | 'Error' | 'Success';
  isRead: boolean;
  createdAt: string;
}

// Icon components
const HomeIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 11 12 4l9 7" />
    <path d="M5 10v10h14V10" />
    <path d="M9 21V13h6v8" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="14 3 14 9 20 9" />
    <path d="M12 17v-6m-3 3h6" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 1 3 6.7" />
    <path d="M3 12h3" />
    <path d="M12 7v6l3 3" />
  </svg>
);

const BalanceIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="14" rx="2" />
    <path d="M4 10h16" />
    <path d="M8 15h.01" />
    <path d="M12 15h4" />
  </svg>
);

const BellIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const HelpIcon = () => (
  <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 17v.01" />
    <path d="M12 13a2 2 0 1 0-2-2" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function StudentLayout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    // Check authentication
    const authenticated = authService.isAuthenticated();
    if (!authenticated) {
      router.push('/login');
      return;
    }

    const user = authService.getUserInfo();
    setUserInfo(user);
    
    // Load unread notification count
    loadUnreadCount();

    // Listen for notification updates from other components
    const handleNotificationUpdate = () => {
      loadUnreadCount();
    };
    
    window.addEventListener('notification-update', handleNotificationUpdate);
    
    return () => {
      window.removeEventListener('notification-update', handleNotificationUpdate);
    };
  }, [router]);

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await notificationService.getNotifications(0, 10);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = () => {
    setNotificationOpen(!notificationOpen);
    if (!notificationOpen) {
      loadNotifications();
    }
    setDropdownOpen(false);
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

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getNotificationIcon = (type: string, isRead: boolean) => {
    const iconClass = isRead ? 'text-gray-400' : '';
    const bgClass = isRead ? 'bg-gray-100 border-gray-200' : '';

    switch (type) {
      case 'Success':
        return (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${bgClass || 'bg-green-100 border-green-300'}`}>
            <svg className={`w-4 h-4 ${iconClass || 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'Error':
        return (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${bgClass || 'bg-red-100 border-red-300'}`}>
            <svg className={`w-4 h-4 ${iconClass || 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'Warning':
        return (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${bgClass || 'bg-yellow-100 border-yellow-300'}`}>
            <svg className={`w-4 h-4 ${iconClass || 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      default: // Info - xanh nước biển (sky)
        return (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${bgClass || 'bg-sky-100 border-sky-300'}`}>
            <svg className={`w-4 h-4 ${iconClass || 'text-sky-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = (items: NotificationItem[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: { [key: string]: NotificationItem[] } = {
      'HÔM NAY': [],
      'HÔM QUA': [],
      'TRƯỚC ĐÓ': [],
    };

    items.forEach(item => {
      const itemDate = new Date(item.createdAt);
      itemDate.setHours(0, 0, 0, 0);

      if (itemDate.getTime() === today.getTime()) {
        groups['HÔM NAY'].push(item);
      } else if (itemDate.getTime() === yesterday.getTime()) {
        groups['HÔM QUA'].push(item);
      } else {
        groups['TRƯỚC ĐÓ'].push(item);
      }
    });

    return groups;
  };

  const filteredNotifications = notificationFilter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const studentMenuItems: MenuItem[] = [
    { name: 'Dashboard', icon: <HomeIcon />, href: '/student/dashboard' },
    { name: 'In tài liệu', icon: <UploadIcon />, href: '/student/print-document' },
    { name: 'Lịch sử in', icon: <HistoryIcon />, href: '/student/print-history' },
    { name: 'Số dư trang', icon: <BalanceIcon />, href: '/student/page-balance' },
    { name: 'Thông báo', icon: <BellIcon />, href: '/student/notifications' },
    { name: 'Hỗ trợ', icon: <HelpIcon />, href: '/student/support' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen" style={{ background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-60' : 'w-20'
        } text-gray-700 transition-all duration-300 flex flex-col border-r border-gray-200 bg-white`}
      >
        {/* Logo */}
        <div className="h-16 px-3 flex items-center">
          <div className="w-full py-3 border-b border-gray-200">
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">SPSS SIU</span>
                </div>
                
                {/* Toggle Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-600 transition flex-shrink-0"
                  title="Thu gọn"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </div>
                
                {/* Toggle Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-600 transition"
                  title="Mở rộng"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          <div className="space-y-2 pb-4 border-b border-gray-200">
            {sidebarOpen && <p className="text-xs font-semibold text-gray-500 tracking-wide">TỔNG QUAN</p>}
            {[studentMenuItems[0], studentMenuItems[4]].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg transition ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-300 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <span className={`text-base leading-none ${isActive(item.href) ? 'text-blue-600' : 'text-gray-600'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="text-sm flex-1 flex items-center justify-between">
                    {item.name}
                    {item.href === '/student/notifications' && unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </span>
                )}
                {!sidebarOpen && item.href === '/student/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="space-y-2">
            {sidebarOpen && <p className="text-xs font-semibold text-gray-500 tracking-wide">CÔNG VIỆC IN ẤN</p>}
            {[studentMenuItems[1], studentMenuItems[2], studentMenuItems[3]].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg transition ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-300 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <span className={`text-base leading-none ${isActive(item.href) ? 'text-blue-600' : 'text-gray-600'}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
         {sidebarOpen && (
           <div className="px-3 py-4">
             <div className="pt-4 border-t border-gray-200 text-xs text-gray-600 text-center space-y-1">
               <p className="font-medium text-gray-800">Hệ thống in HCMIU</p>
               <p className="text-gray-600">Phiên bản 1.0</p>
             </div>
           </div>
         )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header
          className="h-16 border-b border-gray-200 flex items-center justify-end px-6 bg-white gap-4"
        >
          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Thông báo</h3>
                    <button
                      onClick={() => setNotificationOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Filter Tabs */}
                  <div className="flex bg-gray-100 rounded-full p-1">
                    <button
                      onClick={() => setNotificationFilter('all')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-full transition ${
                        notificationFilter === 'all'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setNotificationFilter('unread')}
                      className={`flex-1 py-1.5 text-sm font-medium rounded-full transition flex items-center justify-center gap-1.5 ${
                        notificationFilter === 'unread'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Chưa đọc
                      {unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Mark all as read */}
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p className="text-sm">Không có thông báo</p>
                    </div>
                  ) : (
                    Object.entries(groupedNotifications).map(([group, items]) => (
                      items.length > 0 && (
                        <div key={group}>
                          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                            <span className="text-xs font-semibold text-gray-500">{group}</span>
                          </div>
                          {items.map((notification) => (
                            <div
                              key={notification.notificationId}
                              onClick={() => !notification.isRead && handleMarkAsRead(notification.notificationId)}
                              className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50 ${
                                !notification.isRead ? 'bg-blue-50/30' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Unread dot */}
                                <div className="pt-2">
                                  {!notification.isRead ? (
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  ) : (
                                    <div className="w-2 h-2"></div>
                                  )}
                                </div>
                                
                                {/* Icon */}
                                {getNotificationIcon(notification.notificationType, notification.isRead)}
                                
                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-sm font-medium ${notification.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                                    {notification.title}
                                  </h4>
                                  <p className={`text-xs mt-0.5 line-clamp-2 ${notification.isRead ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {notification.message}
                                  </p>
                                  <span className="text-xs text-gray-400 mt-1 block">
                                    {formatDate(notification.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-100 bg-gray-50">
                  <Link
                    href="/student/notifications"
                    onClick={() => setNotificationOpen(false)}
                    className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Xem tất cả thông báo
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition text-gray-700"
            >
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                {userInfo?.fullName?.charAt(0).toUpperCase() || userInfo?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-gray-700 block">
                {userInfo?.fullName || userInfo?.email?.split('@')[0] || 'User'}
              </span>
              <span className={`transition ${dropdownOpen ? 'rotate-180' : ''}`}>
                <ChevronDownIcon />
              </span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <Link
                  href="/student/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  href="/student/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cài đặt
                </Link>
                <hr className="my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Floating Buttons - Chatbot, Zalo, Messenger */}
      <FloatingButtons 
        zaloLink="https://zalo.me/0937833154"
        messengerLink="https://www.messenger.com/e2ee/t/8489567564474582"
      />

      {/* Maintenance Mode Check */}
      <MaintenanceCheck />
    </div>
  );
}
