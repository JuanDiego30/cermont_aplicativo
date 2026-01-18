/**
 * Aggregate Root: Costo
 *
 * Representa un costo asociado a una orden de trabajo
 *
 * ⚠️ CRÍTICO: Usa Money (Decimal.js) para precisión financiera
 *
 * Invariantes:
 * - Monto debe ser > 0
 * - Tipo y categoría válidos
 * - Debe estar asociado a orden válida
 * - No puede modificarse después de 30 días
 * - Si excede presupuesto, requiere justificación
 */

import { AggregateRoot } from '../../../../shared/base/aggregate-root';
import { CostDeletedEvent, CostoRegisteredEvent, CostUpdatedEvent } from '../events';
import {
  BusinessRuleViolationError,
  CostNotEditableException,
  InvalidCostAmountException,
  ValidationError,
} from '../exceptions';
import { CostoCategory } from '../value-objects/costo-category.vo';
import { CostoId } from '../value-objects/costo-id.vo';
import { CostoType } from '../value-objects/costo-type.vo';
import { Money } from '../value-objects/money.vo';

export class Costo extends AggregateRoot {
  // Configuración
  private static readonly MIN_DESCRIPTION_LENGTH = 3;
  private static readonly MAX_DESCRIPTION_LENGTH = 500;
  private static readonly MAX_JUSTIFICATION_LENGTH = 1000;
  private static readonly EDITABLE_DAYS = 30;

  private constructor(
    private readonly _id: CostoId,
    private readonly _ordenId: string,
    private _type: CostoType,
    private _category: CostoCategory,
    private _amount: Money,
    private _description: string,
    private _invoiceNumber: string | null,
    private _justification: string | null,
    private readonly _registeredBy: string,
    private readonly _registeredAt: Date,
    private _updatedBy: string | null,
    private _updatedAt: Date | null,
    private _isDeleted: boolean
  ) {
    super();
    this.validate();
  }

  // ═══════════════════════════════════════════════════════════════
  // FACTORY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crear nuevo costo
   */
  public static create(props: {
    ordenId: string;
    type: string;
    category: string;
    amount: Money;
    description: string;
    registeredBy: string;
    invoiceNumber?: string;
    justification?: string;
  }): Costo {
    const id = CostoId.generate();
    const now = new Date();

    const type = CostoType.create(props.type);
    const category = CostoCategory.create(props.category);

    // Validar que el tipo y categoría sean consistentes
    const suggestedCategory = type.getSuggestedCategory();
    if (category.getValue() !== suggestedCategory) {
      // Warning pero no error - permitir override manual
      console.warn(
        `[Costo] Tipo ${type.getValue()} sugiere categoría ${suggestedCategory}, pero se asignó ${category.getValue()}`
      );
    }

    const costo = new Costo(
      id,
      props.ordenId,
      type,
      category,
      props.amount,
      props.description,
      props.invoiceNumber || null,
      props.justification || null,
      props.registeredBy,
      now,
      null,
      null,
      false
    );

    // Registrar evento
    costo.addDomainEvent(
      new CostoRegisteredEvent({
        costoId: id.getValue(),
        ordenId: props.ordenId,
        amount: props.amount.toJSON(),
        type: type.getValue(),
        category: category.getValue(),
        registeredBy: props.registeredBy,
        timestamp: now,
      })
    );

    return costo;
  }

  /**
   * Recrear desde persistencia
   */
  public static fromPersistence(props: {
    id: string;
    ordenId: string;
    type: string;
    category: string;
    amount: { amount: number | string; currency: string };
    description: string;
    invoiceNumber?: string | null;
    justification?: string | null;
    registeredBy: string;
    registeredAt: Date;
    updatedBy?: string | null;
    updatedAt?: Date | null;
    isDeleted: boolean;
  }): Costo {
    return new Costo(
      CostoId.create(props.id),
      props.ordenId,
      CostoType.create(props.type),
      CostoCategory.create(props.category),
      Money.create(props.amount.amount, props.amount.currency),
      props.description,
      props.invoiceNumber || null,
      props.justification || null,
      props.registeredBy,
      props.registeredAt,
      props.updatedBy || null,
      props.updatedAt || null,
      props.isDeleted || false
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Actualizar monto del costo
   */
  public update(newAmount: Money, reason: string, updatedBy: string): void {
    if (!this.isEditable()) {
      throw new CostNotEditableException(
        'No se puede editar costo con más de 30 días de antigüedad',
        this._id.getValue(),
        this._registeredAt
      );
    }

    if (this._isDeleted) {
      throw new BusinessRuleViolationError('No se puede editar costo eliminado');
    }

    if (!reason || reason.trim().length === 0) {
      throw new ValidationError('Se requiere razón para actualizar costo', 'reason');
    }

    const oldAmount = this._amount;

    this._amount = newAmount;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();

    // Registrar evento
    this.addDomainEvent(
      new CostUpdatedEvent({
        costoId: this._id.getValue(),
        ordenId: this._ordenId,
        oldAmount: oldAmount.toJSON(),
        newAmount: newAmount.toJSON(),
        updatedBy,
        reason,
        timestamp: this._updatedAt,
      })
    );
  }

  /**
   * Eliminar costo (soft delete)
   */
  public delete(reason: string, deletedBy: string): void {
    if (this._isDeleted) {
      throw new BusinessRuleViolationError('Costo ya está eliminado');
    }

    if (!reason || reason.trim().length === 0) {
      throw new ValidationError('Se requiere justificación para eliminar costo', 'reason');
    }

    this._isDeleted = true;
    this._updatedBy = deletedBy;
    this._updatedAt = new Date();

    // Registrar evento
    this.addDomainEvent(
      new CostDeletedEvent({
        costoId: this._id.getValue(),
        ordenId: this._ordenId,
        amount: this._amount.toJSON(),
        deletedBy,
        reason,
        timestamp: this._updatedAt,
      })
    );
  }

  /**
   * Agregar justificación (cuando excede presupuesto)
   */
  public addJustification(justification: string): void {
    if (!justification || justification.trim().length === 0) {
      throw new ValidationError('Justificación es requerida', 'justification');
    }
    if (justification.length > Costo.MAX_JUSTIFICATION_LENGTH) {
      throw new ValidationError(
        `Justificación no puede exceder ${Costo.MAX_JUSTIFICATION_LENGTH} caracteres`,
        'justification'
      );
    }
    this._justification = justification.trim();
  }

  /**
   * Verificar si es editable (menos de 30 días)
   */
  public isEditable(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - Costo.EDITABLE_DAYS);
    return this._registeredAt > thirtyDaysAgo;
  }

  /**
   * Verificar si está eliminado
   */
  public isDeleted(): boolean {
    return this._isDeleted;
  }

  /**
   * Verificar si requiere factura
   */
  public requiresInvoice(): boolean {
    return this._type.requiresInvoice();
  }

  /**
   * Verificar si tiene factura
   */
  public hasInvoice(): boolean {
    return !!this._invoiceNumber;
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  public getId(): CostoId {
    return this._id;
  }

  public getOrdenId(): string {
    return this._ordenId;
  }

  public getType(): CostoType {
    return this._type;
  }

  public getCategory(): CostoCategory {
    return this._category;
  }

  public getAmount(): Money {
    return this._amount;
  }

  public getDescription(): string {
    return this._description;
  }

  public getInvoiceNumber(): string | null {
    return this._invoiceNumber;
  }

  public getJustification(): string | null {
    return this._justification;
  }

  public getRegisteredBy(): string {
    return this._registeredBy;
  }

  public getRegisteredAt(): Date {
    return this._registeredAt;
  }

  public getUpdatedBy(): string | null {
    return this._updatedBy;
  }

  public getUpdatedAt(): Date | null {
    return this._updatedAt;
  }

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  public toPersistence(): {
    id: string;
    ordenId: string;
    type: string;
    category: string;
    amount: { amount: number | string; currency: string };
    description: string;
    invoiceNumber: string | null;
    justification: string | null;
    registeredBy: string;
    registeredAt: Date;
    updatedBy: string | null;
    updatedAt: Date | null;
    isDeleted: boolean;
  } {
    return {
      id: this._id.getValue(),
      ordenId: this._ordenId,
      type: this._type.getValue(),
      category: this._category.getValue(),
      amount: this._amount.toJSON(),
      description: this._description,
      invoiceNumber: this._invoiceNumber,
      justification: this._justification,
      registeredBy: this._registeredBy,
      registeredAt: this._registeredAt,
      updatedBy: this._updatedBy,
      updatedAt: this._updatedAt,
      isDeleted: this._isDeleted,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════════

  private validate(): void {
    // Invariantes
    if (!this._ordenId || this._ordenId.trim().length === 0) {
      throw new ValidationError('ordenId es requerido', 'ordenId');
    }

    if (this._amount.isZero()) {
      throw new InvalidCostAmountException('Monto debe ser mayor a 0', this._amount.toJSON());
    }

    if (!this._description || this._description.trim().length < Costo.MIN_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `Descripción debe tener al menos ${Costo.MIN_DESCRIPTION_LENGTH} caracteres`,
        'description'
      );
    }

    if (this._description.length > Costo.MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `Descripción no puede exceder ${Costo.MAX_DESCRIPTION_LENGTH} caracteres`,
        'description'
      );
    }

    // Si el tipo requiere factura, debe tener número de factura
    if (this._type.requiresInvoice() && !this._invoiceNumber) {
      throw new ValidationError(
        `Tipo ${this._type.getValue()} requiere número de factura`,
        'invoiceNumber'
      );
    }
  }
}
