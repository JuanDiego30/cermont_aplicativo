/**
 * Entity: ChecklistItem
 *
 * Representa un ítem individual de un checklist
 *
 * Invariantes:
 * - label no puede estar vacío
 * - checkedAt solo existe si isChecked es true
 */

import { ChecklistItemId } from '../value-objects/checklist-item-id.vo';
import { ValidationError, BusinessRuleViolationError } from '../exceptions';

export class ChecklistItem {
  private static readonly MIN_LABEL_LENGTH = 1;
  private static readonly MAX_LABEL_LENGTH = 500;

  private constructor(
    private readonly _id: ChecklistItemId,
    private _label: string,
    private _isRequired: boolean,
    private _isChecked: boolean,
    private _checkedAt?: Date,
    private _observaciones?: string,
    private readonly _orden: number = 0
  ) {
    this.validate();
  }

  /**
   * Crear nuevo item
   */
  public static create(props: {
    label: string;
    isRequired?: boolean;
    observaciones?: string;
    orden?: number;
  }): ChecklistItem {
    const id = ChecklistItemId.generate();

    // Validar label
    if (!props.label || props.label.trim().length < this.MIN_LABEL_LENGTH) {
      throw new ValidationError(
        `Label debe tener al menos ${this.MIN_LABEL_LENGTH} caracteres`,
        'label'
      );
    }
    if (props.label.length > this.MAX_LABEL_LENGTH) {
      throw new ValidationError(
        `Label no puede exceder ${this.MAX_LABEL_LENGTH} caracteres`,
        'label'
      );
    }

    return new ChecklistItem(
      id,
      props.label.trim(),
      props.isRequired || false,
      false, // isChecked
      undefined, // checkedAt
      props.observaciones?.trim(),
      props.orden || 0
    );
  }

  /**
   * Recrear desde persistencia
   */
  public static fromPersistence(props: {
    id: string;
    label: string;
    isRequired: boolean;
    isChecked: boolean;
    checkedAt?: Date;
    observaciones?: string;
    orden?: number;
  }): ChecklistItem {
    return new ChecklistItem(
      ChecklistItemId.create(props.id),
      props.label,
      props.isRequired,
      props.isChecked,
      props.checkedAt,
      props.observaciones,
      props.orden || 0
    );
  }

  /**
   * Marcar como completado
   */
  public markAsChecked(checkedAt?: Date): void {
    if (this._isChecked) {
      throw new BusinessRuleViolationError(
        'El item ya está marcado como completado',
        'YA_COMPLETADO'
      );
    }

    this._isChecked = true;
    this._checkedAt = checkedAt || new Date();
  }

  /**
   * Desmarcar (uncheck)
   */
  public uncheck(): void {
    if (!this._isChecked) {
      throw new BusinessRuleViolationError(
        'El item no está marcado como completado',
        'NO_COMPLETADO'
      );
    }

    this._isChecked = false;
    this._checkedAt = undefined;
  }

  /**
   * Toggle estado checked/unchecked
   */
  public toggle(): void {
    if (this._isChecked) {
      this.uncheck();
    } else {
      this.markAsChecked();
    }
  }

  /**
   * Actualizar observaciones
   */
  public updateObservaciones(observaciones: string): void {
    if (observaciones && observaciones.length > 1000) {
      throw new ValidationError('Observaciones no pueden exceder 1000 caracteres', 'observaciones');
    }
    this._observaciones = observaciones?.trim() || undefined;
  }

  /**
   * Verificar si está completado
   */
  public isCompleted(): boolean {
    return this._isChecked;
  }

  /**
   * Verificar si es requerido
   */
  public isRequired(): boolean {
    return this._isRequired;
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  public getId(): ChecklistItemId {
    return this._id;
  }

  public getLabel(): string {
    return this._label;
  }

  public getIsRequired(): boolean {
    return this._isRequired;
  }

  public getIsChecked(): boolean {
    return this._isChecked;
  }

  public getCheckedAt(): Date | undefined {
    return this._checkedAt;
  }

  public getObservaciones(): string | undefined {
    return this._observaciones;
  }

  public getOrden(): number {
    return this._orden;
  }

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  public toPersistence(): {
    id: string;
    label: string;
    isRequired: boolean;
    isChecked: boolean;
    checkedAt?: Date;
    observaciones?: string;
    orden: number;
  } {
    return {
      id: this._id.getValue(),
      label: this._label,
      isRequired: this._isRequired,
      isChecked: this._isChecked,
      checkedAt: this._checkedAt,
      observaciones: this._observaciones,
      orden: this._orden,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════════

  private validate(): void {
    // Invariante: checkedAt solo existe si isChecked es true
    if (this._checkedAt && !this._isChecked) {
      throw new BusinessRuleViolationError(
        'checkedAt no puede existir si isChecked es false',
        'INVARIANTS_VIOLATION'
      );
    }

    if (!this._checkedAt && this._isChecked) {
      // Si está checked pero no tiene fecha, asignar ahora
      this._checkedAt = new Date();
    }
  }
}
