import { AppError } from './AppError.js';

/**
 * Error when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} con identificador '${identifier}' no encontrado`
      : `${resource} no encontrado`;
    super(message, 404);
  }
}

/**
 * Error for validation failures
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]> | string) {
    const message = typeof errors === 'string' 
      ? errors 
      : 'Error de validación';
    
    super(message, 400);
    
    this.errors = typeof errors === 'string' 
      ? { general: [errors] } 
      : errors;
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      errors: this.errors,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Error for authentication failures (not logged in)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado. Inicie sesión para continuar.') {
    super(message, 401);
  }
}

/**
 * Error for authorization failures (logged in but not permitted)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'No tiene permisos para realizar esta acción') {
    super(message, 403);
  }
}

/**
 * Error for conflict situations (e.g., duplicate entries)
 */
export class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe') {
    super(message, 409);
  }
}

/**
 * Error for rate limiting
 */
export class TooManyRequestsError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = 'Demasiadas solicitudes. Intente más tarde.', retryAfter?: number) {
    super(message, 429);
    this.retryAfter = retryAfter;
  }
}

/**
 * Error for service unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Servicio no disponible temporalmente') {
    super(message, 503);
  }
}

/**
 * Error for bad gateway (external service failures)
 */
export class BadGatewayError extends AppError {
  constructor(message = 'Error en servicio externo') {
    super(message, 502);
  }
}

/**
 * Error for internal server errors with optional error details
 */
export class InternalServerError extends AppError {
  public readonly originalError?: Error;

  constructor(message = 'Error interno del servidor', originalError?: Error) {
    super(message, 500);
    this.originalError = originalError;
  }
}
