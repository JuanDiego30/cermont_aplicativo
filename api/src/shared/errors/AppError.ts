/**
 * Custom application error class
 * Extiende Error para incluir statusCode y tipo operacional
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, code?: string): AppError {
    return new AppError(message, 400, true, code);
  }

  static unauthorized(message: string = 'No autorizado', code?: string): AppError {
    return new AppError(message, 401, true, code);
  }

  static forbidden(message: string = 'Acceso denegado', code?: string): AppError {
    return new AppError(message, 403, true, code);
  }

  static notFound(message: string = 'Recurso no encontrado', code?: string): AppError {
    return new AppError(message, 404, true, code);
  }

  static conflict(message: string, code?: string): AppError {
    return new AppError(message, 409, true, code);
  }

  static internal(message: string = 'Error interno del servidor'): AppError {
    return new AppError(message, 500, false);
  }
}
