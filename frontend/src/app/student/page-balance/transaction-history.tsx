'use client';

import React, { useState, useEffect } from 'react';
import { pageBalanceService } from '@/services/pageBalanceService';
import { PageTransaction } from '@/types/pageBalance';

const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<PageTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Fetch transactions
  const fetchTransactions = async (page: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await pageBalanceService.getTransactions(page, pageSize, {
        type: typeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setTransactions(response.content);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch sử giao dịch');
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on mount and when filters change
  useEffect(() => {
    fetchTransactions(0);
  }, [typeFilter, startDate, endDate]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchTransactions(newPage);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
  };

  // Get transaction type label
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'Allocate': 'Cấp phát',
      'Purchase': 'Mua thêm',
      'Use': 'Khấu trừ (in)',
      'ALLOCATED': 'Cấp phát',
      'PURCHASED': 'Mua thêm',
      'DEDUCTED': 'Khấu trừ (in)',
    };
    return labels[type] || type;
  };

  // Get transaction type color
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'Allocate': 'bg-blue-100 text-blue-800',
      'Purchase': 'bg-green-100 text-green-800',
      'Use': 'bg-orange-100 text-orange-800',
      'ALLOCATED': 'bg-blue-100 text-blue-800',
      'PURCHASED': 'bg-green-100 text-green-800',
      'DEDUCTED': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lịch sử giao dịch</h2>
        <p className="text-gray-600">Xem chi tiết tất cả các giao dịch trang in của bạn</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại giao dịch
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="Allocate">Cấp phát</option>
              <option value="Purchase">Mua thêm</option>
              <option value="Use">Khấu trừ (in)</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Table */}
      {!loading && transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Mã GD
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ngày giờ
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Số trang A4
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Số trang A3
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Số dư A4 sau
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Số dư A3 sau
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ghi chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.transactionId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono font-medium">
                      {transaction.transactionCode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          transaction.transactionType
                        )}`}
                      >
                        {getTypeLabel(transaction.transactionType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                      {transaction.transactionType === 'Use' || transaction.transactionType === 'DEDUCTED' ? '-' : '+'}
                      {Math.abs(transaction.a4Pages)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-medium">
                      {transaction.a3Pages === 0 ? '-' : (transaction.transactionType === 'Use' || transaction.transactionType === 'DEDUCTED' ? '-' : '+') + Math.abs(transaction.a3Pages)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                      {transaction.balanceAfterA4 ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">
                      {transaction.balanceAfterA3 ?? '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {transaction.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Trang {currentPage + 1} / {totalPages} (Tổng: {transactions.length} giao dịch)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trang trước
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Trang sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có giao dịch</h3>
          <p className="text-gray-600">
            Bạn chưa có giao dịch nào. Hãy mua thêm trang in hoặc in tài liệu để bắt đầu.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
