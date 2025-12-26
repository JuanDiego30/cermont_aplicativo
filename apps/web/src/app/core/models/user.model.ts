export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
  ADMINISTRATIVO = 'administrativo'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  phone?: string | null;
  avatar?: string | null;
  active?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * AuthResponse - Compatible with backend NestJS auth response
 * Backend sends: { token, refreshToken, user }
 */
export interface AuthResponse {
  token?: string;           // Backend field
  access_token?: string;    // Alternative naming
  refreshToken?: string;    // Backend field  
  refresh_token?: string;   // Alternative naming
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole | string;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole | string;
  phone?: string;
  avatar?: string;
  active?: boolean;
}

export interface UserQueryParams {
  role?: UserRole | string;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  locked?: boolean;
}

export interface PaginatedUsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
