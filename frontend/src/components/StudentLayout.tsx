'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

type UserInfo = {
  email?: string;
  fullName?: string;
};

export default function StudentLayout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const authenticated = authService.isAuthenticated();
    if (!authenticated) {
      router.push('/login');
      return;
    }

    const user = authService.getUserInfo();
    setUserInfo(user);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  // Student sidebar navigation
  const Icons = {
    home: (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11 12 4l9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 21V13h6v8" />
      </svg>
    ),
    upload: (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12" />
        <path d="M7 8l5-5 5 5" />
        <path d="M4 21h16" />
      </svg>
    ),
    history: (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 1 3 6.7" />
        <path d="M3 12h3" />
        <path d="M12 7v6l3 3" />
      </svg>
    ),
    balance: (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 10h16" />
        <path d="M8 15h.01" />
        <path d="M12 15h4" />
      </svg>
    ),
    bell: (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 15V11a6 6 0 0 0-12 0v4" />
        <path d="M5 15h14" />
        <path d="M10 19c0 1.1.9 2 2 2s2-.9 2-2" />
      </svg>
    ),
    help: (
      <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 17v.01" />
        <path d="M12 13a2 2 0 1 0-2-2" />
      </svg>
    ),
    chevronDown: (
      <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    ),
  };

  const studentMenuItems = [
    { name: 'Dashboard', icon: Icons.home, href: '/student/dashboard' },
    { name: 'In tài liệu', icon: Icons.upload, href: '/student/print-document' },
    { name: 'Lịch sử in', icon: Icons.history, href: '/student/print-history' },
    { name: 'Số dư trang', icon: Icons.balance, href: '/student/page-balance' },
    { name: 'Thông báo', icon: Icons.bell, href: '/student/notifications' },
    { name: 'Hỗ trợ', icon: Icons.help, href: '/student/support' },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
      <div className="flex h-screen" style={{
        background: '#f5f7fb'
      }}>
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } text-gray-700 shadow-sm transition-all duration-300 flex flex-col border-r border-gray-200`}
        style={{ background: 'linear-gradient(90deg, #BBE0FC 0%, #ffffff 100%)' }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-2 border-b border-gray-300" style={{ background: 'linear-gradient(90deg, #8FD3FF 0%, #E8F4FE 100%)' }}>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </div>
            {sidebarOpen && <span className="font-bold text-blue-900 text-sm ml-3">SSPS Portal</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-700"
            title={sidebarOpen ? 'Thu gọn' : 'Mở rộng'}
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {studentMenuItems.map((item: any) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition mb-1 ${
                  isActive(item.href)
                    ? 'bg-blue-200 text-blue-800 font-semibold shadow-sm border border-blue-300'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`text-base leading-none ${
                  isActive(item.href) ? 'text-blue-600' : 'text-gray-500'
                }`}>{item.icon}</span>
                {sidebarOpen && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
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
                          ? 'text-blue-700 bg-blue-50 font-semibold'
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
            <div className="text-center space-y-1">
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
          className="h-16 shadow-sm border-b border-gray-200 flex items-center justify-between px-6"
          style={{ background: '#ffffff' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              {userInfo?.fullName?.charAt(0).toUpperCase() || userInfo?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm text-gray-600">Sinh viên</p>
              <h1 className="text-lg font-semibold text-gray-800">
                {userInfo?.fullName || userInfo?.email?.split('@')[0] || 'Student'}
              </h1>
            </div>
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
              <span className="text-sm text-gray-700 hidden md:block">
                {userInfo?.fullName || userInfo?.email?.split('@')[0] || 'User'}
              </span>
              <span className={`transition ${dropdownOpen ? 'rotate-180' : ''}`}>
                {Icons.chevronDown}
              </span>
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
