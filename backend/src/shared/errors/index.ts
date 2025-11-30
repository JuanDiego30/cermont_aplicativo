/**
 * Shared Error Types and Utilities
 * 
 * Provides typed error handling for the application.
 */

export { AppError } from './AppError.js';

// ============================================
// Specialized Error Classes
// ============================================

/**
 * Validation Error - 400 Bad Request
 */
export class ValidationError extends Error {
  public readonly statusCode = 400;
  public readonly isOperational = true;
  public readonly code = 'VALIDATION_ERROR';
  public readonly fields?: Record<string, string>;

  constructor(message: string, fields?: Record<string, string>) {
    super(message);
    this.fields = fields;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Not Found Error - 404 Not Found
 */
export class NotFoundError extends Error {
  public readonly statusCode = 404;
  public readonly isOperational = true;
  public readonly code = 'NOT_FOUND';
  public readonly resource?: string;

  constructor(resource?: string, id?: string) {
    const message = resource 
      ? `${resource}${id ? ` con ID ${id}` : ''} no encontrado`
      : 'Recurso no encontrado';
    super(message);
    this.resource = resource;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Authentication Error - 401 Unauthorized
 */
export class AuthenticationError extends Error {
  public readonly statusCode = 401;
  public readonly isOperational = true;
  public readonly code = 'AUTHENTICATION_ERROR';

  constructor(message = 'No autenticado') {
    super(message);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error - 403 Forbidden
 */
export class AuthorizationError extends Error {
  public readonly statusCode = 403;
  public readonly isOperational = true;
  public readonly code = 'AUTHORIZATION_ERROR';
  public readonly requiredPermission?: string;

  constructor(message = 'No autorizado', requiredPermission?: string) {
    super(message);
    this.requiredPermission = requiredPermission;
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Conflict Error - 409 Conflict
 */
export class ConflictError extends Error {
  public readonly statusCode = 409;
  public readonly isOperational = true;
  public readonly code = 'CONFLICT_ERROR';

  constructor(message = 'El recurso ya existe o hay un conflicto') {
    super(message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Business Logic Error - 422 Unprocessable Entity
 */
export class BusinessError extends Error {
  public readonly statusCode = 422;
  public readonly isOperational = true;
  public readonly code = 'BUSINESS_ERROR';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, BusinessError.prototype);
  }
}

/**
 * External Service Error - 502 Bad Gateway
 */
export class ExternalServiceError extends Error {
  public readonly statusCode = 502;
  public readonly isOperational = true;
  public readonly code = 'EXTERNAL_SERVICE_ERROR';
  public readonly service?: string;

  constructor(service?: string, originalMessage?: string) {
    const message = service 
      ? `Error en servicio externo: ${service}${originalMessage ? ` - ${originalMessage}` : ''}`
      : 'Error en servicio externo';
    super(message);
    this.service = service;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}

// ============================================
// Error Type Guards
// ============================================

/**
 * Checks if error is an operational (expected) error
 */
export function isOperationalError(error: unknown): error is Error & { isOperational: boolean; statusCode: number } {
  return (
    error instanceof Error &&
    'isOperational' in error &&
    (error as { isOperational?: boolean }).isOperational === true
  );
}

/**
 * Checks if the error is a known application error type
 */
export function isAppError(error: unknown): boolean {
  const { AppError } = require('./AppError.js');
  return (
    error instanceof AppError ||
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError ||
    error instanceof ConflictError ||
    error instanceof BusinessError ||
    error instanceof ExternalServiceError
  );
}

// ============================================
// Error Normalization Utility
// ============================================

interface NormalizedError {
  message: string;
  statusCode: number;
  code: string;
  isOperational: boolean;
  stack?: string;
  details?: Record<string, unknown>;
}

/**
 * Normalizes any error into a consistent shape
 */
export function normalizeError(error: unknown): NormalizedError {
  // Already a known error type
  if (isOperationalError(error)) {
    const err = error as Error & { statusCode: number; code?: string; isOperational: boolean };
    return {
      message: err.message,
      statusCode: err.statusCode,
      code: err.code ?? 'APP_ERROR',
      isOperational: true,
      stack: err.stack,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      isOperational: false,
      stack: error.stack,
    };
  }

  // String thrown
  if (typeof error === 'string') {
    return {
      message: error,
      statusCode: 500,
      code: 'UNKNOWN_ERROR',
      isOperational: false,
    };
  }

  // Unknown error shape
  return {
    message: 'Error desconocido',
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
    isOperational: false,
    details: { originalError: String(error) },
  };
}

/**
 * Gets a safe error message for client responses
 */
export function getSafeErrorMessage(error: unknown, fallback = 'Error interno del servidor'): string {
  if (isOperationalError(error)) {
    return (error as Error).message;
  }
  return fallback;
}

/**
 * Gets the HTTP status code from an error
 */
export function getErrorStatusCode(error: unknown): number {
  if (isOperationalError(error)) {
    return (error as { statusCode: number }).statusCode;
  }
  return 500;
}
