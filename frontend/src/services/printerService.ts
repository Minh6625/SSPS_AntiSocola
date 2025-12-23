/**
 * Printer Service - API calls for printer management
 */

import { AxiosError } from 'axios';
import apiClient from '@/config/axios';
import { PrinterListResponse, PrinterFilters } from '@/types/printer';

interface ErrorResponse {
  error: string;
  timestamp: string;
}

export const printerService = {
  /**
   * GET /api/printers
   * Lấy danh sách máy in với filters và pagination
   */
  async getPrinters(
    filters: PrinterFilters = {},
    page: number = 0,
    size: number = 20,
    sortBy: string = 'printerName',
    sortDir: 'ASC' | 'DESC' = 'ASC'
  ): Promise<PrinterListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      params.append('sortBy', sortBy);
      params.append('sortDir', sortDir);

      if (filters.campus) params.append('campus', filters.campus);
      if (filters.building) params.append('building', filters.building);
      if (filters.room) params.append('room', filters.room);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.model) params.append('model', filters.model);
      if (filters.status) params.append('status', filters.status);
      if (filters.lastMaintenanceDate) params.append('lastMaintenanceDate', filters.lastMaintenanceDate);
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.colorPrinting !== undefined) params.append('colorPrinting', filters.colorPrinting.toString());
      if (filters.duplexPrinting !== undefined) params.append('duplexPrinting', filters.duplexPrinting.toString());

      const response = await apiClient.get(`/printers?${params.toString()}`);
      
      return response.data.data as PrinterListResponse;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Lấy danh sách máy in thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/printers/{id}
   * Lấy chi tiết một máy in
   */
  async getPrinterById(id: string) {
    try {
      const response = await apiClient.get(`/printers/${id}`);
      return response.data.data as any; // shape matches Printer
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Không thể tải thông tin máy in';
      throw new Error(errorMessage);
    }
  },

  /**
   * Get available campuses for filter dropdown
   */
  getAvailableCampuses(): string[] {
    return ['Dĩ An', 'Thành phố'];
  },

  /**
   * Get available buildings by campus
   */
  getAvailableBuildings(campus?: string): string[] {
    if (campus === 'Dĩ An') {
      return ['H1', 'H2', 'H3', 'H6'];
    } else if (campus === 'Thành phố') {
      return ['A', 'B', 'C'];
    }
    return [];
  },

  /**
   * POST /api/printers
   * Thêm máy in mới (SPSO only)
   */
  async addPrinter(printerData: {
    printerName: string;
    brandId: number;
    modelId: number;
    roomId: number;
    ipAddress?: string;
    paperSizes: string;
    colorPrinting: boolean;
    duplexPrinting: boolean;
    lastMaintenanceDate?: string;
  }) {
    try {
      const response = await apiClient.post('/printers', printerData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Thêm máy in thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * PUT /api/printers/{id}
   * Cập nhật máy in (SPSO only)
   */
  async updatePrinter(id: number, printerData: {
    printerName: string;
    brandId: number;
    modelId: number;
    roomId: number;
    ipAddress?: string;
    paperSizes: string;
    colorPrinting: boolean;
    duplexPrinting: boolean;
    status: string;
    lastMaintenanceDate?: string;
  }) {
    try {
      const response = await apiClient.put(`/printers/${id}`, printerData);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Cập nhật máy in thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * PATCH /api/printers/{id}/toggle
   * Bật/Tắt máy in (SPSO only)
   */
  async togglePrinter(id: number) {
    try {
      const response = await apiClient.patch(`/printers/${id}/toggle`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Thay đổi trạng thái máy in thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * DELETE /api/printers/{id}
   * Xóa máy in (SPSO only)
   */
  async deletePrinter(id: number) {
    try {
      const response = await apiClient.delete(`/printers/${id}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Xóa máy in thất bại';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Bulk delete printers by calling DELETE for each id (uses existing endpoint).
   */
  async deletePrinters(ids: number[]) {
    try {
      await Promise.all(ids.map(id => apiClient.delete(`/printers/${id}`)));
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Xóa nhóm máy in thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * Bulk toggle printers by calling PATCH toggle for each id.
   */
  async togglePrinters(ids: number[]) {
    try {
      await Promise.all(ids.map(id => apiClient.patch(`/printers/${id}/toggle`)));
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Thay đổi trạng thái nhóm máy in thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/printers/{id}/supplies
   * Lấy thông tin giấy/mực của máy in
   */
  async getPrinterSupplies(id: number) {
    try {
      const response = await apiClient.get(`/printers/${id}/supplies`);
      return response.data.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Không thể tải thông tin giấy/mực';
      throw new Error(errorMessage);
    }
  },

  /**
   * POST /api/printers/{id}/refill
   * Nạp giấy/mực cho máy in (SPSO only)
   */
  async refillSupplies(id: number, data: {
    a4PaperToAdd?: number;
    a3PaperToAdd?: number;
    tonerBlackToAdd?: number;
    tonerCyanToAdd?: number;
    tonerMagentaToAdd?: number;
    tonerYellowToAdd?: number;
  }) {
    try {
      const response = await apiClient.post(`/printers/${id}/refill`, data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      // Extract message from backend response (message field, not error field)
      const errorMessage = axiosError.response?.data?.message 
        || axiosError.response?.data?.error 
        || 'Nạp giấy/mực thất bại';
      // Throw error with message but preserve the original axios error
      const err = new Error(errorMessage);
      (err as any).response = axiosError.response; // Preserve response for debugging
      throw err;
    }
  },
};
