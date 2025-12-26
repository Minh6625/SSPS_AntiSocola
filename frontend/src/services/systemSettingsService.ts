/**
 * SYSTEM SETTINGS SERVICE - SPSO only
 * API quản lý cấu hình hệ thống cho role SPSO
 */

import apiClient from '@/config/axios';

// Types
export interface SystemConfigDTO {
  configKey: string;
  configValue: string;
  description: string;
  dataType: 'String' | 'Integer' | 'Decimal' | 'Boolean' | 'JSON';
}

export interface SemesterDTO {
  semesterId: number;
  semesterCode: string;
  semesterName: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  defaultA4Pages: number;
  pageAllocationDate: string | null;
  isActive: boolean;
  isCurrent: boolean;
}

export interface AllowedFileTypeDTO {
  fileTypeId: number;
  fileExtension: string;
  mimeType: string;
  maxFileSizeMB: number;
  isAllowed: boolean;
}

export interface SystemSettingsResponse {
  configs: Record<string, SystemConfigDTO>;
  semesters: SemesterDTO[];
  currentSemester: SemesterDTO | null;
  allowedFileTypes: AllowedFileTypeDTO[];
}

export interface CreateSemesterRequest {
  semesterCode: string;
  semesterName: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  defaultA4Pages: number;
  pageAllocationDate?: string;
  isCurrent?: boolean;
  createdBy: string;
}

export interface UpdateSemesterRequest {
  semesterId: number;
  semesterName: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  defaultA4Pages: number;
  pageAllocationDate?: string;
  isActive?: boolean;
  isCurrent?: boolean;
  updatedBy: string;
}

export interface UpdateSystemConfigRequest {
  configKey: string;
  configValue: string;
  updatedBy: string;
}

export const systemSettingsService = {
  /**
   * GET /api/spso/settings - Lấy tất cả cấu hình hệ thống
   */
  async getAllSettings(): Promise<SystemSettingsResponse> {
    const response = await apiClient.get<SystemSettingsResponse>('/spso/settings');
    return response.data;
  },

  /**
   * GET /api/spso/settings/config/{configKey} - Lấy một config
   */
  async getConfig(configKey: string): Promise<SystemConfigDTO> {
    const response = await apiClient.get<SystemConfigDTO>(`/spso/settings/config/${configKey}`);
    return response.data;
  },

  /**
   * PUT /api/spso/settings/config - Cập nhật một config
   */
  async updateConfig(request: UpdateSystemConfigRequest): Promise<SystemConfigDTO> {
    const response = await apiClient.put<SystemConfigDTO>('/spso/settings/config', request);
    return response.data;
  },

  /**
   * PUT /api/spso/settings/configs - Cập nhật nhiều configs cùng lúc
   */
  async updateMultipleConfigs(
    configs: Record<string, string>,
    updatedBy: string
  ): Promise<Record<string, SystemConfigDTO>> {
    const response = await apiClient.put<Record<string, SystemConfigDTO>>(
      '/spso/settings/configs',
      configs,
      { params: { updatedBy } }
    );
    return response.data;
  },

  /**
   * GET /api/spso/settings/semesters - Lấy tất cả học kỳ
   */
  async getAllSemesters(): Promise<SemesterDTO[]> {
    const response = await apiClient.get<SemesterDTO[]>('/spso/settings/semesters');
    return response.data;
  },

  /**
   * GET /api/spso/settings/semesters/current - Lấy học kỳ hiện tại
   */
  async getCurrentSemester(): Promise<SemesterDTO> {
    const response = await apiClient.get<SemesterDTO>('/spso/settings/semesters/current');
    return response.data;
  },

  /**
   * POST /api/spso/settings/semesters - Tạo học kỳ mới
   */
  async createSemester(request: CreateSemesterRequest): Promise<SemesterDTO> {
    const response = await apiClient.post<SemesterDTO>('/spso/settings/semesters', request);
    return response.data;
  },

  /**
   * PUT /api/spso/settings/semesters - Cập nhật học kỳ
   */
  async updateSemester(request: UpdateSemesterRequest): Promise<SemesterDTO> {
    const response = await apiClient.put<SemesterDTO>('/spso/settings/semesters', request);
    return response.data;
  },

  /**
   * PUT /api/spso/settings/semesters/{semesterId}/set-current - Đặt học kỳ làm current
   */
  async setCurrentSemester(semesterId: number, updatedBy: string): Promise<SemesterDTO> {
    const response = await apiClient.put<SemesterDTO>(
      `/spso/settings/semesters/${semesterId}/set-current`,
      null,
      { params: { updatedBy } }
    );
    return response.data;
  },

  /**
   * DELETE /api/spso/settings/semesters/{semesterId} - Xóa học kỳ
   */
  async deleteSemester(semesterId: number): Promise<void> {
    await apiClient.delete(`/spso/settings/semesters/${semesterId}`);
  },
};
