/**
 * @fileoverview Enum canónico de roles de usuario
 * @module common/enums
 *
 * Este es el ÚNICO lugar donde se define UserRole.
 * Todos los demás archivos deben importar desde aquí.
 *
 * @see REFACTOR_AUDIT_2026.md - Sprint 1.1
 */

/**
 * Roles de usuario en el sistema Cermont
 * @enum {string}
 */
export enum UserRole {
  /** Administrador con acceso total */
  ADMIN = "admin",

  /** Supervisor de operaciones */
  SUPERVISOR = "supervisor",

  /** Técnico de campo */
  TECNICO = "tecnico",

  /** Personal administrativo */
  ADMINISTRATIVO = "administrativo",

  /** Gerente con visión ejecutiva */
  GERENTE = "gerente",
}

/**
 * Array de todos los roles válidos (útil para validación)
 */
export const ALL_USER_ROLES = Object.values(UserRole);

/**
 * Verifica si un string es un UserRole válido
 * @param role - String a verificar
 * @returns true si es un rol válido
 */
export function isValidUserRole(role: string): role is UserRole {
  return ALL_USER_ROLES.includes(role as UserRole);
}

/**
 * Roles con permisos de administración
 */
export const ADMIN_ROLES: UserRole[] = [UserRole.ADMIN];

/**
 * Roles con permisos de supervisión (incluye admin)
 */
export const SUPERVISOR_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPERVISOR];

/**
 * Roles operativos (técnicos y administrativos)
 */
export const OPERATIVE_ROLES: UserRole[] = [UserRole.TECNICO, UserRole.ADMINISTRATIVO];

/**
 * Role display names for UI
 */
export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Administrador",
  [UserRole.SUPERVISOR]: "Supervisor",
  [UserRole.TECNICO]: "Técnico",
  [UserRole.ADMINISTRATIVO]: "Administrativo",
  [UserRole.GERENTE]: "Gerente",
};

/**
 * Role descriptions for tooltips/help
 */
export const USER_ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Acceso total al sistema",
  [UserRole.SUPERVISOR]: "Supervisor de operaciones con métricas y aprobaciones",
  [UserRole.TECNICO]: "Técnico de campo con capacidades de ejecución",
  [UserRole.ADMINISTRATIVO]: "Personal administrativo para gestión documental",
  [UserRole.GERENTE]: "Gerente con visión ejecutiva",
};
