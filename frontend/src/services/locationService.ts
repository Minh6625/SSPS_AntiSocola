/**
 * LOCATION SERVICE - Campus, Building, Room Management
 */

import apiClient from '@/config/axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

// Types
export interface Campus {
  campusId: number;
  campusCode: string;
  campusName: string;
  address?: string;
  isActive: boolean;
}

export interface Building {
  buildingId: number;
  campusId: number;
  campusName?: string;
  buildingCode: string;
  buildingName?: string;
  floorCount?: number;
  isActive: boolean;
}

export interface Room {
  roomId: number;
  buildingId: number;
  buildingName?: string;
  roomNumber: string;
  roomName?: string;
  roomType?: string;
  capacity?: number;
  isActive: boolean;
}

export interface CampusRequest {
  campusCode: string;
  campusName: string;
  address?: string;
  isActive: boolean;
}

export interface BuildingRequest {
  campusId: number;
  buildingCode: string;
  buildingName?: string;
  floorCount?: number;
  isActive: boolean;
}

export interface RoomRequest {
  buildingId: number;
  roomNumber: string;
  roomName?: string;
  roomType?: string;
  capacity?: number;
  isActive: boolean;
}

// ==================== CAMPUS APIs ====================

export const getAllCampuses = async (): Promise<Campus[]> => {
  const response = await apiClient.get(`${API_BASE_URL}/locations/campuses`);
  return response.data.data;
};

export const createCampus = async (data: CampusRequest): Promise<Campus> => {
  const response = await apiClient.post(`${API_BASE_URL}/locations/campuses`, data);
  return response.data.data;
};

export const updateCampus = async (id: number, data: CampusRequest): Promise<Campus> => {
  const response = await apiClient.put(`${API_BASE_URL}/locations/campuses/${id}`, data);
  return response.data.data;
};

export const deleteCampus = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_BASE_URL}/locations/campuses/${id}`);
};

// ==================== BUILDING APIs ====================

export const getAllBuildings = async (): Promise<Building[]> => {
  const response = await apiClient.get(`${API_BASE_URL}/locations/buildings`);
  return response.data.data;
};

export const createBuilding = async (data: BuildingRequest): Promise<Building> => {
  const response = await apiClient.post(`${API_BASE_URL}/locations/buildings`, data);
  return response.data.data;
};

export const updateBuilding = async (id: number, data: BuildingRequest): Promise<Building> => {
  const response = await apiClient.put(`${API_BASE_URL}/locations/buildings/${id}`, data);
  return response.data.data;
};

export const deleteBuilding = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_BASE_URL}/locations/buildings/${id}`);
};

// ==================== ROOM APIs ====================

export const getAllRooms = async (): Promise<Room[]> => {
  const response = await apiClient.get(`${API_BASE_URL}/locations/rooms`);
  return response.data.data;
};

export const createRoom = async (data: RoomRequest): Promise<Room> => {
  const response = await apiClient.post(`${API_BASE_URL}/locations/rooms`, data);
  return response.data.data;
};

export const updateRoom = async (id: number, data: RoomRequest): Promise<Room> => {
  const response = await apiClient.put(`${API_BASE_URL}/locations/rooms/${id}`, data);
  return response.data.data;
};

export const deleteRoom = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_BASE_URL}/locations/rooms/${id}`);
};

const locationService = {
  // Campus
  getAllCampuses,
  createCampus,
  updateCampus,
  deleteCampus,
  
  // Building
  getAllBuildings,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  
  // Room
  getAllRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};

export default locationService;
