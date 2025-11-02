// src/components/shared/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
children: React.ReactNode;
requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
const { isAuthenticated, loading, user } = useAuth();
const router = useRouter();

useEffect(() => {
if (!loading && !isAuthenticated) {
router.push('/login');
}

if (!loading && isAuthenticated && requiredRoles && user) {
  if (!requiredRoles.includes(user.rol)) {
    router.push('/dashboard');
  }
}
}, [isAuthenticated, loading, user, requiredRoles, router]);

if (loading) return <LoadingSpinner />;
if (!isAuthenticated) return null;

if (requiredRoles && user && !requiredRoles.includes(user.rol)) {
return (
<div className="flex min-h-screen items-center justify-center">
<div className="text-center">
<p className="text-lg font-semibold text-red-600">Acceso Denegado</p>
<p className="mt-2 text-sm text-gray-600">No tienes permisos para esta página.</p>
</div>
</div>
);
}

return <>{children}</>;
}