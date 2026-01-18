/**
 * @file domain-error.base.ts
 * @description Errores de dominio (reglas de negocio)
 *
 * Uso: throw new EntityNotFoundError('Usuario', '123');
 * Los Domain Errors son capturados por filtros y convertidos a HTTP responses
 */

/**
 * Error base de dominio
 *
 * Representa violaciones de reglas de negocio independientes de la infraestructura
 */
import { ErrorCodes } from './error-codes';

/**
 * Error base de dominio
 *
 * Representa violaciones de reglas de negocio independientes de la infraestructura
 */
export abstract class DomainError extends Error {
  public readonly code: string;
  public readonly occurredAt: Date;

  constructor(message: string, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code ?? this.constructor.name;
    this.occurredAt = new Date();

    // Mantiene el stack trace correcto en V8 (Node.js/Chrome)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serializa el error para logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      occurredAt: this.occurredAt.toISOString(),
      stack: this.stack,
    };
  }

  /**
   * Representación string del error
   */
  override toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

/**
 * Entidad no encontrada
 */
export class EntityNotFoundError extends DomainError {
  public readonly entityName: string;
  public readonly entityId: string | number;

  constructor(entityName: string, id: string | number) {
    super(`${entityName} con id ${id} no encontrado`, ErrorCodes.ENTITY_NOT_FOUND);
    this.entityName = entityName;
    this.entityId = id;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      entityName: this.entityName,
      entityId: this.entityId,
    };
  }
}

/**
 * Violación de regla de negocio
 */
export class BusinessRuleViolationError extends DomainError {
  public readonly ruleName?: string;

  constructor(message: string, ruleName?: string) {
    super(message, ruleName ?? ErrorCodes.BUSINESS_RULE_VIOLATION);
    this.ruleName = ruleName;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      ruleName: this.ruleName,
    };
  }
}

/**
 * Operación no permitida en el estado actual
 */
export class InvalidOperationError extends DomainError {
  public readonly currentState?: string;
  public readonly attemptedOperation?: string;

  constructor(message: string, options?: { currentState?: string; attemptedOperation?: string }) {
    super(message, ErrorCodes.INVALID_OPERATION);
    this.currentState = options?.currentState;
    this.attemptedOperation = options?.attemptedOperation;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      currentState: this.currentState,
      attemptedOperation: this.attemptedOperation,
    };
  }
}

/**
 * Estado inválido de la entidad
 */
export class InvalidEntityStateError extends DomainError {
  constructor(entityName: string, message: string) {
    super(`Estado inválido de ${entityName}: ${message}`, ErrorCodes.INVALID_ENTITY_STATE);
  }
}

/**
 * Duplicado detectado
 */
export class DuplicateEntityError extends DomainError {
  public readonly entityName: string;
  public readonly field: string;
  public readonly value: string;

  constructor(entityName: string, field: string, value: string) {
    super(`${entityName} con ${field} "${value}" ya existe`, ErrorCodes.DUPLICATE_ENTITY);
    this.entityName = entityName;
    this.field = field;
    this.value = value;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      entityName: this.entityName,
      field: this.field,
      value: this.value,
    };
  }
}

/**
 * Permiso insuficiente (dominio)
 */
export class InsufficientPermissionError extends DomainError {
  public readonly requiredPermission: string;

  constructor(requiredPermission: string) {
    super(
      `Permiso insuficiente: se requiere "${requiredPermission}"`,
      ErrorCodes.INSUFFICIENT_PERMISSION
    );
    this.requiredPermission = requiredPermission;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      requiredPermission: this.requiredPermission,
    };
  }
}
