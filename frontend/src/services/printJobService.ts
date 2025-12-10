/**
 * Print Job Service - API calls for print jobs
 */

import { AxiosError } from 'axios';
import apiClient from '@/config/axios';
import { PrintJobRequest, PrintJobResponse, PageBalance } from '@/types/printJob';

interface ErrorResponse {
  error: string;
  timestamp: string;
}

export const printJobService = {
  /**
   * POST /api/print-jobs
   * Submit a new print job
   */
  async submitPrintJob(request: PrintJobRequest): Promise<PrintJobResponse> {
    try {
      const response = await apiClient.post('/print-jobs', request);
      return response.data.data as PrintJobResponse;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Gửi lệnh in thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/users/me/page-balance
   * Get current page balance
   */
  async getPageBalance(): Promise<PageBalance> {
    try {
      const response = await apiClient.get('/users/me/page-balance');
      return response.data.data as PageBalance;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Lấy số dư trang thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * Calculate total pages and A4 equivalent
   * Formula:
   * - A3 = 2x A4
   * - Duplex (2-sided) = x0.5
   * Example: 10 pages, A3, duplex, 2 copies = 10 * 2 * 0.5 * 2 = 20 A4 pages
   */
  calculatePages(
    documentTotalPages: number,
    paperSize: 'A4' | 'A3',
    duplex: boolean,
    copies: number,
    pageRange?: string
  ): number {
    // Parse page range if provided
    let pagesToPrint = documentTotalPages;
    
    if (pageRange && pageRange.trim()) {
      pagesToPrint = this.parsePageRange(pageRange, documentTotalPages);
    }

    // Calculate A4 equivalent
    let a4Equivalent = pagesToPrint;
    
    // A3 is 2x A4
    if (paperSize === 'A3') {
      a4Equivalent *= 2;
    }
    
    // Duplex (2-sided) reduces by half
    if (duplex) {
      a4Equivalent *= 0.5;
    }
    
    // Multiply by number of copies
    a4Equivalent *= copies;
    
    return Math.ceil(a4Equivalent);
  },

  /**
   * Parse page range string
   * Examples: "1-5,10,15-20" -> 5 + 1 + 6 = 12 pages
   */
  parsePageRange(pageRange: string, maxPages: number): number {
    const ranges = pageRange.split(',').map(r => r.trim());
    let totalPages = 0;

    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start > 0 && end <= maxPages && start <= end) {
          totalPages += (end - start + 1);
        }
      } else {
        const page = parseInt(range);
        if (!isNaN(page) && page > 0 && page <= maxPages) {
          totalPages += 1;
        }
      }
    }

    return totalPages;
  },

  /**
   * Validate page range string
   */
  validatePageRange(pageRange: string, maxPages: number): { valid: boolean; error?: string } {
    if (!pageRange || !pageRange.trim()) {
      return { valid: true }; // Empty is valid (means all pages)
    }

    const ranges = pageRange.split(',').map(r => r.trim());

    for (const range of ranges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n.trim()));
        if (isNaN(start) || isNaN(end)) {
          return { valid: false, error: 'Định dạng không hợp lệ. VD: 1-5,10,15-20' };
        }
        if (start <= 0 || end > maxPages) {
          return { valid: false, error: `Trang phải từ 1 đến ${maxPages}` };
        }
        if (start > end) {
          return { valid: false, error: 'Trang bắt đầu phải nhỏ hơn trang kết thúc' };
        }
      } else {
        const page = parseInt(range);
        if (isNaN(page) || page <= 0 || page > maxPages) {
          return { valid: false, error: `Trang phải từ 1 đến ${maxPages}` };
        }
      }
    }

    return { valid: true };
  },
};
