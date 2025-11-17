/**
 * Use Case: Obtener historial de orden
 * Resuelve: Visualizaci�n del historial completo de cambios de una orden
 * 
 * @file backend/src/app/orders/use-cases/GetOrderHistory.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import type { AuditLog } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator.js';

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

      // 2. Obtener logs de auditor�a
      const auditLogs = await this.auditLogRepository.findByEntity('Order', validatedOrderId);

      // 3. Ordenar por fecha (m�s reciente primero)
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
