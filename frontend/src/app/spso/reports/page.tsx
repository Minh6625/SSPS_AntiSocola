'use client';

import { useState, useEffect } from 'react';
import { reportService, MonthlyReportDTO, YearlyReportDTO } from '@/services/reportService';

type ReportType = 'monthly' | 'yearly';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Năm hiện tại
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Tháng hiện tại
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReportDTO | null>(null);
  const [yearlyReport, setYearlyReport] = useState<YearlyReportDTO | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate available years (current year and 5 years back)
  const availableYears = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: 'Tháng 1' }, { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' }, { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' }, { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' }, { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' }, { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' }, { value: 12, label: 'Tháng 12' },
  ];

  // Auto-load report when filters change
  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (reportType === 'monthly') {
          console.log('Loading monthly report:', selectedYear, selectedMonth);
          const data = await reportService.getMonthlyReport(selectedYear, selectedMonth);
          console.log('Monthly report data:', data);
          setMonthlyReport(data);
          setYearlyReport(null);
        } else {
          console.log('Loading yearly report:', selectedYear);
          const data = await reportService.getYearlyReport(selectedYear);
          console.log('Yearly report data:', data);
          setYearlyReport(data);
          setMonthlyReport(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Không thể tải báo cáo. Vui lòng thử lại.';
        setError(errorMessage);
        console.error('Error loading report:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReportData();
  }, [reportType, selectedYear, selectedMonth]);

  const handleExportPDF = async () => {
    try {
      if (reportType === 'monthly' && monthlyReport) {
        await reportService.exportMonthlyReportToPDF(selectedYear, selectedMonth);
      } else if (reportType === 'yearly' && yearlyReport) {
        await reportService.exportYearlyReportToPDF(selectedYear);
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Không thể xuất PDF. Vui lòng thử lại.');
    }
  };

  const handleExportExcel = async () => {
    try {
      if (reportType === 'monthly' && monthlyReport) {
        await reportService.exportMonthlyReportToExcel(selectedYear, selectedMonth);
      } else if (reportType === 'yearly' && yearlyReport) {
        await reportService.exportYearlyReportToExcel(selectedYear);
      }
    } catch (err) {
      console.error('Error exporting Excel:', err);
      alert('Không thể xuất Excel. Vui lòng thử lại.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Báo cáo</h1>
            <p className="text-sm text-gray-500">Xem và xuất báo cáo chi tiết theo tháng/năm</p>
          </div>
        </div>

        {/* Export Buttons */}
        {(monthlyReport || yearlyReport) && !isLoading && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Xuất PDF
            </button>
            
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xuất Excel
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">Chọn báo cáo</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Report Type Toggle */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Loại:</label>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setReportType('monthly')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  reportType === 'monthly'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Tháng
              </button>
              <button
                onClick={() => setReportType('yearly')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  reportType === 'yearly'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Năm
              </button>
            </div>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Năm:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Month Selector (only for monthly report) */}
          {reportType === 'monthly' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Tháng:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-purple-600 ml-auto">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className="text-sm font-medium">Đang tải báo cáo...</span>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải báo cáo...</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!isLoading && !error && reportType === 'monthly' && monthlyReport && monthlyReport.totalPrintJobs === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không có dữ liệu</h3>
          <p className="text-gray-600 mb-4">
            Không có dữ liệu in ấn cho tháng {selectedMonth}/{selectedYear}
          </p>
          <p className="text-sm text-gray-500">
            Thử chọn tháng/năm khác hoặc kiểm tra lại database
          </p>
        </div>
      )}

      {!isLoading && !error && reportType === 'yearly' && yearlyReport && yearlyReport.totalPrintJobs === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Không có dữ liệu</h3>
          <p className="text-gray-600 mb-4">
            Không có dữ liệu in ấn cho năm {selectedYear}
          </p>
          <p className="text-sm text-gray-500">
            Thử chọn năm khác hoặc kiểm tra lại database
          </p>
        </div>
      )}

      {/* Monthly Report */}
      {!isLoading && reportType === 'monthly' && monthlyReport && (
        <div className="space-y-6 print:space-y-4">
          {/* Report Header - For Print */}
          <div className="hidden print:block bg-white p-6 border-b-2 border-gray-200">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800">BÁO CÁO HOẠT ĐỘNG IN ẤN</h1>
              <h2 className="text-xl font-semibold text-purple-600 mt-2">
                {monthlyReport.monthName} / {monthlyReport.year}
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Hệ thống SPSS SIU - Smart Printing Service System
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Ngày tạo: {formatDate()}
              </p>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Tổng quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                <p className="text-sm text-indigo-600 font-medium">Tổng lệnh in</p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">{monthlyReport.totalPrintJobs}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                  <span className="text-green-600">✓ {monthlyReport.successfulJobs} thành công</span>
                  <span className="text-red-600">✗ {monthlyReport.failedJobs} thất bại</span>
                  <span className="text-gray-500">⊘ {monthlyReport.cancelledJobs || 0} đã hủy</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <p className="text-sm text-purple-600 font-medium">Tổng trang in</p>
                <p className="text-3xl font-bold text-purple-900 mt-1">{monthlyReport.totalPagesPrinted}</p>
                <p className="text-xs text-purple-600 mt-2">A4 tương đương: {monthlyReport.totalA4Equivalent}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-600 font-medium">Doanh thu</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(monthlyReport.totalRevenue)}</p>
                <p className="text-xs text-green-600 mt-2">{monthlyReport.totalPagesPurchased} trang đã mua</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium">Sinh viên hoạt động</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{monthlyReport.totalStudentsActive}</p>
                <p className="text-xs text-blue-600 mt-2">Đã sử dụng dịch vụ</p>
              </div>
            </div>
          </div>

          {/* Paper Size Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:break-inside-avoid">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Phân bổ theo khổ giấy
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-600">Khổ A4</span>
                  <span className="text-sm font-bold text-blue-600">{formatPercent(monthlyReport.paperSizeDistribution.a4Percentage)}</span>
                </div>
                <div className="h-4 bg-blue-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${monthlyReport.paperSizeDistribution.a4Percentage}%` }}
                    className="h-full bg-blue-500 transition-all duration-500"
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{monthlyReport.paperSizeDistribution.a4Count} lệnh in</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-green-600">Khổ A3</span>
                  <span className="text-sm font-bold text-green-600">{formatPercent(monthlyReport.paperSizeDistribution.a3Percentage)}</span>
                </div>
                <div className="h-4 bg-green-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${monthlyReport.paperSizeDistribution.a3Percentage}%` }}
                    className="h-full bg-green-500 transition-all duration-500"
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{monthlyReport.paperSizeDistribution.a3Count} lệnh in</p>
              </div>
            </div>
            
            {/* Analysis */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Phân tích:
              </p>
              <p className="text-xs text-gray-600">
                {monthlyReport.paperSizeDistribution.a4Percentage > 70 
                  ? `Khổ A4 chiếm ưu thế với ${formatPercent(monthlyReport.paperSizeDistribution.a4Percentage)}, phù hợp với nhu cầu in tài liệu học tập thông thường.`
                  : monthlyReport.paperSizeDistribution.a3Percentage > 30
                  ? `Tỷ lệ in A3 cao (${formatPercent(monthlyReport.paperSizeDistribution.a3Percentage)}), có thể do nhiều đồ án, poster hoặc bản vẽ kỹ thuật.`
                  : `Phân bổ cân bằng giữa A4 và A3, đáp ứng đa dạng nhu cầu in ấn.`
                }
              </p>
            </div>
          </div>

          {/* Top Students & Printers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:break-inside-avoid">
            {/* Top Students */}
            <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Top 5 sinh viên in nhiều nhất
              </h2>
              <div className="space-y-3">
                {monthlyReport.topStudents.map((student, index) => (
                  <div key={student.studentId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-orange-900' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{student.studentName}</p>
                      <p className="text-xs text-gray-500 truncate">{student.studentEmail}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-indigo-600">{student.totalPages} trang</p>
                      <p className="text-xs text-gray-500">{student.totalJobs} lệnh</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Printers */}
            <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Top 3 máy in bận nhất
              </h2>
              <div className="space-y-3">
                {monthlyReport.topPrinters.map((printer, index) => (
                  <div key={printer.printerId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      index === 0 ? 'bg-blue-400 text-blue-900' :
                      index === 1 ? 'bg-blue-300 text-blue-800' :
                      'bg-blue-200 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{printer.printerName}</p>
                      <p className="text-xs text-gray-500 truncate">{printer.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-blue-600">{printer.totalJobs} lệnh</p>
                      <p className="text-xs text-gray-500">{printer.totalPages} trang</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-sm p-6 border border-purple-200 print:break-inside-avoid">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Phân tích & Đề xuất
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Điểm mạnh
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Tỷ lệ thành công: {((monthlyReport.successfulJobs / monthlyReport.totalPrintJobs) * 100).toFixed(1)}%</li>
                  <li>• {monthlyReport.totalStudentsActive} sinh viên đã sử dụng dịch vụ</li>
                  <li>• Doanh thu đạt {formatCurrency(monthlyReport.totalRevenue)}</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-purple-100">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Đề xuất
                </h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  {monthlyReport.failedJobs > 0 && (
                    <li>• Kiểm tra {monthlyReport.failedJobs} lệnh in thất bại</li>
                  )}
                  {monthlyReport.topPrinters.length > 0 && (
                    <li>• Bảo trì máy in {monthlyReport.topPrinters[0].printerName}</li>
                  )}
                  <li>• Khuyến khích sinh viên sử dụng in 2 mặt</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Daily Stats Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 print:shadow-none print:break-inside-avoid">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Thống kê theo ngày
            </h2>
            <div className="overflow-x-auto print:overflow-visible">
              <div className="flex min-w-[700px] print:min-w-0">
                {/* Y-Axis */}
                <div className="flex flex-col justify-between pr-2 text-right border-r border-gray-200" style={{ height: '200px' }}>
                  {(() => {
                    const maxJobs = Math.max(...monthlyReport.dailyStats.map(s => s.jobs), 1);
                    const yMax = Math.ceil(maxJobs / 4) * 4 || 4;
                    return [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0].map((val, i) => (
                      <span key={i} className="text-xs text-gray-500 leading-none min-w-[30px]">{val}</span>
                    ));
                  })()}
                </div>
                {/* Chart Area */}
                <div className="flex-1 relative pl-2">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '200px' }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-gray-100 w-full"></div>
                    ))}
                  </div>
                  {/* Bars */}
                  <div className="flex items-end gap-0.5 relative z-10" style={{ height: '200px' }}>
                    {monthlyReport.dailyStats.map((stat) => {
                      const maxJobs = Math.max(...monthlyReport.dailyStats.map(s => s.jobs), 1);
                      const yMax = Math.ceil(maxJobs / 4) * 4 || 4;
                      const heightPercent = stat.jobs > 0 ? Math.max((stat.jobs / yMax) * 100, 3) : 0;
                      return (
                        <div key={stat.day} className="flex-1 flex flex-col items-center group relative h-full">
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg print:hidden">
                            <div className="font-semibold mb-1">Ngày {stat.day}</div>
                            <div>Lệnh in: {stat.jobs}</div>
                            <div>Trang: {stat.pages}</div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                          </div>
                          <div className="flex-1 w-full flex items-end justify-center">
                            <div 
                              className="w-3/4 bg-purple-500 rounded-t transition-all hover:bg-purple-600 cursor-pointer print:bg-purple-400" 
                              style={{ height: `${heightPercent}%`, minHeight: stat.jobs > 0 ? '4px' : '0' }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* X-Axis Labels */}
                  <div className="flex justify-between mt-2 border-t border-gray-200 pt-2">
                    {monthlyReport.dailyStats.map((stat) => (
                      <div key={stat.day} className="flex-1 text-center">
                        <span className="text-xs text-gray-500">{stat.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Footer - For Print */}
          <div className="hidden print:block bg-white p-6 border-t-2 border-gray-200 mt-8">
            <div className="text-center text-sm text-gray-600">
              <p>Báo cáo được tạo tự động bởi Hệ thống SPSS SIU</p>
              <p className="text-xs text-gray-400 mt-1">© 2025 HCMIU - Smart Printing Service System</p>
            </div>
          </div>
        </div>
      )}

      {/* Yearly Report */}
      {!isLoading && reportType === 'yearly' && yearlyReport && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500">
              <p className="text-sm text-gray-500">Tổng lệnh in</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{yearlyReport.totalPrintJobs}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                <span className="text-green-600">✓ {yearlyReport.successfulJobs} thành công</span>
                <span className="text-red-600">✗ {yearlyReport.failedJobs} thất bại</span>
                <span className="text-gray-500">⊘ {yearlyReport.cancelledJobs || 0} đã hủy</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Tổng trang in</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{yearlyReport.totalPagesPrinted}</p>
              <p className="text-xs text-gray-500 mt-1">A4 tương đương: {yearlyReport.totalA4Equivalent}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(yearlyReport.totalRevenue)}</p>
              <p className="text-xs text-gray-500 mt-1">TB/SV: {formatCurrency(yearlyReport.averageRevenuePerStudent)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Sinh viên hoạt động</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{yearlyReport.totalStudentsActive}</p>
              <p className="text-xs text-gray-500 mt-1">Đã sử dụng dịch vụ</p>
            </div>
          </div>

          {/* Most Active Month */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h3 className="text-lg font-bold">Tháng hoạt động nhiều nhất</h3>
            </div>
            <p className="text-3xl font-bold">{yearlyReport.mostActiveMonthName}</p>
            <p className="text-sm opacity-90 mt-1">{yearlyReport.mostActiveMonthJobs} lệnh in</p>
          </div>

          {/* Paper Size Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Phân bổ theo khổ giấy
            </h2>
            <div className="flex items-center justify-center gap-8">
              <div className="flex-1 max-w-xs">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        A4
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {formatPercent(yearlyReport.paperSizeDistribution.a4Percentage)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${yearlyReport.paperSizeDistribution.a4Percentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{yearlyReport.paperSizeDistribution.a4Count} lệnh in</p>
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                        A3
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-green-600">
                        {formatPercent(yearlyReport.paperSizeDistribution.a3Percentage)}
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                    <div
                      style={{ width: `${yearlyReport.paperSizeDistribution.a3Percentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{yearlyReport.paperSizeDistribution.a3Count} lệnh in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Stats Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Thống kê theo tháng
            </h2>
            <div className="flex">
              {/* Y-Axis */}
              <div className="flex flex-col justify-between pr-2 text-right border-r border-gray-200" style={{ height: '200px' }}>
                {(() => {
                  const maxJobs = Math.max(...yearlyReport.monthlyStats.map(s => s.jobs), 1);
                  const yMax = Math.ceil(maxJobs / 4) * 4 || 4;
                  return [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0].map((val, i) => (
                    <span key={i} className="text-xs text-gray-500 leading-none min-w-[30px]">{val}</span>
                  ));
                })()}
              </div>
              {/* Chart Area */}
              <div className="flex-1 relative pl-2">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '200px' }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-gray-100 w-full"></div>
                  ))}
                </div>
                {/* Bars */}
                <div className="flex items-end gap-1 relative z-10" style={{ height: '200px' }}>
                  {yearlyReport.monthlyStats.map((stat) => {
                    const maxJobs = Math.max(...yearlyReport.monthlyStats.map(s => s.jobs), 1);
                    const yMax = Math.ceil(maxJobs / 4) * 4 || 4;
                    const heightPercent = stat.jobs > 0 ? Math.max((stat.jobs / yMax) * 100, 3) : 0;
                    return (
                      <div key={stat.month} className="flex-1 flex flex-col items-center group relative h-full">
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg">
                          <div className="font-semibold mb-1">{stat.monthName}</div>
                          <div>Lệnh in: {stat.jobs}</div>
                          <div>Trang: {stat.pages}</div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                        <div className="flex-1 w-full flex items-end justify-center">
                          <div 
                            className="w-3/4 bg-purple-500 rounded-t transition-all hover:bg-purple-600 cursor-pointer" 
                            style={{ height: `${heightPercent}%`, minHeight: stat.jobs > 0 ? '4px' : '0' }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* X-Axis Labels */}
                <div className="flex justify-between mt-2 border-t border-gray-200 pt-2">
                  {yearlyReport.monthlyStats.map((stat) => (
                    <div key={stat.month} className="flex-1 text-center">
                      <span className="text-xs text-gray-500 font-medium">T{stat.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Students & Printers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Students */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Top 5 sinh viên in nhiều nhất
              </h2>
              <div className="space-y-3">
                {yearlyReport.topStudents.map((student, index) => (
                  <div key={student.studentId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-orange-900' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{student.studentName}</p>
                      <p className="text-xs text-gray-500">{student.studentEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-indigo-600">{student.totalPages} trang</p>
                      <p className="text-xs text-gray-500">{student.totalJobs} lệnh</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Printers */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Top 3 máy in bận nhất
              </h2>
              <div className="space-y-3">
                {yearlyReport.topPrinters.map((printer, index) => (
                  <div key={printer.printerId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-blue-400 text-blue-900' :
                      index === 1 ? 'bg-blue-300 text-blue-800' :
                      'bg-blue-200 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{printer.printerName}</p>
                      <p className="text-xs text-gray-500">{printer.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{printer.totalJobs} lệnh</p>
                      <p className="text-xs text-gray-500">{printer.totalPages} trang</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
