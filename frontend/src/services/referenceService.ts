/**
 * Reference Data Service - API calls for dropdown data
 */

import { AxiosError } from 'axios';
import apiClient from '@/config/axios';

interface ErrorResponse {
  error: string;
  timestamp: string;
}

export interface Brand {
  brandId: number;
  brandName: string;
  isActive: boolean;
}

export interface PrinterModel {
  modelId: number;
  modelName: string;
  brandId: number;
  defaultPaperSizes: string;
  defaultColorPrinting: boolean;
  defaultDuplexPrinting: boolean;
  isActive: boolean;
}

export interface Campus {
  campusId: number;
  campusCode: string;
  campusName: string;
  isActive: boolean;
}

export interface Building {
  buildingId: number;
  buildingCode: string;
  buildingName: string;
  campusId: number;
  isActive: boolean;
}

export interface Room {
  roomId: number;
  roomNumber: string;
  roomType: string;
  capacity: number;
  buildingId: number;
  isActive: boolean;
}

export const referenceService = {
  /**
   * GET /api/reference/brands
   * Lấy danh sách hãng máy in
   */
  async getBrands(): Promise<Brand[]> {
    try {
      const response = await apiClient.get('/reference/brands');
      return response.data.data as Brand[];
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Lấy danh sách hãng thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/reference/models?brandId=X
   * Lấy danh sách model theo hãng
   */
  async getModelsByBrand(brandId: number): Promise<PrinterModel[]> {
    try {
      const response = await apiClient.get(`/reference/models?brandId=${brandId}`);
      return response.data.data as PrinterModel[];
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Lấy danh sách model thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/reference/campuses
   * Lấy danh sách cơ sở
   */
  async getCampuses(): Promise<Campus[]> {
    try {
      const response = await apiClient.get('/reference/campuses');
      return response.data.data as Campus[];
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Lấy danh sách cơ sở thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/reference/buildings?campusId=X
   * Lấy danh sách tòa nhà theo cơ sở
   */
  async getBuildingsByCampus(campusId: number): Promise<Building[]> {
    try {
      const response = await apiClient.get(`/reference/buildings?campusId=${campusId}`);
      return response.data.data as Building[];
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Lấy danh sách tòa nhà thất bại';
      throw new Error(errorMessage);
    }
  },

  /**
   * GET /api/reference/rooms?buildingId=X
   * Lấy danh sách phòng theo tòa nhà
   */
  async getRoomsByBuilding(buildingId: number): Promise<Room[]> {
    try {
      const response = await apiClient.get(`/reference/rooms?buildingId=${buildingId}`);
      return response.data.data as Room[];
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.error || 'Lấy danh sách phòng thất bại';
      throw new Error(errorMessage);
    }
  },
};
