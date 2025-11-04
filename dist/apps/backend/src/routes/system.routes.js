import { Router } from 'express';
import { asyncHandler } from '';
import { successResponse, HTTP_STATUS } from '';
import { logger } from '';
import { auditLogger } from '';
import { authenticate as auth } from '';
import { requireMinRole } from '';
import { cacheMiddleware } from '';
import { sanitizeQuery } from '';
import { cacheService } from '';
import { WORKPLAN_STATUS } from '';
import Order from '';
import User from '';
import WorkPlan from '';
const router = Router();
router.get('/health', cacheMiddleware(30), asyncHandler(async (req, res) => {
    let dbConnected = false;
    try {
        await req.app.locals.mongoose.connection.db.admin().ping();
        dbConnected = true;
    }
    catch (error) {
        logger.warn('DB ping failed in health check', { error: error.message });
    }
    const healthData = {
        uptime: Math.floor(process.uptime() * 1000),
        env: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        dbConnected,
        timestamp: new Date().toISOString(),
    };
    const health = successResponse(healthData, 'Sistema operational', HTTP_STATUS.OK);
    res.status(HTTP_STATUS.OK).json(health);
    logger.info('Health check requested', { ip: req.ip });
}));
router.use(auth);
router.use(requireMinRole('admin'));
router.get('/cache/stats', asyncHandler(async (req, res) => {
    const stats = cacheService.getStats();
    res.status(HTTP_STATUS.OK).json(successResponse(stats, 'Estadísticas del cache obtenidas', HTTP_STATUS.OK));
}));
router.get('/cache/keys', sanitizeQuery, asyncHandler(async (req, res) => {
    const { pattern = '*', page = 1, limit = 50 } = req.query;
    const allKeys = cacheService.keys({ pattern });
    const start = (page - 1) * limit;
    const end = page * limit;
    const paginated = {
        keys: allKeys.slice(start, end),
        count: allKeys.length,
        total: allKeys.length,
        page: Number(page),
        limit: Number(limit),
    };
    res.status(HTTP_STATUS.OK).json(successResponse(paginated, 'Keys del cache listadas', HTTP_STATUS.OK));
}));
router.post('/cache/flush', auditLogger('ADMIN', 'CacheFlush'), asyncHandler(async (req, res) => {
    const { pattern } = req.query;
    const flushedKeys = cacheService.flush({ pattern });
    logger.info('Cache flushed manually', { pattern, flushedKeys, userId: req.user._id });
    res.status(HTTP_STATUS.OK).json(successResponse({ flushedKeys }, pattern ? `Cache ${pattern} limpiado exitosamente` : 'Cache limpiado exitosamente', HTTP_STATUS.OK));
}));
router.get('/metrics', sanitizeQuery, cacheMiddleware(300), asyncHandler(async (req, res) => {
    const days = Number(req.query.days) || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const [totalOrders, pendingOrders, inProgressOrders, completedOrders, cancelledOrders, recentOrders, totalUsers, activeUsers, usersByRoleAgg, totalWorkplans, pendingWorkplans, approvedWorkplans, recentWorkplans,] = await Promise.all([
        Order.countDocuments({ isDeleted: false }),
        Order.countDocuments({ status: 'pending', isDeleted: false }),
        Order.countDocuments({ status: 'in_progress', isDeleted: false }),
        Order.countDocuments({ status: 'completed', isDeleted: false }),
        Order.countDocuments({ status: 'cancelled', isDeleted: false }),
        Order.countDocuments({ createdAt: { $gte: cutoffDate }, isDeleted: false }),
        User.countDocuments(),
        User.countDocuments({ active: true }),
        User.aggregate([{ $group: { _id: '$rol', count: { $sum: 1 } } }]),
        WorkPlan.countDocuments({ isDeleted: false }),
        WorkPlan.countDocuments({ status: WORKPLAN_STATUS.pending, isDeleted: false }),
        WorkPlan.countDocuments({ status: WORKPLAN_STATUS.approved, isDeleted: false }),
        WorkPlan.countDocuments({ createdAt: { $gte: cutoffDate }, isDeleted: false }),
    ]);
    const usersByRole = Object.fromEntries(usersByRoleAgg.map((item) => [item._id, item.count]));
    const metrics = {
        system: {
            uptime: Math.floor(process.uptime() * 1000),
            env: process.env.NODE_ENV || 'development',
            cache: cacheService.getStats(),
        },
        orders: {
            pending: pendingOrders,
            in_progress: inProgressOrders,
            completed: completedOrders,
            cancelled: cancelledOrders,
            total: totalOrders,
            recent: recentOrders,
        },
        users: {
            total: totalUsers,
            active: activeUsers,
            byRole: usersByRole,
        },
        workplans: {
            pending: pendingWorkplans,
            approved: approvedWorkplans,
            total: totalWorkplans,
            recent: recentWorkplans,
        },
    };
    res.status(HTTP_STATUS.OK).json(successResponse(metrics, 'Métricas obtenidas exitosamente', HTTP_STATUS.OK));
}));
export default router;
//# sourceMappingURL=system.routes.js.map