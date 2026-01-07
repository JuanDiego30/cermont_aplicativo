/**
 * @decorator Roles
 *
 * Declara roles requeridos en rutas (leído por RolesGuard vía metadata).
 *
 * Uso: @Roles('admin') o @Roles(UserRole.ADMIN).
 */
import { SetMetadata } from "@nestjs/common";
import { UserRole, isValidUserRole } from "../enums/user-role.enum";

// Re-export para compatibilidad con código existente
export { UserRole };

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
 * @deprecated Use isValidUserRole from common/enums/user-role.enum
 */
export const isValidRole = isValidUserRole;
