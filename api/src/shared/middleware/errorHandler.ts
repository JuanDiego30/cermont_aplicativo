import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { ValidationError } from '../errors/errors.js';
import { env } from '../../config/env.js';

/**
 * Centralized error handler middleware
 * Converts all errors to consistent JSON responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.errors.forEach((e) => {
      const path = e.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(e.message);
    });

    res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors,
    });
    return;
  }

  // Handle custom ValidationError
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as { code?: string; meta?: { target?: string[] } };
    
    switch (prismaError.code) {
      case 'P2002':
        const field = prismaError.meta?.target?.[0] ?? 'campo';
        res.status(409).json({
          success: false,
          message: `Ya existe un registro con ese ${field}`,
        });
        return;
      case 'P2025':
        res.status(404).json({
          success: false,
          message: 'Registro no encontrado',
        });
        return;
      case 'P2003':
        res.status(400).json({
          success: false,
          message: 'Error de integridad referencial',
        });
        return;
      default:
        break;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Token inválido',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expirado',
    });
    return;
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la solicitud',
    });
    return;
  }

  // Default: Internal server error
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler for unmatched routes
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
};
