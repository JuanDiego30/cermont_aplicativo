import User from '';
import Order from '';
import { logger } from '';
import { ORDER_STATUS } from '';
import cacheService from '';
import orderService from '';
class StatsService {
    async getSystemOverview(filters = {}) {
        try {
            const cacheKey = `stats:system:overview:${JSON.stringify(filters)}`;
            return await cacheService.wrap(cacheKey, async () => {
                const [userStats, orderStatsBase, performanceStats, activityStats] = await Promise.all([
                    this.getUserStats(filters),
                    orderService.getStats(filters),
                    this.getPerformanceStats(filters),
                    this.getActivityStats(filters),
                ]);
                const completedThisMonth = await Order.countDocuments({
                    isActive: true,
                    isArchived: false,
                    estado: ORDER_STATUS.COMPLETED,
                    fechaFinReal: { $gte: this.getMonthStart(-1) },
                    ...filters,
                });
                const overdue = await Order.countDocuments({
                    isActive: true,
                    isArchived: false,
                    fechaFinEstimada: { $lt: new Date() },
                    fechaFinReal: null,
                    estado: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.PLANNING, ORDER_STATUS.IN_PROGRESS] },
                    ...filters,
                });
                const avgCompletion = await this.getAverageCompletionTime();
                const costStats = await this.getOrderCostStats({ isActive: true, isArchived: false, ...filters });
                const orderStats = {
                    ...orderStatsBase,
                    completedThisMonth,
                    overdue,
                    averageCompletionTime: avgCompletion,
                    costs: costStats,
                };
                return {
                    users: userStats,
                    orders: orderStats,
                    performance: performanceStats,
                    activity: activityStats,
                    generatedAt: new Date(),
                };
            }, 300);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo overview del sistema:', error);
            throw error;
        }
    }
    async getUserStats(filters = {}) {
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
            }, 300);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo estad�sticas de usuarios:', error);
            throw error;
        }
    }
    async getOrderStats() {
        try {
            const cacheKey = 'stats:orders';
            return await cacheService.wrap(cacheKey, async () => {
                const baseStats = await orderService.getStats();
                const completedThisMonth = await Order.countDocuments({
                    isActive: true,
                    isArchived: false,
                    estado: ORDER_STATUS.COMPLETED,
                    fechaFinReal: { $gte: this.getMonthStart(-1) },
                });
                const avgCompletion = await this.getAverageCompletionTime();
                const costStats = baseStats.costs;
                return {
                    ...baseStats,
                    completedThisMonth,
                    averageCompletionTime: avgCompletion,
                    costs: costStats,
                };
            }, 600);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo estad�sticas de �rdenes:', error);
            throw error;
        }
    }
    async getPerformanceStats(filters = {}) {
        try {
            const cacheKey = `stats:performance:${JSON.stringify(filters)}`;
            return await cacheService.wrap(cacheKey, async () => {
                const [completionRate, avgResponseTime, onTimeCompletion, userProductivity] = await Promise.all([
                    this.getCompletionRate(),
                    this.getAverageResponseTime(),
                    this.getOnTimeCompletionRate(),
                    this.getUserProductivityStats(),
                ]);
                return {
                    completionRate,
                    averageResponseTime: avgResponseTime,
                    onTimeCompletion,
                    userProductivity,
                };
            }, 600);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo estad�sticas de rendimiento:', error);
            throw error;
        }
    }
    async getActivityStats(filters = {}) {
        try {
            const cacheKey = `stats:activity:${JSON.stringify(filters)}`;
            return await cacheService.wrap(cacheKey, async () => {
                const now = new Date();
                const periods = [
                    { key: 'last24h', start: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
                    { key: 'last7d', start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
                    { key: 'last30d', start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
                ];
                const promises = periods.flatMap(({ key, start }) => [
                    Order.countDocuments({ createdAt: { $gte: start }, ...filters }),
                    User.countDocuments({ createdAt: { $gte: start }, ...filters }),
                ]);
                const counts = await Promise.all(promises);
                const activity = { last24h: { newOrders: 0, newUsers: 0 }, last7d: { newOrders: 0, newUsers: 0 }, last30d: { newOrders: 0, newUsers: 0 } };
                periods.forEach(({ key }, i) => {
                    activity[key] = {
                        newOrders: counts[i * 2],
                        newUsers: counts[i * 2 + 1],
                    };
                });
                return activity;
            }, 300);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo estad�sticas de actividad:', error);
            throw error;
        }
    }
    async getUserGrowthStats() {
        try {
            const cacheKey = 'stats:users:growth';
            return await cacheService.wrap(cacheKey, async () => {
                const months = [];
                for (let i = 5; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    date.setDate(1);
                    date.setHours(0, 0, 0, 0);
                    months.push(date);
                }
                const growthData = await Promise.all(months.map(async (startDate, index) => {
                    const endDate = index === months.length - 1 ? new Date() : months[index + 1];
                    const count = await User.countDocuments({
                        createdAt: { $gte: startDate, $lt: endDate },
                    });
                    return {
                        month: startDate.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                        count,
                    };
                }));
                return growthData;
            }, 3600);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo crecimiento de usuarios:', error);
            return [];
        }
    }
    async getOrdersByStatus(baseFilter) {
        try {
            const statusCounts = await Promise.all(Object.values(ORDER_STATUS).map((status) => Order.countDocuments({ ...baseFilter, estado: status })));
            const byStatus = {};
            Object.entries(ORDER_STATUS).forEach(([status, _], i) => {
                byStatus[status] = statusCounts[i];
            });
            return byStatus;
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo �rdenes por estado:', error);
            return {};
        }
    }
    async getAverageCompletionTime() {
        try {
            const cacheKey = 'stats:orders:avg-completion';
            return await cacheService.wrap(cacheKey, async () => {
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
                                    1000 * 60 * 60 * 24,
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
            }, 1800);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo tiempo promedio de completitud:', error);
            return { averageDays: 0, minDays: 0, maxDays: 0 };
        }
    }
    async getOrderCostStats(baseFilter) {
        try {
            const cacheKey = `stats:orders:costs:${JSON.stringify(baseFilter)}`;
            return await cacheService.wrap(cacheKey, async () => {
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
                const stats = result[0] || { totalEstimated: 0, totalReal: 0, averageEstimated: 0, averageReal: 0, count: 0 };
                const totalEstimated = stats.totalEstimated || 0;
                const totalReal = stats.totalReal || 0;
                const profitMargin = totalEstimated > 0 ? ((totalReal - totalEstimated) / totalEstimated) * 100 : 0;
                return {
                    totalEstimated,
                    totalReal,
                    averageEstimated: stats.averageEstimated || 0,
                    averageReal: stats.averageReal || 0,
                    profitMargin,
                };
            }, 600);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo estad�sticas de costos:', error);
            return { totalEstimated: 0, totalReal: 0, averageEstimated: 0, averageReal: 0, profitMargin: 0 };
        }
    }
    async getCompletionRate() {
        try {
            const cacheKey = 'stats:completion-rate';
            return await cacheService.wrap(cacheKey, async () => {
                const total = await Order.countDocuments({ isActive: true, isArchived: false });
                const completed = await Order.countDocuments({
                    isActive: true,
                    isArchived: false,
                    estado: ORDER_STATUS.COMPLETED,
                });
                return total > 0 ? (completed / total) * 100 : 0;
            }, 300);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo tasa de completitud:', error);
            return 0;
        }
    }
    async getAverageResponseTime() {
        try {
            const cacheKey = 'stats:avg-response-time';
            return await cacheService.wrap(cacheKey, async () => {
                const result = await Order.aggregate([
                    {
                        $match: {
                            asignadoA: { $exists: true, $ne: [] },
                            createdAt: { $exists: true },
                            historial: { $exists: true, $ne: [] },
                        },
                    },
                    {
                        $addFields: {
                            firstAssign: {
                                $arrayElemAt: [
                                    { $filter: { input: '$historial', cond: { $eq: ['$$this.accion', 'Usuarios asignados'] } } },
                                    0,
                                ],
                            },
                        },
                    },
                    {
                        $match: { 'firstAssign.fecha': { $exists: true } },
                    },
                    {
                        $project: {
                            responseTime: {
                                $divide: [
                                    { $subtract: ['$firstAssign.fecha', '$createdAt'] },
                                    1000 * 60 * 60,
                                ],
                            },
                        },
                    },
                    {
                        $group: { _id: null, averageHours: { $avg: '$responseTime' } },
                    },
                ]);
                return Math.round(result[0]?.averageHours || 0);
            }, 600);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo tiempo promedio de respuesta:', error);
            return 0;
        }
    }
    async getOnTimeCompletionRate() {
        try {
            const cacheKey = 'stats:on-time-rate';
            return await cacheService.wrap(cacheKey, async () => {
                const pipeline = [
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
                ];
                const result = await Order.aggregate(pipeline);
                const stats = result[0] || { completed: 0, onTime: 0 };
                return stats.completed > 0 ? (stats.onTime / stats.completed) * 100 : 0;
            }, 600);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo tasa de completitud a tiempo:', error);
            return 0;
        }
    }
    async getUserProductivityStats() {
        try {
            const cacheKey = 'stats:user-productivity';
            return await cacheService.wrap(cacheKey, async () => {
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
                            pipeline: [{ $match: { activo: true } }, { $project: { nombre: 1 } }],
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
                return result.map((user) => ({
                    userId: user._id.toString(),
                    nombre: user.nombre,
                    completedOrders: user.completedOrders,
                    totalEstimatedCost: user.totalEstimatedCost || 0,
                    totalRealCost: user.totalRealCost || 0,
                    efficiency: user.totalEstimatedCost > 0 && user.totalRealCost > 0
                        ? (user.totalEstimatedCost / user.totalRealCost) * 100
                        : 100,
                }));
            }, 1800);
        }
        catch (error) {
            logger.error('[StatsService] Error obteniendo productividad por usuario:', error);
            return [];
        }
    }
    async clearStatsCache() {
        try {
            await cacheService.delPattern('stats:*');
            logger.info('[StatsService] Cache de estad�sticas limpiado');
        }
        catch (error) {
            logger.error('[StatsService] Error limpiando cache de estad�sticas:', error);
            throw error;
        }
    }
    getMonthStart(monthsBack = 0) {
        const date = new Date();
        date.setMonth(date.getMonth() + monthsBack);
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        return date;
    }
}
export default new StatsService();
//# sourceMappingURL=stats.service.js.map