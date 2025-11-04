/**
 * Users Routes (TypeScript - November 2025 - FIXED)
 * @description Rutas modulares para gestión de usuarios CERMONT ATG
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  getUsersByRole,
  getUserStats,
} from '../controllers/users.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin, requireMinRole } from '../middleware/rbac';
import { validateObjectId } from '../middleware/validate';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import { HTTP_STATUS, ROLES } from '../utils/constants';
import { Role } from '../types';
import { TypedRequest, AuthenticatedRequest, ApiResponse } from '../types/express.types';

// ==================== HELPER FUNCTIONS ====================

const errorResponse = (res: Response, message: string, statusCode: number) => {
  return res.status(statusCode).json({
    success: false,
    error: { message },
  });
};

const auditLogger = (action: string, resource: string) => {
  return (req: TypedRequest | Request, res: Response, next: NextFunction): void => {
    next();
  };
};

const cacheMiddleware = (ttl: number) => {
  return (req: TypedRequest | Request, res: Response, next: NextFunction): void => {
    next();
  };
};

const invalidateCache = (pattern: string) => {
  return (req: TypedRequest | Request, res: Response, next: NextFunction): void => {
    next();
  };
};

const invalidateCacheById = (pattern: string) => {
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

const canModifyRole = (roleField: string) => {
  return (req: TypedRequest | Request, res: Response, next: NextFunction): void => {
    const role = (req.body as any)[roleField];
    if (role && role === 'root') {
      errorResponse(res, 'Cannot assign root role', HTTP_STATUS.FORBIDDEN);
      return;
    }
    next();
  };
};

const validateRole = (param: string) => {
  return (req: TypedRequest | Request, res: Response, next: NextFunction): void => {
    const role = req.params[param];
    if (role && !Object.values(ROLES).includes(role as Role)) {
      errorResponse(res, 'Invalid role', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    next();
  };
};

const asyncHandler = (fn: Function) => {
  return (req: TypedRequest | Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ==================== INTERFACES ====================

interface CreateUserBody {
  nombre: string;
  email: string;
  password: string;
  rol: Role;
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
  activo?: boolean;
}

interface UpdateUserBody {
  nombre?: string;
  email?: string;
  rol?: Role;
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
  activo?: boolean;
}

// ==================== ROUTER ====================

const router = Router();

// Auth required for all
router.use(authenticate);

// ============================================================================
// STATS & FILTERED ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/users/stats/summary
 * @desc    Summary stats
 * @access  Private (admin+)
 */
router.get(
  '/stats/summary',
  sanitizeQuery,
  requireAdmin,
  cacheMiddleware(600),
  asyncHandler(getUserStats)
);

/**
 * @route   GET /api/v1/users/role/:rol
 * @desc    By role
 * @access  Private (engineer+)
 */
router.get(
  '/role/:rol',
  validateRole('rol'),
  sanitizeQuery,
  requireMinRole('engineer'),
  cacheMiddleware(180),
  asyncHandler(getUsersByRole)
);

// ============================================================================
// LIST & SINGLE ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/users
 * @desc    Listar filtrado
 * @access  Private (engineer+)
 */
router.get(
  '/',
  sanitizeQuery,
  requireMinRole('engineer'),
  cacheMiddleware(120),
  asyncHandler(getAllUsers)
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Por ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  cacheMiddleware(300),
  asyncHandler(getUserById)
);

// ============================================================================
// MUTATION ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/users
 * @desc    Crear
 * @access  Private (admin+)
 */
router.post(
  '/',
  requireAdmin,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }),
  validateRequest,
  canModifyRole('rol'),
  invalidateCache('users'),
  invalidateCache('users:stats'),
  auditLogger('CREATE', 'User'),
  asyncHandler(createUser)
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Actualizar
 * @access  Private (owner or admin+)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  validateRequest,
  canModifyRole('rol'),
  invalidateCacheById('users'),
  invalidateCache('users:stats'),
  auditLogger('UPDATE', 'User'),
  asyncHandler(updateUser)
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Soft delete
 * @access  Private (admin+)
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  requireAdmin,
  invalidateCacheById('users'),
  invalidateCache('users:stats'),
  auditLogger('DELETE', 'User'),
  asyncHandler(deleteUser)
);

/**
 * @route   PATCH /api/v1/users/:id/toggle-active
 * @desc    Toggle active
 * @access  Private (admin+)
 */
router.patch(
  '/:id/toggle-active',
  validateObjectId('id'),
  requireAdmin,
  invalidateCacheById('users'),
  invalidateCache('users:stats'),
  auditLogger('UPDATE', 'UserActive'),
  asyncHandler(toggleUserActive)
);

export default router;
