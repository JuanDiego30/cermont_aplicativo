import fs from 'fs';

const content = `/**
 * @file errorHandler.ts
 * @description Middleware de manejo de errores para Express
 */

import { type Request, type Response, type NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    statusCode: number;
    stack?: string;
  };
}

/**
 * Middleware de manejo de errores global
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Internal Server Error';

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Handle MongoDB errors
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  }

  if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
  }

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Send error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message,
      statusCode
    }
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Middleware para manejar errores 404
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(\`Not found - \${req.originalUrl}\`, 404);
  next(error);
}

/**
 * Middleware para manejar errores de validación de Zod
 */
export function zodErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err.name === 'ZodError') {
    const errorMessages = err.errors.map((error: any) => ({
      field: error.path.join('.'),
      message: error.message
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        statusCode: 400,
        details: errorMessages
      }
    });
    return;
  }

  next(err);
}
`;

fs.writeFileSync('src/middleware/errorHandler.ts', content);
console.log('Archivo errorHandler.ts creado exitosamente');