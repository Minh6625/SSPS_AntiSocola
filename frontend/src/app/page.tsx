'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{
      background: 'radial-gradient(circle at top left, rgba(59, 130, 246, 0.4) 0%, transparent 50%), radial-gradient(circle at top right, rgba(96, 165, 250, 0.3) 0%, transparent 50%), radial-gradient(circle at bottom left, rgba(147, 197, 253, 0.3) 0%, transparent 50%), radial-gradient(circle at bottom right, rgba(191, 219, 254, 0.2) 0%, transparent 50%), #ffffff'
    }}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-800">HCMSIU SSPS</span>
            </div>

            {/* Right: Login & Register Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                Đăng Nhập
              </Link>
              <Link
                href="/register/step1"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition shadow-sm"
              >
                Tạo Tài Khoản
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center py-20" style={{ minHeight: 'calc(100vh - 4rem)' }}>
        <div className="text-center max-w-5xl px-6">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">
              Hệ Thống In Ấn Thông Minh Sinh Viên
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Hệ thống in ấn thông minh dành riêng cho sinh viên Đại học Quốc tế Sài Gòn SIU. 
              Dễ dàng, nhanh chóng và tiện lợi.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Upload Tài Liệu</h3>
              <p className="text-gray-600">Hỗ trợ nhiều định dạng file: PDF, DOCX, PPTX, XLSX. Tải lên nhanh chóng và bảo mật.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Chọn Máy In</h3>
              <p className="text-gray-600">Xem vị trí, trạng thái máy in theo campus và tòa nhà. Chọn máy in phù hợp nhất.</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md hover:shadow-xl transition">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Quản Lý Số Trang</h3>
              <p className="text-gray-600">Kiểm tra số dư trang in, lịch sử sử dụng và mua thêm trang in trực tuyến.</p>
            </div>
          </div>

          {/* Stats or Benefits */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <p className="text-gray-600">Hoạt động liên tục</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
              <p className="text-gray-600">Máy in khả dụng</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500đ</div>
              <p className="text-gray-600">Giá mỗi trang A4</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
