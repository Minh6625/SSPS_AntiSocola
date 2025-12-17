/**
 * PRINT LOG SERVICE - API cho SPSO quản lý nhật ký in
 */

import apiClient from '@/config/axios';

// Types
export interface PrintLogDTO {
  logId: number;
  jobId: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  printerId: string;
  printerName: string;
  printerLocation: string;
  documentName: string;
  paperSize: string;
  pagesPrinted: number;
  a4EquivalentUsed: number;
  printTime: string;
  durationSeconds: number;
  status: string;
  statusDisplay: string;
  fileType: string;
  errorMessage?: string;
}

export interface PrintLogFilter {
  studentSearch?: string;
  printerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  documentName?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface PrintLogStatsDTO {
  totalLogs: number;
  completedLogs: number;
  failedLogs: number;
  cancelledLogs: number;
  pendingLogs: number;
  printingLogs: number;
  totalPages: number;
  maxPages: number;
  minPages: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PrintLogStatus {
  value: string;
  label: string;
  color: string;
}

export const printLogService = {
  /**
   * GET /api/print-logs - Lấy danh sách nhật ký in với filter và pagination
   */
  async getPrintLogs(filter: PrintLogFilter = {}): Promise<PageResponse<PrintLogDTO>> {
    const params = new URLSearchParams();
    
    if (filter.studentSearch) params.append('studentSearch', filter.studentSearch);
    if (filter.printerId) params.append('printerId', filter.printerId);
    if (filter.status) params.append('status', filter.status);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.documentName) params.append('documentName', filter.documentName);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortDirection) params.append('sortDirection', filter.sortDirection);

    const response = await apiClient.get<PageResponse<PrintLogDTO>>(`/print-logs?${params.toString()}`);
    return response.data;
  },

  /**
   * GET /api/print-logs/:id - Lấy chi tiết một nhật ký in
   */
  async getPrintLogById(logId: number): Promise<PrintLogDTO> {
    const response = await apiClient.get<PrintLogDTO>(`/print-logs/${logId}`);
    return response.data;
  },

  /**
   * GET /api/print-logs/count - Đếm số lượng logs
   */
  async countPrintLogs(filter: PrintLogFilter = {}): Promise<number> {
    const params = new URLSearchParams();
    
    if (filter.studentSearch) params.append('studentSearch', filter.studentSearch);
    if (filter.printerId) params.append('printerId', filter.printerId);
    if (filter.status) params.append('status', filter.status);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.documentName) params.append('documentName', filter.documentName);

    const response = await apiClient.get<{ count: number }>(`/print-logs/count?${params.toString()}`);
    return response.data.count;
  },

  /**
   * GET /api/print-logs/stats - Lấy thống kê
   */
  async getPrintLogStats(filter: PrintLogFilter = {}): Promise<PrintLogStatsDTO> {
    const params = new URLSearchParams();
    
    if (filter.studentSearch) params.append('studentSearch', filter.studentSearch);
    if (filter.printerId) params.append('printerId', filter.printerId);
    if (filter.status) params.append('status', filter.status);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.documentName) params.append('documentName', filter.documentName);

    const response = await apiClient.get<PrintLogStatsDTO>(`/print-logs/stats?${params.toString()}`);
    return response.data;
  },

  /**
   * POST /api/print-logs/export - Xuất Excel
   */
  async exportToExcel(filter: PrintLogFilter = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (filter.studentSearch) params.append('studentSearch', filter.studentSearch);
    if (filter.printerId) params.append('printerId', filter.printerId);
    if (filter.status) params.append('status', filter.status);
    if (filter.startDate) params.append('startDate', filter.startDate);
    if (filter.endDate) params.append('endDate', filter.endDate);
    if (filter.documentName) params.append('documentName', filter.documentName);

    const response = await apiClient.post(`/print-logs/export?${params.toString()}`, null, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * GET /api/print-logs/statuses - Lấy danh sách trạng thái
   */
  async getStatuses(): Promise<PrintLogStatus[]> {
    const response = await apiClient.get<PrintLogStatus[]>('/print-logs/statuses');
    return response.data;
  },
};
