/**
 * Value Object: ChecklistStatus
 * 
 * Estado de un checklist en su ciclo de vida
 */

import { ValidationError, BusinessRuleViolationError } from '../exceptions';

export enum ChecklistStatusEnum {
  DRAFT = 'DRAFT',         // Borrador (plantilla)
  ACTIVE = 'ACTIVE',       // Activo (puede asignarse)
  COMPLETED = 'COMPLETED', // Completado
  ARCHIVED = 'ARCHIVED',   // Archivado
}

export class ChecklistStatus {
  private constructor(private readonly _value: ChecklistStatusEnum) {
    Object.freeze(this);
  }

  public static create(value: string): ChecklistStatus {
    if (!Object.values(ChecklistStatusEnum).includes(value as ChecklistStatusEnum)) {
      throw new ValidationError(
        `Estado inválido. Estados permitidos: ${Object.values(ChecklistStatusEnum).join(', ')}`,
        'status',
        value,
      );
    }
    return new ChecklistStatus(value as ChecklistStatusEnum);
  }

  public static draft(): ChecklistStatus {
    return new ChecklistStatus(ChecklistStatusEnum.DRAFT);
  }

  public static active(): ChecklistStatus {
    return new ChecklistStatus(ChecklistStatusEnum.ACTIVE);
  }

  public static completed(): ChecklistStatus {
    return new ChecklistStatus(ChecklistStatusEnum.COMPLETED);
  }

  public static archived(): ChecklistStatus {
    return new ChecklistStatus(ChecklistStatusEnum.ARCHIVED);
  }

  public getValue(): ChecklistStatusEnum {
    return this._value;
  }

  public isDraft(): boolean {
    return this._value === ChecklistStatusEnum.DRAFT;
  }

  public isActive(): boolean {
    return this._value === ChecklistStatusEnum.ACTIVE;
  }

  public isCompleted(): boolean {
    return this._value === ChecklistStatusEnum.COMPLETED;
  }

  public isArchived(): boolean {
    return this._value === ChecklistStatusEnum.ARCHIVED;
  }

  /**
   * Verificar si puede ser asignado a una orden/ejecución
   */
  public puedeAsignarse(): boolean {
    return this._value === ChecklistStatusEnum.ACTIVE;
  }

  /**
   * Verificar si puede archivarse
   */
  public puedeArchivarse(): boolean {
    return this._value === ChecklistStatusEnum.ACTIVE || this._value === ChecklistStatusEnum.COMPLETED;
  }

  /**
   * Verificar si puede editarse
   */
  public puedeEditarse(): boolean {
    return this._value === ChecklistStatusEnum.DRAFT || this._value === ChecklistStatusEnum.ACTIVE;
  }

  /**
   * Transición a activo (desde DRAFT)
   */
  public activar(): ChecklistStatus {
    if (!this.isDraft()) {
      throw new BusinessRuleViolationError(
        'Solo los checklists en estado DRAFT pueden activarse',
        'ESTADO_INVALIDO',
      );
    }
    return ChecklistStatus.active();
  }

  /**
   * Transición a completado
   */
  public completar(): ChecklistStatus {
    if (this.isArchived()) {
      throw new BusinessRuleViolationError(
        'No se puede completar un checklist archivado',
        'ESTADO_INVALIDO',
      );
    }
    return ChecklistStatus.completed();
  }

  /**
   * Transición a archivado
   */
  public archivar(): ChecklistStatus {
    if (!this.puedeArchivarse()) {
      throw new BusinessRuleViolationError(
        'Solo los checklists ACTIVE o COMPLETED pueden archivarse',
        'ESTADO_INVALIDO',
      );
    }
    return ChecklistStatus.archived();
  }

  public equals(other: ChecklistStatus): boolean {
    if (!other || !(other instanceof ChecklistStatus)) {
      return false;
    }
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}

