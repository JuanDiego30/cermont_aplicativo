/**
 * Error Handler (TypeScript - November 2025)
 * @description Manejo estructurado de errores para CERMONT ATG: AppError class (extends Error, statusCode: number, code: ErrorCode, isOperational: boolean, status: 'fail'|'error'), errorHandler middleware (centralizado Express, Mongoose CastError/11000/ValidationError → AppError 404/400, JWT JsonWebTokenError/TokenExpiredError → 401). Log con logger (no console), response: { success: false, error: { message, code, status, ...(dev: stack) } }. Integra ERROR_CODES/HTTP_STATUS/ERROR_MESSAGES.
 * Uso: Throw: throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.AUTHENTICATION_ERROR); Middleware: app.use(errorHandler); En asyncHandler: next(new AppError(...)); En Joi: if (error) throw new AppError('Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR, { details: error.details });
 * Integra con: utils/logger.ts (error.error contextual { path, method, userId, stack }), constants.ts (ERROR_CODES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST), middleware (validation/sanitization throw AppError), services (tryCatch/retryOperation catch → throw AppError), jwt (verify catch → 401). Performance: No overhead, early returns. Secure: No PII/sensitive en response/logs (sanitize stack dev-only), operational errors client-visible.
 * Extensible: Add MulterError (413 'FILE_TOO_LARGE'), CacheError (503 'CACHE_FAILURE'), SocketError (400 'INVALID_EVENT'). Para ATG: AuditLog on non-operational (await auditService.log('UNHANDLED_ERROR', userId, 'SYSTEM', { code: err.code })); Metrics: Prometheus counter 'errors_total' { code, status }.
 * Types: class AppError extends Error { constructor(message: string, statusCode?: HttpStatus, code?: ErrorCode, isOperational?: boolean, details?: Record<string, any>) }; errorHandler: (err: Error | AppError, req: Request, res: Response, next: NextFunction) => void. Fixes: Typed params, logger vs console, Object.defineProperty message non-enumerable, details optional in response, sanitize stack (remove paths?).
 * Integrate: En app.ts: import { errorHandler } from '../utils/errorHandler.ts'; app.use(errorHandler); En userController: if (!user) throw new AppError(ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND); En global: process.on('unhandledRejection', (reason: Error) => { logger.error('Unhandled Rejection:', reason); }); process.on('uncaughtException', (err: Error) => { logger.fatal('Uncaught Exception:', err); process.exit(1); });
 * Missing: Joi integration: export const validationError = (errors: Joi.ValidationErrorItem[]) => new AppError(ERROR_MESSAGES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR, { details: errors.map(e => ({ field: e.path, message: e.message })) }); Multer: if (err instanceof MulterError) { if (err.code === 'LIMIT_FILE_SIZE') throw new AppError('File too large', HTTP_STATUS.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR); } Tests: __tests__/utils/errorHandler.spec.ts (mock req/res/logger, test Mongoose/JWT throws).
 * Usage: npm run build (tsc utils/errorHandler.ts), import { AppError, errorHandler } from '../utils/errorHandler.ts'. Barrel: utils/index.ts export * from './errorHandler.ts'; export type { AppError } from './errorHandler.ts'.
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import type { HttpStatus } from './constants.ts';
import type { ErrorCode } from './constants.ts';
import type { ERROR_MESSAGES } from './constants.ts'; // For type reference

export interface AppErrorDetails {
  code?: ErrorCode;
  [key: string]: any;
}

export interface AppErrorResponse {
  success: false;
  error: {
    message: string;
    code: ErrorCode;
    status: 'fail' | 'error';
    details?: AppErrorDetails;
    stack?: string;
  };
}

/**
 * Clase personalizada para manejo de errores estructurados
 * Extiende la clase Error nativa de JavaScript
 */
export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly status: 'fail' | 'error';
  public readonly details?: AppErrorDetails;

  /**
   * Constructor de la clase AppError
   * @param message - Mensaje descriptivo del error
   * @param statusCode - Código de estado HTTP (default: 500)
   * @param details - Detalles adicionales (code, metadata)
   * @param isOperational - Indica si es un error operacional (true) o de programación (false, default: true)
   */
  constructor(
    message: string,
    statusCode: HttpStatus = 500 as HttpStatus,
    details: AppErrorDetails = { code: 'INTERNAL_ERROR' as ErrorCode },
    isOperational: boolean = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = details.code || 'INTERNAL_ERROR' as ErrorCode;
    this.isOperational = isOperational;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.details = details;

    // Hacer message no enumerable (evita serialización accidental)
    Object.defineProperty(this, 'message', { value: message, enumerable: false });

    // Captura el stack trace
    Error.captureStackTrace(this, this.constructor);

    // Asegurar prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Función middleware para manejo centralizado de errores
 * @param err - Error capturado (Error | AppError)
 * @param req - Objeto de solicitud Express
 * @param res - Objeto de respuesta Express
 * @param next - Función next de Express (para chaining si no manejado)
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let customError = err as AppError;

  // Si es Error nativo, wrap en AppError
  if (!(err instanceof AppError)) {
    customError = new AppError(
      err.message || 'Error interno del servidor',
      500 as HttpStatus,
      { code: 'INTERNAL_ERROR' as ErrorCode },
      false // Non-operational
    );
  }

  // Log estructurado (sin PII)
  logger.error('Error Handler:', {
    message: customError.message,
    code: customError.code,
    statusCode: customError.statusCode,
    path: req.path,
    method: req.method,
    userId: (req as any).user?._id?.toString() || 'anonymous',
    stack: customError.stack,
    isOperational: customError.isOperational,
  });

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado - ID inválido';
    customError = new AppError(message, 404 as HttpStatus, { code: 'INVALID_ID' as ErrorCode });
  }

  // Mongoose duplicate key (code: 11000)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'unknown';
    const message = `Valor duplicado para el campo: ${field}`;
    customError = new AppError(message, 409 as HttpStatus, { code: 'DUPLICATE_FIELD' as ErrorCode });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors || {}).map((val: any) => val.message || 'Invalid field');
    const message = messages.join(', ');
    customError = new AppError(message, 400 as HttpStatus, { code: 'VALIDATION_ERROR' as ErrorCode });
  }

  // JWT errors (from jsonwebtoken)
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token JWT inválido';
    customError = new AppError(message, 401 as HttpStatus, { code: 'INVALID_TOKEN' as ErrorCode });
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token JWT expirado';
    customError = new AppError(message, 401 as HttpStatus, { code: 'TOKEN_EXPIRED' as ErrorCode });
  }

  // Joi/Validation errors (custom, if thrown with details)
  if (customError.code === 'VALIDATION_ERROR') {
    // details ya en customError
  }

  // Respuesta estructurada
  const response: AppErrorResponse = {
    success: false,
    error: {
      message: customError.message,
      code: customError.code,
      status: customError.status,
      ...(customError.details && Object.keys(customError.details).length > 0 && customError.details.code !== customError.code
        ? { details: customError.details }
        : {}),
    },
  };

  // Stack solo en desarrollo
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = customError.stack;
  }

  res.status(customError.statusCode).json(response);
};
