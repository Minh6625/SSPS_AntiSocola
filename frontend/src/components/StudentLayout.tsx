'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/authService';
import Link from 'next/link';

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
                  <span className="font-bold text-gray-900 text-sm">SPSS Portal</span>
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
                {sidebarOpen && <span className="text-sm">{item.name}</span>}
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
          className="h-16 border-b border-gray-200 flex items-center justify-end px-6 bg-white"
        >
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
