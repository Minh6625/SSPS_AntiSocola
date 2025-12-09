/**
 * DOCUMENT SERVICE - Upload, List, Download, Delete Documents
 * Handles multipart/form-data file uploads to backend API
 */

import { AxiosError, AxiosProgressEvent } from 'axios';
import apiClient from '@/config/axios';

// Types
export interface DocumentUploadRequest {
  file: File;
  description?: string;
}

// Frontend-friendly shape (mapped từ backend DocumentResponseDTO)
export interface DocumentResponse {
  id: number;
  fileName: string;
  fileExtension: string;
  fileSizeKB: number;
  uploadDate: string;
  isDeleted: boolean;
}

export interface DocumentListResponse {
  content: DocumentResponse[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Backend DTO shape
type BackendDocumentDTO = {
  documentId: number;
  originalFileName: string;
  fileExtension: string;
  fileSizeKB: number;
  uploadDate: string;
  isDeleted: boolean;
};

export interface DocumentError {
  error: string;
  timestamp: string;
  path: string;
}

export const documentService = {
  /**
   * POST /api/documents/upload
   * Upload tài liệu từ máy tính của người dùng
   * 
   * @param file - File từ input[type=file] của user
   * @param description - Optional mô tả tài liệu
   * @param onProgress - Callback để theo dõi tiến độ upload (%)
   * @returns Document ID nếu thành công
   * 
   * Validation trên backend:
   * - File size: Max 50MB
   * - File type: PDF, DOCX, PPTX, XLSX
   * - File name: Không chứa ký tự đặc biệt
   * 
   * Errors:
   * - 400: File quá lớn, định dạng không hỗ trợ
   * - 401: Không được xác thực (token hết hạn)
   * - 403: Không phải Student role
   * - 500: Lỗi server
   */
  async uploadDocument(
    request: DocumentUploadRequest,
    onProgress?: (progress: number) => void
  ): Promise<{ id: number; fileName: string; message: string }> {
    try {
      // Validate file trên client
      if (!request.file) {
        throw new Error('Vui lòng chọn một file');
      }

      const maxSizeMB = 50;
      const fileSizeMB = request.file.size / (1024 * 1024);
      if (fileSizeMB > maxSizeMB) {
        throw new Error(`File quá lớn (max ${maxSizeMB}MB)`);
      }

      const allowedExtensions = ['pdf', 'docx', 'pptx', 'xlsx'];
      const fileExtension = request.file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        throw new Error(
          `Định dạng file không hỗ trợ. Chấp nhận: ${allowedExtensions.join(', ').toUpperCase()}`
        );
      }

      // Tạo FormData object
      const formData = new FormData();
      formData.append('file', request.file);
      if (request.description) {
        formData.append('description', request.description);
      }

      // Upload với tracking progress
      const response = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress?.(progress);
          }
        },
      });

      const payload = response.data?.data;

      return {
        id: payload?.documentId,
        fileName: payload?.originalFileName,
        message: response.data?.message || 'Upload thành công',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      const axiosError = error as AxiosError<DocumentError>;
      const errorMessage = axiosError.response?.data?.error || 'Upload thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/documents
   * Lấy danh sách tài liệu của student
   * 
   * @param page - Trang (0-indexed)
   * @param size - Số items trên trang
   * @param fileType - Lọc theo loại file (PDF, DOCX, PPTX, XLSX)
   * @param search - Tìm kiếm theo tên file
   * @param sortBy - Trường sắp xếp (uploadDate, fileName)
   * @param sortDir - Hướng sắp xếp (ASC, DESC)
   */
  async getDocuments(
    page: number = 0,
    size: number = 10,
    fileType?: string,
    search?: string,
    sortBy: string = 'uploadDate',
    sortDir: 'ASC' | 'DESC' = 'DESC'
  ): Promise<DocumentListResponse> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      params.append('sortBy', sortBy);
      params.append('sortDirection', sortDir);

      if (fileType && fileType.trim()) {
        params.append('fileType', fileType.toUpperCase());
      }

      if (search && search.trim()) {
        params.append('search', search);
      }

      const response = await apiClient.get(`/documents?${params.toString()}`);
      const data = response.data.data;

      // Map backend DTO -> frontend-friendly shape
      return {
        content: (data.content as BackendDocumentDTO[] | undefined || []).map((item) => ({
          id: item.documentId,
          fileName: item.originalFileName,
          fileExtension: (item.fileExtension || '').toUpperCase(),
          fileSizeKB: Number(item.fileSizeKB || 0),
          uploadDate: item.uploadDate,
          isDeleted: item.isDeleted,
        })),
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        pageSize: data.pageSize,
      } as DocumentListResponse;
    } catch (error) {
      const axiosError = error as AxiosError<DocumentError>;
      const errorMessage = axiosError.response?.data?.error || 'Lấy danh sách thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/documents/{id}
   * Lấy chi tiết một tài liệu
   */
  async getDocumentById(documentId: number): Promise<DocumentResponse> {
    try {
      const response = await apiClient.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<DocumentError>;
      const errorMessage = axiosError.response?.data?.error || 'Lấy thông tin thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/documents/{id}/download
   * Tải file về máy tính
   */
  async downloadDocument(documentId: number): Promise<void> {
    try {
      const response = await apiClient.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });

      // Tạo download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Lấy tên file từ Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'download';
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="?([^"]+)"?/);
        if (matches) fileName = matches[1];
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const axiosError = error as AxiosError<DocumentError>;
      const errorMessage = axiosError.response?.data?.error || 'Tải file thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * DELETE /api/documents/{id}
   * Xóa tài liệu (soft delete)
   */
  async deleteDocument(documentId: number): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<DocumentError>;
      const errorMessage = axiosError.response?.data?.error || 'Xóa thất bại';
      throw new Error(errorMessage);
    }
  },
};
