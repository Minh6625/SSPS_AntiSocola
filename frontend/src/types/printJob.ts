/**
 * Print Job types
 */

export interface PrintJobRequest {
  documentId: number;
  printerId: string;
  paperSize: 'A4' | 'A3';
  pageRange?: string; // "1-5,10,15-20" or null for all pages
  duplex: boolean; // 2-sided printing
  copies: number; // 1-10
  colorMode?: 'BW' | 'COLOR'; // Optional
  colorPageRange?: string; // Pages to print in color when colorMode is 'BW'
}

export interface PrintJobResponse {
  jobId: number;
  documentId: number;
  printerId: string;
  studentId: string;
  paperSize: string;
  pageRange?: string;
  duplex: boolean;
  copies: number;
  totalPages: number;
  pagesA4Equivalent: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Cancelled';
  submittedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface PageBalance {
  a4: number;
  a3: number;
  totalA4Equivalent: number;
  lastUpdated?: string;
}

export interface PrintCalculation {
  totalPages: number;
  pagesA4Equivalent: number;
  balanceBefore: number;
  balanceAfter: number;
  hasEnoughBalance: boolean;
}
