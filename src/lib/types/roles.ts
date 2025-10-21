/**
 * Roles y permisos del sistema Cermont Web
 */

import { ROUTES } from '@/lib/constants';

export enum Role {
  CLIENTE = 'cliente',
  TECNICO = 'tecnico',
  COORDINADOR = 'coordinador',
  GERENTE = 'gerente',
  ADMIN = 'admin',
}

export enum Permission {
  // Órdenes
  ORDEN_VIEW_OWN = 'orden:view:own',
  ORDEN_VIEW_ALL = 'orden:view:all',
  ORDEN_CREATE = 'orden:create',
  ORDEN_UPDATE_OWN = 'orden:update:own',
  ORDEN_UPDATE_ALL = 'orden:update:all',
  ORDEN_DELETE = 'orden:delete',
  ORDEN_ASSIGN = 'orden:assign',
  ORDEN_APPROVE = 'orden:approve',
  
  // Clientes
  CLIENTE_VIEW_OWN = 'cliente:view:own',
  CLIENTE_VIEW_ALL = 'cliente:view:all',
  CLIENTE_CREATE = 'cliente:create',
  CLIENTE_UPDATE = 'cliente:update',
  CLIENTE_DELETE = 'cliente:delete',
  
  // Equipos
  EQUIPO_VIEW_OWN = 'equipo:view:own',
  EQUIPO_VIEW_ALL = 'equipo:view:all',
  EQUIPO_CREATE = 'equipo:create',
  EQUIPO_UPDATE = 'equipo:update',
  EQUIPO_DELETE = 'equipo:delete',
  
  // Usuarios
  USER_VIEW_ALL = 'user:view:all',
  USER_CREATE = 'user:create',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  USER_MANAGE_ROLES = 'user:manage:roles',
  
  // Reportes
  REPORTE_VIEW_OWN = 'reporte:view:own',
  REPORTE_VIEW_ALL = 'reporte:view:all',
  REPORTE_EXPORT = 'reporte:export',
  
  // Dashboard
  DASHBOARD_CLIENTE = 'dashboard:cliente',
  DASHBOARD_TECNICO = 'dashboard:tecnico',
  DASHBOARD_COORDINADOR = 'dashboard:coordinador',
  DASHBOARD_GERENTE = 'dashboard:gerente',
  DASHBOARD_ADMIN = 'dashboard:admin',
}

/**
 * Mapa de permisos por rol
 */
export const rolePermissions: Record<Role, Permission[]> = {
  [Role.CLIENTE]: [
    Permission.ORDEN_VIEW_OWN,
    Permission.ORDEN_CREATE,
    Permission.CLIENTE_VIEW_OWN,
    Permission.EQUIPO_VIEW_OWN,
    Permission.REPORTE_VIEW_OWN,
    Permission.DASHBOARD_CLIENTE,
  ],
  
  [Role.TECNICO]: [
    Permission.ORDEN_VIEW_OWN,
    Permission.ORDEN_CREATE,
    Permission.ORDEN_UPDATE_OWN,
    Permission.CLIENTE_VIEW_ALL,
    Permission.EQUIPO_VIEW_ALL,
    Permission.EQUIPO_UPDATE,
    Permission.REPORTE_VIEW_OWN,
    Permission.REPORTE_EXPORT,
    Permission.DASHBOARD_TECNICO,
  ],
  
  [Role.COORDINADOR]: [
    Permission.ORDEN_VIEW_ALL,
    Permission.ORDEN_CREATE,
    Permission.ORDEN_UPDATE_ALL,
    Permission.ORDEN_ASSIGN,
    Permission.ORDEN_APPROVE,
    Permission.CLIENTE_VIEW_ALL,
    Permission.CLIENTE_UPDATE,
    Permission.EQUIPO_VIEW_ALL,
    Permission.EQUIPO_CREATE,
    Permission.EQUIPO_UPDATE,
    Permission.USER_VIEW_ALL,
    Permission.REPORTE_VIEW_ALL,
    Permission.REPORTE_EXPORT,
    Permission.DASHBOARD_COORDINADOR,
  ],
  
  [Role.GERENTE]: [
    Permission.ORDEN_VIEW_ALL,
    Permission.ORDEN_CREATE,
    Permission.ORDEN_UPDATE_ALL,
    Permission.ORDEN_DELETE,
    Permission.ORDEN_ASSIGN,
    Permission.ORDEN_APPROVE,
    Permission.CLIENTE_VIEW_ALL,
    Permission.CLIENTE_CREATE,
    Permission.CLIENTE_UPDATE,
    Permission.CLIENTE_DELETE,
    Permission.EQUIPO_VIEW_ALL,
    Permission.EQUIPO_CREATE,
    Permission.EQUIPO_UPDATE,
    Permission.EQUIPO_DELETE,
    Permission.USER_VIEW_ALL,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.REPORTE_VIEW_ALL,
    Permission.REPORTE_EXPORT,
    Permission.DASHBOARD_GERENTE,
  ],
  
  [Role.ADMIN]: Object.values(Permission),
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: Role | string, permission: Permission): boolean {
  const roleKey = (typeof role === 'string' ? role : role) as Role;
  return rolePermissions[roleKey]?.includes(permission) ?? false;
}

/**
 * Verifica si un rol tiene alguno de los permisos especificados
 */
export function hasAnyPermission(role: Role | string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Verifica si un rol tiene todos los permisos especificados
 */
export function hasAllPermissions(role: Role | string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

/**
 * Tipos de usuario para la aplicación
 */
export interface User {
  id: string;
  email: string;
  nombre?: string;
  rol: Role;
  empresa?: string | null;
  telefono?: string | null;
  avatar_url?: string | null;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Información de sesión del usuario
 */
export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Rutas base por rol
 */
export const roleRoutes: Record<Role, string> = {
  [Role.CLIENTE]: ROUTES.ROLES.CLIENTE.DASHBOARD,
  [Role.TECNICO]: ROUTES.ROLES.TECNICO.DASHBOARD,
  [Role.COORDINADOR]: ROUTES.ROLES.COORDINADOR.DASHBOARD,
  [Role.GERENTE]: ROUTES.ROLES.GERENTE.DASHBOARD,
  [Role.ADMIN]: ROUTES.DASHBOARD,
};

/**
 * Labels en español para los roles
 */
export const roleLabels: Record<Role, string> = {
  [Role.CLIENTE]: 'Cliente',
  [Role.TECNICO]: 'Técnico',
  [Role.COORDINADOR]: 'Coordinador',
  [Role.GERENTE]: 'Gerente',
  [Role.ADMIN]: 'Administrador',
};
