import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { Prisma } from '@prisma/client';

/**
 * ========================================
 * ERROR HANDLER MIDDLEWARE
 * ========================================
 * Middleware global para manejo de errores.
 * Debe colocarse al FINAL de la cadena de middlewares.
 *
 * **Formatos soportados:**
 * - RFC 7807 (Problem Details for HTTP APIs)
 * - Prisma errors
 * - Validation errors
 * - Custom errors
 */

/**
 * Tipos de errores personalizados
 */
interface AppError extends Error {
  statusCode?: number;
  title?: string;
  isOperational?: boolean;
}

/**
 * Middleware de manejo de errores global
 */
export function errorHandler(
  err: AppError | any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log del error
  logger.error('Error handler caught exception', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.userId,
    statusCode: err.statusCode || 500,
  });

  // Si ya se envió una respuesta, delegar al handler por defecto
  if (res.headersSent) {
    return next(err);
  }

  // Determinar status code
  let statusCode = err.statusCode || 500;
  let title = err.title || 'Internal Server Error';
  let detail = err.message || 'Ha ocurrido un error inesperado';

  // Manejo especial de errores Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      statusCode = 409;
      title = 'Conflict';
      detail = `Ya existe un registro con ese ${(err.meta?.target as string[])?.[0] || 'campo'}`;
    }
    // Record not found
    else if (err.code === 'P2025') {
      statusCode = 404;
      title = 'Not Found';
      detail = 'El registro no existe';
    }
    // Invalid relation
    else if (err.code === 'P2003') {
      statusCode = 400;
      title = 'Invalid Relation';
      detail = 'Referencia inválida a otro registro';
    }
    // Other Prisma errors
    else {
      statusCode = 400;
      title = 'Database Error';
      detail = 'Error en la operación de base de datos';
    }
  }

  // Manejo de errores JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    title = 'Invalid Token';
    detail = 'Token JWT inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    title = 'Token Expired';
    detail = 'El token ha expirado';
  }

  // No exponer detalles internos en producción
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    detail = 'Ha ocurrido un error interno del servidor';
  }

  // Respuesta RFC 7807
  res.status(statusCode).json({
    type: `https://httpstatuses.com/${statusCode}`,
    title,
    status: statusCode,
    detail,
    instance: req.path,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Helper para crear errores personalizados
 *
 * @example
 * ```
 * throw createError(404, 'User not found', 'Not Found');
 * ```
 */
export function createError(
  statusCode: number,
  detail: string,
  title?: string
): AppError {
  const error = new Error(detail) as AppError;
  error.statusCode = statusCode;
  error.title = title || 'Error';
  error.isOperational = true;
  return error;
}

/**
 * Wrapper para funciones async en routes (evita try/catch repetitivo)
 *
 * @example
 * ```
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 * ```
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
