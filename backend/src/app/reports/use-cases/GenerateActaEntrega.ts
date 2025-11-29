/**
 * Use Case: Generar acta de entrega
 * 
 * Genera un documento PDF formal de acta de entrega para una orden completada.
 * 
 * Requisitos:
 * - La orden debe existir y estar en estado ACTA o posterior
 * - Debe haber al menos un ítem entregado
 * - Representante del cliente y cédula son obligatorios
 * 
 * El PDF generado se almacena automáticamente y se registra en auditoría.
 * 
 * @file backend/src/app/reports/use-cases/GenerateActaEntrega.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IFileStorageService } from '../../../domain/services/IFileStorageService.js';
import type { IPdfGeneratorService, ActaEntregaData } from '../../../domain/services/IPdfGeneratorService.js';
import type { Order } from '../../../domain/entities/Order.js';
import type { User } from '../../../domain/entities/User.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const VALID_STATES_FOR_ACTA = new Set<OrderState>([
  OrderState.ACTA,
  OrderState.SES,
  OrderState.FACTURA,
  OrderState.PAGO,
]);

const VALIDATION_LIMITS = {
  REPRESENTATIVE_NAME: { min: 3, max: 100 },
  ID_NUMBER: { min: 5, max: 20 },
  ITEM_DESCRIPTION: { min: 3, max: 200 },
  ITEM_CONDITION: { min: 2, max: 50 },
  OBSERVATIONS: { max: 1000 },
} as const;

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  MISSING_REPRESENTATIVE: 'El representante del cliente es requerido',
  REPRESENTATIVE_TOO_SHORT: `El nombre del representante debe tener al menos ${VALIDATION_LIMITS.REPRESENTATIVE_NAME.min} caracteres`,
  REPRESENTATIVE_TOO_LONG: `El nombre del representante no puede exceder ${VALIDATION_LIMITS.REPRESENTATIVE_NAME.max} caracteres`,
  MISSING_ID_NUMBER: 'El número de cédula del representante es requerido',
  ID_NUMBER_INVALID: 'El número de cédula debe tener entre 5 y 20 caracteres',
  MISSING_ITEMS: 'Debe proporcionar al menos un ítem entregado',
  ITEM_DESCRIPTION_INVALID: 'La descripción del ítem debe tener entre 3 y 200 caracteres',
  ITEM_QUANTITY_INVALID: 'La cantidad debe ser un número positivo',
  ITEM_CONDITION_INVALID: 'La condición del ítem debe tener entre 2 y 50 caracteres',
  OBSERVATIONS_TOO_LONG: `Las observaciones no pueden exceder ${VALIDATION_LIMITS.OBSERVATIONS.max} caracteres`,
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  INVALID_STATE: (current: OrderState) =>
    `No se puede generar acta para orden en estado ${current}. Estados válidos: ${Array.from(VALID_STATES_FOR_ACTA).join(', ')}`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[GenerateActaEntregaUseCase]',
} as const;

interface DeliveredItem {
  description: string;
  quantity: number;
  condition: string;
}

interface GenerateActaEntregaInput {
  orderId: string;
  clientRepresentative: string;
  clientIdNumber: string;
  deliveredItems: DeliveredItem[];
  observations?: string;
  generatedBy: string;
  ip?: string;
  userAgent?: string;
}

interface GenerateActaEntregaOutput {
  pdfBuffer: Buffer;
  filePath: string;
  fileSize: number;
  generatedAt: Date;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class GenerateActaEntregaUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly pdfGeneratorService: IPdfGeneratorService,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: GenerateActaEntregaInput): Promise<GenerateActaEntregaOutput> {
    this.validateInput(input);

    const order = await this.fetchOrder(input.orderId);
    this.validateOrderState(order);

    const technician = await this.fetchTechnician(order.responsibleId);

    const actaData = this.buildActaData(order, technician, input);
    const pdfBuffer = await this.generatePdf(actaData);

    const filePath = await this.storePdf(order, pdfBuffer);

    const auditContext = this.extractAuditContext(input);
    await this.logActaGeneration(order, input.generatedBy, filePath, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Acta de entrega generada exitosamente`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      filePath,
      fileSize: pdfBuffer.length,
      generatedBy: input.generatedBy,
    });

    return {
      pdfBuffer,
      filePath,
      fileSize: pdfBuffer.length,
      generatedAt: new Date(),
    };
  }

  private validateInput(input: GenerateActaEntregaInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    this.validateRepresentative(input.clientRepresentative);
    this.validateIdNumber(input.clientIdNumber);
    this.validateDeliveredItems(input.deliveredItems);

    if (input.observations) {
      this.validateObservations(input.observations);
    }
  }

  private validateRepresentative(representative: unknown): void {
    if (!representative || typeof representative !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_REPRESENTATIVE);
    }

    const trimmedLength = representative.trim().length;

    if (trimmedLength < VALIDATION_LIMITS.REPRESENTATIVE_NAME.min) {
      throw new Error(ERROR_MESSAGES.REPRESENTATIVE_TOO_SHORT);
    }

    if (trimmedLength > VALIDATION_LIMITS.REPRESENTATIVE_NAME.max) {
      throw new Error(ERROR_MESSAGES.REPRESENTATIVE_TOO_LONG);
    }
  }

  private validateIdNumber(idNumber: unknown): void {
    if (!idNumber || typeof idNumber !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_ID_NUMBER);
    }

    const trimmedLength = idNumber.trim().length;

    if (
      trimmedLength < VALIDATION_LIMITS.ID_NUMBER.min ||
      trimmedLength > VALIDATION_LIMITS.ID_NUMBER.max
    ) {
      throw new Error(ERROR_MESSAGES.ID_NUMBER_INVALID);
    }
  }

  private validateDeliveredItems(items: unknown): void {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_ITEMS);
    }

    for (const item of items) {
      this.validateItem(item);
    }
  }

  private validateItem(item: any): void {
    // Validar descripción
    if (!item.description || typeof item.description !== 'string') {
      throw new Error(ERROR_MESSAGES.ITEM_DESCRIPTION_INVALID);
    }

    const descLength = item.description.trim().length;
    if (
      descLength < VALIDATION_LIMITS.ITEM_DESCRIPTION.min ||
      descLength > VALIDATION_LIMITS.ITEM_DESCRIPTION.max
    ) {
      throw new Error(ERROR_MESSAGES.ITEM_DESCRIPTION_INVALID);
    }

    // Validar cantidad
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new Error(ERROR_MESSAGES.ITEM_QUANTITY_INVALID);
    }

    // Validar condición
    if (!item.condition || typeof item.condition !== 'string') {
      throw new Error(ERROR_MESSAGES.ITEM_CONDITION_INVALID);
    }

    const condLength = item.condition.trim().length;
    if (
      condLength < VALIDATION_LIMITS.ITEM_CONDITION.min ||
      condLength > VALIDATION_LIMITS.ITEM_CONDITION.max
    ) {
      throw new Error(ERROR_MESSAGES.ITEM_CONDITION_INVALID);
    }
  }

  private validateObservations(observations: string): void {
    if (observations.length > VALIDATION_LIMITS.OBSERVATIONS.max) {
      throw new Error(ERROR_MESSAGES.OBSERVATIONS_TOO_LONG);
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

  private validateOrderState(order: Order): void {
    if (!VALID_STATES_FOR_ACTA.has(order.state)) {
      throw new Error(ERROR_MESSAGES.INVALID_STATE(order.state));
    }
  }

  private async fetchTechnician(responsibleId: string | null): Promise<User | null> {
    if (!responsibleId) {
      return null;
    }

    try {
      return await this.userRepository.findById(responsibleId);
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error obteniendo técnico (no crítico)`, {
        responsibleId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return null;
    }
  }

  private buildActaData(
    order: Order,
    technician: User | null,
    input: GenerateActaEntregaInput
  ): ActaEntregaData {
    return {
      orderNumber: order.orderNumber,
      clientName: order.clientName,
      location: order.location ?? 'Sin ubicación',
      description: order.description,
      deliveryDate: new Date(),
      client: {
        name: order.clientName,
        representative: input.clientRepresentative.trim(),
        idNumber: input.clientIdNumber.trim(),
      },
      technician: technician
        ? {
            name: technician.name,
            role: technician.role,
            idNumber: technician.professionalDetails?.idNumber || 'N/A',
          }
        : {
            name: 'No asignado',
            role: 'N/A',
            idNumber: 'N/A',
          },
      deliveredItems: input.deliveredItems.map((item) => ({
        description: item.description.trim(),
        quantity: item.quantity,
        condition: item.condition.trim(),
      })),
      observations: input.observations?.trim(),
      signatures: {
        client: false,
        technician: false,
      },
    };
  }

  private async generatePdf(actaData: ActaEntregaData): Promise<Buffer> {
    try {
      return await this.pdfGeneratorService.generateActaEntrega(actaData);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error generando PDF`, {
        orderNumber: actaData.orderNumber,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private async storePdf(order: Order, pdfBuffer: Buffer): Promise<string> {
    try {
      const fileName = `acta-entrega-${order.orderNumber}-${Date.now()}.pdf`;
      const filePath = await this.fileStorageService.upload(fileName, pdfBuffer, 'application/pdf');

      return filePath;
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error almacenando PDF`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: GenerateActaEntregaInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logActaGeneration(
    order: Order,
    generatedBy: string,
    filePath: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Order',
        entityId: order.id,
        action: AuditAction.GENERATE_ACTA,
        userId: generatedBy,
        before: null,
        after: {
          actaGenerated: true,
          actaFilePath: filePath,
          generatedAt: new Date(),
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: 'Acta de entrega generada',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}



