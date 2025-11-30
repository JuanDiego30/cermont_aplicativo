import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { Prisma } from '@prisma/client';
import { 
  AppError 
} from '../errors/AppError.js';
import {
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  BusinessError,
  ExternalServiceError,
  isOperationalError,
  getErrorStatusCode,
} from '../errors/index.js';

/**
 * Error Handler Middleware
 * Middleware global para manejo centralizado de errores.
 * Debe colocarse al FINAL de la cadena de middlewares.
 */

// ============================================================================
// Prisma Error Codes
// ============================================================================

const PRISMA_ERROR_MAP = {
  P2002: { statusCode: 409, title: 'Conflict' },
  P2025: { statusCode: 404, title: 'Not Found' },
  P2003: { statusCode: 400, title: 'Invalid Relation' },
} as const;

const PRISMA_ERROR_MESSAGES: Record<string, string> = {
  P2002: 'Ya existe un registro con ese campo',
  P2025: 'El registro no existe',
  P2003: 'Referencia inválida a otro registro',
};

// ============================================================================
// JWT Error Names
// ============================================================================

const JWT_ERRORS = {
  JsonWebTokenError: {
    statusCode: 401,
    title: 'Invalid Token',
    detail: 'Token JWT inválido',
  },
  TokenExpiredError: {
    statusCode: 401,
    title: 'Token Expired',
    detail: 'El token ha expirado',
  },
} as const;

// ============================================================================
// Error Response Builder
// ============================================================================

interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  stack?: string;
}

function buildErrorResponse(
  statusCode: number,
  title: string,
  detail: string,
  path: string,
  stack?: string
): ErrorResponse {
  const response: ErrorResponse = {
    type: `https://httpstatuses.com/${statusCode}`,
    title,
    status: statusCode,
    detail,
    instance: path,
  };

  if (process.env.NODE_ENV === 'development' && stack) {
    response.stack = stack;
  }

  return response;
}

// ============================================================================
// Error Handlers
// ============================================================================

function handlePrismaError(err: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  title: string;
  detail: string;
} {
  const errorConfig = PRISMA_ERROR_MAP[err.code as keyof typeof PRISMA_ERROR_MAP];

  if (errorConfig) {
    const detail = err.code === 'P2002'
      ? `Ya existe un registro con ese ${(err.meta?.target as string[])?.[0] || 'campo'}`
      : PRISMA_ERROR_MESSAGES[err.code] || 'Error en la operación de base de datos';

    return {
      statusCode: errorConfig.statusCode,
      title: errorConfig.title,
      detail,
    };
  }

  return {
    statusCode: 400,
    title: 'Database Error',
    detail: 'Error en la operación de base de datos',
  };
}

function handleJWTError(errorName: string): {
  statusCode: number;
  title: string;
  detail: string;
} | null {
  const jwtError = JWT_ERRORS[errorName as keyof typeof JWT_ERRORS];
  return jwtError || null;
}

function logError(err: Error, req: Request): void {
  const statusCode = getErrorStatusCode(err);

  logger.error('Error handler caught exception', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: (req as Express.Request & { user?: { userId: string } }).user?.userId,
    statusCode,
  });
}

// ============================================================================
// Main Error Handler Middleware
// ============================================================================

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logError(err, req);

  // If response already sent, delegate to default handler
  if (res.headersSent) {
    return next(err);
  }

  // Default values
  let statusCode = 500;
  let title = 'Internal Server Error';
  let detail = 'Ha ocurrido un error inesperado';

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = handlePrismaError(err);
    statusCode = prismaError.statusCode;
    title = prismaError.title;
    detail = prismaError.detail;
  }
  // Handle JWT errors
  else if (err.name && err.name in JWT_ERRORS) {
    const jwtError = handleJWTError(err.name);
    if (jwtError) {
      statusCode = jwtError.statusCode;
      title = jwtError.title;
      detail = jwtError.detail;
    }
  }
  // Handle specific error types
  else if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    title = 'Validation Error';
    detail = err.message;
  }
  else if (err instanceof NotFoundError) {
    statusCode = err.statusCode;
    title = 'Not Found';
    detail = err.message;
  }
  else if (err instanceof AuthenticationError) {
    statusCode = err.statusCode;
    title = 'Authentication Error';
    detail = err.message;
  }
  else if (err instanceof AuthorizationError) {
    statusCode = err.statusCode;
    title = 'Authorization Error';
    detail = err.message;
  }
  else if (err instanceof ConflictError) {
    statusCode = err.statusCode;
    title = 'Conflict';
    detail = err.message;
  }
  else if (err instanceof BusinessError) {
    statusCode = err.statusCode;
    title = 'Business Rule Violation';
    detail = err.message;
  }
  else if (err instanceof ExternalServiceError) {
    statusCode = err.statusCode;
    title = 'External Service Error';
    detail = err.message;
  }
  // Handle custom app errors
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    title = 'Error';
    detail = err.message;
  }
  // Handle legacy custom errors (duck typing)
  else if (isOperationalError(err)) {
    statusCode = getErrorStatusCode(err);
    title = 'Error';
    detail = err.message;
  }

  // Don't expose internal details in production for 500s
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    detail = 'Ha ocurrido un error interno del servidor';
  }

  // Send RFC 7807 compliant response
  const response = buildErrorResponse(
    statusCode,
    title,
    detail,
    req.path,
    err.stack
  );

  res.status(statusCode).json(response);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates a custom application error
 */
export function createError(
  statusCode: number,
  detail: string
): AppError {
  return new AppError(detail, statusCode);
}

/**
 * Wrapper for async route handlers (avoids repetitive try/catch)
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
