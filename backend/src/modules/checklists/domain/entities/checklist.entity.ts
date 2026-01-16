/**
 * Aggregate Root: Checklist
 *
 * Representa una plantilla de checklist o una instancia asignada a una orden/ejecución
 *
 * Invariantes:
 * - Nombre no puede estar vacío
 * - Debe tener al menos 1 item
 * - Solo ACTIVE puede asignarse
 * - Solo DRAFT puede editarse
 */

import { ChecklistId } from '../value-objects/checklist-id.vo';
import { ChecklistItemId } from '../value-objects/checklist-item-id.vo';
import { ChecklistStatus, ChecklistStatusEnum } from '../value-objects/checklist-status.vo';
import { ChecklistItem } from './checklist-item.entity';
import { ValidationError, BusinessRuleViolationError } from '../exceptions';
import {
  ChecklistCreatedEvent,
  ChecklistAssignedEvent,
  ChecklistItemToggledEvent,
  ChecklistCompletedEvent,
} from '../events';
import { AggregateRoot } from '../../../../shared/base/aggregate-root';

export class Checklist extends AggregateRoot {
  // Configuración
  private static readonly MIN_NAME_LENGTH = 3;
  private static readonly MAX_NAME_LENGTH = 100;
  private static readonly MIN_DESCRIPTION_LENGTH = 0;
  private static readonly MAX_DESCRIPTION_LENGTH = 500;
  private static readonly MIN_ITEMS = 1;
  private static readonly MAX_ITEMS = 100;

  private constructor(
    private readonly _id: ChecklistId,
    private _name: string,
    private _description: string | null,
    private _status: ChecklistStatus,
    private _tipo: string | null,
    private _categoria: string | null,
    private _items: ChecklistItem[],
    private _ordenId: string | null,
    private _ejecucionId: string | null,
    private _templateId: string | null,
    private _completada: boolean,
    private _completadoPorId: string | null,
    private _completadoEn: Date | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {
    super();
    this.validate();
  }

  // ═══════════════════════════════════════════════════════════════
  // FACTORY METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crear nueva plantilla de checklist (DRAFT)
   */
  public static createTemplate(props: {
    name: string;
    description?: string;
    tipo: string;
    categoria?: string;
    items: { label: string; isRequired?: boolean; orden?: number }[];
  }): Checklist {
    const id = ChecklistId.generate();
    const status = ChecklistStatus.draft();

    // Validar nombre
    if (!props.name || props.name.trim().length < this.MIN_NAME_LENGTH) {
      throw new ValidationError(
        `Nombre debe tener al menos ${this.MIN_NAME_LENGTH} caracteres`,
        'name'
      );
    }
    if (props.name.length > this.MAX_NAME_LENGTH) {
      throw new ValidationError(
        `Nombre no puede exceder ${this.MAX_NAME_LENGTH} caracteres`,
        'name'
      );
    }

    // Validar descripción
    if (props.description && props.description.length > this.MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(
        `Descripción no puede exceder ${this.MAX_DESCRIPTION_LENGTH} caracteres`,
        'description'
      );
    }

    // Validar items
    if (!props.items || props.items.length < this.MIN_ITEMS) {
      throw new ValidationError(`Debe tener al menos ${this.MIN_ITEMS} item`, 'items');
    }
    if (props.items.length > this.MAX_ITEMS) {
      throw new ValidationError(`No puede tener más de ${this.MAX_ITEMS} items`, 'items');
    }

    // Crear items
    const items = props.items.map((item, index) =>
      ChecklistItem.create({
        label: item.label,
        isRequired: item.isRequired,
        orden: item.orden ?? index,
      })
    );

    const now = new Date();

    const checklist = new Checklist(
      id,
      props.name.trim(),
      props.description?.trim() || null,
      status,
      props.tipo,
      props.categoria || null,
      items,
      null, // ordenId
      null, // ejecucionId
      null, // templateId
      false, // completada
      null, // completadoPorId
      null, // completadoEn
      now,
      now
    );

    // Registrar evento
    checklist.addDomainEvent(
      new ChecklistCreatedEvent({
        checklistId: id.getValue(),
        name: props.name,
        tipo: props.tipo,
        itemsCount: items.length,
        timestamp: now,
      })
    );

    return checklist;
  }

  /**
   * Crear instancia desde plantilla (para orden/ejecución)
   */
  public static createInstanceFromTemplate(props: {
    templateId: string;
    name: string;
    description?: string;
    items: ChecklistItem[];
    ordenId?: string;
    ejecucionId?: string;
  }): Checklist {
    const id = ChecklistId.generate();
    const status = ChecklistStatus.active();

    const now = new Date();

    const checklist = new Checklist(
      id,
      props.name.trim(),
      props.description?.trim() || null,
      status,
      null, // tipo (se hereda del template)
      null, // categoria
      props.items,
      props.ordenId || null,
      props.ejecucionId || null,
      props.templateId,
      false, // completada
      null, // completadoPorId
      null, // completadoEn
      now,
      now
    );

    // Registrar evento de asignación
    if (props.ordenId || props.ejecucionId) {
      checklist.addDomainEvent(
        new ChecklistAssignedEvent({
          checklistId: id.getValue(),
          templateId: props.templateId,
          ordenId: props.ordenId,
          ejecucionId: props.ejecucionId,
          timestamp: now,
        })
      );
    }

    return checklist;
  }

  /**
   * Recrear desde persistencia
   */
  public static fromPersistence(props: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
    tipo?: string | null;
    categoria?: string | null;
    items: Array<{
      id: string;
      label: string;
      isRequired: boolean;
      isChecked: boolean;
      checkedAt?: Date;
      observaciones?: string;
      orden: number;
    }>;
    ordenId?: string | null;
    ejecucionId?: string | null;
    templateId?: string | null;
    completada: boolean;
    completadoPorId?: string | null;
    completadoEn?: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): Checklist {
    const items = props.items.map(item =>
      ChecklistItem.fromPersistence({
        id: item.id,
        label: item.label,
        isRequired: item.isRequired,
        isChecked: item.isChecked,
        checkedAt: item.checkedAt,
        observaciones: item.observaciones,
        orden: item.orden,
      })
    );

    return new Checklist(
      ChecklistId.create(props.id),
      props.name,
      props.description || null,
      ChecklistStatus.create(props.status),
      props.tipo || null,
      props.categoria || null,
      items,
      props.ordenId || null,
      props.ejecucionId || null,
      props.templateId || null,
      props.completada,
      props.completadoPorId || null,
      props.completadoEn || null,
      props.createdAt,
      props.updatedAt
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // BUSINESS METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Activar plantilla (DRAFT → ACTIVE)
   */
  public activate(): void {
    this._status = this._status.activar();
    this._updatedAt = new Date();
  }

  /**
   * Agregar item (solo en DRAFT)
   */
  public addItem(props: { label: string; isRequired?: boolean; orden?: number }): void {
    if (!this._status.isDraft()) {
      throw new BusinessRuleViolationError(
        'Solo se pueden agregar items a checklists en estado DRAFT',
        'ESTADO_INVALIDO'
      );
    }

    if (this._items.length >= Checklist.MAX_ITEMS) {
      throw new BusinessRuleViolationError(
        `No se pueden agregar más de ${Checklist.MAX_ITEMS} items`,
        'MAX_ITEMS_ALCANZADO'
      );
    }

    const orden = props.orden ?? this._items.length;
    const item = ChecklistItem.create({
      label: props.label,
      isRequired: props.isRequired,
      orden,
    });

    this._items.push(item);
    this._updatedAt = new Date();
  }

  /**
   * Asignar a orden
   */
  public assignToOrden(ordenId: string): void {
    if (!this._status.puedeAsignarse()) {
      throw new BusinessRuleViolationError(
        'Solo los checklists ACTIVE pueden asignarse',
        'ESTADO_INVALIDO'
      );
    }

    if (this._ordenId) {
      throw new BusinessRuleViolationError(
        'El checklist ya está asignado a una orden',
        'YA_ASIGNADO'
      );
    }

    this._ordenId = ordenId;
    this._updatedAt = new Date();

    // Registrar evento
    this.addDomainEvent(
      new ChecklistAssignedEvent({
        checklistId: this._id.getValue(),
        templateId: this._templateId || undefined,
        ordenId,
        ejecucionId: undefined,
        timestamp: this._updatedAt,
      })
    );
  }

  /**
   * Asignar a ejecución
   */
  public assignToEjecucion(ejecucionId: string): void {
    if (!this._status.puedeAsignarse()) {
      throw new BusinessRuleViolationError(
        'Solo los checklists ACTIVE pueden asignarse',
        'ESTADO_INVALIDO'
      );
    }

    if (this._ejecucionId) {
      throw new BusinessRuleViolationError(
        'El checklist ya está asignado a una ejecución',
        'YA_ASIGNADO'
      );
    }

    this._ejecucionId = ejecucionId;
    this._updatedAt = new Date();

    // Registrar evento
    this.addDomainEvent(
      new ChecklistAssignedEvent({
        checklistId: this._id.getValue(),
        templateId: this._templateId || undefined,
        ordenId: undefined,
        ejecucionId,
        timestamp: this._updatedAt,
      })
    );
  }

  /**
   * Toggle item
   */
  public toggleItem(itemId: ChecklistItemId, userId?: string): void {
    const item = this.getUpdatableItemOrThrow(itemId);

    const wasChecked = item.getIsChecked();
    item.toggle();

    this._updatedAt = new Date();

    // Registrar evento
    this.addDomainEvent(
      new ChecklistItemToggledEvent({
        checklistId: this._id.getValue(),
        itemId: itemId.getValue(),
        checked: !wasChecked,
        userId,
        timestamp: this._updatedAt,
      })
    );

    // Verificar si todos los items están completos
    this.completeIfAllItemsDone(userId);
  }

  /**
   * Actualizar observaciones de un item
   */
  public updateItemObservaciones(itemId: ChecklistItemId, observaciones: string): void {
    const item = this.getUpdatableItemOrThrow(itemId);

    item.updateObservaciones(observaciones);
    this._updatedAt = new Date();
  }

  /**
   * Completar si todos los items están hechos
   */
  public completeIfAllItemsDone(userId?: string): void {
    const allRequiredCompleted = this._items
      .filter(i => i.isRequired())
      .every(i => i.isCompleted());

    const allItemsCompleted = this._items.every(i => i.isCompleted());

    if (allRequiredCompleted && !this._completada) {
      this.markAsCompleted(userId);
    } else if (!allItemsCompleted && this._completada) {
      // Si se desmarca un item, descompletar
      this._completada = false;
      this._completadoPorId = null;
      this._completadoEn = null;
      if (this._status.isCompleted()) {
        this._status = ChecklistStatus.active();
      }
      this._updatedAt = new Date();
    }
  }

  /**
   * Completar manualmente
   */
  public completeManually(userId: string): void {
    if (this._completada) {
      throw new BusinessRuleViolationError('El checklist ya está completado', 'YA_COMPLETADO');
    }

    this.markAsCompleted(userId);
  }

  private markAsCompleted(userId?: string): void {
    this._completada = true;
    this._completadoPorId = userId || null;
    this._completadoEn = new Date();
    this._status = this._status.completar();
    this._updatedAt = new Date();

    // Registrar evento
    this.addDomainEvent(
      new ChecklistCompletedEvent({
        checklistId: this._id.getValue(),
        ordenId: this._ordenId || undefined,
        ejecucionId: this._ejecucionId || undefined,
        completedBy: userId,
        timestamp: this._updatedAt,
      })
    );
  }

  private getUpdatableItemOrThrow(itemId: ChecklistItemId): ChecklistItem {
    if (this._status.isArchived()) {
      throw new BusinessRuleViolationError(
        'No se puede modificar un checklist archivado',
        'ESTADO_INVALIDO'
      );
    }

    const item = this._items.find(i => i.getId().equals(itemId));
    if (!item) {
      throw new ValidationError('Item no encontrado', 'itemId', itemId.getValue());
    }

    return item;
  }

  /**
   * Archivar
   */
  public archive(): void {
    if (!this._status.puedeArchivarse()) {
      throw new BusinessRuleViolationError(
        'Solo los checklists ACTIVE o COMPLETED pueden archivarse',
        'ESTADO_INVALIDO'
      );
    }

    this._status = this._status.archivar();
    this._updatedAt = new Date();
  }

  /**
   * Obtener ratio de completitud (0-1)
   */
  public getCompletionRatio(): number {
    if (this._items.length === 0) {
      return 0;
    }

    const completed = this._items.filter(i => i.isCompleted()).length;
    return completed / this._items.length;
  }

  /**
   * Obtener porcentaje de completitud (0-100)
   */
  public getCompletionPercentage(): number {
    return Math.round(this.getCompletionRatio() * 100);
  }

  /**
   * Verificar si está completado
   */
  public isCompleted(): boolean {
    return this._completada;
  }

  /**
   * Verificar si es plantilla
   */
  public isTemplate(): boolean {
    return !this._ordenId && !this._ejecucionId;
  }

  /**
   * Verificar si está asignado
   */
  public isAssigned(): boolean {
    return !!(this._ordenId || this._ejecucionId);
  }

  // ═══════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════

  public getId(): ChecklistId {
    return this._id;
  }

  public getName(): string {
    return this._name;
  }

  public getDescription(): string | null {
    return this._description;
  }

  public getStatus(): ChecklistStatus {
    return this._status;
  }

  public getTipo(): string | null {
    return this._tipo;
  }

  public getCategoria(): string | null {
    return this._categoria;
  }

  public getItems(): ChecklistItem[] {
    return [...this._items]; // Retornar copia
  }

  public getOrdenId(): string | null {
    return this._ordenId;
  }

  public getEjecucionId(): string | null {
    return this._ejecucionId;
  }

  public getTemplateId(): string | null {
    return this._templateId;
  }

  public getCompletada(): boolean {
    return this._completada;
  }

  public getCompletadoPorId(): string | null {
    return this._completadoPorId;
  }

  public getCompletadoEn(): Date | null {
    return this._completadoEn;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // ═══════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  public toPersistence(): {
    id: string;
    name: string;
    description: string | null;
    status: string;
    tipo: string | null;
    categoria: string | null;
    items: Array<{
      id: string;
      label: string;
      isRequired: boolean;
      isChecked: boolean;
      checkedAt?: Date;
      observaciones?: string;
      orden: number;
    }>;
    ordenId: string | null;
    ejecucionId: string | null;
    templateId: string | null;
    completada: boolean;
    completadoPorId: string | null;
    completadoEn: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this._id.getValue(),
      name: this._name,
      description: this._description,
      status: this._status.getValue(),
      tipo: this._tipo,
      categoria: this._categoria,
      items: this._items.map(i => i.toPersistence()),
      ordenId: this._ordenId,
      ejecucionId: this._ejecucionId,
      templateId: this._templateId,
      completada: this._completada,
      completadoPorId: this._completadoPorId,
      completadoEn: this._completadoEn,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═══════════════════════════════════════════════════════════════

  private validate(): void {
    // Invariantes
    if (this._items.length < Checklist.MIN_ITEMS) {
      throw new BusinessRuleViolationError(
        `Un checklist debe tener al menos ${Checklist.MIN_ITEMS} item`,
        'MIN_ITEMS'
      );
    }

    if (this._items.length > Checklist.MAX_ITEMS) {
      throw new BusinessRuleViolationError(
        `Un checklist no puede tener más de ${Checklist.MAX_ITEMS} items`,
        'MAX_ITEMS'
      );
    }

    // No puede estar asignado a orden y ejecución simultáneamente
    if (this._ordenId && this._ejecucionId) {
      throw new BusinessRuleViolationError(
        'Un checklist no puede estar asignado a orden y ejecución simultáneamente',
        'ASIGNACION_INVALIDA'
      );
    }
  }
}
