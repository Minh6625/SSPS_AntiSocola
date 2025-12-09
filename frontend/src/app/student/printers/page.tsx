'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { printerService } from '@/services/printerService';
import { Printer, PrinterFilters } from '@/types/printer';
import StudentLayout from '@/components/StudentLayout';

export default function PrinterSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId');

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [filters, setFilters] = useState<PrinterFilters>({
    status: 'Active', // Default: chỉ hiện máy khả dụng
  });
  const [campus, setCampus] = useState<string>('');
  const [building, setBuilding] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(true);

  // Fetch printers
  const fetchPrinters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await printerService.getPrinters(filters, currentPage, 20);
      setPrinters(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách máy in');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchPrinters();
  }, [filters, currentPage]);

  // Apply filters
  const handleApplyFilters = () => {
    setFilters({
      campus: campus || undefined,
      building: building || undefined,
      status: showAvailableOnly ? 'Active' : undefined,
      keyword: keyword || undefined,
    });
    setCurrentPage(0);
  };

  // Reset filters
  const handleResetFilters = () => {
    setCampus('');
    setBuilding('');
    setKeyword('');
    setShowAvailableOnly(true);
    setFilters({ status: 'Active' });
    setCurrentPage(0);
  };

  // Select printer
  const handleSelectPrinter = (printerId: string) => {
    if (!documentId) {
      alert('Vui lòng chọn tài liệu trước');
      router.push('/student/print-document');
      return;
    }
    
    // Navigate to print configuration with selected printer
    router.push(`/student/print/configure?documentId=${documentId}&printerId=${printerId}`);
  };

  // Status badge color
  const getStatusBadge = (status: string) => {
    const badges = {
      Active: 'bg-green-100 text-green-800 border-green-300',
      Inactive: 'bg-gray-100 text-gray-800 border-gray-300',
      Maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Error: 'bg-red-100 text-red-800 border-red-300',
    };
    const text = {
      Active: 'Khả dụng',
      Inactive: 'Tắt',
      Maintenance: 'Bảo trì',
      Error: 'Lỗi',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${badges[status as keyof typeof badges] || badges.Inactive}`}>
        {text[status as keyof typeof text] || status}
      </span>
    );
  };

  return (
    <StudentLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Chọn máy in</h1>
          <p className="text-sm text-gray-500 mt-1">Chọn máy in phù hợp với nhu cầu của bạn</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Campus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cơ sở</label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="Dĩ An">Dĩ An</option>
                <option value="Thành phố">Thành phố</option>
              </select>
            </div>

            {/* Building */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tòa nhà</label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!campus}
              >
                <option value="">Tất cả</option>
                {printerService.getAvailableBuildings(campus).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Keyword */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tên máy in, phòng..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Available Toggle */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Chỉ máy khả dụng</span>
              </label>
            </div>
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Áp dụng
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Đặt lại
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Đang tải...</p>
          </div>
        )}

        {/* Printer cards grid */}
        {!loading && !error && (
          <>
            {printers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <p className="text-gray-500 mt-4">Không có máy in nào khả dụng</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {printers.map((printer) => (
                  <div
                    key={printer.printerId}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
                  >
                    {/* Printer icon */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{printer.printerName}</h3>
                          <p className="text-xs text-gray-500">{printer.brand} {printer.model}</p>
                        </div>
                      </div>
                      {getStatusBadge(printer.status)}
                    </div>

                    {/* Location */}
                    <div className="mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{printer.campus} - {printer.building} - {printer.roomNumber}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {printer.paperSizes?.split(',').map(size => (
                        <span key={size} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {size.trim()}
                        </span>
                      ))}
                      {printer.colorPrinting && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          Màu
                        </span>
                      )}
                      {printer.duplexPrinting && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          2 mặt
                        </span>
                      )}
                    </div>

                    {/* Select button */}
                    <button
                      onClick={() => handleSelectPrinter(printer.printerId)}
                      disabled={printer.status !== 'Active'}
                      className={`w-full py-2 rounded-lg font-medium transition ${
                        printer.status === 'Active'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {printer.status === 'Active' ? 'Chọn máy in này' : 'Không khả dụng'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-sm text-gray-600">
                  Hiển thị {printers.length} / {totalElements} máy in
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>
                  <span className="px-3 py-1">
                    Trang {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}
