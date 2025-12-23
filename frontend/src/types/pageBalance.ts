/**
 * PAGE BALANCE TYPES - Chỉ A4
 */

export type TransactionType = 'Allocate' | 'Purchase' | 'Use' | 'ALLOCATED' | 'PURCHASED' | 'DEDUCTED';

export interface PageTransaction {
  transactionId: number;
  transactionCode: string;  // Mã giao dịch: TXN819201
  transactionType: string;
  a4Pages: number;
  balanceAfterA4: number;
  notes: string;
  createdAt: string;
}

export interface PageTransactionResponse {
  content: PageTransaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PageBalance {
  id: number;
  userId: number;
  pagesA4: number;
  lastUpdated: string;
}

export interface PageBalanceResponse extends PageBalance {
  // Chỉ có A4, không có totalA4Equivalent
}
