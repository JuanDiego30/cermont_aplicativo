/**
 * ToolKits Routes (TypeScript - November 2025 - FIXED)
 * @description Rutas modulares para gestión de kits de herramientas CERMONT ATG
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllToolKits,
  getToolKitById,
  getToolKitsByCategory,
  createToolKit,
  updateToolKit,
  deleteToolKit,
  incrementToolKitUsage,
  getMostUsedToolKits,
  cloneToolKit,
  toggleToolKitActive,
  getToolKitStats,
} from '../controllers/toolkits.controller';
import { authenticate } from '../middleware/auth';
import { requireMinRole } from '../middleware/rbac';
import { validateObjectId } from '../middleware/validate';
import { createRateLimiter } from '../middleware/rateLimiter';

// ==================== HELPER FUNCTIONS ====================

const auditLogger = (action: string, resource: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    next();
  };
};

const cacheMiddleware = (ttl: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    next();
  };
};

const invalidateCache = (pattern: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

const sanitizeParams = (req: Request, res: Response, next: NextFunction): void => {
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = (req.params[key] as string).trim();
      }
    });
  }
  next();
};

const validateCategory = (paramName: string) => {
  const validCategories = ['electrico', 'mecanico', 'cctv', 'general'];
  return (req: Request, res: Response, next: NextFunction): void => {
    const category = req.params[paramName] || req.query[paramName];
    if (category && !validCategories.includes(category as string)) {
      return res.status(400).json({
        success: false,
        error: { message: `Invalid category: ${category}` },
      });
    }
    next();
  };
};

// ==================== INTERFACES ====================

interface CreateToolKitBody {
  nombre: string;
  descripcion?: string;
  categoria: 'electrico' | 'mecanico' | 'cctv' | 'general';
  activo?: boolean;
  tools: Array<{
    nombre: string;
    cantidad: number;
    unidad: string;
  }>;
}

interface UpdateToolKitBody {
  nombre?: string;
  descripcion?: string;
  categoria?: 'electrico' | 'mecanico' | 'cctv' | 'general';
  activo?: boolean;
  tools?: Array<{
    nombre: string;
    cantidad: number;
    unidad: string;
  }>;
}

interface UseToolKitBody {
  orderId?: string;
  quantity?: number;
}

interface CloneToolKitBody {
  suffix?: string;
}

// ==================== ROUTER ====================

const router = Router();

// Auth required for all
router.use(authenticate);

// ============================================================================
// STATS ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/toolkits/stats/summary
 * @desc    Summary stats
 * @access  Private (engineer+)
 */
router.get(
  '/stats/summary',
  sanitizeQuery,
  requireMinRole('engineer'),
  cacheMiddleware(600),
  getToolKitStats
);

/**
 * @route   GET /api/v1/toolkits/stats/most-used
 * @desc    Most used
 * @access  Private (engineer+)
 */
router.get(
  '/stats/most-used',
  sanitizeQuery,
  requireMinRole('engineer'),
  cacheMiddleware(300),
  getMostUsedToolKits
);

// ============================================================================
// LIST & SEARCH ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/toolkits
 * @desc    Listar con filtros
 * @access  Private
 */
router.get(
  '/',
  sanitizeQuery,
  cacheMiddleware(120),
  getAllToolKits
);

/**
 * @route   GET /api/v1/toolkits/category/:categoria
 * @desc    Por categoría
 * @access  Private
 */
router.get(
  '/category/:categoria',
  validateCategory('categoria'),
  cacheMiddleware(180),
  getToolKitsByCategory
);

// ============================================================================
// SINGLE ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/toolkits/:id
 * @desc    Detalle por ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  cacheMiddleware(300),
  getToolKitById
);

// ============================================================================
// MUTATION ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/toolkits
 * @desc    Crear
 * @access  Private (supervisor+)
 */
router.post(
  '/',
  requireMinRole('supervisor'),
  createRateLimiter,
  invalidateCache('toolkits'),
  auditLogger('CREATE', 'ToolKit'),
  createToolKit
);

/**
 * @route   PUT /api/v1/toolkits/:id
 * @desc    Actualizar
 * @access  Private (supervisor+)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  invalidateCacheById('toolkits'),
  auditLogger('UPDATE', 'ToolKit'),
  updateToolKit
);

/**
 * @route   DELETE /api/v1/toolkits/:id
 * @desc    Soft delete
 * @access  Private (admin)
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  requireMinRole('admin'),
  invalidateCacheById('toolkits'),
  auditLogger('DELETE', 'ToolKit'),
  deleteToolKit
);

/**
 * @route   POST /api/v1/toolkits/:id/use
 * @desc    Increment usage
 * @access  Private
 */
router.post(
  '/:id/use',
  validateObjectId('id'),
  invalidateCache('toolkits:stats'),
  incrementToolKitUsage
);

/**
 * @route   POST /api/v1/toolkits/:id/clone
 * @desc    Clonar
 * @access  Private (supervisor+)
 */
router.post(
  '/:id/clone',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  invalidateCache('toolkits'),
  auditLogger('CREATE', 'ToolKitClone'),
  cloneToolKit
);

/**
 * @route   PATCH /api/v1/toolkits/:id/toggle-active
 * @desc    Toggle active
 * @access  Private (admin)
 */
router.patch(
  '/:id/toggle-active',
  validateObjectId('id'),
  requireMinRole('admin'),
  invalidateCacheById('toolkits'),
  invalidateCache('toolkits:stats'),
  auditLogger('UPDATE', 'ToolKitActive'),
  toggleToolKitActive
);

export default router;
