/**
 * User Roles
 * Defines all user roles in the system and their hierarchy
 */

// ============================================================================
// Role Enumeration
// ============================================================================

export enum UserRole {
  ROOT = 'root',
  ADMIN = 'admin',
  COORDINADOR = 'coordinador',
  AUXILIAR = 'auxiliar',
  CLIENTE = 'cliente',
}

// ============================================================================
// Role Hierarchy
// ============================================================================

/**
 * Role hierarchy from most to least privileged
 */
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.ROOT,
  UserRole.ADMIN,
  UserRole.COORDINADOR,
  UserRole.AUXILIAR,
  UserRole.CLIENTE,
];

/**
 * Role descriptions for UI/documentation
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.ROOT]: 'Sistema - Acceso total',
  [UserRole.ADMIN]: 'Administrador - Gestión completa',
  [UserRole.COORDINADOR]: 'Coordinador - Gestión de órdenes y planes',
  [UserRole.AUXILIAR]: 'Auxiliar - Ejecución de trabajos',
  [UserRole.CLIENTE]: 'Cliente - Solicitud de servicios',
};

// ============================================================================
// Privilege Checking
// ============================================================================

/**
 * Checks if a role has equal or greater privilege than another role
 * @param userRole - Role of the user performing the action
 * @param requiredRole - Role required for the action
 * @returns true if user role privilege >= required role privilege
 */
export function hasRolePrivilege(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);

  return userLevel !== -1 && requiredLevel !== -1 && userLevel <= requiredLevel;
}

/**
 * Gets the privilege level of a role (0 = highest, length = lowest)
 * @param role - Role to check
 * @returns Privilege level index or -1 if role not found
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY.indexOf(role);
}

/**
 * Checks if a role is admin or above
 */
export function isAdminOrAbove(role: UserRole): boolean {
  return hasRolePrivilege(role, UserRole.ADMIN);
}

/**
 * Checks if a role is coordinator or above
 */
export function isCoordinatorOrAbove(role: UserRole): boolean {
  return hasRolePrivilege(role, UserRole.COORDINADOR);
}
