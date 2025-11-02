import User from '../models/User.js';
import Order from '../models/Order.js';
import logger from '../utils/logger.js';
import { ORDER_STATUS } from '../utils/constants.js';
import cacheService from './cache.service.js';

/**
 * Servicio de estadísticas del sistema
 * Proporciona métricas y análisis de datos consolidados
 */
class StatsService {
  /**
   * Obtener estadísticas generales del sistema
   */
  async getSystemOverview() {
    try {
      const cacheKey = 'stats:system:overview';

      return await cacheService.wrap(
        cacheKey,
        async () => {
          // Estadísticas de usuarios
          const userStats = await this.getUserStats();

          // Estadísticas de órdenes
          const orderStats = await this.getOrderStats();

          // Estadísticas de rendimiento
          const performanceStats = await this.getPerformanceStats();

          // Estadísticas de actividad reciente
          const activityStats = await this.getActivityStats();

          return {
            users: userStats,
            orders: orderStats,
            performance: performanceStats,
            activity: activityStats,
            generatedAt: new Date(),
          };
        },
        300 // Cache 5 minutos
      );
    } catch (error) {
      logger.error('[StatsService] Error obteniendo overview del sistema:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        usersByRole,
        newUsersThisMonth,
        userGrowth,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ activo: true }),
        User.aggregate([
          { $match: { activo: true } },
          { $group: { _id: '$rol', count: { $sum: 1 } } },
        ]),
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
        this.getUserGrowthStats(),
      ]);

      return {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: usersByRole,
        newThisMonth: newUsersThisMonth,
        growth: userGrowth,
      };
    } catch (error) {
      logger.error('[StatsService] Error obteniendo estadísticas de usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de órdenes
   */
  async getOrderStats() {
    try {
      const baseFilter = { isActive: true, isArchived: false };

      const [
        totalOrders,
        ordersByStatus,
        completedThisMonth,
        overdueOrders,
        averageCompletionTime,
        costStats,
      ] = await Promise.all([
        Order.countDocuments(baseFilter),
        this.getOrdersByStatus(baseFilter),
        Order.countDocuments({
          ...baseFilter,
          estado: ORDER_STATUS.COMPLETED,
          fechaFinReal: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
        Order.countDocuments({
          ...baseFilter,
          fechaFinEstimada: { $lt: new Date() },
          fechaFinReal: null,
          estado: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.PLANNING, ORDER_STATUS.IN_PROGRESS] },
        }),
        this.getAverageCompletionTime(),
        this.getOrderCostStats(baseFilter),
      ]);

      return {
        total: totalOrders,
        byStatus: ordersByStatus,
        completedThisMonth,
        overdue: overdueOrders,
        averageCompletionTime,
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
  async getPerformanceStats() {
    try {
      // Tasa de completitud de órdenes
      const completionRate = await this.getCompletionRate();

      // Tiempo promedio de respuesta
      const avgResponseTime = await this.getAverageResponseTime();

      // Órdenes completadas vs estimadas
      const onTimeCompletion = await this.getOnTimeCompletionRate();

      // Productividad por usuario
      const userProductivity = await this.getUserProductivityStats();

      return {
        completionRate,
        averageResponseTime: avgResponseTime,
        onTimeCompletion,
        userProductivity,
      };
    } catch (error) {
      logger.error('[StatsService] Error obteniendo estadísticas de rendimiento:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de actividad reciente
   */
  async getActivityStats() {
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        ordersLast24h,
        ordersLast7d,
        ordersLast30d,
        usersLast24h,
        usersLast7d,
        usersLast30d,
      ] = await Promise.all([
        Order.countDocuments({ createdAt: { $gte: last24h } }),
        Order.countDocuments({ createdAt: { $gte: last7d } }),
        Order.countDocuments({ createdAt: { $gte: last30d } }),
        User.countDocuments({ createdAt: { $gte: last24h } }),
        User.countDocuments({ createdAt: { $gte: last7d } }),
        User.countDocuments({ createdAt: { $gte: last30d } }),
      ]);

      return {
        last24h: {
          newOrders: ordersLast24h,
          newUsers: usersLast24h,
        },
        last7d: {
          newOrders: ordersLast7d,
          newUsers: usersLast7d,
        },
        last30d: {
          newOrders: ordersLast30d,
          newUsers: usersLast30d,
        },
      };
    } catch (error) {
      logger.error('[StatsService] Error obteniendo estadísticas de actividad:', error);
      throw error;
    }
  }

  /**
   * Obtener crecimiento de usuarios
   */
  async getUserGrowthStats() {
    try {
      const months = [];
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

  /**
   * Obtener órdenes por estado
   */
  async getOrdersByStatus(baseFilter) {
    try {
      const statusCounts = await Promise.all([
        Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.PENDING }),
        Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.PLANNING }),
        Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.IN_PROGRESS }),
        Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.COMPLETED }),
        Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.INVOICING }),
        Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.INVOICED }),
        Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.PAID }),
        Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.CANCELLED }),
      ]);

      return {
        pending: statusCounts[0],
        planning: statusCounts[1],
        inProgress: statusCounts[2],
        completed: statusCounts[3],
        invoicing: statusCounts[4],
        invoiced: statusCounts[5],
        paid: statusCounts[6],
        cancelled: statusCounts[7],
      };
    } catch (error) {
      logger.error('[StatsService] Error obteniendo órdenes por estado:', error);
      return {};
    }
  }

  /**
   * Obtener tiempo promedio de completitud
   */
  async getAverageCompletionTime() {
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
              $divide: [
                { $subtract: ['$fechaFinReal', '$fechaInicio'] },
                1000 * 60 * 60 * 24, // Convertir a días
              ],
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
      logger.error('[StatsService] Error obteniendo tiempo promedio de completitud:', error);
      return { averageDays: 0, minDays: 0, maxDays: 0 };
    }
  }

  /**
   * Obtener estadísticas de costos de órdenes
   */
  async getOrderCostStats(baseFilter) {
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
            count: { $sum: 1 },
          },
        },
      ]);

      const stats = result[0] || {
        totalEstimated: 0,
        totalReal: 0,
        averageEstimated: 0,
        averageReal: 0,
        count: 0,
      };

      return {
        totalEstimated: stats.totalEstimated || 0,
        totalReal: stats.totalReal || 0,
        averageEstimated: stats.averageEstimated || 0,
        averageReal: stats.averageReal || 0,
        profitMargin: stats.totalReal && stats.totalEstimated
          ? ((stats.totalReal - stats.totalEstimated) / stats.totalEstimated) * 100
          : 0,
      };
    } catch (error) {
      logger.error('[StatsService] Error obteniendo estadísticas de costos:', error);
      return {
        totalEstimated: 0,
        totalReal: 0,
        averageEstimated: 0,
        averageReal: 0,
        profitMargin: 0,
      };
    }
  }

  /**
   * Obtener tasa de completitud
   */
  async getCompletionRate() {
    try {
      const total = await Order.countDocuments({ isActive: true });
      const completed = await Order.countDocuments({
        isActive: true,
        estado: ORDER_STATUS.COMPLETED,
      });

      return total > 0 ? (completed / total) * 100 : 0;
    } catch (error) {
      logger.error('[StatsService] Error obteniendo tasa de completitud:', error);
      return 0;
    }
  }

  /**
   * Obtener tiempo promedio de respuesta
   */
  async getAverageResponseTime() {
    try {
      // Calcular tiempo desde creación hasta primera asignación
      const result = await Order.aggregate([
        {
          $match: {
            asignadoA: { $exists: true, $ne: [] },
            createdAt: { $exists: true },
          },
        },
        {
          $addFields: {
            firstAssigned: { $arrayElemAt: ['$historial', 0] },
          },
        },
        {
          $match: {
            'firstAssigned.fecha': { $exists: true },
          },
        },
        {
          $project: {
            responseTime: {
              $divide: [
                { $subtract: ['$firstAssigned.fecha', '$createdAt'] },
                1000 * 60 * 60, // Convertir a horas
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            averageHours: { $avg: '$responseTime' },
          },
        },
      ]);

      return result[0]?.averageHours || 0;
    } catch (error) {
      logger.error('[StatsService] Error obteniendo tiempo promedio de respuesta:', error);
      return 0;
    }
  }

  /**
   * Obtener tasa de completitud a tiempo
   */
  async getOnTimeCompletionRate() {
    try {
      const completedOrders = await Order.countDocuments({
        estado: ORDER_STATUS.COMPLETED,
        fechaFinEstimada: { $exists: true },
        fechaFinReal: { $exists: true },
      });

      const onTimeOrders = await Order.countDocuments({
        estado: ORDER_STATUS.COMPLETED,
        fechaFinEstimada: { $exists: true },
        fechaFinReal: { $exists: true },
        $expr: { $lte: ['$fechaFinReal', '$fechaFinEstimada'] },
      });

      return completedOrders > 0 ? (onTimeOrders / completedOrders) * 100 : 0;
    } catch (error) {
      logger.error('[StatsService] Error obteniendo tasa de completitud a tiempo:', error);
      return 0;
    }
  }

  /**
   * Obtener productividad por usuario
   */
  async getUserProductivityStats() {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            asignadoA: { $exists: true, $ne: [] },
            estado: ORDER_STATUS.COMPLETED,
          },
        },
        {
          $unwind: '$asignadoA',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'asignadoA',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $group: {
            _id: '$user._id',
            nombre: { $first: '$user.nombre' },
            completedOrders: { $sum: 1 },
            totalEstimatedCost: { $sum: '$costoEstimado' },
            totalRealCost: { $sum: '$costoReal' },
          },
        },
        {
          $sort: { completedOrders: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      return result.map(user => ({
        userId: user._id,
        nombre: user.nombre,
        completedOrders: user.completedOrders,
        totalEstimatedCost: user.totalEstimatedCost || 0,
        totalRealCost: user.totalRealCost || 0,
        efficiency: user.totalEstimatedCost && user.totalRealCost
          ? (user.totalEstimatedCost / user.totalRealCost) * 100
          : 100,
      }));
    } catch (error) {
      logger.error('[StatsService] Error obteniendo productividad por usuario:', error);
      return [];
    }
  }

  /**
   * Limpiar cache de estadísticas
   */
  async clearStatsCache() {
    try {
      await cacheService.delPattern('stats:*');
      logger.info('[StatsService] Cache de estadísticas limpiado');
    } catch (error) {
      logger.error('[StatsService] Error limpiando cache de estadísticas:', error);
    }
  }
}

// Exportar instancia única (singleton)
export default new StatsService();
