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

    // Success rate
    const completed = jobs.filter((j) => j.jobStatus === 'Completed').length;
    const failed = jobs.filter((j) => j.jobStatus === 'Failed').length;
    setSuccessRate({ success: completed, failed });

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

  const maxBarValue = Math.max(...weeklyStats.map((s) => s.success + s.failed), 1);
  const totalJobs = successRate.success + successRate.failed || 1;
  const successPercent = Math.round((successRate.success / totalJobs) * 100);

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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Số dư trang A4</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{pageBalance?.totalA4Equivalent || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Lệnh in tháng này</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{monthlyStats.jobs}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Trang in tháng này</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{monthlyStats.pages}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Máy in yêu thích</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{favoritePrinter}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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
            <div className="h-64 flex items-end justify-between gap-4 px-4">
              {weeklyStats.length > 0 ? weeklyStats.map((stat, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-lg">
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
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                  
                  {/* Number label on top of bar */}
                  {(stat.success + stat.failed) > 0 && (
                    <span className="text-xs font-semibold text-gray-700 mb-1">{stat.success + stat.failed}</span>
                  )}
                  
                  <div className="w-full flex flex-col items-center gap-1" style={{ height: '180px' }}>
                    <div className="w-full flex flex-col justify-end h-full gap-0.5 cursor-pointer">
                      <div className="w-full bg-green-500 rounded-t-sm transition-all hover:bg-green-600" style={{ height: `${(stat.success / maxBarValue) * 100}%`, minHeight: stat.success > 0 ? '4px' : '0' }}></div>
                      <div className="w-full bg-red-400 rounded-b-sm transition-all hover:bg-red-500" style={{ height: `${(stat.failed / maxBarValue) * 100}%`, minHeight: stat.failed > 0 ? '4px' : '0' }}></div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{stat.day}</span>
                </div>
              )) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">Chưa có dữ liệu</div>
              )}
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
                  Thành công: {successPercent}%
                </div>
                
                {/* Pie Chart */}
                <svg className="w-40 h-40 flex-shrink-0" viewBox="0 0 100 100">
                  {totalJobs === 0 || (successPercent === 0 && successRate.failed === 0) ? (
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
                
                {/* Failed Label - Right side */}
                <div className="text-sm text-red-500 font-medium whitespace-nowrap text-left min-w-[110px]">
                  Thất bại: {100 - successPercent}%
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
                      <td className="py-3 px-4 text-sm text-gray-800">{job.documentName || `Job #${job.jobId}`}</td>
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
