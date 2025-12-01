/**
 * HTTP Routes: Equipment
 * Define rutas REST para gestión de equipos certificados
 * 
 * @file backend/src/infra/http/routes/equipment.routes.ts
 */

import { Router } from 'express';
import { EquipmentController } from '../controllers/EquipmentController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// ============================================================================
// Public Routes (require authentication only)
// ============================================================================

/**
 * GET /api/equipment
 * Lista todos los equipos con filtros y paginación
 * Requiere: Autenticación
 */
router.get(
  '/',
  authenticate,
  authorize([
    PERMISSIONS.EQUIPMENT_READ,
    PERMISSIONS.WORKPLANS_VIEW,
    PERMISSIONS.ORDERS_VIEW,
  ]),
  EquipmentController.list
);

/**
 * GET /api/equipment/:id
 * Obtiene detalles de un equipo específico
 * Requiere: Autenticación
 */
router.get(
  '/:id',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_READ]),
  EquipmentController.getById
);

// ============================================================================
// Equipment Management Routes (require specific permissions)
// ============================================================================

/**
 * POST /api/equipment
 * Crea un nuevo equipo certificado
 * Requiere: Permiso de escritura
 */
router.post(
  '/',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_WRITE]),
  EquipmentController.create
);

/**
 * PATCH /api/equipment/:id
 * Actualiza un equipo existente
 * Requiere: Permiso de escritura
 */
router.patch(
  '/:id',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_WRITE]),
  EquipmentController.update
);

/**
 * DELETE /api/equipment/:id
 * Elimina un equipo (soft delete)
 * Requiere: Permiso de eliminación
 */
router.delete(
  '/:id',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_DELETE]),
  EquipmentController.delete
);

// ============================================================================
// Statistics Routes
// ============================================================================

/**
 * GET /api/equipment/stats/by-status
 * Estadísticas de equipos agrupadas por estado
 */
router.get(
  '/stats/by-status',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_READ, PERMISSIONS.DASHBOARD_VIEW_STATS]),
  EquipmentController.statsByStatus
);

/**
 * GET /api/equipment/stats/by-category
 * Estadísticas de equipos agrupadas por categoría
 */
router.get(
  '/stats/by-category',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_READ, PERMISSIONS.DASHBOARD_VIEW_STATS]),
  EquipmentController.statsByCategory
);

// ============================================================================
// Certification Alerts
// ============================================================================

/**
 * GET /api/equipment/alerts/expiring
 * Obtiene lista de equipos con certificaciones próximas a vencer
 * Requiere: Autenticación
 */
router.get(
  '/alerts/expiring',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_READ]),
  EquipmentController.getExpiringAlerts
);

// ============================================================================
// Equipment Assignment Routes
// ============================================================================

/**
 * PATCH /api/equipment/:id/assign
 * Asigna un equipo a un usuario específico
 * Requiere: Permiso de escritura
 */
router.patch(
  '/:id/assign',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_WRITE, PERMISSIONS.ORDERS_ASSIGN]),
  EquipmentController.assign
);

/**
 * PATCH /api/equipment/:id/release
 * Libera un equipo (marca como disponible)
 * Requiere: Permiso de escritura
 */
router.patch(
  '/:id/release',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_WRITE]),
  EquipmentController.release
);

// ============================================================================
// Category-Specific Routes
// ============================================================================

/**
 * GET /api/equipment/category/:category/available
 * Lista equipos disponibles de una categoría específica
 * Útil para selección en planes de trabajo
 */
router.get(
  '/category/:category/available',
  authenticate,
  authorize([PERMISSIONS.EQUIPMENT_READ, PERMISSIONS.WORKPLANS_VIEW]),
  EquipmentController.getAvailableByCategory
);

export default router;
