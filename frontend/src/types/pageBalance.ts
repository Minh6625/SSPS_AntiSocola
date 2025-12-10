/**
 * PAGE BALANCE TYPES
 */

export type TransactionType = 'ALLOCATED' | 'PURCHASED' | 'DEDUCTED';

export interface PageTransaction {
  id: number;
  userId: number;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  relatedJobId?: number;
  transactionDate: string;
  description: string;
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
