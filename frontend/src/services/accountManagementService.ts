/**
 * ACCOUNT MANAGEMENT SERVICE - SPSO only
 * API quản lý tài khoản (tất cả roles) cho role SPSO
 */

import apiClient from '@/config/axios';

// Types
export interface AccountListDTO {
  userId: string;
  email: string;
  fullName: string;
  userType: 'Student' | 'SPSO' | 'Admin';
  status: string;
  a4Balance: number | null;
  a3Balance: number | null;
  totalPrintJobs: number | null;
  lastLogin: string | null;
  createdAt: string;
}

export interface AccountDetailDTO {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  userType: 'Student' | 'SPSO' | 'Admin';
  status: string;
  createdAt: string;
  lastLogin: string | null;
  a4Balance: number | null;
  a3Balance: number | null;
  totalA4Equivalent: number | null;
  totalPrintJobs: number | null;
  totalPagesPrinted: number | null;
  lastPrintTime: string | null;
}

export interface AccountFilterDTO {
  keyword?: string;
  userType?: 'Student' | 'SPSO' | 'Admin';
  status?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface UpdateStatusRequest {
  userId: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  reason?: string;
}

export interface UpdateStatusResponse {
  userId: string;
  fullName: string;
  previousStatus: string;
  newStatus: string;
  message: string;
}

export interface UpdateRoleRequest {
  userId: string;
  newRole: 'Student' | 'SPSO' | 'Admin';
  reason?: string;
}

export interface UpdateRoleResponse {
  userId: string;
  fullName: string;
  previousRole: string;
  newRole: string;
  message: string;
}

export interface AllocatePageRequest {
  studentId: string;
  a4Pages: number;
  a3Pages: number;
  reason?: string;
}

export interface AllocatePageResponse {
  studentId: string;
  studentName: string;
  a4PagesAllocated: number;
  a3PagesAllocated: number;
  newA4Balance: number;
  newA3Balance: number;
  totalA4Equivalent: number;
  message: string;
}

export interface PrintLogDTO {
  logId: number;
  jobId: number;
  studentId: string;
  printerId: number;
  documentName: string;
  paperSize: string;
  pagesPrinted: number;
  a4EquivalentUsed: number;
  printTime: string;
  durationSeconds: number;
  status: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}

export const accountManagementService = {
  /**
   * GET /api/spso/accounts - Lấy danh sách tài khoản
   */
  async getAccountList(filter: AccountFilterDTO = {}): Promise<PageResponse<AccountListDTO>> {
    const params = new URLSearchParams();
    
    if (filter.keyword) params.append('keyword', filter.keyword);
    if (filter.userType) params.append('userType', filter.userType);
    if (filter.status) params.append('status', filter.status);
    params.append('pageNumber', String(filter.pageNumber || 1));
    params.append('pageSize', String(filter.pageSize || 20));
    params.append('sortBy', filter.sortBy || 'userId');
    params.append('sortDirection', filter.sortDirection || 'ASC');
    
    const response = await apiClient.get<PageResponse<AccountListDTO>>(
      `/spso/accounts?${params.toString()}`
    );
    return response.data;
  },

  /**
   * GET /api/spso/accounts/{userId} - Lấy chi tiết tài khoản
   */
  async getAccountDetail(userId: string): Promise<AccountDetailDTO> {
    const response = await apiClient.get<AccountDetailDTO>(`/spso/accounts/${userId}`);
    return response.data;
  },

  /**
   * PUT /api/spso/accounts/status - Cập nhật trạng thái tài khoản
   */
  async updateAccountStatus(request: UpdateStatusRequest): Promise<UpdateStatusResponse> {
    const response = await apiClient.put<UpdateStatusResponse>(
      '/spso/accounts/status',
      request
    );
    return response.data;
  },

  /**
   * PUT /api/spso/accounts/role - Đổi role tài khoản
   */
  async updateAccountRole(request: UpdateRoleRequest): Promise<UpdateRoleResponse> {
    const response = await apiClient.put<UpdateRoleResponse>(
      '/spso/accounts/role',
      request
    );
    return response.data;
  },

  /**
   * POST /api/spso/accounts/allocate-pages - Cấp trang miễn phí
   */
  async allocatePages(request: AllocatePageRequest): Promise<AllocatePageResponse> {
    const response = await apiClient.post<AllocatePageResponse>(
      '/spso/accounts/allocate-pages',
      request
    );
    return response.data;
  },

  /**
   * GET /api/spso/accounts/{userId}/print-history - Lấy lịch sử in
   */
  async getAccountPrintHistory(
    userId: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<PageResponse<PrintLogDTO>> {
    const response = await apiClient.get<PageResponse<PrintLogDTO>>(
      `/spso/accounts/${userId}/print-history?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return response.data;
  },

  /**
   * DELETE /api/spso/accounts/{userId} - Xóa tài khoản (soft delete)
   */
  async deleteAccount(userId: string): Promise<void> {
    await apiClient.delete(`/spso/accounts/${userId}`);
  },
};
