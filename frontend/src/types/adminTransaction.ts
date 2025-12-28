/**
 * ADMIN TRANSACTION TYPES - Quản lý giao dịch cho SPSO
 */

export interface AdminTransaction {
  transactionId: number;
  transactionCode: string;
  studentId: string;
  studentName: string | null;
  studentEmail: string | null;
  transactionType: string;
  a4Pages: number;
  balanceAfterA4: number;
  amount: number | null;
  paymentMethod: string | null;
  transactionStatus: string;
  semester: string | null;
  notes: string | null;
  createdAt: string;
  createdBy: string | null;
}

export interface AdminTransactionResponse {
  content: AdminTransaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalAllocateTransactions: number;
  totalPurchaseTransactions: number;
  totalUseTransactions: number;
}

export interface TransactionFilter {
  keyword?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}
