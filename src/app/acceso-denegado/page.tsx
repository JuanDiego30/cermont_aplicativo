/**
 * Página de Acceso Denegado
 * Se muestra cuando un usuario intenta acceder a una ruta sin permisos
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { roleRoutes } from '@/lib/types/roles';
import Button from '@/components/ui/Button';

export default function AccesoDenegadoPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleVolverDashboard = () => {
    if (user?.rol) {
      router.push(roleRoutes[user.rol]);
    } else {
      router.push('/autenticacion/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h1>
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={handleVolverDashboard}
            className="w-full"
          >
            Volver a mi Dashboard
          </Button>
          
          <Link href="/autenticacion/login">
            <Button variant="light" className="w-full">
              Iniciar Sesión
            </Button>
          </Link>
        </div>

        {user && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              Usuario actual: <span className="font-semibold">{user.nombre}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Rol: <span className="capitalize">{user.rol}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
