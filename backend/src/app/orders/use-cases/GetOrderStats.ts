/**
 * Use Case: Obtener estadísticas de órdenes
 * Resuelve: Dashboard con métricas de órdenes por estado, prioridad, etc.
 * 
 * @file backend/src/app/orders/use-cases/GetOrderStats.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { Order, OrderState } from '../../../domain/entities/Order';
import { logger } from '../../../shared/utils/logger';

/**
 * Estadísticas de órdenes
 */
export interface OrderStats {
  total: number;
  byState: Record<OrderState, number>;
  byPriority: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
  archived: number;
  active: number;
  overdue: number;
  completedThisMonth: number;
  averageCompletionDays: number;
}

/**
 * Filtros para estadísticas
 */
export interface OrderStatsFilters {
  startDate?: Date;
  endDate?: Date;
  responsibleId?: string;
  state?: OrderState;
  archived?: boolean;
  search?: string;
}

/**
 * Use Case: Obtener Estadísticas de órdenes
 * @class GetOrderStats
 */
export class GetOrderStats {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(filters: OrderStatsFilters = {}): Promise<OrderStats> {
    try {
      logger.info('[GetOrderStats] Obteniendo estadísticas', { filters });

      // 1. Obtener todas las órdenes según filtros
      const { orders } = await this.orderRepository.findAll({
        state: filters.state,
        responsibleId: filters.responsibleId,
        archived: filters.archived,
        search: filters.search,
        limit: 10000, // Obtener todas para estadísticas
        skip: 0,
      });

      // 2. Calcular estadísticas por estado
      const byState: Record<OrderState, number> = {
        [OrderState.SOLICITUD]: 0,
        [OrderState.VISITA]: 0,
        [OrderState.PO]: 0,
        [OrderState.PLANEACION]: 0,
        [OrderState.EJECUCION]: 0,
        [OrderState.INFORME]: 0,
        [OrderState.ACTA]: 0,
        [OrderState.SES]: 0,
        [OrderState.FACTURA]: 0,
        [OrderState.PAGO]: 0,
      };

      orders.forEach((order: Order) => {
        if (order.state in byState) {
          byState[order.state]++;
        }
      });

      // 3. Calcular estadísticas por prioridad
      const byPriority = {
        LOW: orders.filter((o: Order) => o.priority === 'LOW').length,
        MEDIUM: orders.filter((o: Order) => o.priority === 'MEDIUM').length,
        HIGH: orders.filter((o: Order) => o.priority === 'HIGH').length,
      };

      // 4. Calcular órdenes archivadas y activas
      const archived = orders.filter((o: Order) => o.archived).length;
      const active = orders.length - archived;

      // 5. Calcular órdenes vencidas
      const now = new Date();
      const overdue = orders.filter(
        (o: Order) => o.dueDate && o.dueDate < now && !o.archived
      ).length;

      // 6. Calcular órdenes completadas este mes
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const completedThisMonth = orders.filter(
        (o: Order) =>
          o.state === OrderState.PAGO &&
          o.updatedAt &&
          o.updatedAt >= startOfMonth
      ).length;

      // 7. Calcular promedio de días para completar
      const completedOrders = orders.filter(
        (o: Order) => o.state === OrderState.PAGO && o.createdAt && o.updatedAt
      );

      let totalDays = 0;
      completedOrders.forEach((order: Order) => {
        if (order.createdAt && order.updatedAt) {
          const days = Math.ceil(
            (order.updatedAt.getTime() - order.createdAt.getTime()) / (1000 * 60 * 60 * 24)
          );
          totalDays += days;
        }
      });

      const averageCompletionDays =
        completedOrders.length > 0 ? Math.round(totalDays / completedOrders.length) : 0;

      const stats: OrderStats = {
        total: orders.length,
        byState,
        byPriority,
        archived,
        active,
        overdue,
        completedThisMonth,
        averageCompletionDays,
      };

      logger.info('[GetOrderStats] Estadísticas calculadas', { stats });

      return stats;
    } catch (error) {
      logger.error('[GetOrderStats] Error obteniendo estadísticas', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }
}
