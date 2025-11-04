import AuditLog from '../models/AuditLog';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { z } from 'zod';
const AuditQuerySchema = z.object({
    page: z.string().default('1').transform((val) => parseInt(val, 10)).refine((val) => val > 0, { message: 'page debe ser > 0' }),
    limit: z.string().default('50').transform((val) => parseInt(val, 10)).refine((val) => val > 0 && val <= 100, { message: 'limit debe ser 1-100' }),
    action: z.string().optional().refine((val) => !val || ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN_FAILED'].includes(val), { message: 'Action inválida' }),
    resource: z.string().optional().refine((val) => !val || ['User', 'Order', 'Auth', 'WorkPlan'].includes(val), { message: 'Resource inválido' }),
    userId: z.string().optional().refine((val) => !val || /^[0-9a-fA-F]{24}$/.test(val), { message: 'userId debe ser ObjectId válido' }),
    severity: z.string().optional().refine((val) => !val || ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(val), { message: 'Severity inválido' }),
    status: z.string().optional().refine((val) => !val || ['SUCCESS', 'FAILURE', 'DENIED'].includes(val), { message: 'Status inválido' }),
    startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: 'startDate debe ser ISO datetime válido' }),
    endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: 'endDate debe ser ISO datetime válido' }),
});
const UserActivityQuerySchema = z.object({
    limit: z.string().default('50').transform((val) => parseInt(val, 10)).refine((val) => val > 0 && val <= 100, { message: 'limit debe ser 1-100' }),
});
const SecurityAlertsQuerySchema = z.object({
    days: z.string().default('7').transform((val) => parseInt(val, 10)).refine((val) => val > 0 && val <= 365, { message: 'days debe ser 1-365' }),
});
const AuditStatsQuerySchema = z.object({
    days: z.string().default('30').transform((val) => parseInt(val, 10)).refine((val) => val > 0 && val <= 365, { message: 'days debe ser 1-365' }),
});
const UserIdParamSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), { message: 'userId debe ser ObjectId válido' });
const requireAdmin = (req) => {
    if (!req.user || req.user.role !== 'admin') {
        throw new Error('Acceso denegado: Requiere rol admin');
    }
};
export const getAuditLogs = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const query = AuditQuerySchema.parse({
        ...req.query,
        page: req.query.page || '1',
        limit: req.query.limit || '50',
    });
    const filters = {};
    if (query.action)
        filters.action = query.action;
    if (query.resource)
        filters.resource = query.resource;
    if (query.userId)
        filters.userId = query.userId;
    if (query.severity)
        filters.severity = query.severity;
    if (query.status)
        filters.status = query.status;
    if (query.startDate || query.endDate) {
        filters.timestamp = {};
        if (query.startDate)
            filters.timestamp.$gte = new Date(query.startDate);
        if (query.endDate)
            filters.timestamp.$lte = new Date(query.endDate + 'T23:59:59.999Z');
    }
    const skip = (query.page - 1) * query.limit;
    const logs = await AuditLog.find(filters)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(query.limit)
        .populate('userId', 'nombre email rol')
        .lean();
    const total = await AuditLog.countDocuments(filters);
    const pages = Math.ceil(total / query.limit);
    const hasMore = query.page < pages;
    logger.debug(`Audit logs fetched: page ${query.page}, limit ${query.limit}, total ${total}`);
    successResponse(res, {
        data: logs,
        pagination: {
            page: query.page,
            limit: query.limit,
            total,
            pages,
            hasMore,
        },
    }, 'Logs de auditoría obtenidos exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getUserActivity = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const userId = UserIdParamSchema.parse(req.params.userId);
    const query = UserActivityQuerySchema.parse(req.query);
    const filters = { userId };
    const logs = await AuditLog.find(filters)
        .sort({ timestamp: -1 })
        .limit(query.limit)
        .populate('userId', 'nombre email rol')
        .lean();
    logger.debug(`User activity fetched for ${userId}: ${logs.length} logs`);
    successResponse(res, { data: logs }, `Actividad de usuario obtenida (${logs.length} registros)`, HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getSecurityAlerts = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const query = SecurityAlertsQuerySchema.parse(req.query);
    const since = new Date(Date.now() - query.days * 24 * 60 * 60 * 1000);
    const filters = {
        timestamp: { $gte: since },
        $or: [
            { status: 'DENIED' },
            { status: 'FAILURE', severity: { $in: ['HIGH', 'CRITICAL'] } },
        ],
    };
    const alerts = await AuditLog.find(filters)
        .sort({ timestamp: -1 })
        .limit(100)
        .populate('userId', 'nombre email rol')
        .lean();
    logger.debug(`Security alerts fetched: ${alerts.length} for last ${query.days} days`);
    successResponse(res, {
        data: alerts,
        count: alerts.length,
        period: `${query.days} días`,
    }, 'Alertas de seguridad obtenidas', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getAuditStats = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const query = AuditStatsQuerySchema.parse(req.query);
    const since = new Date(Date.now() - query.days * 24 * 60 * 60 * 1000);
    const stats = await AuditLog.aggregate([
        { $match: { timestamp: { $gte: since } } },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 },
                failures: { $sum: { $cond: [{ $eq: ['$status', 'FAILURE'] }, 1, 0] } },
                denials: { $sum: { $cond: [{ $eq: ['$status', 'DENIED'] }, 1, 0] } },
                resources: { $addToSet: '$resource' },
            },
        },
        { $sort: { count: -1 } },
        { $limit: 20 },
    ]);
    const totalEvents = stats.reduce((sum, stat) => sum + stat.count, 0);
    logger.debug(`Audit stats aggregated: ${stats.length} actions for ${query.days} days`);
    successResponse(res, {
        data: stats,
        period: `${query.days} días`,
        totalEvents,
    }, 'Estadísticas de auditoría obtenidas', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
//# sourceMappingURL=auditLog.controller.js.map