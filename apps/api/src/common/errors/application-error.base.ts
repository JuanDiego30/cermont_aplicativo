/**
 * @file application-error.base.ts
 * @description Errores de aplicación (use cases / capa de aplicación)
 *
 * Estos errores incluyen status HTTP ya que están en la capa de aplicación
 * Los Domain Errors son independientes de HTTP
 */

import { HttpStatus } from "@nestjs/common";

/**
 * Error base de aplicación
 *
 * Incluye status HTTP ya que la capa de aplicación conoce el protocolo de transporte
 */
export abstract class ApplicationError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, statusCode: HttpStatus, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code =
      code ?? this.constructor.name.replace("Error", "").toUpperCase();
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serializa para respuesta HTTP
   */
  toHttpResponse(path: string): Record<string, unknown> {
    return {
      success: false,
      statusCode: this.statusCode,
      message: this.message,
      error: this.getHttpErrorName(),
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      path,
    };
  }

  /**
   * Serializa para logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Obtiene el nombre del error HTTP
   */
  private getHttpErrorName(): string {
    const names: Partial<Record<HttpStatus, string>> = {
      [HttpStatus.BAD_REQUEST]: "Bad Request",
      [HttpStatus.UNAUTHORIZED]: "Unauthorized",
      [HttpStatus.FORBIDDEN]: "Forbidden",
      [HttpStatus.NOT_FOUND]: "Not Found",
      [HttpStatus.CONFLICT]: "Conflict",
      [HttpStatus.UNPROCESSABLE_ENTITY]: "Unprocessable Entity",
      [HttpStatus.TOO_MANY_REQUESTS]: "Too Many Requests",
      [HttpStatus.INTERNAL_SERVER_ERROR]: "Internal Server Error",
      [HttpStatus.SERVICE_UNAVAILABLE]: "Service Unavailable",
    };
    return names[this.statusCode] ?? "Error";
  }
}

/**
 * Error de validación con detalles de campos
 */
export class ValidationError extends ApplicationError {
  public readonly fieldErrors: ReadonlyArray<{
    field: string;
    message: string;
  }>;

  constructor(
    message: string,
    errors?: Array<{ field: string; message: string }>,
  ) {
    super(message, HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    this.fieldErrors = errors ?? [];
  }

  override toHttpResponse(path: string): Record<string, unknown> {
    return {
      ...super.toHttpResponse(path),
      errors: this.fieldErrors,
    };
  }
}

/**
 * No autorizado (falta autenticación)
 */
export class UnauthorizedError extends ApplicationError {
  constructor(message: string = "No autorizado") {
    super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
  }
}

/**
 * Acceso denegado (falta autorización)
 */
export class ForbiddenError extends ApplicationError {
  public readonly requiredRoles?: readonly string[];

  constructor(message: string = "Acceso denegado", requiredRoles?: string[]) {
    super(message, HttpStatus.FORBIDDEN, "FORBIDDEN");
    this.requiredRoles = requiredRoles;
  }

  override toHttpResponse(path: string): Record<string, unknown> {
    return {
      ...super.toHttpResponse(path),
      requiredRoles: this.requiredRoles,
    };
  }
}

/**
 * Recurso no encontrado
 */
export class NotFoundError extends ApplicationError {
  public readonly resource: string;
  public readonly resourceId?: string | number;

  constructor(resource: string, resourceId?: string | number) {
    const message = resourceId
      ? `${resource} con id ${resourceId} no encontrado`
      : `${resource} no encontrado`;
    super(message, HttpStatus.NOT_FOUND, "NOT_FOUND");
    this.resource = resource;
    this.resourceId = resourceId;
  }

  override toHttpResponse(path: string): Record<string, unknown> {
    return {
      ...super.toHttpResponse(path),
      resource: this.resource,
      resourceId: this.resourceId,
    };
  }
}

/**
 * Conflicto (recurso ya existe, estado conflictivo)
 */
export class ConflictError extends ApplicationError {
  public readonly conflictingField?: string;

  constructor(message: string, conflictingField?: string) {
    super(message, HttpStatus.CONFLICT, "CONFLICT");
    this.conflictingField = conflictingField;
  }

  override toHttpResponse(path: string): Record<string, unknown> {
    return {
      ...super.toHttpResponse(path),
      conflictingField: this.conflictingField,
    };
  }
}

/**
 * Entidad no procesable (reglas de negocio)
 */
export class UnprocessableEntityError extends ApplicationError {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY, "UNPROCESSABLE_ENTITY");
  }
}

/**
 * Demasiadas peticiones (rate limit)
 */
export class TooManyRequestsError extends ApplicationError {
  public readonly retryAfter?: number;

  constructor(message: string = "Demasiadas peticiones", retryAfter?: number) {
    super(message, HttpStatus.TOO_MANY_REQUESTS, "TOO_MANY_REQUESTS");
    this.retryAfter = retryAfter;
  }

  override toHttpResponse(path: string): Record<string, unknown> {
    return {
      ...super.toHttpResponse(path),
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Error interno del servidor
 */
export class InternalError extends ApplicationError {
  constructor(message: string = "Error interno del servidor") {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR");
  }
}

/**
 * Servicio no disponible (dependencia externa caída)
 */
export class ServiceUnavailableError extends ApplicationError {
  public readonly serviceName?: string;

  constructor(message: string, serviceName?: string) {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, "SERVICE_UNAVAILABLE");
    this.serviceName = serviceName;
  }

  override toHttpResponse(path: string): Record<string, unknown> {
    return {
      ...super.toHttpResponse(path),
      serviceName: this.serviceName,
    };
  }
}
