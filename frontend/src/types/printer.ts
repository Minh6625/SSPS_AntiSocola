/**
 * Printer types for print flow
 */

export interface Printer {
  printerId: string;
  printerName: string;
  brand: string;
  model: string;
  location: string;
  campus: string;
  building: string;
  roomNumber: string;
  paperSizes: string; // "A4,A3"
  colorPrinting: boolean;
  duplexPrinting: boolean;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Error';
  totalPagesPrinted: number;
  lastMaintenanceDate?: string;
  createdAt: string;
}

export interface PrinterListResponse {
  content: Printer[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PrinterFilters {
  campus?: string;
  building?: string;
  status?: string;
  keyword?: string;
  colorPrinting?: boolean;
  duplexPrinting?: boolean;
}
