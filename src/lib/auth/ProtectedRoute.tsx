/**
 * Componente para proteger rutas por permisos
 * Uso: <ProtectedRoute permissions={[Permission.ORDEN_VIEW_ALL]}>contenido</ProtectedRoute>
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useRole } from './AuthContext';
import { Permission, hasAnyPermission, roleRoutes } from '@/lib/types/roles';
import { ROUTES } from '@/lib/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissions?: Permission[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  permissions = [],
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const role = useRole();
  const router = useRouter();

  const hasPermissions = role && permissions.length > 0
    ? hasAnyPermission(role, permissions)
    : true;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(ROUTES.LOGIN);
      } else if (!hasPermissions) {
        if (redirectTo) {
          router.push(redirectTo);
        } else if (role) {
          router.push(roleRoutes[role]);
        } else {
          router.push(ROUTES.ACCESS_DENIED);
        }
      }
    }
  }, [isLoading, isAuthenticated, hasPermissions, router, redirectTo, role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner" />
          <p className="mt-4">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !hasPermissions) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
