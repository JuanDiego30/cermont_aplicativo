/**
 * Use Case: Obtener estadísticas de órdenes
 * 
 * Calcula métricas y estadísticas agregadas de órdenes usando queries
 * SQL eficientes en vez de cargar datos en memoria.
 * 
 * Características:
 * - Cálculos en BD (GROUP BY, COUNT, AVG)
 * - Caché de resultados (5 minutos)
 * - Filtros por rango de fechas, responsable, estado
 * - Comparación con periodo anterior
 * 
 * @file backend/src/app/orders/use-cases/GetOrderStats.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { ICacheService } from '../../../domain/services/ICacheService.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { logger } from '../../../shared/utils/logger.js';

const CACHE_TTL_SECONDS = 300; // 5 minutos

const ERROR_MESSAGES = {
  INVALID_DATE_RANGE: 'La fecha de inicio debe ser anterior a la fecha de fin',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[GetOrderStatsUseCase]',
} as const;

interface GetOrderStatsInput {
  startDate?: Date;
  endDate?: Date;
  responsibleId?: string;
  includeArchived?: boolean;
  compareWithPrevious?: boolean; // Comparar con periodo anterior
}

export interface OrderStats {
  total: number;
  byState: Record<OrderState, number>;
  stateGroups: {
    pending: number; // SOLICITUD, VISITA, PO
    inProgress: number; // PLANEACION, EJECUCION, INFORME
    closing: number; // ACTA, SES, FACTURA
    completed: number; // PAGO
  };
  byResponsible: Array<{
    responsibleId: string;
    responsibleName: string;
    count: number;
  }>;
  archived: number;
  active: number;
  completedThisMonth: number;
  completedThisWeek: number;
  averageCompletionDays: number;
  medianCompletionDays: number;
}

interface GetOrderStatsOutput {
  stats: OrderStats;
  comparison?: {
    previous: Partial<OrderStats>;
    changes: {
      total: number; // % de cambio
      completed: number;
      averageCompletionDays: number;
    };
  };
  metadata: {
    generatedAt: Date;
    period: {
      startDate?: Date;
      endDate?: Date;
    };
    filters: {
      responsibleId?: string;
      includeArchived: boolean;
    };
  };
}

export class GetOrderStatsUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly cacheService: ICacheService
  ) {}

  async execute(input: GetOrderStatsInput = {}): Promise<GetOrderStatsOutput> {
    this.validateInput(input);

    // Intentar obtener de caché
    const cacheKey = this.buildCacheKey(input);
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    const stats = await this.calculateStats(input);

    let comparison;
    if (input.compareWithPrevious) {
      comparison = await this.calculateComparison(input, stats);
    }

    const result: GetOrderStatsOutput = {
      stats,
      comparison,
      metadata: {
        generatedAt: new Date(),
        period: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
        filters: {
          responsibleId: input.responsibleId,
          includeArchived: input.includeArchived || false,
        },
      },
    };

    await this.saveToCache(cacheKey, result);

    logger.info(`${LOG_CONTEXT.USE_CASE} Estadísticas calculadas`, {
      total: stats.total,
      period: input.startDate && input.endDate ? 'custom' : 'all',
    });

    return result;
  }

  private validateInput(input: GetOrderStatsInput): void {
    if (input.startDate && input.endDate && input.startDate > input.endDate) {
      throw new Error(ERROR_MESSAGES.INVALID_DATE_RANGE);
    }
  }

  private buildCacheKey(input: GetOrderStatsInput): string {
    const parts = [
      'order-stats',
      input.startDate?.toISOString() || 'all',
      input.endDate?.toISOString() || 'all',
      input.responsibleId || 'all',
      input.includeArchived ? 'archived' : 'active',
    ];
    return parts.join(':');
  }

  private async getFromCache(cacheKey: string): Promise<GetOrderStatsOutput | null> {
    try {
      return await this.cacheService.get<GetOrderStatsOutput>(cacheKey);
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error obteniendo de caché (continuando)`, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return null;
    }
  }

  private async calculateStats(input: GetOrderStatsInput): Promise<OrderStats> {
    // Todas estas queries se ejecutan en paralelo
    const [
      total,
      byState,
      byResponsibleRecord,
      archived,
      completedThisMonth,
      completedThisWeek,
      completionStats,
    ] = await Promise.all([
      this.orderRepository.countOrders(input),
      this.orderRepository.countByState(input),
      this.orderRepository.countByResponsible(input),
      this.orderRepository.countArchived(input),
      this.orderRepository.countCompletedThisMonth(input),
      this.orderRepository.countCompletedThisWeek(input),
      this.orderRepository.getCompletionStats(input),
    ]);

    const stateGroups = this.groupStatesByPhase(byState);
    const active = total - archived;

    // Transformar Record<string, number> a array de objetos
    const byResponsible = Object.entries(byResponsibleRecord).map(([id, count]) => ({
      responsibleId: id,
      responsibleName: id, // El nombre real se obtendría con un join en la query del repository
      count,
    }));

    return {
      total,
      byState,
      stateGroups,
      byResponsible,
      archived,
      active,
      completedThisMonth,
      completedThisWeek,
      averageCompletionDays: completionStats.average,
      medianCompletionDays: completionStats.median,
    };
  }

  private groupStatesByPhase(byState: Record<OrderState, number>): OrderStats['stateGroups'] {
    return {
      pending:
        (byState[OrderState.SOLICITUD] || 0) +
        (byState[OrderState.VISITA] || 0) +
        (byState[OrderState.PO] || 0),
      inProgress:
        (byState[OrderState.PLANEACION] || 0) +
        (byState[OrderState.EJECUCION] || 0) +
        (byState[OrderState.INFORME] || 0),
      closing:
        (byState[OrderState.ACTA] || 0) +
        (byState[OrderState.SES] || 0) +
        (byState[OrderState.FACTURA] || 0),
      completed: byState[OrderState.PAGO] || 0,
    };
  }

  private async calculateComparison(
    input: GetOrderStatsInput,
    currentStats: OrderStats
  ): Promise<GetOrderStatsOutput['comparison']> {
    try {
      // Calcular periodo anterior
      const previousInput = this.getPreviousPeriod(input);
      const previousStats = await this.calculateStats(previousInput);

      const totalChange = this.calculatePercentageChange(
        previousStats.total,
        currentStats.total
      );

      const completedChange = this.calculatePercentageChange(
        previousStats.stateGroups.completed,
        currentStats.stateGroups.completed
      );

      const completionDaysChange = this.calculatePercentageChange(
        previousStats.averageCompletionDays,
        currentStats.averageCompletionDays
      );

      return {
        previous: {
          total: previousStats.total,
          completedThisMonth: previousStats.completedThisMonth,
          averageCompletionDays: previousStats.averageCompletionDays,
        },
        changes: {
          total: totalChange,
          completed: completedChange,
          averageCompletionDays: completionDaysChange,
        },
      };
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error calculando comparación (no crítico)`, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return undefined;
    }
  }

  private getPreviousPeriod(input: GetOrderStatsInput): GetOrderStatsInput {
    if (!input.startDate || !input.endDate) {
      // Si no hay rango de fechas, comparar último mes con mes anterior
      const now = new Date();
      const endDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      return {
        ...input,
        startDate,
        endDate,
      };
    }

    // Calcular la diferencia en días entre startDate y endDate
    const diffDays = Math.ceil(
      (input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Restar esa misma cantidad de días para obtener el periodo anterior
    const previousEndDate = new Date(input.startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);

    const previousStartDate = new Date(previousEndDate);
    previousStartDate.setDate(previousStartDate.getDate() - diffDays + 1);

    return {
      ...input,
      startDate: previousStartDate,
      endDate: previousEndDate,
    };
  }

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  private async saveToCache(cacheKey: string, result: GetOrderStatsOutput): Promise<void> {
    try {
      await this.cacheService.set(cacheKey, result, CACHE_TTL_SECONDS);
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error guardando en caché (no crítico)`, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

