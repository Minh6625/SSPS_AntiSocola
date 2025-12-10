'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const authenticated = authService.isAuthenticated();
    if (!authenticated) {
      router.push('/login');
      return;
    }

    setIsAuthenticated(true);
    const user = authService.getUserInfo();
    setUserInfo(user);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  // Student sidebar navigation
  const studentMenuItems = [
    {
      name: 'Dashboard',
      icon: '📊',
      href: '/student/dashboard',
      badge: null,
    },
    {
      name: 'In tài liệu',
      icon: '📄',
      href: '/student/print',
      badge: null,
      submenu: [
        { name: 'Tải tài liệu', href: '/student/documents/upload' },
        { name: 'Chọn máy in', href: '/student/printers' },
        { name: 'Cấu hình in', href: '/student/print/configure' },
      ],
    },
    {
      name: 'Lịch sử in',
      icon: '📋',
      href: '/student/print-history',
      badge: null,
    },
    {
      name: 'Số dư trang',
      icon: '📄',
      href: '/student/page-balance',
      badge: '50',
    },
    {
      name: 'Thông báo',
      icon: '🔔',
      href: '/student/notifications',
      badge: '3',
    },
    {
      name: 'Hỗ trợ',
      icon: '❓',
      href: '/student/support',
      badge: null,
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="font-bold text-gray-800 text-sm">SSPS</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title={sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {studentMenuItems.map((item: any) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition mb-2 ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>

              {/* Submenu */}
              {sidebarOpen && item.submenu && isActive(item.href) && (
                <div className="ml-8 space-y-1">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.href}
                      href={subitem.href}
                      className={`block px-4 py-2 text-sm rounded-lg transition ${
                        isActive(subitem.href)
                          ? 'text-blue-600 bg-blue-50 font-semibold'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {subitem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-200 text-xs text-gray-600">
            <div className="text-center">
              <p>Hệ thống in HCMIU</p>
              <p className="text-gray-500">v1.0</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {userInfo?.email || 'Student'}
            </h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {userInfo?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-gray-700 hidden md:block">
                {userInfo?.email?.split('@')[0] || 'User'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-600 transition ${
                  dropdownOpen ? 'transform rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <Link
                  href="/student/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Thông tin cá nhân
                </Link>
                <Link
                  href="/student/settings"
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
    </div>
  );
}
