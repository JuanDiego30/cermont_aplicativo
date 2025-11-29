/**
 * Use Case: Actualizar orden
 * 
 * Actualiza campos de una orden existente con validaciones completas.
 * 
 * Campos actualizables:
 * - clientName: Nombre del cliente (3-100 caracteres)
 * - description: Descripción del trabajo (10-1000 caracteres)
 * - location: Ubicación (5-200 caracteres)
 * - clientEmail: Email del cliente (opcional)
 * - clientPhone: Teléfono del cliente (opcional)
 * - estimatedStartDate: Fecha estimada de inicio (opcional)
 * - notes: Notas adicionales (máx. 500 caracteres)
 * 
 * Validaciones:
 * - La orden debe existir y no estar archivada
 * - Debe haber al menos un campo para actualizar
 * - No se pueden modificar campos inmutables (id, createdAt, createdBy, orderNumber)
 * - Debe haber cambios reales (comparación profunda)
 * 
 * @file backend/src/app/orders/use-cases/UpdateOrder.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const VALIDATION_LIMITS = {
  CLIENT_NAME: { min: 3, max: 100 },
  DESCRIPTION: { min: 10, max: 1000 },
  LOCATION: { min: 5, max: 200 },
  NOTES: { max: 500 },
  CLIENT_EMAIL: { max: 100 },
  CLIENT_PHONE: { min: 7, max: 20 },
} as const;

const IMMUTABLE_FIELDS = ['id', 'createdAt', 'createdBy', 'orderNumber', 'state'] as const;

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  MISSING_UPDATED_BY: 'El ID del usuario es requerido',
  MISSING_UPDATES: 'Debe proporcionar al menos un campo para actualizar',
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  ORDER_ARCHIVED: 'No se puede actualizar una orden archivada',
  NO_CHANGES: 'No hay cambios para aplicar',
  IMMUTABLE_FIELD: (field: string) => `El campo "${field}" no se puede modificar`,
  CLIENT_NAME_TOO_SHORT: `El nombre del cliente debe tener al menos ${VALIDATION_LIMITS.CLIENT_NAME.min} caracteres`,
  CLIENT_NAME_TOO_LONG: `El nombre del cliente no puede exceder ${VALIDATION_LIMITS.CLIENT_NAME.max} caracteres`,
  DESCRIPTION_TOO_SHORT: `La descripción debe tener al menos ${VALIDATION_LIMITS.DESCRIPTION.min} caracteres`,
  DESCRIPTION_TOO_LONG: `La descripción no puede exceder ${VALIDATION_LIMITS.DESCRIPTION.max} caracteres`,
  LOCATION_TOO_SHORT: `La ubicación debe tener al menos ${VALIDATION_LIMITS.LOCATION.min} caracteres`,
  LOCATION_TOO_LONG: `La ubicación no puede exceder ${VALIDATION_LIMITS.LOCATION.max} caracteres`,
  NOTES_TOO_LONG: `Las notas no pueden exceder ${VALIDATION_LIMITS.NOTES.max} caracteres`,
  INVALID_EMAIL: 'El email del cliente no es válido',
  INVALID_PHONE: 'El teléfono del cliente no es válido',
  INVALID_DATE: 'La fecha estimada no es válida',
  DATE_IN_PAST: 'La fecha estimada no puede ser en el pasado',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[UpdateOrderUseCase]',
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s\-\(\)]{7,20}$/;

interface UpdateOrderInput {
  orderId: string;
  updates: {
    clientName?: string;
    description?: string;
    location?: string;
    clientEmail?: string;
    clientPhone?: string;
    estimatedStartDate?: Date;
    notes?: string;
  };
  updatedBy: string;
  ip?: string;
  userAgent?: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class UpdateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: UpdateOrderInput): Promise<Order> {
    this.validateInput(input);

    const existingOrder = await this.fetchOrder(input.orderId);
    this.validateOrderCanBeUpdated(existingOrder);

    this.validateUpdates(input.updates);
    this.checkImmutableFields(input.updates);

    const hasChanges = this.detectChanges(existingOrder, input.updates);
    if (!hasChanges) {
      throw new Error(ERROR_MESSAGES.NO_CHANGES);
    }

    const updatedOrder = await this.updateOrder(input.orderId, input.updates);

    const auditContext = this.extractAuditContext(input);
    await this.logOrderUpdate(existingOrder, updatedOrder, input.updatedBy, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Orden actualizada exitosamente`, {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      updatedBy: input.updatedBy,
      updatedFields: Object.keys(input.updates),
    });

    return updatedOrder;
  }

  private validateInput(input: UpdateOrderInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (!input.updatedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_UPDATED_BY);
    }

    if (!input.updates || Object.keys(input.updates).length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_UPDATES);
    }
  }

  private async fetchOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Orden no encontrada`, { orderId });
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND(orderId));
    }

    return order;
  }

  private validateOrderCanBeUpdated(order: Order): void {
    if (order.archived) {
      throw new Error(ERROR_MESSAGES.ORDER_ARCHIVED);
    }
  }

  private checkImmutableFields(updates: Record<string, any>): void {
    for (const field of IMMUTABLE_FIELDS) {
      if (field in updates) {
        throw new Error(ERROR_MESSAGES.IMMUTABLE_FIELD(field));
      }
    }
  }

  private validateUpdates(updates: UpdateOrderInput['updates']): void {
    if (updates.clientName !== undefined) {
      this.validateClientName(updates.clientName);
    }

    if (updates.description !== undefined) {
      this.validateDescription(updates.description);
    }

    if (updates.location !== undefined) {
      this.validateLocation(updates.location);
    }

    if (updates.clientEmail !== undefined) {
      this.validateEmail(updates.clientEmail);
    }

    if (updates.clientPhone !== undefined) {
      this.validatePhone(updates.clientPhone);
    }

    if (updates.estimatedStartDate !== undefined) {
      this.validateEstimatedDate(updates.estimatedStartDate);
    }

    if (updates.notes !== undefined) {
      this.validateNotes(updates.notes);
    }
  }

  private validateClientName(clientName: string): void {
    if (!clientName || clientName.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.CLIENT_NAME_TOO_SHORT);
    }

    const trimmedLength = clientName.trim().length;

    if (trimmedLength < VALIDATION_LIMITS.CLIENT_NAME.min) {
      throw new Error(ERROR_MESSAGES.CLIENT_NAME_TOO_SHORT);
    }

    if (trimmedLength > VALIDATION_LIMITS.CLIENT_NAME.max) {
      throw new Error(ERROR_MESSAGES.CLIENT_NAME_TOO_LONG);
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_SHORT);
    }

    const trimmedLength = description.trim().length;

    if (trimmedLength < VALIDATION_LIMITS.DESCRIPTION.min) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_SHORT);
    }

    if (trimmedLength > VALIDATION_LIMITS.DESCRIPTION.max) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_LONG);
    }
  }

  private validateLocation(location: string): void {
    if (!location || location.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.LOCATION_TOO_SHORT);
    }

    const trimmedLength = location.trim().length;

    if (trimmedLength < VALIDATION_LIMITS.LOCATION.min) {
      throw new Error(ERROR_MESSAGES.LOCATION_TOO_SHORT);
    }

    if (trimmedLength > VALIDATION_LIMITS.LOCATION.max) {
      throw new Error(ERROR_MESSAGES.LOCATION_TOO_LONG);
    }
  }

  private validateEmail(email: string): void {
    const normalized = email.trim().toLowerCase();

    if (normalized.length > VALIDATION_LIMITS.CLIENT_EMAIL.max) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
    }

    if (!EMAIL_PATTERN.test(normalized)) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
    }
  }

  private validatePhone(phone: string): void {
    const cleaned = phone.trim();

    if (cleaned.length < VALIDATION_LIMITS.CLIENT_PHONE.min) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE);
    }

    if (cleaned.length > VALIDATION_LIMITS.CLIENT_PHONE.max) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE);
    }

    if (!PHONE_PATTERN.test(cleaned)) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE);
    }
  }

  private validateNotes(notes: string): void {
    if (notes.length > VALIDATION_LIMITS.NOTES.max) {
      throw new Error(ERROR_MESSAGES.NOTES_TOO_LONG);
    }
  }

  private validateEstimatedDate(date: Date): void {
    const estimatedDate = new Date(date);

    if (Number.isNaN(estimatedDate.getTime())) {
      throw new Error(ERROR_MESSAGES.INVALID_DATE);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    estimatedDate.setHours(0, 0, 0, 0);

    if (estimatedDate < today) {
      throw new Error(ERROR_MESSAGES.DATE_IN_PAST);
    }
  }

  private detectChanges(
    existingOrder: Order,
    updates: UpdateOrderInput['updates']
  ): boolean {
    for (const [key, value] of Object.entries(updates)) {
      const existingValue = existingOrder[key as keyof Order];

      // Comparación profunda para detectar cambios
      if (JSON.stringify(existingValue) !== JSON.stringify(value)) {
        return true;
      }
    }

    return false;
  }

  private async updateOrder(
    orderId: string,
    updates: UpdateOrderInput['updates']
  ): Promise<Order> {
    try {
      const updated = await this.orderRepository.update(orderId, updates);

      if (!updated) {
        throw new Error('Error actualizando la orden');
      }

      return updated;
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error actualizando orden en BD`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: UpdateOrderInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logOrderUpdate(
    before: Order,
    after: Order,
    userId: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      // Registrar solo los campos que cambiaron
      const changes = this.getChangedFields(before, after);

      await this.auditService.log({
        entityType: 'Order',
        entityId: after.id,
        action: AuditAction.UPDATE,
        userId,
        before: changes.before,
        after: changes.after,
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: `Orden actualizada - ${Object.keys(changes.before).length} campos modificados`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        orderId: after.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  private getChangedFields(
    before: Order,
    after: Order
  ): {
    before: Record<string, any>;
    after: Record<string, any>;
  } {
    const beforeChanges: Record<string, any> = {};
    const afterChanges: Record<string, any> = {};

    for (const key of Object.keys(after)) {
      const beforeValue = before[key as keyof Order];
      const afterValue = after[key as keyof Order];

      // Comparar valores
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        beforeChanges[key] = beforeValue;
        afterChanges[key] = afterValue;
      }
    }

    return { before: beforeChanges, after: afterChanges };
  }
}

