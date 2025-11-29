'use client';

import { useAuth } from '../context/AuthContext';
import { Permission, ROLE_PERMISSIONS } from '@/shared/constants/permissions';

/**
 * usePermissions Hook
 * 
 * Provides permission checking utilities based on current user's role.
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.some(hasPermission);
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return permissions.every(hasPermission);
  };

  const isAdmin = (): boolean => {
    if (!user) return false;
    return user.role === 'ROOT' || user.role === 'ADMIN';
  };

  const isClient = (): boolean => {
    if (!user) return false;
    return user.role === 'CLIENT';
  };

  // Common permission shortcuts
  const canViewUsers = hasPermission('users:view-all' as Permission);
  const canCreateUsers = hasPermission('users:create' as Permission);
  const canUpdateUsers = hasPermission('users:update' as Permission);
  const canDeleteUsers = hasPermission('users:delete' as Permission);

  const canViewOrders = hasPermission('orders:view' as Permission);
  const canCreateOrders = hasPermission('orders:create' as Permission);
  const canUpdateOrders = hasPermission('orders:update' as Permission);
  const canDeleteOrders = hasPermission('orders:delete' as Permission);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isClient,
    canViewUsers,
    canCreateUsers,
    canUpdateUsers,
    canDeleteUsers,
    canViewOrders,
    canCreateOrders,
    canUpdateOrders,
    canDeleteOrders,
  };
}
