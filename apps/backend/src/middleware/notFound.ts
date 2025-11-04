/**
 * Not Found Middleware (TypeScript - November 2025)
 * @description Middleware para manejar rutas/endpoints no encontrados (404) en CERMONT ATG.
 * Útil como último middleware en app (después de todas routes). Loggea warns, integra audit si auth (low severity, non-blocking).
 * Response estandarizado con timestamp/code via errorResponse. Compatible con errorHandler (pasa Error si needed).
 * Uso en server.ts (último antes de errorHandler): app.use(notFound); app.use(errorHandler);
 * Pruebas: Jest supertest invalid route (expect 404 + JSON { success: false, message, data: { errorCode, timestamp } }), auth user (audit called), anon (no audit), viaError (next(Error) to handler).
 * Types: @types/express. TypedRequest from auth.ts (req.user: AuthUser | undefined). AuditOptions from auditLogger.ts.
 * Fixes: req.user safe cast (if exists). createAuditLog async .catch log. notFoundViaError: Custom Error subclass or props (statusCode typed). No next() call (end chain). Suggested msg safe (no leak).
 * Assumes: errorResponse(res: Response, msg: string, status: number, details?: any[]): void. HTTP_STATUS.NOT_FOUND: 404. AuthUser { userId: string, email?: string }.
 */


import { AppError } from '../utils/errorHandler';
import { errorResponse } from '../utils/response';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { createAuditLog } from './auditLogger';
import User from '../models/User';

// Optional path (if audit needed)
import type { TypedRequest } from '../types'; // For req.user if auth middleware prior

// Infer AuthUser type (from auth.ts)
interface AuthUser {
  userId: string;
  email?: string;
  // ... other props
}

// Extend AUDIT_ACTIONS if needed (assume in constants.ts)
declare const AUDIT_ACTIONS: {
  // ... prev
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND';
};

/**
 * Middleware para rutas no encontradas (404)
 * Ejecuta al final de chain; no llama next().
 * @param req TypedRequest (may have user if auth)
 * @param res Response
 * @param next NextFunction (unused; para Express compat)
 */
export const notFound = (
  req: TypedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Satisfy Express (3-arg middleware, but typed 4 for safety)
  void next;

  const userContext: string = req.user ? `${req.user.email || req.user.userId}` : 'anonymous';
  const errorCode: string = 'ROUTE_NOT_FOUND';
  const timestamp: string = new Date().toISOString();

  // Structured log warn
  logger.warn('[404 Not Found]', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    user: userContext,
    userAgent: req.get('User-Agent') || 'unknown',
    timestamp,
  });

  // Non-blocking audit si autenticado (low severity)
  if (req.user && req.user.userId) {
    const userAgent: string = req.get('User-Agent') || 'unknown';
    createAuditLog({
      userId: req.user.userId,
      action: 'ROUTE_NOT_FOUND',
      resource: 'Routing',
      ip: req.ip || 'unknown',
      details: {
        endpoint: req.originalUrl,
        method: req.method,
        userAgent,
      },
    }).catch((err: unknown) => {
      const errMsg: string = err instanceof Error ? err.message : 'Unknown audit error';
      logger.error('[Audit] NotFound audit failed', { error: errMsg });
    });
  }

  // Estandarizado response via errorResponse (incluye success: false, etc.)
  errorResponse(
    res,
    `Endpoint no encontrado: ${req.method} ${req.originalUrl}. Revisa la documentación de la API.`,
    HTTP_STATUS.NOT_FOUND,
    [
      {
        code: errorCode,
        message: 'Ruta no existe',
      }
    ]
  );
};

/**
 * Alternativa: Pasar Error a errorHandler (si prefieres centralizar)
 * Útil si quieres que errorHandler maneje 404 como error genérico.
 * @param req TypedRequest
 * @param res Response
 * @param next NextFunction
 */
export const notFoundViaError = (
  req: TypedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  (error as any).statusCode = HTTP_STATUS.NOT_FOUND; // Type assertion for custom props
  (error as any).errorCode = 'ROUTE_NOT_FOUND';
  next(error); // Pasa a errorHandler
};

export default notFound;
