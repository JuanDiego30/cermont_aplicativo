/**
 * System Routes (TypeScript - November 2025 - FIXED)
 * @description Rutas del sistema para administración y monitoreo CERMONT ATG
 */

import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { authenticate } from '../middleware/auth';
import { requireMinRole } from '../middleware/rbac';
import Order from '../models/Order';
import User from '../models/User';
import WorkPlan from '../models/WorkPlan';
import { HTTP_STATUS } from '../constants';
import { getJWKS } from '../config/jwt';

// ==================== CONSTANTS ====================

const WORKPLAN_STATUS = {
  pending: 'pending',
  approved: 'approved',
  inProgress: 'inProgress',
  completed: 'completed',
};

// ==================== HELPER FUNCTIONS ====================

const successResponse = (data: any, message: string, statusCode: number) => {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
};

const errorResponse = (res: Response, message: string, statusCode: number) => {
  return res.status(statusCode).json({
    success: false,
    error: { message },
  });
};

const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const cacheMiddleware = (ttl: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    next();
  };
};

const sanitizeQuery = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }
  next();
};

const auditLogger = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    logger.info(`[AUDIT] ${action} on ${resource}`, {
      userId: (req as any).user?._id,
      ip: req.ip,
    });
    next();
  };
};

// Mock cache service
const cacheService = {
  getStats: () => ({
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    keys: 0,
  }),
  keys: ({ pattern }: { pattern?: string }) => {
    return [] as string[];
  },
  flush: ({ pattern }: { pattern?: string }) => {
    return 0;
  },
};

// ==================== ROUTER ====================

const router = Router();

// ============================================================================
// PUBLIC HEALTH CHECK
// ============================================================================

/**
 * @route   GET /api/v1/system/health
 * @desc    Health check
 * @access  Public
 */
router.get(
  '/health',
  cacheMiddleware(30),
  asyncHandler(async (req: Request, res: Response) => {
    let dbConnected = false;
    try {
      await mongoose.connection.db.admin().ping();
      dbConnected = true;
    } catch (error: any) {
      logger.warn('DB ping failed in health check', { error: error.message });
    }

    const healthData = {
      uptime: Math.floor(process.uptime() * 1000),
      env: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      dbConnected,
      timestamp: new Date().toISOString(),
    };

    res.status(HTTP_STATUS.OK).json(
      successResponse(healthData, 'Sistema operational', HTTP_STATUS.OK)
    );
  })
);

// ============================================================================
// ADMIN ROUTES
// ============================================================================

// Auth + Admin required
router.use(authenticate);
router.use(requireMinRole('admin'));

/**
 * @route   GET /api/v1/system/cache/stats
 * @desc    Cache stats
 * @access  Private (admin)
 */
router.get(
  '/cache/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = cacheService.getStats();

    res.status(HTTP_STATUS.OK).json(
      successResponse(stats, 'Estadísticas del cache obtenidas', HTTP_STATUS.OK)
    );
  })
);

/**
 * @route   GET /api/v1/system/cache/keys
 * @desc    Listar keys
 * @access  Private (admin)
 */
router.get(
  '/cache/keys',
  sanitizeQuery,
  asyncHandler(async (req: Request, res: Response) => {
    const pattern = (req.query.pattern as string) || '*';
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;

    const allKeys = cacheService.keys({ pattern });
    const start = (page - 1) * limit;
    const end = page * limit;

    const paginated = {
      keys: allKeys.slice(start, end),
      count: allKeys.length,
      total: allKeys.length,
      page,
      limit,
    };

    res.status(HTTP_STATUS.OK).json(
      successResponse(paginated, 'Keys del cache listadas', HTTP_STATUS.OK)
    );
  })
);

/**
 * @route   POST /api/v1/system/cache/flush
 * @desc    Flush cache
 * @access  Private (admin)
 */
router.post(
  '/cache/flush',
  auditLogger('ADMIN', 'CacheFlush'),
  asyncHandler(async (req: Request, res: Response) => {
    const pattern = req.query.pattern as string | undefined;
    const flushedKeys = cacheService.flush({ pattern });

    logger.info('Cache flushed manually', {
      pattern,
      flushedKeys,
      userId: (req as any).user?._id,
    });

    res.status(HTTP_STATUS.OK).json(
      successResponse(
        { flushedKeys },
        pattern ? `Cache ${pattern} limpiado exitosamente` : 'Cache limpiado exitosamente',
        HTTP_STATUS.OK
      )
    );
  })
);

/**
 * @route   GET /api/v1/system/metrics
 * @desc    Global metrics
 * @access  Private (admin)
 */
router.get(
  '/metrics',
  sanitizeQuery,
  cacheMiddleware(300),
  asyncHandler(async (req: Request, res: Response) => {
    const days = Number(req.query.days) || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const [
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      cancelledOrders,
      recentOrders,
      totalUsers,
      activeUsers,
      usersByRoleAgg,
      totalWorkplans,
      pendingWorkplans,
      approvedWorkplans,
      recentWorkplans,
    ] = await Promise.all([
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

    const usersByRole = Object.fromEntries(
      usersByRoleAgg.map((item: any) => [item._id, item.count])
    );

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

    res.status(HTTP_STATUS.OK).json(
      successResponse(metrics, 'Métricas obtenidas exitosamente', HTTP_STATUS.OK)
    );
  })
);

// ==================== JWKS ENDPOINT ====================

/**
 * JWKS endpoint para validación de tokens JWT
 * @route GET /.well-known/jwks.json
 * @access Public
 * @description Endpoint estándar para distribución de claves públicas JWT
 */
router.get('/.well-known/jwks.json', asyncHandler(async (req: Request, res: Response) => {
  const jwks = await getJWKS();

  // Set appropriate headers for JWKS
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  logger.debug('JWKS endpoint accessed', { ip: req.ip });
  res.status(HTTP_STATUS.OK).json(jwks);
}));

export default router;
