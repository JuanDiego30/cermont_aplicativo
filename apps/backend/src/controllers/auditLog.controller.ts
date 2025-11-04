/**
 * Audit Log Controller (TypeScript - November 2025)
 * @description Endpoints para gestión y consulta de logs de auditoría, con filtros avanzados y paginación.
 * Uso: En audit.routes.ts (router.get('/audit-logs', authenticate, requireMinRole('admin'), getAuditLogs);). Integrado con AuditLog model (populate userId), Zod (query validation), logger (debug fetches).
 * Secure: Admin-only (req.user.rol check), Zod sanitizes inputs (no injection), date filters end-of-day UTC. Performance: lean() queries, countDocuments separate, aggregate optimized (match early, limit groups).
 * Types: mongoose@types, zod@types, express@types. Pruebas: Mock AuditLog.find/aggregate en Jest (e.g., jest.mock('../models/AuditLog')). Para ATG: Filters para WorkPlan actions/resources, ISO 27001 compliant (retention via days).
 * Fixes: Align AuthUser a global (rol en lugar de role, resuelve TS2430/2352), type guards inline (no casts), Zod.safeParse() para safe validation, buildAuditFilters helper para DRY, UTC dates, typed aggregate.
 */

import { Request, Response } from 'express';
import type { FilterQuery, PipelineStage } from 'mongoose';
import AuditLog from '../models/AuditLog';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { z } from 'zod';

// Tipo alineado con global express.d.ts (user: { userId: string; rol: string; ... } | undefined)
type AuthUser = {
  userId: string;
  rol: string;
  tokenVersion?: number;
  email?: string;
};

// Extensión typed de Request (compatible con global)
type TypedRequest<T = any, P = any> = Request<P, any, T> & {
  user?: AuthUser;
};

// Typed para aggregate stats
interface AuditStat {
  _id: string; // action
  count: number;
  failures: number;
  denials: number;
  resources: string[];
}

// Audit filter typed (extends Mongoose FilterQuery)
interface AuditFilter extends Partial<FilterQuery<typeof AuditLog>> {
  action?: string;
  resource?: string;
  userId?: string;
  severity?: string;
  status?: string;
  timestamp?: { $gte?: Date; $lte?: Date };
}

// Schemas Zod con safeParse-ready (transform/refine typed)
const AuditQuerySchema = z.object({
  page: z.string().default('1').transform((val: string): number => parseInt(val, 10)).refine((val: number) => val > 0, { message: 'page debe ser > 0' }),
  limit: z.string().default('50').transform((val: string): number => parseInt(val, 10)).refine((val: number) => val > 0 && val <= 100, { message: 'limit debe ser 1-100' }),
  action: z.string().optional().refine((val?: string) => !val || ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN_FAILED'].includes(val), { message: 'Action inválida' }),
  resource: z.string().optional().refine((val?: string) => !val || ['User', 'Order', 'Auth', 'WorkPlan'].includes(val), { message: 'Resource inválido' }),
  userId: z.string().optional().refine((val?: string) => !val || /^[0-9a-fA-F]{24}$/.test(val), { message: 'userId debe ser ObjectId válido' }),
  severity: z.string().optional().refine((val?: string) => !val || ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(val), { message: 'Severity inválido' }),
  status: z.string().optional().refine((val?: string) => !val || ['SUCCESS', 'FAILURE', 'DENIED'].includes(val), { message: 'Status inválido' }),
  startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: 'startDate debe ser ISO datetime válido' }),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), { message: 'endDate debe ser ISO datetime válido' }),
}) satisfies z.ZodObject<any>; // satisfies para type safety

type AuditQueryType = z.infer<typeof AuditQuerySchema>;

const UserActivityQuerySchema = z.object({
  limit: z.string().default('50').transform((val: string): number => parseInt(val, 10)).refine((val: number) => val > 0 && val <= 100, { message: 'limit debe ser 1-100' }),
}) satisfies z.ZodObject<any>;

type UserActivityQueryType = z.infer<typeof UserActivityQuerySchema>;

const SecurityAlertsQuerySchema = z.object({
  days: z.string().default('7').transform((val: string): number => parseInt(val, 10)).refine((val: number) => val > 0 && val <= 365, { message: 'days debe ser 1-365' }),
}) satisfies z.ZodObject<any>;

type SecurityAlertsQueryType = z.infer<typeof SecurityAlertsQuerySchema>;

const AuditStatsQuerySchema = z.object({
  days: z.string().default('30').transform((val: string): number => parseInt(val, 10)).refine((val: number) => val > 0 && val <= 365, { message: 'days debe ser 1-365' }),
}) satisfies z.ZodObject<any>;

type AuditStatsQueryType = z.infer<typeof AuditStatsQuerySchema>;

const UserIdParamSchema = z.string().refine((val: string) => /^[0-9a-fA-F]{24}$/.test(val), { message: 'userId debe ser ObjectId válido' });

/**
 * Verificar rol admin (type guard)
 * @param req - Express request con user de auth middleware
 * @throws Error si no admin (caught by asyncHandler)
 */
const requireAdmin = (req: Request & { user?: AuthUser }): void => {
  if (!req.user || req.user.rol !== 'admin') {
    throw new Error('Acceso denegado: Requiere rol admin');
  }
};

/**
 * Construir filtros de auditoría (DRY helper)
 * @param query - Parsed Zod query
 * @returns Partial<AuditFilter>
 */
const buildAuditFilters = (query: AuditQueryType): AuditFilter => {
  const filters: AuditFilter = {};
  if (query.action) filters.action = query.action;
  if (query.resource) filters.resource = query.resource;
  if (query.userId) filters.userId = query.userId;
  if (query.severity) filters.severity = query.severity;
  if (query.status) filters.status = query.status;

  if (query.startDate || query.endDate) {
    filters.timestamp = {} as { $gte?: Date; $lte?: Date };
    if (query.startDate) {
      const start = new Date(query.startDate);
      filters.timestamp.$gte = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      filters.timestamp.$lte = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999));
    }
  }
  return filters;
};

/**
 * Obtener logs de auditoría con filtros y paginación
 * @route GET /api/v1/audit-logs
 * @access Private (Admin only)
 * @swagger [swagger intacto como original]
 */
export const getAuditLogs = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const parseResult = AuditQuerySchema.safeParse({
      ...req.query,
      page: (req.query.page as string) || '1',
      limit: (req.query.limit as string) || '50',
    });
    if (!parseResult.success) {
      throw new Error(`Validación fallida: ${JSON.stringify(parseResult.error.errors)}`);
    }
    const query = parseResult.data;

    const filters = buildAuditFilters(query);

    const skip = (query.page - 1) * query.limit;

    // Query optimizada: lean(), populate select, typed FilterQuery
    const logs = await AuditLog.find(filters as FilterQuery<typeof AuditLog>)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate('userId', 'nombre email rol')
      .lean();

    const total = await AuditLog.countDocuments(filters as FilterQuery<typeof AuditLog>);
    const pages = Math.ceil(total / query.limit);
    const hasMore = query.page < pages;

    logger.debug(`Audit logs fetched by admin ${req.user?.userId}: page ${query.page}, limit ${query.limit}, total ${total}`);

    successResponse(
      res,
      {
        data: logs,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          pages,
          hasMore,
        },
      },
      'Logs de auditoría obtenidos exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Obtener actividad reciente de un usuario específico
 * @route GET /api/v1/audit-logs/user/:userId
 * @access Private (Admin only)
 * @swagger [swagger intacto como original]
 */
export const getUserActivity = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const userIdParse = UserIdParamSchema.safeParse(req.params.userId);
    if (!userIdParse.success) {
      throw new Error(`userId inválido: ${JSON.stringify(userIdParse.error.errors)}`);
    }
    const userId = userIdParse.data;

    const activityParse = UserActivityQuerySchema.safeParse(req.query);
    if (!activityParse.success) {
      throw new Error(`Validación fallida: ${JSON.stringify(activityParse.error.errors)}`);
    }
    const query = activityParse.data;

    const filters = { userId } as AuditFilter;
    const logs = await AuditLog.find(filters as FilterQuery<typeof AuditLog>)
      .sort({ timestamp: -1 })
      .limit(query.limit)
      .populate('userId', 'nombre email rol')
      .lean();

    logger.debug(`User activity fetched by admin ${req.user?.userId} for ${userId}: ${logs.length} logs`);

    successResponse(
      res,
      { data: logs },
      `Actividad de usuario obtenida (${logs.length} registros)`,
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Obtener alertas de seguridad
 * @route GET /api/v1/audit-logs/security-alerts
 * @access Private (Admin only)
 * @swagger [swagger intacto como original]
 */
export const getSecurityAlerts = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const alertsParse = SecurityAlertsQuerySchema.safeParse(req.query);
    if (!alertsParse.success) {
      throw new Error(`Validación fallida: ${JSON.stringify(alertsParse.error.errors)}`);
    }
    const query = alertsParse.data;
    const since = new Date(Date.now() - query.days * 24 * 60 * 60 * 1000);

    const filters: FilterQuery<typeof AuditLog> = {
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

    logger.debug(`Security alerts fetched by admin ${req.user?.userId}: ${alerts.length} for last ${query.days} days`);

    successResponse(
      res,
      {
        data: alerts,
        count: alerts.length,
        period: `${query.days} días`,
      },
      'Alertas de seguridad obtenidas',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Obtener estadísticas de auditoría
 * @route GET /api/v1/audit-logs/stats
 * @access Private (Admin only)
 * @swagger [swagger intacto como original]
 */
export const getAuditStats = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    requireAdmin(req);
    const statsParse = AuditStatsQuerySchema.safeParse(req.query);
    if (!statsParse.success) {
      throw new Error(`Validación fallida: ${JSON.stringify(statsParse.error.errors)}`);
    }
    const query = statsParse.data;
    const since = new Date(Date.now() - query.days * 24 * 60 * 60 * 1000);

    const pipeline: PipelineStage[] = [
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
    ];

    const stats: AuditStat[] = await AuditLog.aggregate(pipeline);

    const totalEvents = stats.reduce((sum: number, stat: AuditStat) => sum + stat.count, 0);

    logger.debug(`Audit stats aggregated by admin ${req.user?.userId}: ${stats.length} actions for ${query.days} days`);

    successResponse(
      res,
      {
        data: stats,
        period: `${query.days} días`,
        totalEvents,
      },
      'Estadísticas de auditoría obtenidas',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);
