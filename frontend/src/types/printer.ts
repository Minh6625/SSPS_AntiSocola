/**
 * Printer types for print flow
 */

export interface Printer {
  printerId: number;
  printerName: string;
  brand: string;
  model: string;
  location: string;
  campus: string;
  building: string;
  roomNumber: string;
  ipAddress?: string;
  paperSizes: string; // "A4,A3"
  colorPrinting: boolean;
  duplexPrinting: boolean;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Error' | 'OutOfPaper' | 'OutOfToner' | 'OutOfBoth';
  statusMessage?: string;
  totalPagesPrinted: number;
  lastMaintenanceDate?: string;
  createdAt: string;
  
  // Paper supplies
  a4PaperRemaining?: number;
  a3PaperRemaining?: number;
  a4PaperCapacity?: number;
  a3PaperCapacity?: number;
  
  // Toner supplies
  tonerBlackRemaining?: number;
  tonerCyanRemaining?: number;
  tonerMagentaRemaining?: number;
  tonerYellowRemaining?: number;
  tonerLastReplaced?: string;
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
  room?: string;
  brand?: string;
  model?: string;
  status?: string;
  lastMaintenanceDate?: string;
  keyword?: string;
  colorPrinting?: boolean;
  duplexPrinting?: boolean;
}
