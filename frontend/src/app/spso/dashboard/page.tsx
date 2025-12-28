'use client';

import { useState, useEffect } from 'react';
import { printLogService, PrintLogDTO, PrintLogStatsDTO } from '@/services/printLogService';
import { pagePricingService } from '@/services/pagePricingService';
import { PagePricing } from '@/types/pagePricing';
import { dashboardService } from '@/services/dashboardService';

interface MonthlyStat {
  month: string;
  monthIndex: number;
  jobs: number;
  revenue: number;
}

interface WeeklyStat {
  day: string;
  success: number;
  failed: number;
}

export default function SPSODashboard() {
  const [stats, setStats] = useState<PrintLogStatsDTO | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsDTO | null>(null);
  const [recentLogs, setRecentLogs] = useState<PrintLogDTO[]>([]);
  const [allLogs, setAllLogs] = useState<PrintLogDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatDTO[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Generate available years (current year and 5 years back)
  const availableYears = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (allLogs.length > 0 && pricing.length > 0) {
      calculateChartData(allLogs, pricing, selectedYear, null);
    }
  }, [allLogs]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [statsData, logsData, allLogsData, pricingData, dashboardData] = await Promise.all([
        printLogService.getPrintLogStats({}),
        dashboardService.getDashboardStats(),
        printLogService.getPrintLogs({ page: 0, size: 5, sortBy: 'printTime', sortDirection: 'DESC' }),
        printLogService.getPrintLogs({ page: 0, size: 1000, sortBy: 'printTime', sortDirection: 'DESC' }),
        pagePricingService.getAllPricing(),
        dashboardService.getDashboardStats(),
      ]);
      setStats(statsData);
      setDashboardStats(dashStats);
      setRecentLogs(logsData.content);
      setAllLogs(allLogsData.content);
      setPricing(pricingData);
      
      // Lấy doanh thu từ API backend (tính từ Purchase transactions)
      setTotalRevenue(dashboardData.totalRevenue || 0);
      setMonthRevenue(dashboardData.monthRevenue || 0);
      
      calculateChartData(allLogsData.content, pricingData, selectedYear, dashboardData);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateChartData = (logs: PrintLogDTO[], pricingData: PagePricing[], year: number, dashboardData: any) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate revenue per log (chỉ dùng cho biểu đồ, không phải doanh thu thực)
    const getLogRevenue = (log: PrintLogDTO) => {
      const price = pricingData.find(p => p.paperSize === log.paperSize);
      return (price?.pricePerPage || 500) * log.pagesPrinted;
    };

    // Doanh thu thực được lấy từ API backend (Purchase transactions)
    // Không tính từ print logs nữa

    // Monthly stats (all 12 months of selected year) - chỉ hiển thị số lệnh in
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const completedLogs = logs.filter(l => l.status === 'Success' || l.status === 'Completed');
    const monthlyData: MonthlyStat[] = [];
    
    // Nếu có dữ liệu từ backend, sử dụng nó cho doanh thu theo tháng
    const backendMonthlyStats = dashboardData?.monthlyStats || [];
    
    for (let m = 0; m < 12; m++) {
      const monthLogs = completedLogs.filter(log => {
        const logDate = new Date(log.printTime);
        return logDate.getMonth() === m && logDate.getFullYear() === year;
      });
      
      // Tìm doanh thu từ backend cho tháng này
      const backendStat = backendMonthlyStats.find((s: any) => {
        const monthIndex = months.indexOf(s.month);
        return monthIndex === m && s.year === year;
      });
      
      monthlyData.push({
        month: months[m],
        monthIndex: m,
        jobs: monthLogs.length,
        // Sử dụng doanh thu từ backend nếu có, nếu không thì để 0
        revenue: backendStat?.revenue || 0,
      });
    }
    setMonthlyStats(monthlyData);

    // Weekly stats (last 7 days)
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const weekData: WeeklyStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.printTime);
        return logDate.toDateString() === date.toDateString();
      });
      weekData.push({
        day: days[date.getDay()],
        success: dayLogs.filter(l => l.status === 'Success' || l.status === 'Completed').length,
        failed: dayLogs.filter(l => l.status === 'Failed').length,
      });
    }
    setWeeklyStats(weekData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Failed': return 'bg-red-100 text-red-700';
      case 'Cancelled': return 'bg-gray-100 text-gray-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Printing': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Success': return 'Hoàn thành';
      case 'Completed': return 'Hoàn thành';
      case 'Failed': return 'Thất bại';
      case 'Cancelled': return 'Đã hủy';
      case 'Pending': return 'Đang chờ';
      case 'Printing': return 'Đang in';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const maxMonthlyJobs = Math.max(...monthlyStats.map(s => s.jobs), 1);
  const maxMonthlyRevenue = Math.max(...monthlyStats.map(s => s.revenue), 1);
  const maxWeeklyValue = Math.max(...weeklyStats.map(s => s.success + s.failed), 1);
  const totalWeeklyJobs = weeklyStats.reduce((sum, s) => sum + s.success + s.failed, 0);
  const successWeeklyJobs = weeklyStats.reduce((sum, s) => sum + s.success, 0);
  const successPercent = totalWeeklyJobs > 0 ? Math.round((successWeeklyJobs / totalWeeklyJobs) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard SPSO</h1>
          <p className="text-sm text-gray-500">Tổng quan hệ thống in ấn</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng lệnh in</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalLogs || 0}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Hoàn thành</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.completedLogs || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Thất bại</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.failedLogs || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng trang in</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats?.totalPages || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Doanh thu tháng</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(dashboardStats?.monthRevenue || 0)}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đang chờ</p>
              <p className="text-xl font-bold text-gray-800">{stats?.pendingLogs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đang in</p>
              <p className="text-xl font-bold text-gray-800">{stats?.printingLogs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đã hủy</p>
              <p className="text-xl font-bold text-gray-800">{stats?.cancelledLogs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-xl font-bold text-gray-800">{formatCurrency(dashboardStats?.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Jobs Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-800">Lệnh in theo tháng</h2>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between h-48 pr-2 text-right border-r border-gray-200">
              {(() => {
                const yMax = Math.ceil(maxMonthlyJobs / 4) * 4 || 4;
                return [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0].map((val, i) => (
                  <span key={i} className="text-xs text-gray-500 leading-none">{val}</span>
                ));
              })()}
            </div>
            {/* Chart Area */}
            <div className="flex-1 relative pl-2">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '192px' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-gray-100 w-full"></div>
                ))}
              </div>
              {/* Bars */}
              <div className="h-48 flex items-end justify-between gap-1 relative z-10">
                {monthlyStats.map((stat, index) => {
                  const yMax = Math.ceil(maxMonthlyJobs / 4) * 4 || 4;
                  const barHeight = stat.jobs > 0 ? Math.max((stat.jobs / yMax) * 100, 5) : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative h-full">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg">
                        <div className="font-semibold mb-1">{stat.month}/{selectedYear}</div>
                        <div>Lệnh in: {stat.jobs}</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                      {/* Bar */}
                      <div className="flex-1 w-full flex items-end justify-center">
                        <div 
                          className="w-4 bg-indigo-500 rounded-t transition-all hover:bg-indigo-600 cursor-pointer" 
                          style={{ height: `${barHeight}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* X-Axis Labels */}
              <div className="flex justify-between mt-2 border-t border-gray-200 pt-2">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="flex-1 text-center">
                    <span className="text-xs text-gray-500 font-medium">{stat.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-800">Doanh thu theo tháng</h2>
            </div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between h-48 pr-2 text-right border-r border-gray-200 min-w-[45px]">
              {(() => {
                const yMax = Math.ceil(maxMonthlyRevenue / 4000) * 4000 || 4000;
                return [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0].map((val, i) => (
                  <span key={i} className="text-xs text-gray-500 leading-none">{val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}</span>
                ));
              })()}
            </div>
            {/* Chart Area */}
            <div className="flex-1 relative pl-2">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '192px' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-gray-100 w-full"></div>
                ))}
              </div>
              {/* Bars */}
              <div className="h-48 flex items-end justify-between gap-1 relative z-10">
                {monthlyStats.map((stat, index) => {
                  const yMax = Math.ceil(maxMonthlyRevenue / 4000) * 4000 || 4000;
                  const barHeight = stat.revenue > 0 ? Math.max((stat.revenue / yMax) * 100, 5) : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative h-full">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg">
                        <div className="font-semibold mb-1">{stat.month}/{selectedYear}</div>
                        <div>{formatCurrency(stat.revenue)}</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                      {/* Bar */}
                      <div className="flex-1 w-full flex items-end justify-center">
                        <div 
                          className="w-4 bg-emerald-500 rounded-t transition-all hover:bg-emerald-600 cursor-pointer" 
                          style={{ height: `${barHeight}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* X-Axis Labels */}
              <div className="flex justify-between mt-2 border-t border-gray-200 pt-2">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="flex-1 text-center">
                    <span className="text-xs text-gray-500 font-medium">{stat.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Stats & Success Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly Stats Bar Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Thống kê lệnh in theo tuần</h2>
          </div>
          <div className="flex">
            {/* Y-Axis */}
            <div className="flex flex-col justify-between h-48 pr-2 text-right border-r border-gray-200">
              {(() => {
                const yMax = Math.ceil(maxWeeklyValue / 4) * 4 || 4;
                return [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0].map((val, i) => (
                  <span key={i} className="text-xs text-gray-500 leading-none">{val}</span>
                ));
              })()}
            </div>
            {/* Chart Area */}
            <div className="flex-1 relative pl-2">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '192px' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-gray-100 w-full"></div>
                ))}
              </div>
              {/* Bars */}
              <div className="h-48 flex items-end justify-between gap-2 relative z-10">
                {weeklyStats.length > 0 ? weeklyStats.map((stat, index) => {
                  const yMax = Math.ceil(maxWeeklyValue / 4) * 4 || 4;
                  const successHeight = stat.success > 0 ? Math.max((stat.success / yMax) * 100, 5) : 0;
                  const failedHeight = stat.failed > 0 ? Math.max((stat.failed / yMax) * 100, 5) : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative h-full">
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-lg">
                        <div className="font-semibold mb-1">{stat.day}</div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-green-400 rounded-sm"></span>
                          <span>Thành công: {stat.success}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-red-400 rounded-sm"></span>
                          <span>Thất bại: {stat.failed}</span>
                        </div>
                        <div className="border-t border-gray-600 mt-1 pt-1">Tổng: {stat.success + stat.failed}</div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                      {/* Bars */}
                      <div className="flex-1 w-full flex justify-center items-end gap-1 cursor-pointer">
                        <div 
                          className="w-4 bg-green-500 rounded-t transition-all hover:bg-green-600" 
                          style={{ height: `${successHeight}%` }}
                        ></div>
                        <div 
                          className="w-4 bg-red-400 rounded-t transition-all hover:bg-red-500" 
                          style={{ height: `${failedHeight}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
                )}
              </div>
              {/* X-Axis Labels */}
              <div className="flex justify-between mt-2 border-t border-gray-200 pt-2">
                {weeklyStats.map((stat, index) => (
                  <div key={index} className="flex-1 text-center">
                    <span className="text-xs text-gray-500 font-medium">{stat.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div><span className="text-sm text-gray-600">Thành công</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-sm"></div><span className="text-sm text-gray-600">Thất bại</span></div>
          </div>
        </div>

        {/* Success Rate Pie Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-800">Tỷ lệ thành công (tuần)</h2>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-6 mb-8 w-full">
              <div className="text-sm text-green-600 font-medium whitespace-nowrap text-right min-w-[110px]">
                Thành công: {successPercent}%
              </div>
              <svg className="w-40 h-40 flex-shrink-0" viewBox="0 0 100 100">
                {totalWeeklyJobs === 0 ? (
                  <circle cx="50" cy="50" r="45" fill="#e5e7eb" />
                ) : successPercent === 100 ? (
                  <circle cx="50" cy="50" r="45" fill="#22c55e" />
                ) : successPercent === 0 ? (
                  <circle cx="50" cy="50" r="45" fill="#f87171" />
                ) : (
                  <>
                    <circle cx="50" cy="50" r="45" fill="#22c55e" />
                    <path
                      d={`M 50 50 L 95 50 A 45 45 0 ${(100 - successPercent) > 50 ? 1 : 0} 1 ${50 + 45 * Math.cos(((100 - successPercent) / 100) * 2 * Math.PI)} ${50 + 45 * Math.sin(((100 - successPercent) / 100) * 2 * Math.PI)} Z`}
                      fill="#f87171"
                    />
                  </>
                )}
              </svg>
              <div className="text-sm text-red-500 font-medium whitespace-nowrap text-left min-w-[110px]">
                Thất bại: {100 - successPercent}%
              </div>
            </div>
            <div className="flex items-center justify-center gap-10">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{successWeeklyJobs}</p>
                  <p className="text-xs text-gray-500">Thành công</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{totalWeeklyJobs - successWeeklyJobs}</p>
                  <p className="text-xs text-gray-500">Thất bại</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Print Logs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Nhật ký in gần đây</h2>
          <a href="/spso/print-logs" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Xem tất cả →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Sinh viên</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Tài liệu</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Máy in</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Số trang</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Thời gian</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    Chưa có dữ liệu nhật ký in
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.logId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-800">{log.studentName || log.studentId}</p>
                        <p className="text-xs text-gray-500">{log.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700 truncate max-w-[200px]" title={log.documentName}>
                        {log.documentName}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700">{log.printerName || log.printerId}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-700">{log.pagesPrinted}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-gray-600 text-xs">{formatDate(log.printTime)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                        {getStatusDisplay(log.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
