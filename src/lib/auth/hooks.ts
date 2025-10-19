/**
 * Hooks de permisos
 * Verifican si el usuario actual tiene permisos específicos
 */

'use client';

import { useAuth, useRole } from './AuthContext';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/types/roles';

/**
 * Hook para verificar si el usuario tiene un permiso específico
 */
export function usePermission(permission: Permission): boolean {
  const role = useRole();
  if (!role) return false;
  return hasPermission(role, permission);
}

/**
 * Hook para verificar si el usuario tiene alguno de los permisos
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const role = useRole();
  if (!role) return false;
  return hasAnyPermission(role, permissions);
}

/**
 * Hook para verificar si el usuario tiene todos los permisos
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const role = useRole();
  if (!role) return false;
  return hasAllPermissions(role, permissions);
}

/**
 * Hook para verificar si el usuario está autenticado
 */
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}
