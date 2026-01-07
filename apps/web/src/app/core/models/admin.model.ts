/**
 * Admin Models
 * Models for admin module matching backend DTOs
 */

import { UserRole } from "./user.model";

/**
 * User Role type - matches backend SSOT
 * @see apps/api/src/common/enums/user-role.enum.ts
 * @see apps/api/prisma/schema.prisma enum UserRole
 */
export type UserRoleType = UserRole;

/**
 * DTO para crear usuario (Admin module)
 */
export interface AdminCreateUserDto {
  email: string;
  name: string;
  password: string;
  role: UserRoleType;
  phone?: string;
  avatar?: string;
}

/**
 * DTO para actualizar usuario (Admin module)
 */
export interface AdminUpdateUserDto {
  name?: string;
  phone?: string;
  avatar?: string;
}

/**
 * DTO para cambiar rol
 */
export interface ChangeRoleDto {
  role: UserRoleType;
}

/**
 * DTO para cambiar contraseña (admin)
 */
export interface ChangePasswordDto {
  newPassword: string;
}

/**
 * DTO para activar/desactivar usuario
 */
export interface ToggleActiveDto {
  active: boolean;
  reason?: string;
}

/**
 * Query parameters para listar usuarios
 */
export interface UserQueryDto {
  role?: UserRoleType;
  active?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Response de un usuario
 */
export interface UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRoleType;
  phone?: string;
  avatar?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Response paginado de usuarios
 */
export interface PaginatedUsersResponseDto {
  data: UserResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Response de acción genérica
 */
export interface ActionResponseDto<T = UserResponseDto> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Estadísticas de usuarios
 */
export interface UserStatsResponseDto {
  total: number;
  activos: number;
  porRol: Record<string, number>;
}

