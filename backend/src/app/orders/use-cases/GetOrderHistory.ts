/**
 * Use Case: Obtener historial de orden
 * Resuelve: Visualización del historial completo de cambios de una orden
 * 
 * @file backend/src/app/orders/use-cases/GetOrderHistory.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import type { Order } from '../../../domain/entities/Order';
import type { AuditLog } from '../../../domain/entities/AuditLog';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * Historial de orden
 */
export interface OrderHistory {
  order: Order;
  auditLogs: AuditLog[];
  totalChanges: number;
}

/**
 * Error de historial
 */
export class GetOrderHistoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'GetOrderHistoryError';
  }
}

/**
 * Use Case: Obtener Historial de Orden
 * @class GetOrderHistory
 */
export class GetOrderHistory {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(orderId: string): Promise<OrderHistory> {
    try {
      // Validar orderId
      const validatedOrderId = ObjectIdValidator.validate(orderId, 'ID de la orden');

      logger.info('[GetOrderHistory] Obteniendo historial', { orderId: validatedOrderId });

      // 1. Verificar que la orden existe
      const order = await this.orderRepository.findById(validatedOrderId);

      if (!order) {
        throw new GetOrderHistoryError(
          `Orden ${validatedOrderId} no encontrada`,
          'ORDER_NOT_FOUND',
          404
        );
      }

      // 2. Obtener logs de auditoría
      const auditLogs = await this.auditLogRepository.findByEntity('Order', validatedOrderId);

      // 3. Ordenar por fecha (más reciente primero)
      auditLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      logger.info('[GetOrderHistory] Historial obtenido', {
        orderId: validatedOrderId,
        totalChanges: auditLogs.length,
      });

      return {
        order,
        auditLogs,
        totalChanges: auditLogs.length,
      };
    } catch (error) {
      if (error instanceof GetOrderHistoryError || error instanceof ObjectIdValidationError) {
        throw error;
      }

      logger.error('[GetOrderHistory] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new GetOrderHistoryError(
        'Error interno al obtener historial',
        'INTERNAL_ERROR',
        500
      );
    }
  }
}
