'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { adminTransactionService } from '@/services/adminTransactionService';
import { AdminTransaction, AdminTransactionResponse, TransactionFilter } from '@/types/adminTransaction';

// Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Statistics (không bị ảnh hưởng bởi filter)
  const [stats, setStats] = useState({
    totalAll: 0,
    totalAllocate: 0,
    totalPurchase: 0,
    totalUse: 0,
  });

  // Filters
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [selectedTransaction, setSelectedTransaction] = useState<AdminTransaction | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch transactions
  const fetchTransactions = useCallback(async (page: number = 0, isInitial: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const filters: TransactionFilter = {};
      if (keyword.trim()) filters.keyword = keyword.trim();
      if (typeFilter) filters.type = typeFilter;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;

      const response: AdminTransactionResponse = await adminTransactionService.getTransactions(
        page, pageSize, filters
      );

      setTransactions(response.content);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      
      // Chỉ cập nhật stats khi load lần đầu (không có filter)
      if (isInitial) {
        setStats({
          totalAll: response.totalAllocateTransactions + response.totalPurchaseTransactions + response.totalUseTransactions,
          totalAllocate: response.totalAllocateTransactions,
          totalPurchase: response.totalPurchaseTransactions,
          totalUse: response.totalUseTransactions,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  }, [keyword, typeFilter, startDate, endDate, pageSize]);

  // Load on mount
  useEffect(() => {
    fetchTransactions(0, true);
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(0);
    fetchTransactions(0);
  };

  // Handle filter change
  const handleApplyFilters = () => {
    setCurrentPage(0);
    fetchTransactions(0);
  };

  // Clear filters
  const handleClearFilters = () => {
    setKeyword('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(0);
    setTimeout(() => fetchTransactions(0), 0);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      fetchTransactions(newPage);
    }
  };

  // View transaction detail
  const handleViewDetail = async (transaction: AdminTransaction) => {
    try {
      const detail = await adminTransactionService.getTransactionById(transaction.transactionId);
      setSelectedTransaction(detail);
      setShowModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết giao dịch');
    }
  };

  // Get transaction type label
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'Allocate': 'Cấp phát',
      'Purchase': 'Mua thêm',
      'Use': 'Khấu trừ (in)',
    };
    return labels[type] || type;
  };

  // Get transaction type color
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      'Allocate': 'bg-blue-100 text-blue-800',
      'Purchase': 'bg-green-100 text-green-800',
      'Use': 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // Get status label (Vietnamese)
  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'Completed': 'Hoàn thành',
      'Pending': 'Đang xử lý',
      'Failed': 'Thất bại',
    };
    return labels[status] || status;
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Completed': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Failed': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  // Format currency
  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý giao dịch</h1>
          <p className="text-gray-600 mt-1">Xem và quản lý tất cả giao dịch trang in của sinh viên</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
          <div className="text-sm text-gray-500">Tổng giao dịch</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAll}</div>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-100">
          <div className="text-sm text-blue-600">Cấp phát</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{stats.totalAllocate}</div>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm p-4 border border-green-100">
          <div className="text-sm text-green-600">Mua thêm</div>
          <div className="text-2xl font-bold text-green-700 mt-1">{stats.totalPurchase}</div>
        </div>
        <div className="bg-orange-50 rounded-xl shadow-sm p-4 border border-orange-100">
          <div className="text-sm text-orange-600">Khấu trừ (in)</div>
          <div className="text-2xl font-bold text-orange-700 mt-1">{stats.totalUse}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm theo mã giao dịch, mã sinh viên, tên sinh viên..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FilterIcon />
            <span>Bộ lọc</span>
          </button>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Loại giao dịch
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Allocate">Cấp phát</option>
                  <option value="Purchase">Mua thêm</option>
                  <option value="Use">Khấu trừ (in)</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Áp dụng
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Xóa lọc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Table */}
      {!loading && transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Mã GD
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sinh viên
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Số trang A4
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Số dư sau
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ngày giờ
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.transactionId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">
                      {transaction.transactionCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{transaction.studentId}</div>
                      <div className="text-xs text-gray-500">{transaction.studentName || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.transactionType)}`}>
                        {getTypeLabel(transaction.transactionType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      <span className={transaction.transactionType === 'Use' ? 'text-red-600' : 'text-green-600'}>
                        {transaction.transactionType === 'Use' ? '' : '+'}
                        {transaction.a4Pages}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {transaction.balanceAfterA4 ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.transactionStatus)}`}>
                        {getStatusLabel(transaction.transactionStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {transaction.amount ? formatCurrency(transaction.amount) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetail(transaction)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                        title="Xem chi tiết"
                      >
                        <EyeIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Hiển thị {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, totalElements)} / {totalElements} giao dịch
            </div>
            <div className="flex items-center gap-1">
              {/* First */}
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                className="px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Trang đầu"
              >
                «
              </button>
              {/* Previous */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Trang trước"
              >
                ‹
              </button>
              
              {/* Page Numbers */}
              {(() => {
                const pages = [];
                const maxVisible = 5;
                let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
                let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
                
                if (endPage - startPage < maxVisible - 1) {
                  startPage = Math.max(0, endPage - maxVisible + 1);
                }
                
                if (startPage > 0) {
                  pages.push(
                    <button
                      key={0}
                      onClick={() => handlePageChange(0)}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      1
                    </button>
                  );
                  if (startPage > 1) {
                    pages.push(<span key="start-ellipsis" className="px-1 text-gray-500">...</span>);
                  }
                }
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`px-3 py-1.5 border rounded text-sm transition ${
                        i === currentPage
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                }
                
                if (endPage < totalPages - 1) {
                  if (endPage < totalPages - 2) {
                    pages.push(<span key="end-ellipsis" className="px-1 text-gray-500">...</span>);
                  }
                  pages.push(
                    <button
                      key={totalPages - 1}
                      onClick={() => handlePageChange(totalPages - 1)}
                      className="px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
              
              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Trang sau"
              >
                ›
              </button>
              {/* Last */}
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-2 py-1.5 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Trang cuối"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && transactions.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có giao dịch</h3>
          <p className="text-gray-600">Không tìm thấy giao dịch nào phù hợp với bộ lọc.</p>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-6">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Chi tiết giao dịch</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <label className="text-xs text-gray-500">Mã giao dịch</label>
                    <p className="font-mono font-semibold text-gray-900">{selectedTransaction.transactionCode}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.transactionStatus)}`}>
                    {getStatusLabel(selectedTransaction.transactionStatus)}
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <label className="text-xs text-gray-500">Sinh viên</label>
                  <p className="font-semibold text-gray-900">{selectedTransaction.studentId}</p>
                  <p className="text-sm text-gray-600">{selectedTransaction.studentName || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                  <div>
                    <label className="text-xs text-gray-500">Loại giao dịch</label>
                    <p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(selectedTransaction.transactionType)}`}>
                        {getTypeLabel(selectedTransaction.transactionType)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Số trang A4</label>
                    <p className={`font-semibold ${selectedTransaction.transactionType === 'Use' ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedTransaction.transactionType === 'Use' ? '' : '+'}
                      {selectedTransaction.a4Pages}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Số dư sau GD</label>
                    <p className="font-semibold text-gray-900">{selectedTransaction.balanceAfterA4 ?? '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Số tiền</label>
                    <p className="font-semibold text-gray-900">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                </div>

                {selectedTransaction.paymentMethod && (
                  <div>
                    <label className="text-xs text-gray-500">Phương thức thanh toán</label>
                    <p className="text-gray-900 text-sm">{selectedTransaction.paymentMethod}</p>
                  </div>
                )}

                {selectedTransaction.notes && (
                  <div className="border-t border-gray-100 pt-3">
                    <label className="text-xs text-gray-500">Ghi chú</label>
                    <p className="text-gray-900 text-sm">{selectedTransaction.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                  <div>
                    <label className="text-xs text-gray-500">Ngày tạo</label>
                    <p className="text-gray-900 text-sm">{formatDate(selectedTransaction.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Người tạo</label>
                    <p className="text-gray-900 text-sm">{selectedTransaction.createdBy || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
