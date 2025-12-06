/**
 * TYPE DEFINITIONS - Khớp với DTO từ Backend
 */

export interface User {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface UserCreateDTO {
  email: string;
  fullName: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  message: string;
  errors?: { [key: string]: string };
}
