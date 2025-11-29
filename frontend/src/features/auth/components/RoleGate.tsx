'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface RoleGateProps {
  allowedRoles: string[];
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * RoleGate Component
 * Restricts access based on user role.
 */
export function RoleGate({
  allowedRoles,
  children,
  redirectTo = '/dashboard',
  fallback = null
}: RoleGateProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [user, isLoading, allowedRoles, redirectTo, router]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Admin Only Gate
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGate allowedRoles={['ROOT', 'ADMIN']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * Client Only Gate
 */
export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGate allowedRoles={['CLIENTE']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
