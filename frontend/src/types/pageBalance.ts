/**
 * TYPE DEFINITIONS - Page Balance
 */

export interface PageBalanceResponse {
  pagesA4: number;
  pagesA3: number;
  totalA4Equivalent: number;
  lastUpdated: string;
}

export interface PageBalanceError {
  error: string;
  timestamp: string;
}
