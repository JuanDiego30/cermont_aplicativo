import { OrderState } from '../../../domain/entities/Order.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import { logger } from '../../../shared/utils/logger.js';

const KPI_CONFIG = {
  MAX_ORDERS_FETCH: 10_000,
  DELAY_THRESHOLD_DAYS: 30,
  COMPLETION_DECIMAL_PRECISION: 2,
} as const;

const TIME_CONSTANTS = {
  MS_PER_DAY: 24 * 60 * 60 * 1000,
} as const;

const COMPLETED_STATES = new Set<OrderState>([OrderState.PAGO]);

const LOG_CONTEXT = {
  USE_CASE: '[GetKPIsUseCase]',
} as const;

interface SystemMetrics {
  /** Total de órdenes en el sistema */
  totalOrders: number;
  /** Órdenes agrupadas por estado */
  ordersByState: Record<OrderState, number>;
  /** Tiempo promedio de ciclo en días (órdenes completadas) */
  averageCycleTimeDays: number;
  /** Tasa de completitud en porcentaje (0-100) */
  completionRatePercentage: number;
  /** Órdenes pendientes de aprobación (estado ACTA) */
  pendingApprovals: number;
  /** Órdenes con retraso (más de 30 días sin completar) */
  delayedOrders: number;
  /** Última actualización de métricas */
  lastUpdated: Date;
}

interface OrderMetrics {
  ordersByState: Record<OrderState, number>;
  completedOrders: Order[];
  delayedOrders: number;
}

export class GetKPIsUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<SystemMetrics> {
    try {
      const [orders, totalCount] = await this.fetchOrdersData();

      if (totalCount === 0) {
        logger.info(`${LOG_CONTEXT.USE_CASE} Sin órdenes en el sistema`);
        return this.buildEmptyMetrics();
      }

      const orderMetrics = this.analyzeOrders(orders);

      const metrics: SystemMetrics = {
        totalOrders: totalCount,
        ordersByState: orderMetrics.ordersByState,
        averageCycleTimeDays: this.calculateAverageCycleTime(orderMetrics.completedOrders),
        completionRatePercentage: this.calculateCompletionRate(
          orderMetrics.completedOrders.length,
          totalCount
        ),
        pendingApprovals: orderMetrics.ordersByState[OrderState.ACTA] ?? 0,
        delayedOrders: orderMetrics.delayedOrders,
        lastUpdated: new Date(),
      };

      logger.info(`${LOG_CONTEXT.USE_CASE} KPIs calculados exitosamente`, {
        totalOrders: metrics.totalOrders,
        completionRate: metrics.completionRatePercentage,
        delayedOrders: metrics.delayedOrders,
      });

      return metrics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`${LOG_CONTEXT.USE_CASE} Error al calcular KPIs`, { error: errorMessage });
      throw new Error(`No se pudieron calcular las métricas del sistema: ${errorMessage}`);
    }
  }

  private async fetchOrdersData(): Promise<[Order[], number]> {
    return Promise.all([
      this.orderRepository.find({ limit: KPI_CONFIG.MAX_ORDERS_FETCH, skip: 0 }),
      this.orderRepository.count({}),
    ]);
  }

  private analyzeOrders(orders: Order[]): OrderMetrics {
    const ordersByState = this.initializeStateCounter();
    const completedOrders: Order[] = [];
    const nowMs = Date.now();
    const delayThresholdMs = KPI_CONFIG.DELAY_THRESHOLD_DAYS * TIME_CONSTANTS.MS_PER_DAY;
    let delayedCount = 0;

    for (const order of orders) {
      ordersByState[order.state] = (ordersByState[order.state] ?? 0) + 1;

      if (this.isOrderCompleted(order)) {
        completedOrders.push(order);
      } else if (this.isOrderDelayed(order, nowMs, delayThresholdMs)) {
        delayedCount++;
      }
    }

    return {
      ordersByState,
      completedOrders,
      delayedOrders: delayedCount,
    };
  }

  private initializeStateCounter(): Record<OrderState, number> {
    return Object.values(OrderState).reduce(
      (acc, state) => {
        acc[state as OrderState] = 0;
        return acc;
      },
      {} as Record<OrderState, number>
    );
  }

  private isOrderCompleted(order: Order): boolean {
    return COMPLETED_STATES.has(order.state);
  }

  private isOrderDelayed(order: Order, nowMs: number, thresholdMs: number): boolean {
    if (COMPLETED_STATES.has(order.state)) {
      return false;
    }

    const ageMs = nowMs - order.createdAt.getTime();
    return ageMs > thresholdMs;
  }

  private calculateAverageCycleTime(completedOrders: Order[]): number {
    if (completedOrders.length === 0) {
      return 0;
    }

    const totalCycleTimeMs = completedOrders.reduce((sum, order) => {
      const cycleTimeMs = order.updatedAt.getTime() - order.createdAt.getTime();
      return sum + cycleTimeMs;
    }, 0);

    const averageCycleTimeMs = totalCycleTimeMs / completedOrders.length;
    return Math.round(averageCycleTimeMs / TIME_CONSTANTS.MS_PER_DAY);
  }

  private calculateCompletionRate(completedCount: number, totalCount: number): number {
    if (totalCount === 0) {
      return 0;
    }

    const ratePercentage = (completedCount / totalCount) * 100;
    const multiplier = Math.pow(10, KPI_CONFIG.COMPLETION_DECIMAL_PRECISION);
    return Math.round(ratePercentage * multiplier) / multiplier;
  }

  private buildEmptyMetrics(): SystemMetrics {
    return {
      totalOrders: 0,
      ordersByState: this.initializeStateCounter(),
      averageCycleTimeDays: 0,
      completionRatePercentage: 0,
      pendingApprovals: 0,
      delayedOrders: 0,
      lastUpdated: new Date(),
    };
  }
}






