/**
 * Express Extended Types - Single Source of Truth
 * @description Tipos extendidos de Express para toda la app
 * @version 2.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { AuthUser } from './auth.types.js';

/**
 * Request extendido con usuario autenticado
 * ✅ Uso único en toda la app
 */
export interface TypedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthUser;
  pagination?: {
    page: number;
    limit: number;
    skip: number;
    totalPages: number;
  };
}

/**
 * Request middleware con usuario garantizado
 */
export interface AuthenticatedRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user: AuthUser; // ✅ Requerido
}

/**
 * Middleware handler type
 */
export type MiddlewareHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = (
  req: TypedRequest<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void> | void;

/**
 * Controller handler type
 */
export type ControllerHandler<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any
> = (
  req: AuthenticatedRequest<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void> | void;

/**
 * Response estándar
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
}

/**
 * Paginación
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

/**
 * Request con socket.io
 */
export interface SocketRequest extends TypedRequest {
  io?: any;
  socketId?: string;
}