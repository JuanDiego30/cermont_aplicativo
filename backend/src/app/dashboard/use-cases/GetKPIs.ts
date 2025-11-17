import { OrderState } from '../../../domain/entities/Order.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { Order } from '../../../domain/entities/Order.js';

/**
 * Estructura de datos para las métricas KPI del sistema
 * @interface SystemMetrics
 */
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

/**
 * Caso de uso: Obtener KPIs (Key Performance Indicators) del sistema
 * Calcula métricas de rendimiento basadas en el estado y ciclo de vida de las órdenes
 * @class GetKPIs
 * @since 1.0.0
 */
export class GetKPIs {
  private static readonly MAX_ORDERS_FETCH = 10_000;
  private static readonly DELAY_THRESHOLD_DAYS = 30;
  private static readonly MS_PER_DAY = 86_400_000; // 1000 * 60 * 60 * 24
  private static readonly FINAL_STATES = new Set<OrderState>([OrderState.PAGO]);
  private static readonly DECIMAL_PRECISION = 100;

  constructor(private readonly orderRepository: IOrderRepository) {}

  /**
   * Ejecuta el cálculo de KPIs del sistema
   * @returns {Promise<SystemMetrics>} Métricas calculadas con datos actualizados
   * @throws {Error} Si hay error al obtener datos del repositorio
   */
  async execute(): Promise<SystemMetrics> {
    try {
      const [orders, totalCount] = await this.fetchOrdersData();

      if (totalCount === 0) {
        return this.buildEmptyMetrics();
      }

      const ordersByState = this.initializeStateCounter();
      const completedOrders = this.categorizeOrdersByState(orders, ordersByState);

      const metrics: SystemMetrics = {
        totalOrders: totalCount,
        ordersByState,
        averageCycleTimeDays: this.calculateAverageCycleTime(completedOrders),
        completionRatePercentage: this.calculateCompletionRate(completedOrders.length, totalCount),
        pendingApprovals: ordersByState[OrderState.ACTA] ?? 0,
        delayedOrders: this.countDelayedOrders(orders),
        lastUpdated: new Date(),
      };

      return metrics;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[GetKPIs] Error al calcular KPIs:', errorMessage);
      throw new Error(`No se pudieron calcular las métricas del sistema: ${errorMessage}`);
    }
  }

  /**
   * Obtiene las órdenes y el total desde el repositorio de forma paralela
   * @private
   * @returns {Promise<[Order[], number]>} Tupla con array de órdenes y total
   */
  private async fetchOrdersData(): Promise<[Order[], number]> {
    return Promise.all([
      this.orderRepository.find({ limit: GetKPIs.MAX_ORDERS_FETCH, skip: 0 }),
      this.orderRepository.count({}),
    ]);
  }

  /**
   * Inicializa el contador de estados con valor 0 para cada estado del enum
   * @private
   * @returns {Record<OrderState, number>} Objeto con todos los estados inicializados en 0
   */
  private initializeStateCounter(): Record<OrderState, number> {
    return Object.values(OrderState).reduce(
      (acc, state) => {
        acc[state as OrderState] = 0;
        return acc;
      },
      {} as Record<OrderState, number>
    );
  }

  /**
   * Categoriza las órdenes por estado y extrae las completadas
   * @private
   * @param {Order[]} orders - Array de órdenes a categorizar
   * @param {Record<OrderState, number>} ordersByState - Contador de estados a actualizar (mutable)
   * @returns {Order[]} Array de órdenes completadas (estado PAGO)
   */
  private categorizeOrdersByState(
    orders: Order[],
    ordersByState: Record<OrderState, number>
  ): Order[] {
    const completedOrders: Order[] = [];

    for (const order of orders) {
      ordersByState[order.state] = (ordersByState[order.state] ?? 0) + 1;

      if (order.state === OrderState.PAGO) {
        completedOrders.push(order);
      }
    }

    return completedOrders;
  }

  /**
   * Calcula el tiempo promedio de ciclo en días para órdenes completadas
   * @private
   * @param {Order[]} completedOrders - Array de órdenes completadas (estado PAGO)
   * @returns {number} Tiempo promedio en días (redondeado a entero)
   */
  private calculateAverageCycleTime(completedOrders: Order[]): number {
    if (completedOrders.length === 0) {
      return 0;
    }

    const totalCycleTimeMs = completedOrders.reduce((sum, order) => {
      const cycleTimeMs = order.updatedAt.getTime() - order.createdAt.getTime();
      return sum + cycleTimeMs;
    }, 0);

    const averageCycleTimeMs = totalCycleTimeMs / completedOrders.length;
    const averageCycleTimeDays = averageCycleTimeMs / GetKPIs.MS_PER_DAY;

    return Math.round(averageCycleTimeDays);
  }

  /**
   * Calcula la tasa de completitud en porcentaje
   * @private
   * @param {number} completedCount - Cantidad de órdenes completadas
   * @param {number} totalCount - Total de órdenes en el sistema
   * @returns {number} Porcentaje de completitud con 2 decimales (0.00-100.00)
   */
  private calculateCompletionRate(completedCount: number, totalCount: number): number {
    if (totalCount === 0) {
      return 0;
    }

    const ratePercentage = (completedCount / totalCount) * 100;
    return Math.round(ratePercentage * GetKPIs.DECIMAL_PRECISION) / GetKPIs.DECIMAL_PRECISION;
  }

  /**
   * Cuenta las órdenes con retraso (más de 30 días sin completar)
   * Solo considera órdenes activas que no estén en estado final (PAGO)
   * @private
   * @param {Order[]} orders - Array de todas las órdenes del sistema
   * @returns {number} Cantidad de órdenes con retraso
   */
  private countDelayedOrders(orders: Order[]): number {
    const nowMs = Date.now();
    const thresholdMs = GetKPIs.DELAY_THRESHOLD_DAYS * GetKPIs.MS_PER_DAY;

    return orders.reduce((delayedCount, order) => {
      if (GetKPIs.FINAL_STATES.has(order.state)) {
        return delayedCount;
      }

      const ageMs = nowMs - order.createdAt.getTime();

      return ageMs > thresholdMs ? delayedCount + 1 : delayedCount;
    }, 0);
  }

  /**
   * Construye métricas vacías cuando no hay datos disponibles en el sistema
   * @private
   * @returns {SystemMetrics} Objeto de métricas con todos los valores en 0
   */
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





