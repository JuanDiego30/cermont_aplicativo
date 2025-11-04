/**
 * Audit Log Routes (TypeScript - November 2025)
 * @description Rutas para gestión y consulta de logs de auditoría en CERMONT ATG. Soporte para filtros avanzados, paginación,
 * exportación (CSV/JSON), y estadísticas agregadas. Acceso restringido por RBAC: coordinator+ para logs básicos, admin/root para
 * alertas sensibles/user activity. Integrado con auditLogger para trackear accesos a audits (meta-audit). Para ATG: Filter by
 * action='ORDER_*' | 'CCTV_*', resource='Order' | 'CctvReport'.
 * Uso: app.use('/api/v1/audit-logs', auditLogRoutes); // Mount
 * Nota: All queries lean/paginated (limit=50 default, max=100). Export: ?format=csv (controller handles). Sensitive: Mask IPs
 *       in response for non-root. Indexes: Model has {timestamp: -1, severity: 1, userId: 1}. Para dev: Limit results.
 *       Future: Webhook alerts for HIGH severity (integrate socket.io).
 * Pruebas: Jest supertest (401 unauth, 403 low role, 200 paginated, 422 invalid query), export stream large data.
 * Types: Interfaces for queries/params (e.g., AuditLogsQuery: action?: string[], userId?: string). Middleware: Typed req.user: UserDoc.
 * Fixes: Imports .ts. requireMinRole('coordinator'): Middleware. validateRequest: Schema object. auditLogger(string). 404: Typed.
 * Assumes: AuditLog model lean(). Controllers: async (req: AuthRequest<Query>, res, next), paginatedResponse (total, data, page, limit).
 * Deps: express ^4+, mongoose ^7+ for ObjectId format.
 */

import express, { Router, Request, Response, NextFunction } from 'express';
import {
  getAuditLogs,
  getUserActivity,
  getSecurityAlerts,
  getAuditStats,
} from '../controllers/auditLog.controller';
import { authenticate } from '../middleware/auth'; // Adds req.user: UserDoc
import { requireMinRole } from '../middleware/rbac'; // (role: Rol): Middleware, uses hierarchy
import { validateRequest } from '../middleware/validateRequest'; // (schema: object): Middleware
import { auditLogger } from '../middleware/auditLogger'; // (action: string): Middleware for meta-audit

// Interfaces for queries/params (type safety in controllers)
interface CommonAuditQuery {
  page?: number;
  limit?: number;
  action?: string | string[]; // Single or array
  resource?: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
  userId?: string; // ObjectId string
  startDate?: string; // ISO date
  endDate?: string;
  ip?: string;
}

interface AuditLogsQuery extends CommonAuditQuery {}

interface UserActivityQuery extends CommonAuditQuery {
  export?: 'csv' | 'json';
}

interface SecurityAlertsQuery {
  severity?: 'HIGH' | 'MEDIUM';
  period?: '24h' | '7d' | '30d';
  limit?: number;
  page?: number;
}

interface AuditStatsQuery {
  period?: '7d' | '30d' | 'all';
  groupBy?: 'action' | 'resource' | 'user' | 'severity';
}

interface ExportAuditQuery extends CommonAuditQuery {
  format: 'csv' | 'json';
  page?: number;
  limit?: number; // Higher max for export
}

interface UserParams {
  userId: string;
}

const router: Router = express.Router();

// Global: Auth required for all
router.use(authenticate);

// Rate limit audit routes (low, e.g., 20/min per user, to prevent abuse)
// Assume separate rateLimiter instance
router.use((req: Request, res: Response, next: NextFunction) => {
  // Key: `audit:${req.user?._id}` - Implement in rateLimiter.ts
  next();
});

/**
 * @route   GET /api/v1/audit-logs/
 * @desc    Obtener logs de auditoría con filtros avanzados y paginación
 * @access  Private (Coordinator+)
 * @query   { page: integer (1), limit: integer (1-100), action?: string|array, resource?: string, severity?: HIGH|MEDIUM|LOW,
 *           userId?: ObjectId, startDate?: date, endDate?: date, ip?: string }
 * @response { logs: array, pagination: { total, page, limit, pages }, filtersApplied: boolean }
 */
router.get<AuditLogsQuery>(
  '/',
  requireMinRole('coordinator'), // coordinator_hes, engineer, etc. via hierarchy
  validateRequest({
    query: {
      page: { type: 'integer', min: 1, default: 1 },
      limit: { type: 'integer', min: 1, max: 100, default: 50 },
      action: { type: ['string', 'array'], optional: true }, // e.g., 'LOGIN' or ['CREATE_ORDER', 'UPDATE_USER']
      resource: { type: 'string', optional: true }, // e.g., 'User', 'Order'
      severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'], optional: true },
      userId: { type: 'string', format: 'mongo-id', optional: true },
      startDate: { type: 'date-time', optional: true },
      endDate: { type: 'date-time', optional: true },
      ip: { type: 'string', format: 'ip', optional: true },
    },
  }),
  auditLogger('VIEW_AUDIT_LOGS'), // Meta-audit: Who viewed what
  getAuditLogs
);

/**
 * @route   GET /api/v1/audit-logs/user/:userId
 * @desc    Obtener actividad específica de un usuario (paginated, filters como arriba)
 * @access  Private (Coordinator+)
 * @params  { userId: ObjectId (required) }
 * @query   Igual que arriba, + export?: 'csv'|'json'
 * @response { activities: array (masked for privacy), totalActions, avgSeverity }
 */
router.get<UserParams, {}, {}, UserActivityQuery>(
  '/user/:userId',
  requireMinRole('coordinator'),
  validateRequest({
    params: {
      userId: { type: 'string', format: 'mongo-id', required: true },
    },
    query: {
      page: { type: 'integer', min: 1, default: 1 },
      limit: { type: 'integer', min: 1, max: 100, default: 50 },
      action: { type: ['string', 'array'], optional: true },
      resource: { type: 'string', optional: true },
      severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'], optional: true },
      startDate: { type: 'date-time', optional: true },
      endDate: { type: 'date-time', optional: true },
      ip: { type: 'string', format: 'ip', optional: true },
      export: { type: 'string', enum: ['csv', 'json'], optional: true },
    },
  }),
  auditLogger('VIEW_USER_ACTIVITY'),
  getUserActivity
);

/**
 * @route   GET /api/v1/audit-logs/security-alerts
 * @desc    Obtener alertas de seguridad (solo HIGH/MEDIUM, last 24h/7d por default)
 * @access  Private (Admin+)
 * @query   { severity: HIGH|MEDIUM (default HIGH), period: '24h'|'7d'|'30d' (default 24h), limit: 1-50 }
 * @response { alerts: array (detailed, no mask), countBySeverity, topIPs }
 */
router.get<SecurityAlertsQuery>(
  '/security-alerts',
  requireMinRole('admin'), // Stricter: admin/root only
  validateRequest({
    query: {
      severity: { type: 'string', enum: ['HIGH', 'MEDIUM'], default: 'HIGH' },
      period: { type: 'string', enum: ['24h', '7d', '30d'], default: '24h' },
      limit: { type: 'integer', min: 1, max: 50, default: 20 },
      page: { type: 'integer', min: 1, default: 1 },
    },
  }),
  auditLogger('VIEW_SECURITY_ALERTS'),
  getSecurityAlerts
);

/**
 * @route   GET /api/v1/audit-logs/stats
 * @desc    Obtener estadísticas agregadas de auditoría (counts by action/resource/severity, trends)
 * @access  Private (Coordinator+)
 * @query   { period: '7d'|'30d'|'all' (default 30d), groupBy?: 'action'|'resource'|'user'|'severity' }
 * @response { stats: object (counts, avg, trends array), totalLogs }
 */
router.get<AuditStatsQuery>(
  '/stats',
  requireMinRole('coordinator'),
  validateRequest({
    query: {
      period: { type: 'string', enum: ['7d', '30d', 'all'], default: '30d' },
      groupBy: { type: 'string', enum: ['action', 'resource', 'user', 'severity'], optional: true },
    },
  }),
  auditLogger('VIEW_AUDIT_STATS'),
  getAuditStats
);

/**
 * @route   GET /api/v1/audit-logs/export
 * @desc    Exportar logs (CSV/JSON, filtered como GET /)
 * @access  Private (Admin+)
 * @query   { format: 'csv'|'json' (required), + all filters from GET / }
 * @response CSV file download or JSON array (large: stream in controller)
 */
router.get<ExportAuditQuery>(
  '/export',
  requireMinRole('admin'),
  validateRequest({
    query: {
      format: { type: 'string', enum: ['csv', 'json'], required: true },
      page: { type: 'integer', min: 1, default: 1 },
      limit: { type: 'integer', min: 1, max: 1000, default: 1000 }, // Higher for export
      action: { type: ['string', 'array'], optional: true },
      resource: { type: 'string', optional: true },
      severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'], optional: true },
      userId: { type: 'string', format: 'mongo-id', optional: true },
      startDate: { type: 'date-time', optional: true },
      endDate: { type: 'date-time', optional: true },
      ip: { type: 'string', format: 'ip', optional: true },
    },
  }),
  auditLogger('EXPORT_AUDIT_LOGS'),
  exportAuditLogs
);

// 404 for invalid audit routes (typed)
router.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: 'Ruta de auditoría no encontrada' });
});

export default router;
