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
      if (filters.status) params.append('status', filters.status);
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
};
