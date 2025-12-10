'use client';

import React, { useState, useEffect } from 'react';
import { pageBalanceService } from '@/services/pageBalanceService';
import { PageBalanceResponse } from '@/types/pageBalance';
import TransactionHistory from '@/app/student/page-balance/transaction-history';

const PageBalanceSection: React.FC = () => {
  const [balance, setBalance] = useState<PageBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasePages, setPurchasePages] = useState<number>(10);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // Fetch balance on mount
  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pageBalanceService.getBalance();
      if (data && data.pagesA4 !== undefined) {
        setBalance(data);
      } else {
        setError('Dữ liệu số dư không hợp lệ');
        setBalance(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải số dư trang in');
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (purchasePages <= 0) {
      setError('Vui lòng nhập số trang hợp lệ');
      return;
    }

    try {
      setPurchasing(true);
      setError(null);
      await pageBalanceService.purchasePages(purchasePages);

      // Refresh balance
      await fetchBalance();
      setShowPurchaseModal(false);
      setPurchasePages(10);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mua trang thất bại');
    } finally {
      setPurchasing(false);
    }
  };

  const pricePerPage = 500; // VND
  const totalPrice = purchasePages * pricePerPage;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Số dư trang in</h2>
        <p className="text-gray-600 text-sm mt-1">Quản lý số dư trang in và lịch sử giao dịch của bạn</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Balance Cards */}
      {balance && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* A4 Balance Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trang A4</h3>
                <div className="text-3xl">📄</div>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {balance.pagesA4}
              </div>
              <p className="text-gray-600 text-sm mb-4">trang</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((balance.pagesA4 / 100) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* A3 Balance Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trang A3</h3>
                <div className="text-3xl">📋</div>
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {balance.pagesA3}
              </div>
              <p className="text-gray-600 text-sm mb-4">trang</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((balance.pagesA3 / 100) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Total A4 Equivalent Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tổng A4 tương đương</h3>
                <div className="text-3xl">📊</div>
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {balance.totalA4Equivalent}
              </div>
              <p className="text-gray-600 text-sm mb-4">trang</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((balance.totalA4Equivalent / 100) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Purchase Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mua thêm trang in</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số trang A4 muốn mua
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={purchasePages}
                  onChange={(e) => setPurchasePages(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá tiền
                </label>
                <div className="text-2xl font-bold text-blue-600">
                  {totalPrice.toLocaleString('vi-VN')} VND
                </div>
                <p className="text-xs text-gray-600 mt-1">500 VND/trang</p>
              </div>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Thanh toán qua SIUPay
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <TransactionHistory />
          </div>
        </>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận mua trang in</h3>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Số trang:</span>
                <span className="font-semibold text-gray-900">{purchasePages} trang</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Giá/trang:</span>
                <span className="font-semibold text-gray-900">500 VND</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="text-gray-900 font-semibold">Tổng cộng:</span>
                <span className="text-lg font-bold text-blue-600">
                  {totalPrice.toLocaleString('vi-VN')} VND
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPurchaseModal(false)}
                disabled={purchasing}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  'Xác nhận thanh toán'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBalanceSection;
