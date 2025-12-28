/**
 * REPORT SERVICE - API cho báo cáo SPSO
 */

import apiClient from '@/config/axios';

// Types
export interface PaperSizeDistribution {
  a4Count: number;
  a3Count: number;
  a4Percentage: number;
  a3Percentage: number;
}

export interface TopStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalPages: number;
  totalJobs: number;
  totalSpent: number;
}

export interface TopPrinter {
  printerId: string;
  printerName: string;
  location: string;
  totalJobs: number;
  totalPages: number;
}

export interface DailyStats {
  day: number;
  jobs: number;
  pages: number;
  revenue: number;
}

export interface MonthlyReportDTO {
  reportId?: number;
  year: number;
  month: number;
  monthName: string;
  
  // Thống kê chung
  totalStudentsActive: number;
  totalPrintJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalPagesPrinted: number;
  totalA4Equivalent: number;
  totalPagesPurchased: number;
  totalRevenue: number;
  
  // Top performers
  mostUsedPrinterId?: string;
  mostUsedPrinterName?: string;
  mostUsedPrinterJobs?: number;
  topStudentId?: string;
  topStudentName?: string;
  topStudentPages?: number;
  
  // Phân bổ
  paperSizeDistribution: PaperSizeDistribution;
  topStudents: TopStudent[];
  topPrinters: TopPrinter[];
  dailyStats: DailyStats[];
}

export interface MonthlyStats {
  month: number;
  monthName: string;
  jobs: number;
  pages: number;
  revenue: number;
}

export interface YearlyReportDTO {
  reportId?: number;
  year: number;
  
  // Thống kê chung
  totalStudentsActive: number;
  totalPrintJobs: number;
  successfulJobs: number;
  failedJobs: number;
  totalPagesPrinted: number;
  totalA4Equivalent: number;
  totalPagesPurchased: number;
  totalRevenue: number;
  averageRevenuePerStudent: number;
  
  // Tháng hoạt động nhiều nhất
  mostActiveMonth: number;
  mostActiveMonthName: string;
  mostActiveMonthJobs: number;
  
  // Thống kê
  monthlyStats: MonthlyStats[];
  topStudents: TopStudent[];
  topPrinters: TopPrinter[];
  paperSizeDistribution: PaperSizeDistribution;
}

export const reportService = {
  /**
   * GET /api/reports/monthly - Lấy báo cáo theo tháng
   */
  async getMonthlyReport(year: number, month: number): Promise<MonthlyReportDTO> {
    const response = await apiClient.get<MonthlyReportDTO>(`/reports/monthly?year=${year}&month=${month}`);
    return response.data;
  },

  /**
   * GET /api/reports/yearly - Lấy báo cáo theo năm
   */
  async getYearlyReport(year: number): Promise<YearlyReportDTO> {
    const response = await apiClient.get<YearlyReportDTO>(`/reports/yearly?year=${year}`);
    return response.data;
  },

  /**
   * POST /api/reports/monthly/generate - Tạo báo cáo tháng mới
   */
  async generateMonthlyReport(year: number, month: number): Promise<MonthlyReportDTO> {
    const response = await apiClient.post<MonthlyReportDTO>(`/reports/monthly/generate?year=${year}&month=${month}`);
    return response.data;
  },

  /**
   * GET /api/reports/monthly/export/pdf - Xuất báo cáo tháng ra PDF
   */
  async exportMonthlyReportToPDF(year: number, month: number): Promise<void> {
    const response = await apiClient.get(`/reports/monthly/export/pdf?year=${year}&month=${month}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCaoThang_${month}_${year}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * GET /api/reports/monthly/export/excel - Xuất báo cáo tháng ra Excel
   */
  async exportMonthlyReportToExcel(year: number, month: number): Promise<void> {
    const response = await apiClient.get(`/reports/monthly/export/excel?year=${year}&month=${month}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCaoThang_${month}_${year}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * GET /api/reports/yearly/export/pdf - Xuất báo cáo năm ra PDF
   */
  async exportYearlyReportToPDF(year: number): Promise<void> {
    const response = await apiClient.get(`/reports/yearly/export/pdf?year=${year}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCaoNam_${year}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * GET /api/reports/yearly/export/excel - Xuất báo cáo năm ra Excel
   */
  async exportYearlyReportToExcel(year: number): Promise<void> {
    const response = await apiClient.get(`/reports/yearly/export/excel?year=${year}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaoCaoNam_${year}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
