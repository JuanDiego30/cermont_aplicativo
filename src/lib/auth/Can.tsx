/**
 * Componente para renderizar contenido condicionalmente basado en permisos
 * Uso: <Can permission={Permission.ORDEN_DELETE}>botón eliminar</Can>
 */

'use client';

import { useRole } from './AuthContext';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/types/roles';

interface CanProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function Can({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}: CanProps) {
  const role = useRole();

  if (!role) {
    return <>{fallback}</>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(role, permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(role, permissions)
      : hasAnyPermission(role, permissions);
  } else {
    hasAccess = true; // Si no se especifican permisos, mostrar
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
