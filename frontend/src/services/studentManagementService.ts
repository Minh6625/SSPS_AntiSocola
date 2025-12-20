/**
 * STUDENT MANAGEMENT SERVICE - SPSO only
 * API quản lý sinh viên cho role SPSO
 */

import apiClient from '@/config/axios';

// Types
export interface StudentListDTO {
  studentId: string;
  email: string;
  fullName: string;
  status: string;
  a4Balance: number;
  a3Balance: number;
  totalPrintJobs: number;
  lastLogin: string | null;
}

export interface StudentDetailDTO {
  studentId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  status: string;
  createdAt: string;
  lastLogin: string | null;
  a4Balance: number;
  a3Balance: number;
  totalA4Equivalent: number;
  totalPrintJobs: number;
  totalPagesPrinted: number;
  lastPrintTime: string | null;
}

export interface StudentFilterDTO {
  keyword?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
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

export interface UpdateStatusRequest {
  studentId: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  reason?: string;
}

export interface UpdateStatusResponse {
  studentId: string;
  studentName: string;
  previousStatus: string;
  newStatus: string;
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

export const studentManagementService = {
  /**
   * GET /api/spso/students - Lấy danh sách sinh viên
   */
  async getStudentList(filter: StudentFilterDTO = {}): Promise<PageResponse<StudentListDTO>> {
    const params = new URLSearchParams();
    
    if (filter.keyword) params.append('keyword', filter.keyword);
    if (filter.status) params.append('status', filter.status);
    params.append('pageNumber', String(filter.pageNumber || 1));
    params.append('pageSize', String(filter.pageSize || 20));
    params.append('sortBy', filter.sortBy || 'studentId');
    params.append('sortDirection', filter.sortDirection || 'ASC');
    
    const response = await apiClient.get<PageResponse<StudentListDTO>>(
      `/spso/students?${params.toString()}`
    );
    return response.data;
  },

  /**
   * GET /api/spso/students/{studentId} - Lấy chi tiết sinh viên
   */
  async getStudentDetail(studentId: string): Promise<StudentDetailDTO> {
    const response = await apiClient.get<StudentDetailDTO>(`/spso/students/${studentId}`);
    return response.data;
  },

  /**
   * POST /api/spso/students/allocate-pages - Cấp trang miễn phí
   */
  async allocatePages(request: AllocatePageRequest): Promise<AllocatePageResponse> {
    const response = await apiClient.post<AllocatePageResponse>(
      '/spso/students/allocate-pages',
      request
    );
    return response.data;
  },

  /**
   * PUT /api/spso/students/status - Cập nhật trạng thái sinh viên
   */
  async updateStudentStatus(request: UpdateStatusRequest): Promise<UpdateStatusResponse> {
    const response = await apiClient.put<UpdateStatusResponse>(
      '/spso/students/status',
      request
    );
    return response.data;
  },

  /**
   * GET /api/spso/students/{studentId}/print-history - Lấy lịch sử in
   */
  async getStudentPrintHistory(
    studentId: string,
    pageNumber: number = 1,
    pageSize: number = 20
  ): Promise<PageResponse<PrintLogDTO>> {
    const response = await apiClient.get<PageResponse<PrintLogDTO>>(
      `/spso/students/${studentId}/print-history?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    return response.data;
  },

  /**
   * DELETE /api/spso/students/{studentId} - Xóa sinh viên (soft delete)
   */
  async deleteStudent(studentId: string): Promise<void> {
    await apiClient.delete(`/spso/students/${studentId}`);
  },
};
