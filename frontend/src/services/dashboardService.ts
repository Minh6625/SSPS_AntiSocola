import apiClient from '@/config/axios';

export interface DashboardStatsDTO {
  totalJobs: number;
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

export interface MonthlyStatDTO {
  month: string;
  year: number;
  jobs: number;
  revenue: number;
}

export interface WeeklyStatDTO {
  day: string;
  date: string;
  jobs: number;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStatsDTO> {
    const response = await apiClient.get<DashboardStatsDTO>('/dashboard/stats');
    return response.data;
  }
}

export const dashboardService = new DashboardService();
