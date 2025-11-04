/**
 * Admin Routes (November 2025)
 * @description Rutas de administración extendidas para gestión de seguridad (rate limiting, IP management, system stats).
 * Todas las rutas requieren autenticación JWT y rol admin/root (RBAC). Integrado con audit logs para tracking de acciones admin.
 * Validación de inputs (IP format, body schemas via Joi/Ajv). Rate limit stats: Paginated, filtered by time/IP. Para ATG: Admin solo (no expose user data).
 *
 * @requires express - Router
 * @requires ../middleware/auth.js - JWT auth + user to req
 * @requires ../middleware/authorize.js - RBAC (admin/root)
 * @requires ../middleware/validate.js - Input validation (IP, body)
 * @requires ../middleware/auditLogger.js - Auto-audit on admin actions
 * @requires ../controllers/admin.controller.js - Handlers (getRateLimitStats, blockIp, etc.)
 * @requires ../utils/constants.js - ADMIN_ROLES ['root', 'admin']
 *
 * Uso: app.use('/api/v1/admin', adminRoutes); // Mount
 *      En controller: Use asyncHandler + successResponse/errorResponse.
 * Nota: IP validation: IPv4/IPv6 via validator.isIP. Block/whitelist: Add to Redis/Mongo + audit. Stats: Aggregate recent (24h/7d) + export CSV.
 *       Secure: No admin routes exposed in Swagger without auth. Rate limit these routes (low, e.g., 10/min). Para dev: Skip auth if env=dev.
 *       Future: Add user management routes here (integrate usersController admin-only).
 */

import express from 'express';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../utils/asyncHandler';
import { validateRequest } from '../middleware/validate';
import { auditLogger } from '../middleware/auditLogger'; // Custom for admin
import { TypedRequest, AuthenticatedRequest, ApiResponse } from '../types/express.types';
import {
  getRateLimitStats,
  blockIp,
  unblockIp,
  whitelistIp,
  removeFromWhitelist,
  resetIpLimit,
  checkIpStatus,
  // New: systemStats, clearCache
  getSystemStats,
  clearCache,
} from '../utils/asyncHandler';

const router = express.Router();

// Global middleware: Auth + RBAC (admin/root only)
router.use(authenticate);
router.use(authorizeRoles('root', 'admin'));

// Rate limit admin routes separately (strict, e.g., 10/min per user)
router.use('/rate-limit', (req, res, next) => {
  // Assume rateLimiter middleware with key `admin:${req.user.id}`
  next();
});

/**
 * @route   GET /api/v1/admin/rate-limit/stats
 * @desc    Obtener estadísticas de rate limiting (paginated, filters: period=24h/7d, ip, page=1&limit=50)
 * @access  Private (Admin)
 * @body    Query: { period?: '24h'|'7d'|'30d', ip?: string, page: number, limit: number }
 */
router.get(
  '/rate-limit/stats',
  validateRequest({
    query: {
      period: { type: 'string', enum: ['24h', '7d', '30d'], optional: true },
      ip: { type: 'string', format: 'ip', optional: true },
      page: { type: 'integer', min: 1, optional: true },
      limit: { type: 'integer', min: 1, max: 100, optional: true },
    },
  }),
  auditLogger('VIEW_RATE_STATS'), // Audit view
  getRateLimitStats
);

/**
 * @route   POST /api/v1/admin/rate-limit/block
 * @desc    Bloquear IP temporal/permanente (body: { ip, duration?: 'temp'|'permanent', reason })
 * @access  Private (Admin)
 * @body    { ip: string (required, IPv4/IPv6), duration: 'temp' (default, 1h) | 'permanent', reason: string }
 */
router.post(
  '/rate-limit/block',
  validateRequest({
    body: {
      ip: { type: 'string', format: 'ip', required: true },
      duration: { type: 'string', enum: ['temp', 'permanent'], optional: true },
      reason: { type: 'string', maxlength: 500, optional: true },
    },
  }),
  auditLogger('BLOCK_IP'),
  blockIp
);

/**
 * @route   POST /api/v1/admin/rate-limit/unblock
 * @desc    Desbloquear IP (body: { ip, reason })
 * @access  Private (Admin)
 * @body    { ip: string (required), reason: string }
 */
router.post(
  '/rate-limit/unblock',
  validateRequest({
    body: {
      ip: { type: 'string', format: 'ip', required: true },
      reason: { type: 'string', maxlength: 500, optional: true },
    },
  }),
  auditLogger('UNBLOCK_IP'),
  unblockIp
);

/**
 * @route   POST /api/v1/admin/rate-limit/whitelist
 * @desc    Agregar IP a whitelist (body: { ip, reason, expiresAt? })
 * @access  Private (Admin)
 * @body    { ip: string (required), reason: string, expiresAt: date (optional) }
 */
router.post(
  '/rate-limit/whitelist',
  validateRequest({
    body: {
      ip: { type: 'string', format: 'ip', required: true },
      reason: { type: 'string', maxlength: 500, required: true },
      expiresAt: { type: 'date-time', optional: true },
    },
  }),
  auditLogger('WHITELIST_IP'),
  whitelistIp
);

/**
 * @route   DELETE /api/v1/admin/rate-limit/whitelist/:ip
 * @desc    Remover IP de whitelist (params: ip)
 * @access  Private (Admin)
 * @params  { ip: string }
 */
router.delete(
  '/rate-limit/whitelist/:ip',
  validateRequest({
    params: {
      ip: { type: 'string', format: 'ip', required: true },
    },
  }),
  auditLogger('REMOVE_WHITELIST_IP'),
  removeFromWhitelist
);

/**
 * @route   POST /api/v1/admin/rate-limit/reset
 * @desc    Resetear límite de IP (body: { ip, reason })
 * @access  Private (Admin)
 * @body    { ip: string (required), reason: string }
 */
router.post(
  '/rate-limit/reset',
  validateRequest({
    body: {
      ip: { type: 'string', format: 'ip', required: true },
      reason: { type: 'string', maxlength: 500, optional: true },
    },
  }),
  auditLogger('RESET_IP_LIMIT'),
  resetIpLimit
);

/**
 * @route   GET /api/v1/admin/rate-limit/check/:ip
 * @desc    Verificar estado de IP (params: ip, query: detailed?=true)
 * @access  Private (Admin)
 * @params  { ip: string }
 * @query   { detailed: boolean (default false) }
 */
router.get(
  '/rate-limit/check/:ip',
  validateRequest({
    params: {
      ip: { type: 'string', format: 'ip', required: true },
    },
    query: {
      detailed: { type: 'boolean', optional: true },
    },
  }),
  auditLogger('CHECK_IP_STATUS'),
  checkIpStatus
);

// New: System-wide admin routes
/**
 * @route   GET /api/v1/admin/system/stats
 * @desc    Obtener estadísticas del sistema (users active, orders count, db size, cache hits)
 * @access  Private (Admin)
 * @query   { period?: '24h'|'7d', detailed?: boolean }
 */
router.get(
  '/system/stats',
  validateRequest({
    query: {
      period: { type: 'string', enum: ['24h', '7d'], optional: true },
      detailed: { type: 'boolean', optional: true },
    },
  }),
  auditLogger('VIEW_SYSTEM_STATS'),
  getSystemStats
);

/**
 * @route   POST /api/v1/admin/system/clear-cache
 * @desc    Limpiar cache global (body: { keys?: array<string>, reason })
 * @access  Private (Admin)
 * @body    { keys: array (optional, specific keys), reason: string (required) }
 */
router.post(
  '/system/clear-cache',
  validateRequest({
    body: {
      keys: { type: 'array', items: { type: 'string' }, optional: true },
      reason: { type: 'string', maxlength: 500, required: true },
    },
  }),
  auditLogger('CLEAR_CACHE'),
  clearCache
);

// 404 handler for admin routes
router.use((req, res) => {
  res.status(404).json({ message: 'Ruta admin no encontrada' });
});

export default router;

