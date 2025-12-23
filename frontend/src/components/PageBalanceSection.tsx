'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { pageBalanceService } from '@/services/pageBalanceService';
import { pagePricingService } from '@/services/pagePricingService';
import { paymentService, CreatePaymentResponse, PaymentNotification } from '@/services/paymentService';
import { PageBalanceResponse } from '@/types/pageBalance';
import TransactionHistory from '@/app/student/page-balance/transaction-history';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';

const PageBalanceSection: React.FC = () => {
  const [balance, setBalance] = useState<PageBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseA4Pages, setPurchaseA4Pages] = useState<number>(1);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [priceA4, setPriceA4] = useState<number>(500);
  
  // Payment state
  const [currentPayment, setCurrentPayment] = useState<CreatePaymentResponse | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [countdown, setCountdown] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  // WebSocket
  const stompClientRef = useRef<Client | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get student ID from token
  const getStudentId = useCallback(() => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.userId || payload.studentId;
    } catch {
      return null;
    }
  }, []);

  // Fetch balance and pricing on mount
  useEffect(() => {
    fetchBalance();
    fetchPricing();
    
    return () => {
      disconnectWebSocket();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Countdown timer for QR modal
  useEffect(() => {
    if (showQRModal && currentPayment && paymentStatus === 'pending') {
      const expiresAt = new Date(currentPayment.expiresAt).getTime();
      
      const updateCountdown = () => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setCountdown(remaining);
        
        if (remaining <= 0) {
          setPaymentStatus('failed');
          setError('Giao dịch đã hết hạn. Vui lòng tạo giao dịch mới.');
        }
      };
      
      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);
      
      return () => clearInterval(timer);
    }
  }, [showQRModal, currentPayment, paymentStatus]);

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
      const a4Price = pricings.find(p => p.paperSize === 'A4');
      if (a4Price) setPriceA4(a4Price.pricePerPage);
    } catch (err) {
      console.error('Failed to fetch pricing:', err);
    }
  };

  // Connect to WebSocket for real-time payment notifications
  const connectWebSocket = useCallback((studentId: string) => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
                  (process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:8080') + '/ws';
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log('STOMP:', str),
    });

    client.onConnect = () => {
      console.log('WebSocket connected');
      
      // Subscribe to payment notifications for this student
      client.subscribe(`/topic/payment/${studentId}`, (message: IMessage) => {
        console.log('Received payment notification:', message.body);
        try {
          const notification: PaymentNotification = JSON.parse(message.body);
          handlePaymentNotification(notification);
        } catch (e) {
          console.error('Error parsing notification:', e);
        }
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    client.activate();
    stompClientRef.current = client;
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
  }, []);

  // Handle payment notification from WebSocket
  const handlePaymentNotification = useCallback((notification: PaymentNotification) => {
    console.log('Processing payment notification:', notification);
    
    if (notification.status === 'SUCCESS') {
      setPaymentStatus('success');
      setSuccessMessage(notification.message);
      
      // Update balance immediately - chỉ A4
      setBalance(prev => prev ? {
        ...prev,
        pagesA4: notification.newA4Balance,
      } : null);
      
      // Stop polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, []);

  // Start polling for payment status (fallback if WebSocket fails)
  const startPolling = useCallback((paymentCode: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await paymentService.getPaymentStatus(paymentCode);
        console.log('Polling payment status:', status);
        
        if (status.status === 'COMPLETED') {
          setPaymentStatus('success');
          setSuccessMessage('Thanh toán thành công! Số dư đã được cập nhật.');
          await fetchBalance();
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (status.status === 'EXPIRED' || status.status === 'CANCELLED') {
          setPaymentStatus('failed');
          setError('Giao dịch đã hết hạn hoặc bị hủy.');
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
      }
    }, 3000); // Poll every 3 seconds
  }, []);

  // Create payment and show QR
  const handleCreatePayment = async () => {
    if (purchaseA4Pages < 1) {
      setError('Vui lòng nhập ít nhất 1 trang A4');
      return;
    }

    try {
      setPurchasing(true);
      setError(null);
      setPaymentStatus('pending');
      
      console.log('Creating payment request:', { a4Pages: purchaseA4Pages });
      
      // Create payment - chỉ A4
      const payment = await paymentService.createPayment(purchaseA4Pages, 0);
      console.log('Payment created successfully:', payment);
      
      // Validate payment response
      if (!payment.success || !payment.qrUrl || !payment.paymentCode) {
        throw new Error('Phản hồi từ server không hợp lệ: ' + JSON.stringify(payment));
      }
      
      setCurrentPayment(payment);
      setShowPurchaseModal(false);
      setShowQRModal(true);
      
      // Connect WebSocket
      const studentId = getStudentId();
      if (studentId) {
        connectWebSocket(studentId);
      }
      
      // Start polling as fallback
      startPolling(payment.paymentCode);
      
    } catch (err) {
      console.error('Error creating payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Tạo giao dịch thất bại';
      setError(errorMessage);
      setPaymentStatus('failed');
    } finally {
      setPurchasing(false);
    }
  };

  // Close QR modal and cleanup
  const handleCloseQRModal = () => {
    setShowQRModal(false);
    setCurrentPayment(null);
    setPaymentStatus('idle');
    setSuccessMessage('');
    setPurchaseA4Pages(1);
    disconnectWebSocket();
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // Refresh balance
    fetchBalance();
  };

  const totalPrice = purchaseA4Pages * priceA4;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* A4 Balance Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trang A4</h3>
                <div className="text-3xl">📄</div>
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{balance.pagesA4}</div>
              <p className="text-gray-600 text-sm mb-4">trang</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((balance.pagesA4 / 100) * 100, 100)}%` }}></div>
              </div>
            </div>

            {/* Available for Print Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Có thể in</h3>
                <div className="text-3xl">🖨️</div>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">{balance.pagesA4} trang A4</div>
              <div className="text-lg font-semibold text-green-600 mb-2">hoặc {Math.floor(balance.pagesA4 / 2)} trang A3</div>
              <p className="text-gray-600 text-xs">1 trang A3 = 2 trang A4</p>
            </div>
          </div>

          {/* Purchase Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mua thêm trang in</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số trang A4 (1-1000)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={purchaseA4Pages}
                  onChange={(e) => setPurchaseA4Pages(Math.max(1, parseInt(e.target.value) || 1))}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    purchaseA4Pages >= 1 && purchaseA4Pages <= 1000 ? 'border-gray-300 focus:ring-blue-500' : 'border-red-300 focus:ring-red-500'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-1">Có thể in {purchaseA4Pages} trang A4 hoặc {Math.floor(purchaseA4Pages / 2)} trang A3</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tổng tiền</label>
                <div className="text-2xl font-bold text-blue-600">{(purchaseA4Pages * priceA4).toLocaleString('vi-VN')} VND</div>
                <p className="text-xs text-gray-600 mt-1">Giá: {priceA4.toLocaleString('vi-VN')} VND/trang</p>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setShowPurchaseModal(true)}
                  disabled={purchaseA4Pages < 1 || purchaseA4Pages > 1000}
                  className={`w-full px-6 py-2 rounded-lg transition-colors font-medium ${
                    purchaseA4Pages >= 1 && purchaseA4Pages <= 1000 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Thanh toán qua SePay
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
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Số trang A4:</span>
                <span className="font-semibold text-gray-900">{purchaseA4Pages} trang</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Có thể in A3:</span>
                <span className="font-semibold text-gray-600">{Math.floor(purchaseA4Pages / 2)} trang</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                <span className="text-gray-900 font-semibold">Tổng cộng:</span>
                <span className="text-lg font-bold text-blue-600">{totalPrice.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Sau khi nhấn "Tạo mã QR", hệ thống sẽ tự động xác nhận khi bạn chuyển khoản thành công.
              </p>
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
                onClick={handleCreatePayment}
                disabled={purchasing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang tạo...
                  </>
                ) : (
                  'Tạo mã QR'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Payment Modal */}
      {showQRModal && currentPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full mx-4">
            {paymentStatus === 'success' ? (
              // Success State
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h3>
                <p className="text-gray-600 mb-6">{successMessage}</p>
                <button
                  onClick={handleCloseQRModal}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            ) : paymentStatus === 'failed' ? (
              // Failed State
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Giao dịch thất bại</h3>
                <p className="text-gray-600 mb-6">{error || 'Giao dịch đã hết hạn hoặc bị hủy.'}</p>
                <button
                  onClick={handleCloseQRModal}
                  className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            ) : (
              // Pending State - Show QR
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Quét mã QR để thanh toán</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    countdown > 60 ? 'bg-green-100 text-green-700' : 
                    countdown > 30 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    ⏱️ {formatCountdown(countdown)}
                  </div>
                </div>
                
                {/* QR Code */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src={currentPayment.qrUrl}
                      alt="QR Code thanh toán"
                      className="w-64 h-64 border-2 border-gray-200 rounded-lg"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                      SePay
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Mã giao dịch:</span>
                    <span className="font-bold text-blue-600">{currentPayment.paymentCode}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Ngân hàng:</span>
                    <span className="font-semibold text-gray-900">{currentPayment.bankName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Số tài khoản:</span>
                    <span className="font-semibold text-gray-900">{currentPayment.bankAccount}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Chủ tài khoản:</span>
                    <span className="font-semibold text-gray-900">{currentPayment.accountName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Số tiền:</span>
                    <span className="font-bold text-blue-600">{currentPayment.amount.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Nội dung CK:</span>
                    <span className="font-semibold text-orange-600">{currentPayment.paymentCode}</span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm text-yellow-800">
                      Đang chờ thanh toán... Hệ thống sẽ tự động xác nhận khi nhận được tiền.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseQRModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Hủy giao dịch
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageBalanceSection;
