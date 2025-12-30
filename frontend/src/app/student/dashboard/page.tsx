'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/StudentLayout';
import { printJobService } from '@/services/printJobService';
import { PrintJob, PageBalance } from '@/types/printJob';

interface WeeklyStat {
  day: string;
  success: number;
  failed: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pageBalance, setPageBalance] = useState<PageBalance | null>(null);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [successRate, setSuccessRate] = useState({ success: 0, failed: 0 });
  const [jobStatusCounts, setJobStatusCounts] = useState({ completed: 0, failed: 0, printing: 0, pending: 0, cancelled: 0 });
  const [monthlyStats, setMonthlyStats] = useState({ jobs: 0, pages: 0 });
  const [favoritePrinter, setFavoritePrinter] = useState('--');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [balanceData, jobsData] = await Promise.all([
        printJobService.getPageBalance(),
        printJobService.getMyPrintJobs(),
      ]);

      setPageBalance(balanceData);
      setPrintJobs(jobsData);
      calculateStats(jobsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobs: PrintJob[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Monthly stats
    const monthJobs = jobs.filter((job) => {
      const jobDate = new Date(job.submittedAt);
      return jobDate.getMonth() === currentMonth && jobDate.getFullYear() === currentYear;
    });
    const monthPages = monthJobs.reduce((sum, job) => sum + (job.a4EquivalentPages || job.totalPagesToPrint || 0), 0);
    setMonthlyStats({ jobs: monthJobs.length, pages: monthPages });

    // Job status counts
    const completed = jobs.filter((j) => j.jobStatus === 'Completed').length;
    const failed = jobs.filter((j) => j.jobStatus === 'Failed').length;
    const printing = jobs.filter((j) => j.jobStatus === 'Printing').length;
    const pending = jobs.filter((j) => j.jobStatus === 'Pending').length;
    const cancelled = jobs.filter((j) => j.jobStatus === 'Cancelled').length;
    setSuccessRate({ success: completed, failed });
    setJobStatusCounts({ completed, failed, printing, pending, cancelled });

    // Weekly stats (last 7 days)
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const weekStats: WeeklyStat[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayJobs = jobs.filter((job) => {
        const jobDate = new Date(job.submittedAt);
        return jobDate.toDateString() === date.toDateString();
      });
      weekStats.push({
        day: days[date.getDay()],
        success: dayJobs.filter((j) => j.jobStatus === 'Completed').length,
        failed: dayJobs.filter((j) => j.jobStatus === 'Failed').length,
      });
    }
    setWeeklyStats(weekStats);

    // Favorite printer
    const printerCount: Record<string, number> = {};
    jobs.forEach((job) => {
      const printer = job.printerName || job.printerId || 'Unknown';
      printerCount[printer] = (printerCount[printer] || 0) + 1;
    });
    const topPrinter = Object.entries(printerCount).sort((a, b) => b[1] - a[1])[0];
    setFavoritePrinter(topPrinter ? topPrinter[0] : '--');
  };

  const maxBarValue = Math.max(...weeklyStats.map((s) => Math.max(s.success, s.failed)), 1);
  const totalJobs = successRate.success + successRate.failed;
  const hasData = totalJobs > 0;
  const successPercent = hasData ? Math.round((successRate.success / totalJobs) * 100) : 0;
  const failedPercent = hasData ? 100 - successPercent : 0;

  const recentJobs = printJobs.slice(0, 5);

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Chào mừng bạn trở lại, sinh viên!</p>
        </div>

        {/* Stats Cards - Row 1: Tổng quan */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Số dư trang A4</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{pageBalance?.totalA4Equivalent || 0}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Lệnh in tháng này</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{monthlyStats.jobs}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Trang in tháng này</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{monthlyStats.pages}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-xs">Máy in yêu thích</p>
                <p className="text-xl font-bold text-purple-600 mt-1">{favoritePrinter}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Row 2: Trạng thái lệnh in */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Thành công</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{jobStatusCounts.completed}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Thất bại</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{jobStatusCounts.failed}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Đang in</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{jobStatusCounts.printing}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-yellow-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Đang chờ</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{jobStatusCounts.pending}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Đã hủy</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{jobStatusCounts.cancelled}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Hành động nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => router.push('/student/print-document')} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-6 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Tải tài liệu
            </button>
            <button onClick={() => router.push('/student/print-document?tab=list')} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3.5 px-6 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              In tài liệu
            </button>
            <button onClick={() => router.push('/student/page-balance')} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3.5 px-6 rounded-xl font-medium transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              Mua thêm trang
            </button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Weekly Stats Bar Chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <h2 className="text-lg font-bold text-gray-800">Thống kê lệnh in theo tuần</h2>
            </div>
            <div className="flex">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between h-52 pr-2 text-right border-r border-gray-200">
                {(() => {
                  const yAxisMax = Math.ceil(maxBarValue / 3) * 3 || 3;
                  const step = yAxisMax / 3;
                  return [yAxisMax, Math.round(step * 2), Math.round(step), 0].map((val, i) => (
                    <span key={i} className="text-xs text-gray-500 leading-none -translate-y-1">{val}</span>
                  ));
                })()}
              </div>
              
              {/* Chart Area */}
              <div className="flex-1 relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: '208px' }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="border-t border-gray-100 w-full"></div>
                  ))}
                </div>
                
                {/* Bars */}
                <div className="h-52 flex items-end justify-around gap-2 relative z-10 pl-2">
                  {weeklyStats.length > 0 ? weeklyStats.map((stat, index) => {
                    const yAxisMax = Math.ceil(maxBarValue / 3) * 3 || 3;
                    const successHeight = stat.success > 0 ? Math.max((stat.success / yAxisMax) * 100, 10) : 0;
                    const failedHeight = stat.failed > 0 ? Math.max((stat.failed / yAxisMax) * 100, 10) : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group relative h-full">
                        {/* Tooltip on hover */}
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
                          <div className="border-t border-gray-600 mt-1 pt-1">
                            Tổng: {stat.success + stat.failed}
                          </div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                        
                        {/* Bars container */}
                        <div className="flex-1 w-full flex justify-center items-end gap-1 cursor-pointer">
                          {/* Success Bar */}
                          <div 
                            className="w-5 bg-green-500 rounded-t transition-all hover:bg-green-600" 
                            style={{ height: `${successHeight}%` }}
                          ></div>
                          {/* Failed Bar */}
                          <div 
                            className="w-5 bg-red-400 rounded-t transition-all hover:bg-red-500" 
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
                <div className="flex justify-between mt-2">
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
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h2 className="text-lg font-bold text-gray-800">Tỷ lệ thành công</h2>
            </div>
            <div className="flex flex-col items-center">
              {/* Pie Chart with labels */}
              <div className="flex items-center justify-center gap-6 mb-8 w-full">
                {/* Success Label - Left side */}
                <div className="text-sm text-green-600 font-medium whitespace-nowrap text-right min-w-[110px]">
                  {hasData ? `Thành công: ${successPercent}%` : ''}
                </div>
                
                {/* Pie Chart */}
                <svg className="w-40 h-40 flex-shrink-0" viewBox="0 0 100 100">
                  {!hasData ? (
                    <>
                      <circle cx="50" cy="50" r="45" fill="#e5e7eb" />
                      <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-xs" fill="#9ca3af" fontSize="8">Chưa có dữ liệu</text>
                    </>
                  ) : successPercent === 100 ? (
                    <circle cx="50" cy="50" r="45" fill="#22c55e" />
                  ) : successPercent === 0 ? (
                    <circle cx="50" cy="50" r="45" fill="#f87171" />
                  ) : (
                    <>
                      <circle cx="50" cy="50" r="45" fill="#22c55e" />
                      <path
                        d={`M 50 50 L 95 50 A 45 45 0 ${failedPercent > 50 ? 1 : 0} 1 ${50 + 45 * Math.cos((failedPercent / 100) * 2 * Math.PI)} ${50 + 45 * Math.sin((failedPercent / 100) * 2 * Math.PI)} Z`}
                        fill="#f87171"
                      />
                    </>
                  )}
                </svg>
                
                {/* Failed Label - Right side */}
                <div className="text-sm text-red-500 font-medium whitespace-nowrap text-left min-w-[110px]">
                  {hasData ? `Thất bại: ${failedPercent}%` : ''}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-10">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{successRate.success}</p>
                    <p className="text-xs text-gray-500">Thành công</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{successRate.failed}</p>
                    <p className="text-xs text-gray-500">Thất bại</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <h2 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h2>
            </div>
            <button 
              onClick={() => router.push('/student/print-history')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Xem chi tiết
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          {recentJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tên tài liệu</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Máy in</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ngày</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((job, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-800 max-w-[200px]">
                        <span className="block truncate" title={job.documentName || `Job #${job.jobId}`}>
                          {job.documentName || `Job #${job.jobId}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{job.printerName || job.printerId}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{new Date(job.submittedAt).toLocaleDateString('vi-VN')}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          job.jobStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                          job.jobStatus === 'Failed' ? 'bg-red-100 text-red-600' :
                          job.jobStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          job.jobStatus === 'Printing' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {job.jobStatus === 'Completed' ? 'Hoàn thành' :
                           job.jobStatus === 'Failed' ? 'Thất bại' :
                           job.jobStatus === 'Pending' ? 'Đang chờ' :
                           job.jobStatus === 'Printing' ? 'Đang in' :
                           job.jobStatus === 'Cancelled' ? 'Đã hủy' : job.jobStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">Chưa có hoạt động nào</div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
