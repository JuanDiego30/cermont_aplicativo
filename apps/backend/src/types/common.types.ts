/**
 * Common Types - Shared Types Across App
 * @description Tipos comunes para evitar duplicación y dependencias circulares
 */

import { Types } from 'mongoose';
import { AuthUser } from './auth.types';

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface OrderDocument {
  _id: Types.ObjectId;
  numeroOrden: string;
  titulo?: string;
  descripcion: string;
  estado: string;
  status?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  fechaFinReal?: Date;
  asignadoA?: Types.ObjectId[];
  supervisorId?: Types.ObjectId;
  historial?: Array<{
    usuario: Types.ObjectId;
    accion: string;
    fecha: Date;
  }>;
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// USER DOCUMENT TYPES
// ============================================================================

export interface UserDocument extends AuthUser {
  password: string;
  isDeleted?: boolean;
  lastLogin?: Date;
  loginAttempts?: number;
  lockUntil?: Date;
  sessions?: Array<{
    refreshToken: string;
    device: string;
    ip: string;
    userAgent: string;
    createdAt: Date;
    expiresAt: Date;
  }>;
}

export interface UserMinimal {
  _id: Types.ObjectId;
  nombre: string;
  email: string;
  rol: string;
}

// ============================================================================
// WORKPLAN TYPES
// ============================================================================

export interface WorkPlanDocument {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  status: string;
  actividades?: Array<{
    _id: Types.ObjectId;
    descripcion: string;
    completada: boolean;
    completadaEn?: Date;
  }>;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
  message: string;
  read: boolean;
  data?: Record<string, any>;
  createdAt: Date;
}

export interface NotificationData {
  id?: string;
  type?: string;
  message?: string;
  read?: boolean;
}

export interface NotificationPayload extends NotificationData {
  id: string;
  type: string;
  message: string;
  read: boolean;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export interface AuditLogEntry {
  userId: Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: Types.ObjectId;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  resource?: string;
  from?: Date;
  to?: Date;
}

// ============================================================================
// CUSTOM ERROR TYPES
// ============================================================================

export class CustomError extends Error {
  constructor(
    public message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

// ============================================================================
// PROGRESS & ACTIVITY TYPES
// ============================================================================

export interface Progress {
  percentage: number;
  completed: number;
  total: number;
}

// ============================================================================
// SSL CONFIG
// ============================================================================

export interface SSLConfig {
  key: Buffer | string;
  cert: Buffer | string;
}

// ============================================================================
// SOCKET TYPES
// ============================================================================

export interface ExtendedSocket {
  user?: AuthUser;
  userId?: string;
  userRole?: string;
}