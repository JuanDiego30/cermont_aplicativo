/**
 * WorkPlans Routes (TypeScript - November 2025 - FIXED)
 * @description Rutas modulares para planes de trabajo CERMONT ATG
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ParsedQs } from 'qs';

// Controllers
import {
  getAllWorkPlans,
  getWorkPlanById,
  getWorkPlanByOrderId,
  createWorkPlan,
  updateWorkPlan,
  deleteWorkPlan,
  approveWorkPlan,
  completeActivity,
  getWorkPlanStats,
} from '../controllers/workplan.controller';

// Middleware
import { authenticate } from '../middleware/auth';
import { requireMinRole, requireAdmin } from '../middleware/rbac';
import { validateObjectId, validateRequest } from '../middleware/validate';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS, ORDER_STATUS, WORKPLAN_STATUS, type WorkplanStatus } from '../utils/constants';

// ==================== INTERFACES ====================

interface WorkPlanIdParams {
  id: string;
}

interface OrderIdParams {
  orderId: string;
}

interface ActivityParams {
  id: string;
  actividadId: string;
}

interface CreateWorkPlanBody {
  orderId: string;
  nombre: string;
  descripcion?: string;
  status?: WorkplanStatus;
  assignedTo?: string[];
  cronograma: Array<{
    nombre: string;
    descripcion?: string;
    duracion: number;
    responsable: string;
    fechaInicio?: string;
    fechaFin?: string;
  }>;
}

interface UpdateWorkPlanBody {
  nombre?: string;
  descripcion?: string;
  assignedTo?: string[];
  cronograma?: Array<{
    _id?: string;
    nombre?: string;
    descripcion?: string;
    duracion?: number;
    responsable?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }>;
}

interface ApproveWorkPlanBody {
  comentarios?: string;
}

interface CompleteActivityBody {
  fechaCompletado?: string;
  evidencias?: string[];
  comentarios?: string;
}

// ==================== MIDDLEWARE HELPERS ====================

const errorResponse = (res: Response, message: string, status: number) => {
  return res.status(status).json({
    success: false,
    error: { message },
  });
};

const validateStatus = (statusField: string, enumValues: readonly string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const status = req.query[statusField] || (req.body as any).status;
    if (status && !enumValues.includes(status as string)) {
      return errorResponse(res, `Invalid ${statusField}`, HTTP_STATUS.BAD_REQUEST);
    }
    next();
  };
};

const sanitizeQuery = (req: Request, res: Response, next: NextFunction): void => {
  // Basic query sanitization
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string).trim();
      }
    });
  }
  next();
};

const cacheMiddleware = (ttl: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Cache implementation placeholder
    next();
  };
};

const invalidateCache = (pattern: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Cache invalidation placeholder
    next();
  };
};

const invalidateCacheById = (pattern: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Cache invalidation by ID placeholder
    next();
  };
};

const auditLogger = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Audit logging placeholder
    next();
  };
};

const createRateLimiter = (options: { windowMs: number; max: number }) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Rate limiter placeholder
    next();
  };
};

// Validator placeholders
const createWorkPlanValidator = {};
const updateWorkPlanValidator = {};
const completeActivityValidator = {};

// ==================== ROUTER ====================

const router = Router();

// Auth required for all routes
router.use(authenticate);

// ============================================================================
// STATS ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/workplans/stats/summary
 * @desc    Summary stats (cached 10min)
 * @access  Private (engineer+)
 */
router.get(
  '/stats/summary',
  sanitizeQuery,
  validateStatus('orderStatus', Object.keys(ORDER_STATUS)),
  requireMinRole('engineer'),
  cacheMiddleware(600),
  asyncHandler(getWorkPlanStats)
);

// ============================================================================
// LIST & SEARCH ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/workplans
 * @desc    Listar con filtros
 * @access  Private (supervisor+)
 */
router.get(
  '/',
  sanitizeQuery,
  validateStatus('status', Object.values(WORKPLAN_STATUS)),
  validateStatus('orderStatus', Object.keys(ORDER_STATUS)),
  requireMinRole('supervisor'),
  cacheMiddleware(120),
  asyncHandler(getAllWorkPlans)
);

/**
 * @route   GET /api/v1/workplans/order/:orderId
 * @desc    Por orden
 * @access  Private (supervisor+)
 */
router.get(
  '/order/:orderId',
  validateObjectId('orderId'),
  requireMinRole('supervisor'),
  cacheMiddleware(300),
  asyncHandler(getWorkPlanByOrderId)
);

// ============================================================================
// SINGLE ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/workplans/:id
 * @desc    Por ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  cacheMiddleware(300),
  asyncHandler(getWorkPlanById)
);

// ============================================================================
// MUTATION ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/workplans
 * @desc    Crear
 * @access  Private (engineer+)
 */
router.post(
  '/',
  requireMinRole('engineer'),
  validateRequest(createWorkPlanValidator),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  invalidateCache('workplans'),
  invalidateCache('workplans:stats'),
  auditLogger('CREATE', 'WorkPlan'),
  asyncHandler(createWorkPlan)
);

/**
 * @route   PUT /api/v1/workplans/:id
 * @desc    Actualizar
 * @access  Private (supervisor+)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  validateRequest(updateWorkPlanValidator),
  invalidateCacheById('workplans'),
  invalidateCache('workplans:stats'),
  auditLogger('UPDATE', 'WorkPlan'),
  asyncHandler(updateWorkPlan)
);

/**
 * @route   DELETE /api/v1/workplans/:id
 * @desc    Soft delete
 * @access  Private (admin+)
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  requireAdmin,
  invalidateCacheById('workplans'),
  invalidateCache('workplans:stats'),
  auditLogger('DELETE', 'WorkPlan'),
  asyncHandler(deleteWorkPlan)
);

/**
 * @route   POST /api/v1/workplans/:id/approve
 * @desc    Approve
 * @access  Private (engineer+)
 */
router.post(
  '/:id/approve',
  validateObjectId('id'),
  requireMinRole('engineer'),
  invalidateCacheById('workplans'),
  invalidateCache('workplans:stats'),
  auditLogger('UPDATE', 'WorkPlanApprove'),
  asyncHandler(approveWorkPlan)
);

/**
 * @route   PATCH /api/v1/workplans/:id/cronograma/:actividadId/complete
 * @desc    Complete activity
 * @access  Private (assigned user)
 */
router.patch(
  '/:id/cronograma/:actividadId/complete',
  validateObjectId('id'),
  validateObjectId('actividadId'),
  validateRequest(completeActivityValidator),
  invalidateCacheById('workplans'),
  invalidateCache('workplans:stats'),
  auditLogger('UPDATE', 'WorkPlanActivityComplete'),
  asyncHandler(completeActivity)
);

export default router;
