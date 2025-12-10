/**
 * PAGE BALANCE TYPES
 */

export type TransactionType = 'Allocate' | 'Purchase' | 'Use' | 'ALLOCATED' | 'PURCHASED' | 'DEDUCTED';

export interface PageTransaction {
  transactionId: number;
  transactionType: string;
  a4Pages: number;
  a3Pages: number;
  balanceAfter: number;
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
  pagesA3: number;
  lastUpdated: string;
}

export interface PageBalanceResponse extends PageBalance {
  totalA4Equivalent: number;
}
