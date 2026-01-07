/**
 * @decorator Roles
 *
 * Declara roles requeridos en rutas (leído por RolesGuard vía metadata).
 *
 * Uso: @Roles('admin') o @Roles(UserRole.ADMIN).
 */
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../enums/user-role.enum";

export const ROLES_KEY = "roles";

/**
 * Define roles requeridos.
 * - Compatible con uso actual: @Roles('admin')
 * - Type-safe opcional: @Roles(UserRole.ADMIN)
 */
export const Roles = (...roles: Array<UserRole | string>) =>
  SetMetadata(ROLES_KEY, roles);

/**
 * Helper para validar roles (útil para inputs dinámicos)
 */
export const isValidRole = (role: string): role is UserRole => {
  return Object.values(UserRole).includes(role as UserRole);
};
