/**
 * @file domain.exception.ts
 * @description Excepciones de dominio para errores de lógica de negocio
 *
 * Uso: Lanzar excepciones semánticas que representan errores del dominio
 * Mejora legibilidad y trazabilidad de errores
 */

import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción base de dominio
 * Extiende HttpException para integración con NestJS
 */
export class DomainException extends HttpException {
  constructor(
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
    public readonly code?: string
  ) {
    super(
      {
        statusCode,
        message,
        error: 'Domain Error',
        code,
        timestamp: new Date().toISOString(),
      },
      statusCode
    );
  }
}

/**
 * Transición de estado de orden inválida
 * Ejemplo: Intentar completar una orden que está en planeación
 */
export class InvalidOrdenStateTransition extends DomainException {
  constructor(currentState: string, targetState: string) {
    super(
      `No se puede transicionar de '${currentState}' a '${targetState}'`,
      HttpStatus.CONFLICT,
      'INVALID_STATE_TRANSITION'
    );
  }
}

/**
 * Orden no encontrada
 */
export class OrdenNotFound extends DomainException {
  constructor(identifier: string) {
    super(`Orden ${identifier} no encontrada`, HttpStatus.NOT_FOUND, 'ORDEN_NOT_FOUND');
  }
}

/**
 * Usuario no encontrado
 */
export class UserNotFound extends DomainException {
  constructor(identifier: string) {
    super(`Usuario ${identifier} no encontrado`, HttpStatus.NOT_FOUND, 'USER_NOT_FOUND');
  }
}

/**
 * Permisos insuficientes para la acción
 */
export class InsufficientPermissions extends DomainException {
  constructor(action: string, resource?: string) {
    const resourceStr = resource ? ` en ${resource}` : '';
    super(
      `Permisos insuficientes para ${action}${resourceStr}`,
      HttpStatus.FORBIDDEN,
      'INSUFFICIENT_PERMISSIONS'
    );
  }
}

/**
 * Email inválido
 */
export class InvalidEmail extends DomainException {
  constructor(email: string) {
    super(`Email inválido: ${email}`, HttpStatus.BAD_REQUEST, 'INVALID_EMAIL');
  }
}

/**
 * Entidad duplicada (ya existe)
 */
export class DuplicateEntity extends DomainException {
  constructor(entity: string, field: string, value: string) {
    super(`${entity} con ${field} "${value}" ya existe`, HttpStatus.CONFLICT, 'DUPLICATE_ENTITY');
  }
}

/**
 * Operación no permitida en el estado actual
 */
export class OperationNotAllowed extends DomainException {
  constructor(operation: string, reason: string) {
    super(
      `Operación '${operation}' no permitida: ${reason}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'OPERATION_NOT_ALLOWED'
    );
  }
}

/**
 * Recurso expirado (token, enlace, etc.)
 */
export class ResourceExpired extends DomainException {
  constructor(resource: string) {
    super(`${resource} ha expirado`, HttpStatus.GONE, 'RESOURCE_EXPIRED');
  }
}

/**
 * Límite excedido (rate limit, cuota, etc.)
 */
export class LimitExceeded extends DomainException {
  constructor(limit: string, currentValue?: number, maxValue?: number) {
    const details =
      currentValue !== undefined && maxValue !== undefined ? ` (${currentValue}/${maxValue})` : '';
    super(`Límite de ${limit} excedido${details}`, HttpStatus.TOO_MANY_REQUESTS, 'LIMIT_EXCEEDED');
  }
}

/**
 * Archivo inválido (tipo, tamaño, etc.)
 */
export class InvalidFile extends DomainException {
  constructor(reason: string) {
    super(`Archivo inválido: ${reason}`, HttpStatus.BAD_REQUEST, 'INVALID_FILE');
  }
}
