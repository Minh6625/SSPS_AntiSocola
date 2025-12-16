'use client';

import React, { useState, useEffect } from 'react';
import { pageBalanceService } from '@/services/pageBalanceService';
import { pagePricingService } from '@/services/pagePricingService';
import { PageBalanceResponse } from '@/types/pageBalance';
import { PagePricing } from '@/types/pagePricing';
import TransactionHistory from '@/app/student/page-balance/transaction-history';

const PageBalanceSection: React.FC = () => {
  const [balance, setBalance] = useState<PageBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseA4Pages, setPurchaseA4Pages] = useState<number>(0);
  const [purchaseA3Pages, setPurchaseA3Pages] = useState<number>(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [priceA4, setPriceA4] = useState<number>(500); // Default A4 price
  const [priceA3, setPriceA3] = useState<number>(1000); // Default A3 price

  // Fetch balance and pricing on mount
  useEffect(() => {
    fetchBalance();
    fetchPricing();
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

  const fetchPricing = async () => {
    try {
      const pricings = await pagePricingService.getAllPricing();
      
      // Set prices for A4 and A3
      const a4Price = pricings.find(p => p.paperSize === 'A4');
      const a3Price = pricings.find(p => p.paperSize === 'A3');
      
      if (a4Price) {
        setPriceA4(a4Price.pricePerPage);
      }
      if (a3Price) {
        setPriceA3(a3Price.pricePerPage);
      }
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
    }
  };

  const handlePurchase = async () => {
    // Validate input - phải mua ít nhất 1 trang (A4 hoặc A3)
    if ((purchaseA4Pages < 0 || purchaseA4Pages > 1000) && (purchaseA3Pages < 0 || purchaseA3Pages > 500)) {
      setError('Vui lòng nhập số trang hợp lệ');
      return;
    }
    if (purchaseA4Pages < 0 || purchaseA4Pages > 1000) {
      setError('Số trang A4 phải từ 0 đến 1000');
      return;
    }
    if (purchaseA3Pages < 0 || purchaseA3Pages > 500) {
      setError('Số trang A3 phải từ 0 đến 500');
      return;
    }
    if (purchaseA4Pages === 0 && purchaseA3Pages === 0) {
      setError('Vui lòng nhập ít nhất 1 trang');
      return;
    }

    try {
      setPurchasing(true);
      setError(null);
      const response = await pageBalanceService.purchasePages(purchaseA4Pages, purchaseA3Pages);

      // Refresh balance
      await fetchBalance();
      setShowPurchaseModal(false);
      setPurchaseA4Pages(0);
      setPurchaseA3Pages(0);
      
      // Show success message
      alert(response.message || 'Mua trang in thành công!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mua trang thất bại');
    } finally {
      setPurchasing(false);
    }
  };

  const totalPrice = (purchaseA4Pages * priceA4) + (purchaseA3Pages * priceA3);
  // Form hợp lệ: phải mua ít nhất 1 trang, và số lượng trong range
  const isValidForm = 
    (purchaseA4Pages >= 0 && purchaseA4Pages <= 1000) &&
    (purchaseA3Pages >= 0 && purchaseA3Pages <= 500) &&
    (purchaseA4Pages > 0 || purchaseA3Pages > 0);

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
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Số dư trang in</h2>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý số dư trang in và lịch sử giao dịch của bạn</p>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* A4 Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số trang A4 (0-1000)
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={purchaseA4Pages}
                  onChange={(e) => setPurchaseA4Pages(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    purchaseA4Pages >= 0 && purchaseA4Pages <= 1000
                      ? 'border-gray-300 focus:ring-blue-500'
                      : 'border-red-300 focus:ring-red-500'
                  }`}
                />
                {purchaseA4Pages > 1000 && (
                  <p className="text-xs text-red-600 mt-1">Tối đa 1000 trang</p>
                )}
              </div>

              {/* A3 Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số trang A3 (0-500)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={purchaseA3Pages}
                  onChange={(e) => setPurchaseA3Pages(Math.max(0, parseInt(e.target.value) || 0))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    purchaseA3Pages >= 0 && purchaseA3Pages <= 500
                      ? 'border-gray-300 focus:ring-blue-500'
                      : 'border-red-300 focus:ring-red-500'
                  }`}
                />
                {purchaseA3Pages > 500 && (
                  <p className="text-xs text-red-600 mt-1">Tối đa 500 trang</p>
                )}
              </div>

              {/* Price Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tổng tiền
                </label>
                <div className="text-2xl font-bold text-blue-600">
                  {totalPrice.toLocaleString('vi-VN')} VND
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  A4: {priceA4.toLocaleString('vi-VN')} | A3: {priceA3.toLocaleString('vi-VN')}
                </p>
              </div>

              {/* Button */}
              <div className="flex items-end">
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={!isValidForm}
                  className={`w-full px-6 py-2 rounded-lg transition-colors font-medium ${
                    isValidForm
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Thanh toán qua SIUPay
                </button>
              </div>
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
                <span className="text-gray-700">Số trang A4:</span>
                <span className="font-semibold text-gray-900">{purchaseA4Pages} trang</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Số trang A3:</span>
                <span className="font-semibold text-gray-900">{purchaseA3Pages} trang</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Giá A4:</span>
                <span className="font-semibold text-gray-900">
                  {(purchaseA4Pages * priceA4).toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Giá A3:</span>
                <span className="font-semibold text-gray-900">
                  {(purchaseA3Pages * priceA3).toLocaleString('vi-VN')} VND
                </span>
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
