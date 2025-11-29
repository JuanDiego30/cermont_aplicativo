/**
 * Use Case: Crear orden de trabajo
 * 
 * Crea una nueva orden de trabajo en estado SOLICITUD.
 * 
 * Validaciones:
 * - Campos requeridos: clientName, description, location, createdBy
 * - Longitudes mínimas y máximas configurables
 * - Email y teléfono opcionales con formato válido
 * - Fecha estimada no puede ser pasada ni más de 2 años futura
 * 
 * @file backend/src/app/orders/use-cases/CreateOrder.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import { generateUniqueId } from '../../../shared/utils/generateUniqueId.js';

const VALIDATION_LIMITS = {
  CLIENT_NAME: { min: 3, max: 100 },
  DESCRIPTION: { min: 10, max: 1000 },
  LOCATION: { min: 5, max: 200 },
  NOTES: { min: 0, max: 500 },
  CLIENT_EMAIL: { max: 100 },
  CLIENT_PHONE: { min: 7, max: 20 },
} as const;

const DATE_LIMITS = {
  MAX_FUTURE_YEARS: 2,
} as const;

const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]{7,20}$/,
  CLIENT_NAME: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,'&\-]+$/,
} as const;

const ERROR_MESSAGES = {
  MISSING_CLIENT_NAME: 'El nombre del cliente es requerido',
  CLIENT_NAME_TOO_SHORT: `El nombre del cliente debe tener al menos ${VALIDATION_LIMITS.CLIENT_NAME.min} caracteres`,
  CLIENT_NAME_TOO_LONG: `El nombre del cliente no puede exceder ${VALIDATION_LIMITS.CLIENT_NAME.max} caracteres`,
  CLIENT_NAME_INVALID_CHARS: 'El nombre del cliente contiene caracteres no permitidos',
  MISSING_DESCRIPTION: 'La descripción es requerida',
  DESCRIPTION_TOO_SHORT: `La descripción debe tener al menos ${VALIDATION_LIMITS.DESCRIPTION.min} caracteres`,
  DESCRIPTION_TOO_LONG: `La descripción no puede exceder ${VALIDATION_LIMITS.DESCRIPTION.max} caracteres`,
  MISSING_LOCATION: 'La ubicación es requerida',
  LOCATION_TOO_SHORT: `La ubicación debe tener al menos ${VALIDATION_LIMITS.LOCATION.min} caracteres`,
  LOCATION_TOO_LONG: `La ubicación no puede exceder ${VALIDATION_LIMITS.LOCATION.max} caracteres`,
  MISSING_CREATED_BY: 'El ID del usuario creador es requerido',
  INVALID_EMAIL: 'El email del cliente no es válido',
  INVALID_PHONE: 'El teléfono del cliente no es válido',
  PHONE_TOO_SHORT: `El teléfono debe tener al menos ${VALIDATION_LIMITS.CLIENT_PHONE.min} dígitos`,
  PHONE_TOO_LONG: `El teléfono no puede exceder ${VALIDATION_LIMITS.CLIENT_PHONE.max} caracteres`,
  NOTES_TOO_LONG: `Las notas no pueden exceder ${VALIDATION_LIMITS.NOTES.max} caracteres`,
  INVALID_DATE: 'La fecha estimada de inicio no es válida',
  DATE_IN_PAST: 'La fecha estimada de inicio no puede ser en el pasado',
  DATE_TOO_FAR: `La fecha estimada no puede ser más de ${DATE_LIMITS.MAX_FUTURE_YEARS} años en el futuro`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[CreateOrderUseCase]',
} as const;

interface CreateOrderInput {
  clientName: string;
  description: string;
  location: string;
  createdBy: string;
  responsibleId?: string; // Opcional: técnico asignado desde el inicio
  clientEmail?: string;
  clientPhone?: string;
  estimatedStartDate?: Date;
  notes?: string;
  ip?: string;
  userAgent?: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    this.validateInput(input);

    const orderNumber = await this.generateOrderNumber();
    const orderData = this.buildOrderData(input, orderNumber);

    const createdOrder = await this.createOrder(orderData);

    const auditContext = this.extractAuditContext(input);
    await this.logOrderCreation(createdOrder, input.createdBy, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Orden creada exitosamente`, {
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      clientName: createdOrder.clientName,
      createdBy: input.createdBy,
    });

    return createdOrder;
  }

  private validateInput(input: CreateOrderInput): void {
    this.validateClientName(input.clientName);
    this.validateDescription(input.description);
    this.validateLocation(input.location);
    this.validateCreatedBy(input.createdBy);

    if (input.clientEmail) {
      this.validateEmail(input.clientEmail);
    }

    if (input.clientPhone) {
      this.validatePhone(input.clientPhone);
    }

    if (input.estimatedStartDate) {
      this.validateEstimatedDate(input.estimatedStartDate);
    }

    if (input.notes) {
      this.validateNotes(input.notes);
    }
  }

  private validateClientName(clientName: unknown): void {
    if (!clientName || typeof clientName !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_CLIENT_NAME);
    }

    const trimmed = clientName.trim();

    if (trimmed.length < VALIDATION_LIMITS.CLIENT_NAME.min) {
      throw new Error(ERROR_MESSAGES.CLIENT_NAME_TOO_SHORT);
    }

    if (trimmed.length > VALIDATION_LIMITS.CLIENT_NAME.max) {
      throw new Error(ERROR_MESSAGES.CLIENT_NAME_TOO_LONG);
    }

    if (!PATTERNS.CLIENT_NAME.test(trimmed)) {
      throw new Error(ERROR_MESSAGES.CLIENT_NAME_INVALID_CHARS);
    }
  }

  private validateDescription(description: unknown): void {
    if (!description || typeof description !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_DESCRIPTION);
    }

    const trimmed = description.trim();

    if (trimmed.length < VALIDATION_LIMITS.DESCRIPTION.min) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_SHORT);
    }

    if (trimmed.length > VALIDATION_LIMITS.DESCRIPTION.max) {
      throw new Error(ERROR_MESSAGES.DESCRIPTION_TOO_LONG);
    }
  }

  private validateLocation(location: unknown): void {
    if (!location || typeof location !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_LOCATION);
    }

    const trimmed = location.trim();

    if (trimmed.length < VALIDATION_LIMITS.LOCATION.min) {
      throw new Error(ERROR_MESSAGES.LOCATION_TOO_SHORT);
    }

    if (trimmed.length > VALIDATION_LIMITS.LOCATION.max) {
      throw new Error(ERROR_MESSAGES.LOCATION_TOO_LONG);
    }
  }

  private validateCreatedBy(createdBy: unknown): void {
    if (!createdBy || typeof createdBy !== 'string' || createdBy.trim() === '') {
      throw new Error(ERROR_MESSAGES.MISSING_CREATED_BY);
    }
  }

  private validateEmail(email: string): void {
    const normalized = email.trim().toLowerCase();

    if (normalized.length > VALIDATION_LIMITS.CLIENT_EMAIL.max) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
    }

    if (!PATTERNS.EMAIL.test(normalized)) {
      throw new Error(ERROR_MESSAGES.INVALID_EMAIL);
    }
  }

  private validatePhone(phone: string): void {
    const cleaned = phone.trim().replace(/\s/g, '');

    if (cleaned.length < VALIDATION_LIMITS.CLIENT_PHONE.min) {
      throw new Error(ERROR_MESSAGES.PHONE_TOO_SHORT);
    }

    if (cleaned.length > VALIDATION_LIMITS.CLIENT_PHONE.max) {
      throw new Error(ERROR_MESSAGES.PHONE_TOO_LONG);
    }

    if (!PATTERNS.PHONE.test(phone.trim())) {
      throw new Error(ERROR_MESSAGES.INVALID_PHONE);
    }
  }

  private validateNotes(notes: string): void {
    if (notes.length > VALIDATION_LIMITS.NOTES.max) {
      throw new Error(ERROR_MESSAGES.NOTES_TOO_LONG);
    }
  }

  private validateEstimatedDate(date: Date): void {
    const estimatedDate = this.normalizeDate(new Date(date));

    if (Number.isNaN(estimatedDate.getTime())) {
      throw new Error(ERROR_MESSAGES.INVALID_DATE);
    }

    const today = this.normalizeDate(new Date());

    if (estimatedDate < today) {
      throw new Error(ERROR_MESSAGES.DATE_IN_PAST);
    }

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + DATE_LIMITS.MAX_FUTURE_YEARS);

    if (estimatedDate > maxDate) {
      throw new Error(ERROR_MESSAGES.DATE_TOO_FAR);
    }
  }

  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const orderNumber = await this.orderRepository.nextOrderNumber(year);
    return orderNumber;
  }

  private buildOrderData(input: CreateOrderInput, orderNumber: string): any {
    return {
      orderNumber,
      clientName: input.clientName.trim(),
      description: input.description.trim(),
      location: input.location.trim(),
      state: OrderState.SOLICITUD,
      responsibleId: input.responsibleId || null, // null si no hay técnico asignado
      createdBy: input.createdBy,
      archived: false,
      clientEmail: input.clientEmail?.trim().toLowerCase(),
      clientPhone: input.clientPhone?.trim(),
      estimatedStartDate: input.estimatedStartDate ? new Date(input.estimatedStartDate) : null,
      notes: input.notes?.trim() || null,
    };
  }

  private async createOrder(orderData: any): Promise<Order> {
    try {
      return await this.orderRepository.create(orderData);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error creando orden en BD`, {
        clientName: orderData.clientName,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: CreateOrderInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logOrderCreation(
    order: Order,
    createdBy: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Order',
        entityId: order.id,
        action: AuditAction.CREATE,
        userId: createdBy,
        before: null, // No hay estado anterior en un create
        after: {
          orderNumber: order.orderNumber,
          clientName: order.clientName,
          location: order.location,
          state: order.state,
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: 'Orden de trabajo creada',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}





