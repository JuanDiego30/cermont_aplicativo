/**
 * Tipos Centralizados (TypeScript - November 2025)
 * @description Exporta interfaces para auth, models, req. Fixes: role → rol, AuthUser con req.user, TypedRequest no conflictivo.
 * Uso: Import { TokenPayload, AuthUser, AuditLogData } from './types'.
 * Integrado: Mongoose HydratedDocument, Express Request augment. Secure: No PII en tokens.
 * Performance: Inline types. Tests: Type-check en jest.
 * Fixes TS: Exporta UserDocument, AuditLogData; guards para undefined; params order (opcionales al final).
 * Assumes: Mongoose 9.0.0, Express 4.21.0.
 */

import { HydratedDocument } from 'mongoose';
import { Request } from 'express';
import type { IUser } from '../models/User';
import type { IOrder } from '../models/Order';
import type { IWorkPlan } from '../models/WorkPlan';

// Auth Types
export interface TokenPayload {
  sub: string; // userId
  iat: number;
  exp: number;
  rol: string[]; // Array for RBAC (root, admin, etc.)
  jti?: string;
}

export interface AuthUser {
  userId: string;
  rol: string; // Single rol, fallback 'user'
  nombre?: string;
  email?: string;
  active?: boolean;
  createdAt?: Date;
  tokenVersion?: number;
}

export interface PartialAuthUser {
  userId?: string;
  rol?: string; // 'root' | 'admin' | 'engineer' | 'technician' | 'supervisor'
}

// Req Augment (no duplicados)
declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export interface TypedRequest<T = any> extends Request {
  user?: AuthUser;
  body: T;
  params: T;
}

// Models Types
export interface AuditLogData {
  action: string;
  userId?: string | null;
  resource: string;
  details?: Record<string, any>;
  ip?: string;
  timestamp?: Date;
}

export type UserDocument = HydratedDocument<IUser>; // From User model
export type OrderDocument = HydratedDocument<IOrder>;
export type WorkPlanDocument = HydratedDocument<IWorkPlan>;
// Agrega otros: AuditLogDocument, etc.

// Enums
export type Role = 'root' | 'admin' | 'engineer' | 'technician' | 'supervisor' | 'client';
export type OrderStatusType = 'pending' | 'inprogress' | 'completed' | 'cancelled';
export type AuditAction = 'AUTH_REQUIRED' | 'TOKEN_BLACKLISTED' | 'USER_INACTIVE_ACCESS' | 'AUTH_ERROR' | 'LOGIN_SUCCESS' | 'AUTH_FAILED' | 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' | 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_DELETED' | 'WORKPLAN_CREATED' | 'WORKPLAN_UPDATED' | 'WORKPLAN_DELETED';

// ============================================================================
// AUTH TYPES
// ============================================================================

export * from './auth.types';

// ============================================================================
// EXPRESS TYPES
// ============================================================================

export * from './express.types';

// ============================================================================
// FUTURE TYPES (agregar aquí nuevos archivos de tipos)
// ============================================================================

// export * from './user.types';
// export * from './project.types';
// export * from './equipment.types';
// export * from './maintenance.types';
// export * from './report.types';