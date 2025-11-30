import type { BaseEntity, PaginatedResponse } from '@/shared/types';

export enum UserRole {
  ROOT = 'ROOT',
  ADMIN = 'ADMIN',
  COORDINATOR = 'COORDINATOR',
  INSPECTOR = 'INSPECTOR',
  TECHNICIAN = 'TECHNICIAN',
  CLIENT = 'CLIENT',
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  mfaEnabled: boolean;
  lastLogin?: string;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  role: UserRole;
  password?: string;
}

export interface UpdateUserDTO {
  name?: string;
  role?: UserRole;
  mfaEnabled?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export type UsersResponse = PaginatedResponse<User>;

