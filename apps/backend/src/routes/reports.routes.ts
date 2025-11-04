/**
 * CCTV Routes (TypeScript - November 2025)
 * @description Rutas modulares para gestión de reportes CCTV en CERMONT ATG. CRUD completo con filtros avanzados (por orden, status,
 * fechas, assigned), aprobación workflow (pending → approved/rejected), y queries por orden de trabajo. Integrado con RBAC
 * (technician para create, supervisor para approve, engineer para update/delete, admin para all). Middleware: auth global,
 * cache on GET (invalidate on mutations), audit on CREATE/UPDATE/APPROVE/DELETE, rateLimit on POST. Swagger: Full docs con examples.
 * Performance: Pagination (default 10-50), lean queries en controller, indexes Mongo (orderId, status, fechaCreacion, approvedBy).
 * Secure: Sanitize inputs, ObjectId validation, status transitions valid (e.g., approved solo si pending). Missing: Export PDF
 * (integrate upload/evidence), bulk approve, websocket notifs (approval via Socket.IO). Usage: /cctv (list), /:id (get/update),
 * /:id/approve (post), /order/:orderId (get). Integrates: Populates order/user/evidence (virtuals en model CctvReport).
 * No direct DB (via controllers/asyncHandler). Para ATG: Tied a orders (require orderId en create), audit sensitive (CCTV data).
 * Pruebas: Jest supertest (GET /cctv 200 paginated, POST /cctv 201 create with orderId, POST /:id/approve 200 transition,
 * 403 low role, 404 invalid id, 429 rate limit, cache hit/miss, validate order exists). Types: Params: { id: string, orderId: string },
 * Bodies: CreateCctvReportBody, etc. Schemas: Ajv/Zod for validation.
 * Fixes: Paths adjusted to /cctv base (no /reports prefix, matches v1 index mount). Imports .ts. requireMinRole for granular RBAC.
 * Assumes: Controllers: async (req: AuthRequest<Params, {}, Body>, res: Response). ENV for rate limits. Model: CctvReport with ref Order/Evidence.
 * Deps: express ^4+, mongoose ^7+, @types/express.
 */

import { Router, Request, Response, NextFunction } from 'express';
import {
  getAllCctvReports,
  getCctvReportById,
  createCctvReport,
  updateCctvReport,
  deleteCctvReport,
  approveCctvReport,
  getReportsByOrder,
} from '../controllers/reports.controller';
import { authenticate } from '../middleware/auth';
import { requireMinRole } from '../middleware/rbac';
import { validateObjectId } from '../middleware/validate';
import { createRateLimiter } from '../middleware/rateLimiter';
import { createAuditLog as auditLogger } from '../middleware/auditLogger'; // For CCTV events
import { cacheMiddleware, invalidateCache, invalidateCacheById } from '../utils/asyncHandler';
import { sanitizeQuery } from '../utils/asyncHandler'; // Sanitiza filtros

// Interfaces for type safety (request params/bodies/queries, extend if validation schemas used)
interface CctvIdParams {
  id: string;
}

interface OrderIdParams {
  orderId: string;
}

interface CreateCctvReportBody {
  orderId: string;
  descripcion: string;
  tipoFalla: 'hardware' | 'software' | 'conexion' | 'configuracion';
  severidad: 'low' | 'medium' | 'high' | 'critical';
  recomendaciones: string;
  evidenciaIds?: string[]; // ObjectIds
  fechaInspeccion?: string;
}

interface UpdateCctvReportBody {
  descripcion?: string;
  tipoFalla?: 'hardware' | 'software' | 'conexion' | 'configuracion';
  severidad?: 'low' | 'medium' | 'high' | 'critical';
  recomendaciones?: string;
  evidenciaIds?: string[];
  // ... partial fields
}

interface ApproveCctvReportBody {
  status: 'approved' | 'rejected';
  comentario: string;
}

const router: Router = Router();

// Auth required for all (RBAC granular per route)
router.use(authenticate);

// ============================================================================
// STATS & LIST ROUTES (Read-heavy, cached)
// ============================================================================

/**
 * @route   GET /api/v1/cctv
 * @desc    Listar con filtros (cached 2min, query optimizada con indexes)
 * @access  Private
 */
router.get<{}, {}, {}, { page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc'; search?: string; status?: 'pending' | 'approved' | 'rejected'; orderId?: string; fechaDesde?: string; fechaHasta?: string }>('/cctv',
  sanitizeQuery,
  cacheMiddleware(120), // 2min cache
  getAllCctvReports
);

// ============================================================================
// SINGLE REPORT ROUTES (GET/PUT/DELETE)
// ============================================================================

/**
 * @route   GET /api/v1/cctv/:id
 * @desc    Detalle por ID (cached 5min)
 * @access  Private
 */
router.get<CctvIdParams, {}, {}>('/cctv/:id',
  validateObjectId('id'),
  cacheMiddleware(300),
  getCctvReportById
);

/**
 * @route   POST /api/v1/cctv
 * @desc    Crear (rate limit, audit, invalidate cache, check order exists)
 * @access  Private (technician+)
 */
router.post<{}, {}, CreateCctvReportBody>('/cctv',
  requireMinRole('technician'),
  createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10/15min (CCTV sensitive)
  invalidateCache('cctv:stats'), // Global stats
  auditLogger('CREATE', 'CctvReport'),
  createCctvReport
);

/**
 * @route   PUT /api/v1/cctv/:id
 * @desc    Actualizar (audit, invalidate by ID, check ownership)
 * @access  Private (engineer+ or creator)
 */
router.put<CctvIdParams, {}, UpdateCctvReportBody>('/cctv/:id',
  validateObjectId('id'),
  requireMinRole('engineer'), // Controller check para creator fallback
  invalidateCacheById('cctv'),
  auditLogger('UPDATE', 'CctvReport'),
  updateCctvReport
);

/**
 * @route   DELETE /api/v1/cctv/:id
 * @desc    Delete (audit, invalidate)
 * @access  Private (engineer+)
 */
router.delete<CctvIdParams, {}, {}>('/cctv/:id',
  validateObjectId('id'),
  requireMinRole('engineer'),
  invalidateCacheById('cctv'),
  auditLogger('DELETE', 'CctvReport'),
  deleteCctvReport
);

// ============================================================================
// SUB-ROUTES (Approve, By Order)
// ============================================================================

/**
 * @route   POST /api/v1/cctv/:id/approve
 * @desc    Aprobar (validate pending, audit, invalidate stats/list)
 * @access  Private (supervisor+)
 */
router.post<CctvIdParams, {}, ApproveCctvReportBody>('/cctv/:id/approve',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  invalidateCache('cctv:stats'),
  invalidateCacheById('cctv'),
  auditLogger('UPDATE', 'CctvReportApproval'),
  approveCctvReport
);

/**
 * @route   GET /api/v1/cctv/order/:orderId
 * @desc    Por orden (cached 3min, check order access via RBAC)
 * @access  Private
 */
router.get<OrderIdParams, {}, {}, { status?: 'pending' | 'approved' | 'rejected'; page?: number; limit?: number }>('/order/:orderId',
  validateObjectId('orderId'),
  sanitizeQuery, // Para status/page
  cacheMiddleware(180),
  getReportsByOrder
);

export default router;
