/**
 * Authentication DTOs - Shared between Backend and Frontend
 */

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: UserRole;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'TECNICO' | 'SUPERVISOR' | 'CLIENTE';

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol?: UserRole;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

/**
 * Full User interface for frontend consumption
 */
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  name?: string; // Compatibility alias
  rol: UserRole;
  role?: UserRole; // Compatibility alias
  phone?: string;
  avatar?: string;
  active?: boolean;
  activo: boolean;
  emailVerified?: boolean;
  lastLogin?: string;
  lockedUntil?: string | null;
  loginAttempts?: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Auth Response for frontend
 */
export interface AuthResponse {
  token: string;
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn?: number;
}

/**
 * User list query parameters
 */
export interface ListUsersQuery {
  role?: UserRole;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  locked?: boolean;
}

/**
 * Paginated users response
 */
export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
