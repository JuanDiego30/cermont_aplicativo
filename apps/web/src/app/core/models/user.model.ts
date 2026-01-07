/**
 * User Role enum - matches backend SSOT
 * @see apps/api/src/common/enums/user-role.enum.ts
 * @see apps/api/prisma/schema.prisma enum UserRole
 */
export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
  ADMINISTRATIVO = 'administrativo',
  GERENTE = 'gerente',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  active: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  lockedUntil?: string | null;
  loginAttempts: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  role?: UserRole;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

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

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  locked: number;
  byRole: Record<string, number>;
  recentlyActive: number;
}

export interface Permission {
  resource: string;
  action: string;
}

export interface RolePermissions {
  role: string;
  description: string;
  permissions: Permission[];
}

export interface RevokeTokensResult {
  tokensRevoked: number;
  message: string;
}
