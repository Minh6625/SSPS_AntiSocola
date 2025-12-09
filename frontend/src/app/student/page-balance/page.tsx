'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/StudentLayout';
import { pageBalanceService } from '@/services/pageBalanceService';
import { PageBalanceResponse } from '@/types/pageBalance';

export default function PageBalancePage() {
  const router = useRouter();
  const [balance, setBalance] = useState<PageBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        if (!token) {
          router.push('/login');
          return;
        }

        const data = await pageBalanceService.getPageBalance();
        setBalance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [router]);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-start">
              <div className="text-3xl mr-4">⚠️</div>
              <div>
                <h3 className="font-bold text-red-800 text-lg">Lỗi</h3>
                <p className="text-red-700 mt-2">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Số dư trang in</h1>
          <p className="text-gray-600 mt-2">Quản lý và theo dõi số dư trang A4, A3 của bạn</p>
        </div>

        {/* Main Stats Grid */}
        {balance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* A4 Card */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-8 border-l-4 border-blue-600 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Trang A4</p>
                  <p className="text-5xl font-bold text-blue-600 mt-2">{balance.pagesA4}</p>
                </div>
                <div className="text-6xl opacity-20">📄</div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-xs text-gray-600">Khổ giấy tiêu chuẩn</p>
              </div>
            </div>

            {/* A3 Card */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-8 border-l-4 border-green-600 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Trang A3</p>
                  <p className="text-5xl font-bold text-green-600 mt-2">{balance.pagesA3}</p>
                </div>
                <div className="text-6xl opacity-20">📋</div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs text-gray-600">Khổ giấy lớn (= 2 trang A4)</p>
              </div>
            </div>

            {/* Total Equivalent Card */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-8 border-l-4 border-purple-600 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Tổng quy đổi</p>
                  <p className="text-5xl font-bold text-purple-600 mt-2">{balance.totalA4Equivalent}</p>
                </div>
                <div className="text-6xl opacity-20">📊</div>
              </div>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <p className="text-xs text-gray-600">Tính theo A4 (A4 + A3×2)</p>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage Info */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-3">ℹ️</span>
              Thông tin sử dụng
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-3">•</span>
                <div>
                  <p className="font-semibold text-gray-800">Trang A4</p>
                  <p className="text-sm text-gray-600">Khổ giấy tiêu chuẩn (210×297mm)</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 font-bold mr-3">•</span>
                <div>
                  <p className="font-semibold text-gray-800">Trang A3</p>
                  <p className="text-sm text-gray-600">Khổ giấy lớn (297×420mm) = 2 trang A4</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 font-bold mr-3">•</span>
                <div>
                  <p className="font-semibold text-gray-800">Tổng quy đổi</p>
                  <p className="text-sm text-gray-600">Tính toán: A4 + (A3 × 2)</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Last Updated & Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-2xl mr-3">⏱️</span>
              Thông tin cập nhật
            </h2>
            {balance && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Cập nhật lần cuối</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {new Date(balance.lastUpdated).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    🔄 Làm mới
                  </button>
                  <button
                    onClick={() => router.push('/student/dashboard')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    ← Quay lại
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Hành động nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
              📤 Tải tài liệu
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
              🖨️ In tài liệu
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
              💳 Mua thêm trang
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
