/**
 * Auth Types - Centralized Authentication Types
 * @description Tipos de autenticación centralizados para CERMONT ATG
 * @version 1.0.0 - November 2025
 *
 * ✅ Evita inconsistencias rol/role en todo el backend
 * ✅ Tipado fuerte para req.user en todos los controllers
 * ✅ Compatibilidad con Express y Mongoose
 */

import { Request } from 'express';

// ============================================================================
// ROLES SYSTEM
// ============================================================================

/**
 * Roles disponibles en el sistema (orden jerárquico descendente)
 * root > admin > engineer > supervisor > technician
 */
export const ROLES = [
  'root',
  'admin',
  'engineer',
  'supervisor',
  'technician',
] as const;

export type Role = typeof ROLES[number];

/**
 * Jerarquía de roles para validación de permisos
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  root: 5,
  admin: 4,
  engineer: 3,
  supervisor: 2,
  technician: 1,
};

/**
 * Verifica si un rol tiene permisos suficientes
 */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// ============================================================================
// USER INTERFACES
// ============================================================================

/**
 * Usuario autenticado (agregado a req.user por middleware auth)
 * ✅ SIEMPRE usar 'rol' (no 'role')
 */
export interface AuthUser {
  userId: string;              // ✅ String (no ObjectId) para consistencia
  email: string;
  nombre: string;
  rol: Role;                   // ✅ Consistente con modelo User
  active: boolean;
  cedula?: string;
  telefono?: string;
  cargo?: string;
  especialidad?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Request de Express extendida con usuario autenticado
 * Usar en todos los controllers protegidos
 */
export interface AuthRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user: AuthUser;         // ✅ Siempre disponible después de authenticate
}

// ============================================================================
// TOKEN INTERFACES
// ============================================================================

/**
 * Payload del JWT (access token)
 */
export interface JwtPayload {
  sub: string;            // User ID
  email: string;
  nombre: string;
  rol: Role;
  active: boolean;
  iat: number;            // Issued at
  exp: number;            // Expiration
}

/**
 * Payload del refresh token
 */
export interface RefreshTokenPayload {
  sub: string;
  tokenVersion: number;   // Para invalidar tokens antiguos
  iat: number;
  exp: number;
}

/**
 * Sesión activa del usuario (multi-device)
 */
export interface UserSession {
  refreshToken: string;
  device: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
}

// ============================================================================
// AUTH REQUEST BODIES
// ============================================================================

export interface LoginBody {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterBody {
  nombre: string;
  email: string;
  password: string;
  rol?: Role;
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
}

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}

export interface UpdateProfileBody {
  nombre?: string;
  telefono?: string;
  cargo?: string;
  especialidad?: string;
}

// ============================================================================
// AUTH RESPONSE INTERFACES
// ============================================================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  success: true;
  data: {
    user: Omit<AuthUser, 'password'>;
    tokens: AuthTokens;
  };
  message: string;
}

export interface RefreshTokenResponse {
  success: true;
  data: {
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Usuario sin campos sensibles (para respuestas API)
 */
export type SafeUser = Omit<AuthUser, 'password'>;

/**
 * Campos del usuario que pueden ser actualizados
 */
export type UpdatableUserFields = Pick<
  AuthUser,
  'nombre' | 'telefono' | 'cargo' | 'especialidad'
>;

/**
 * Validación de roles para middleware
 */
export type RoleValidator = (userRole: Role, requiredRole: Role) => boolean;