/**
 * DASHBOARD SERVICE - API cho SPSO Dashboard
 */

import apiClient from '@/config/axios';

export interface MonthlyStatDTO {
  month: string;
  year: number;
  jobs: number;
  revenue: number;
}

export interface WeeklyStatDTO {
  day: string;
  date: string;
  success: number;
  failed: number;
}

export interface DashboardStatsDTO {
  totalPrintJobs: number;
  completedJobs: number;
  failedJobs: number;
  cancelledJobs: number;
  pendingJobs: number;
  printingJobs: number;
  totalPages: number;
  totalRevenue: number;
  monthRevenue: number;
  monthlyStats: MonthlyStatDTO[];
  weeklyStats: WeeklyStatDTO[];
}

export const dashboardService = {
  /**
   * GET /api/dashboard/stats - Lấy thống kê Dashboard
   */
  async getDashboardStats(): Promise<DashboardStatsDTO> {
    const response = await apiClient.get<DashboardStatsDTO>('/dashboard/stats');
    return response.data;
  },
};
