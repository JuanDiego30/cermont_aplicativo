/**
 * HOC para proteger componentes por rol
 * Uso: export default withRole(MiComponente, ['admin', 'gerente'])
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useHasRole } from './AuthContext';
import { Role, roleRoutes } from '@/lib/types/roles';

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: Role[]
) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const hasRole = useHasRole(allowedRoles);
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/autenticacion/login');
        } else if (!hasRole) {
          // Redirigir al dashboard del rol actual
          if (user?.rol) {
            router.push(roleRoutes[user.rol]);
          } else {
            router.push('/acceso-denegado');
          }
        }
      }
    }, [isLoading, isAuthenticated, hasRole, router, user]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="spinner" />
            <p className="mt-4">Cargando...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || !hasRole) {
      return null;
    }

    return <Component {...props} />;
  };
}
