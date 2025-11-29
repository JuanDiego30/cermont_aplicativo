/**
 * Use Case: Obtener orden por ID
 * 
 * Busca una orden específica por su ID y retorna todos sus datos.
 * 
 * Opciones:
 * - Incluir work plans asociados
 * - Incluir evidencias asociadas
 * - Incluir historial de auditoría
 * 
 * @file backend/src/app/orders/use-cases/GetOrderById.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import { logger } from '../../../shared/utils/logger.js';

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  EMPTY_ORDER_ID: 'El ID de la orden no puede estar vacío',
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[GetOrderByIdUseCase]',
} as const;

interface GetOrderByIdInput {
  orderId: string;
  includeWorkPlans?: boolean;
  includeEvidences?: boolean;
  includeAuditLog?: boolean;
}

interface GetOrderByIdOutput {
  order: Order;
  workPlans?: any[]; // Tipado según tu entidad WorkPlan
  evidences?: any[]; // Tipado según tu entidad Evidence
  auditLog?: any[]; // Tipado según tu entidad AuditLog
}

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: GetOrderByIdInput): Promise<GetOrderByIdOutput> {
    this.validateInput(input);

    const order = await this.fetchOrder(input.orderId);

    const result: GetOrderByIdOutput = { order };

    // Incluir relaciones opcionales
    if (input.includeWorkPlans) {
      result.workPlans = await this.fetchWorkPlans(order.id);
    }

    if (input.includeEvidences) {
      result.evidences = await this.fetchEvidences(order.id);
    }

    if (input.includeAuditLog) {
      result.auditLog = await this.fetchAuditLog(order.id);
    }

    return result;
  }

  private validateInput(input: GetOrderByIdInput): void {
    if (!input.orderId || typeof input.orderId !== 'string') {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (input.orderId.trim() === '') {
      throw new Error(ERROR_MESSAGES.EMPTY_ORDER_ID);
    }
  }

  private async fetchOrder(orderId: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        logger.warn(`${LOG_CONTEXT.USE_CASE} Orden no encontrada`, { orderId });
        throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND(orderId));
      }

      return order;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown';
      if (errorMessage.includes('no encontrada')) {
        throw error;
      }

      logger.error(`${LOG_CONTEXT.USE_CASE} Error obteniendo orden`, {
        orderId,
        error: errorMessage,
      });
      throw error;
    }
  }

  private async fetchWorkPlans(orderId: string): Promise<any[]> {
    try {
      return await this.orderRepository.findWorkPlansByOrderId(orderId);
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error obteniendo work plans (no crítico)`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return [];
    }
  }

  private async fetchEvidences(orderId: string): Promise<any[]> {
    try {
      return await this.orderRepository.findEvidencesByOrderId(orderId);
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error obteniendo evidencias (no crítico)`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return [];
    }
  }

  private async fetchAuditLog(orderId: string): Promise<any[]> {
    try {
      return await this.orderRepository.findAuditLogByOrderId(orderId);
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error obteniendo audit log (no crítico)`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return [];
    }
  }
}






