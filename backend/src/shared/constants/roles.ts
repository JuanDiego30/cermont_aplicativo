export enum UserRole {
  ROOT = 'root',
  ADMIN = 'admin',
  COORDINADOR = 'coordinador',
  AUXILIAR = 'auxiliar',
}

/**
 * Jerarquía de roles (del más privilegiado al menos privilegiado)
 */
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.ROOT,
  UserRole.ADMIN,
  UserRole.COORDINADOR,
  UserRole.AUXILIAR,
];

/**
 * Verifica si un rol tiene privilegio igual o superior a otro
 * @param userRole - Rol del usuario que opera
 * @param requiredRole - Rol requerido para la acción
 */
export function hasRolePrivilege(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);

  return userLevel !== -1 && requiredLevel !== -1 && userLevel <= requiredLevel;
}
