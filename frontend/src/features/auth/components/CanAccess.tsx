'use client';

import { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Permission } from '@/shared/constants/permissions';

interface CanAccessProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * CanAccess Component
 * Conditionally renders children based on user permissions.
 */
export function CanAccess({ permission, children, fallback = null }: CanAccessProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface CanAccessAnyProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanAccessAny({ permissions, children, fallback = null }: CanAccessAnyProps) {
  const { hasAnyPermission } = usePermissions();

  if (!hasAnyPermission(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface CanAccessAllProps {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function CanAccessAll({ permissions, children, fallback = null }: CanAccessAllProps) {
  const { hasAllPermissions } = usePermissions();

  if (!hasAllPermissions(permissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
