/**
 * Stats Service (TypeScript - November 2025 - FIXED)
 * @description Servicio centralizado para métricas CERMONT ATG
 */

import User from '../models/User';
import Order from '../models/Order';
import { logger } from '../utils/logger';
import { ORDER_STATUS } from '../utils/constants';
import cacheService from './cache.service';

// ==================== TYPE DEFINITIONS ====================

type OrderStatusType = 'pending' | 'planning' | 'in_progress' | 'completed' | 'cancelled';

interface SystemOverview {
  users: UserStats;
  orders: OrderStatsExtended;
  performance: PerformanceStats;
  activity: ActivityStats;
  generatedAt: Date;
}

interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Array<{ _id: string; count: number }>;
  newThisMonth: number;
  growth: Array<{ month: string; count: number }>;
}

interface OrderStatsExtended {
  total: number;
  byStatus: Partial<Record<OrderStatusType, number>>;
  completedThisMonth: number;
  overdue: number;
  averageCompletionTime: { averageDays: number; minDays: number; maxDays: number };
  costs: {
    totalEstimated: number;
    totalReal: number;
    averageEstimated: number;
    averageReal: number;
    profitMargin: number;
  };
}

interface PerformanceStats {
  completionRate: number;
  averageResponseTime: number;
  onTimeCompletion: number;
  userProductivity: Array<{
    userId: string;
    nombre: string;
    completedOrders: number;
    totalEstimatedCost: number;
    totalRealCost: number;
    efficiency: number;
  }>;
}

interface ActivityStats {
  last24h: { newOrders: number; newUsers: number };
  last7d: { newOrders: number; newUsers: number };
  last30d: { newOrders: number; newUsers: number };
}

interface Filters {
  fechaDesde?: Date;
  fechaHasta?: Date;
  rol?: string;
  estado?: OrderStatusType;
}

// ==================== STATS SERVICE CLASS ====================

class StatsServiceClass {
  /**
   * Obtener estadísticas generales del sistema
   */
  async getSystemOverview(filters: Partial<Filters> = {}): Promise<SystemOverview> {
    try {
      const cacheKey = `stats:system:overview:${JSON.stringify(filters)}`;
      return await cacheService.wrap(cacheKey, async () => {
        const [userStats, orderStats, performanceStats, activityStats] = await Promise.all([
          this.getUserStats(filters),
          this.getOrderStatsInternal(filters),
          this.getPerformanceStats(filters),
          this.getActivityStats(filters),
        ]);

        return {
          users: userStats,
          orders: orderStats,
          performance: performanceStats,
          activity: activityStats,
          generatedAt: new Date(),
        };
      }, 300);
    } catch (error) {
      logger.error('[StatsService] Error obteniendo overview del sistema:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats(filters: Partial<Filters> = {}): Promise<UserStats> {
    try {
      const cacheKey = `stats:users:${JSON.stringify(filters)}`;
      return await cacheService.wrap(cacheKey, async () => {
        const baseFilter = { ...filters };
        const [totalUsers, activeUsers, usersByRole, newUsersThisMonth, userGrowth] = await Promise.all([
          User.countDocuments(baseFilter),
          User.countDocuments({ ...baseFilter, activo: true }),
          User.aggregate([
            { $match: { ...baseFilter, activo: true } },
            { $group: { _id: '$rol', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
          User.countDocuments({
            ...baseFilter,
            createdAt: { $gte: this.getMonthStart(-1) },
          }),
          this.getUserGrowthStatsInternal(),
        ]);

        return {
          total: totalUsers,
          active: activeUsers,
          inactive: totalUsers - activeUsers,
          byRole: usersByRole,
          newThisMonth: newUsersThisMonth,
          growth: userGrowth,
        };
      }, 300);
    } catch (error) {
      logger.error('[StatsService] Error obteniendo estadísticas de usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de órdenes (internal)
   */
  private async getOrderStatsInternal(filters: Partial<Filters> = {}): Promise<OrderStatsExtended> {
    try {
      const baseFilter = { isActive: true, isArchived: false, ...filters };
      
      const [total, byStatus, completedThisMonth, overdue, avgCompletion, costStats] = await Promise.all([
        Order.countDocuments(baseFilter),
        this.getOrdersByStatusInternal(baseFilter),
        Order.countDocuments({
          ...baseFilter,
          estado: ORDER_STATUS.COMPLETED,
          fechaFinReal: { $gte: this.getMonthStart(-1) },
        }),
        Order.countDocuments({
          ...baseFilter,
          fechaFinEstimada: { $lt: new Date() },
          fechaFinReal: null,
          estado: { $in: ['pending', 'planning', 'in_progress'] },
        }),
        this.getAverageCompletionTimeInternal(),
        this.getOrderCostStatsInternal(baseFilter),
      ]);

      return {
        total,
        byStatus,
        completedThisMonth,
        overdue,
        averageCompletionTime: avgCompletion,
        costs: costStats,
      };
    } catch (error) {
      logger.error('[StatsService] Error obteniendo estadísticas de órdenes:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de rendimiento
   */
  async getPerformanceStats(filters: Partial<Filters> = {}): Promise<PerformanceStats> {
    try {
      const cacheKey = `stats:performance:${JSON.stringify(filters)}`;
      return await cacheService.wrap(cacheKey, async () => {
        const [completionRate, avgResponseTime, onTimeCompletion, userProductivity] = await Promise.all([
          this.getCompletionRateInternal(),
          this.getAverageResponseTimeInternal(),
          this.getOnTimeCompletionRateInternal(),
          this.getUserProductivityStatsInternal(),
        ]);

        return {
          completionRate,
          averageResponseTime: avgResponseTime,
          onTimeCompletion,
          userProductivity,
        };
      }, 600);
    } catch (error) {
      logger.error('[StatsService] Error obteniendo estadísticas de rendimiento:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de actividad reciente
   */
  async getActivityStats(filters: Partial<Filters> = {}): Promise<ActivityStats> {
    try {
      const cacheKey = `stats:activity:${JSON.stringify(filters)}`;
      return await cacheService.wrap(cacheKey, async () => {
        const now = new Date();
        const periods = [
          { key: 'last24h' as const, start: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          { key: 'last7d' as const, start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
          { key: 'last30d' as const, start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        ];

        const promises = periods.flatMap(({ start }) => [
          Order.countDocuments({ createdAt: { $gte: start }, ...filters }),
          User.countDocuments({ createdAt: { $gte: start }, ...filters }),
        ]);
        const counts = await Promise.all(promises);

        const activity: ActivityStats = {
          last24h: { newOrders: counts[0], newUsers: counts[1] },
          last7d: { newOrders: counts[2], newUsers: counts[3] },
          last30d: { newOrders: counts[4], newUsers: counts[5] },
        };

        return activity;
      }, 300);
    } catch (error) {
      logger.error('[StatsService] Error obteniendo estadísticas de actividad:', error);
      throw error;
    }
  }

  /**
   * Limpiar cache de estadísticas
   */
  async clearStatsCache(): Promise<void> {
    try {
      await cacheService.delPattern('stats:*');
      logger.info('[StatsService] Cache de estadísticas limpiado');
    } catch (error) {
      logger.error('[StatsService] Error limpiando cache de estadísticas:', error);
      throw error;
    }
  }

  // ==================== PRIVATE HELPERS ====================

  private async getUserGrowthStatsInternal(): Promise<Array<{ month: string; count: number }>> {
    try {
      const months: Date[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        months.push(date);
      }

      const growthData = await Promise.all(
        months.map(async (startDate, index) => {
          const endDate = index === months.length - 1 ? new Date() : months[index + 1];
          const count = await User.countDocuments({
            createdAt: { $gte: startDate, $lt: endDate },
          });
          return {
            month: startDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
            count,
          };
        })
      );

      return growthData;
    } catch (error) {
      logger.error('[StatsService] Error obteniendo crecimiento de usuarios:', error);
      return [];
    }
  }

  private async getOrdersByStatusInternal(baseFilter: any): Promise<Partial<Record<OrderStatusType, number>>> {
    try {
      const statuses: OrderStatusType[] = ['pending', 'planning', 'in_progress', 'completed', 'cancelled'];
      const statusCounts = await Promise.all(
        statuses.map((status) => Order.countDocuments({ ...baseFilter, estado: status }))
      );

      const byStatus: Partial<Record<OrderStatusType, number>> = {};
      statuses.forEach((status, i) => {
        byStatus[status] = statusCounts[i];
      });

      return byStatus;
    } catch (error) {
      logger.error('[StatsService] Error obteniendo órdenes por estado:', error);
      return {};
    }
  }

  private async getAverageCompletionTimeInternal(): Promise<{ averageDays: number; minDays: number; maxDays: number }> {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            estado: ORDER_STATUS.COMPLETED,
            fechaInicio: { $exists: true },
            fechaFinReal: { $exists: true },
          },
        },
        {
          $project: {
            duration: {
              $divide: [{ $subtract: ['$fechaFinReal', '$fechaInicio'] }, 1000 * 60 * 60 * 24],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageDays: { $avg: '$duration' },
            minDays: { $min: '$duration' },
            maxDays: { $max: '$duration' },
          },
        },
      ]);

      return result[0] || { averageDays: 0, minDays: 0, maxDays: 0 };
    } catch (error) {
      logger.error('[StatsService] Error obteniendo tiempo promedio:', error);
      return { averageDays: 0, minDays: 0, maxDays: 0 };
    }
  }

  private async getOrderCostStatsInternal(baseFilter: any): Promise<OrderStatsExtended['costs']> {
    try {
      const result = await Order.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: null,
            totalEstimated: { $sum: '$costoEstimado' },
            totalReal: { $sum: '$costoReal' },
            averageEstimated: { $avg: '$costoEstimado' },
            averageReal: { $avg: '$costoReal' },
          },
        },
      ]);

      const stats = result[0] || { totalEstimated: 0, totalReal: 0, averageEstimated: 0, averageReal: 0 };
      const profitMargin = stats.totalEstimated > 0 
        ? ((stats.totalReal - stats.totalEstimated) / stats.totalEstimated) * 100 
        : 0;

      return {
        totalEstimated: stats.totalEstimated || 0,
        totalReal: stats.totalReal || 0,
        averageEstimated: stats.averageEstimated || 0,
        averageReal: stats.averageReal || 0,
        profitMargin,
      };
    } catch (error) {
      logger.error('[StatsService] Error obteniendo costos:', error);
      return { totalEstimated: 0, totalReal: 0, averageEstimated: 0, averageReal: 0, profitMargin: 0 };
    }
  }

  private async getCompletionRateInternal(): Promise<number> {
    try {
      const total = await Order.countDocuments({ isActive: true, isArchived: false });
      const completed = await Order.countDocuments({
        isActive: true,
        isArchived: false,
        estado: ORDER_STATUS.COMPLETED,
      });
      return total > 0 ? (completed / total) * 100 : 0;
    } catch (error) {
      logger.error('[StatsService] Error obteniendo tasa de completitud:', error);
      return 0;
    }
  }

  private async getAverageResponseTimeInternal(): Promise<number> {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            asignadoA: { $exists: true, $ne: [] },
            createdAt: { $exists: true },
          },
        },
        {
          $project: {
            responseTime: {
              $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60],
            },
          },
        },
        {
          $group: { _id: null, averageHours: { $avg: '$responseTime' } },
        },
      ]);

      return Math.round(result[0]?.averageHours || 0);
    } catch (error) {
      logger.error('[StatsService] Error obteniendo tiempo de respuesta:', error);
      return 0;
    }
  }

  private async getOnTimeCompletionRateInternal(): Promise<number> {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            estado: ORDER_STATUS.COMPLETED,
            fechaFinEstimada: { $exists: true },
            fechaFinReal: { $exists: true },
          },
        },
        {
          $group: {
            _id: null,
            completed: { $sum: 1 },
            onTime: {
              $sum: {
                $cond: [{ $lte: ['$fechaFinReal', '$fechaFinEstimada'] }, 1, 0],
              },
            },
          },
        },
      ]);
      const stats = result[0] || { completed: 0, onTime: 0 };
      return stats.completed > 0 ? (stats.onTime / stats.completed) * 100 : 0;
    } catch (error) {
      logger.error('[StatsService] Error obteniendo tasa a tiempo:', error);
      return 0;
    }
  }

  private async getUserProductivityStatsInternal(): Promise<PerformanceStats['userProductivity']> {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            asignadoA: { $exists: true, $ne: [] },
            estado: ORDER_STATUS.COMPLETED,
          },
        },
        { $unwind: '$asignadoA' },
        {
          $lookup: {
            from: 'users',
            localField: 'asignadoA',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: '$user._id',
            nombre: { $first: '$user.nombre' },
            completedOrders: { $sum: 1 },
            totalEstimatedCost: { $sum: '$costoEstimado' },
            totalRealCost: { $sum: '$costoReal' },
          },
        },
        { $sort: { completedOrders: -1 } },
        { $limit: 10 },
      ]);

      return result.map((user: any) => ({
        userId: user._id.toString(),
        nombre: user.nombre,
        completedOrders: user.completedOrders,
        totalEstimatedCost: user.totalEstimatedCost || 0,
        totalRealCost: user.totalRealCost || 0,
        efficiency:
          user.totalEstimatedCost > 0 && user.totalRealCost > 0
            ? (user.totalEstimatedCost / user.totalRealCost) * 100
            : 100,
      }));
    } catch (error) {
      logger.error('[StatsService] Error obteniendo productividad:', error);
      return [];
    }
  }

  private getMonthStart(monthsBack: number = 0): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsBack);
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}

// Singleton
export default new StatsServiceClass();
export { StatsServiceClass as StatsService };
export type { SystemOverview, UserStats, OrderStatsExtended, PerformanceStats, ActivityStats, Filters };
