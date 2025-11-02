import express from 'express';
import { getAuditLogs, getUserActivity, getSecurityAlerts, getAuditStats } from '../controllers/auditLog.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole } from '../middleware/rbac.js';

const router = express.Router();

/**
 * Todas las rutas de audit logs requieren autenticación
 * y solo admins/coordinadores pueden consultarlas
 */

// Obtener logs con filtros y paginación
router.get('/',
  authenticate,
  requireMinRole('coordinator'),
  getAuditLogs
);

// Obtener actividad de un usuario específico
router.get('/user/:userId',
  authenticate,
  requireMinRole('coordinator'),
  getUserActivity
);

// Obtener alertas de seguridad
router.get('/security-alerts',
  authenticate,
  requireMinRole('admin'),
  getSecurityAlerts
);

// Obtener estadísticas de auditoría
router.get('/stats',
  authenticate,
  requireMinRole('coordinator'),
  getAuditStats
);

export default router;