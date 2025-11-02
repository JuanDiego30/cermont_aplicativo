/**
 * WorkPlans Routes
 * @description Rutas para planes de trabajo
 */

import { Router } from 'express';
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
} from '../controllers/workplans.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole, requireAdmin } from '../middleware/rbac.js';
import { validateObjectId } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authenticate);

/**
 * @route   GET /api/v1/workplans/stats/summary
 * @desc    Obtener estadísticas de planes de trabajo
 * @access  Private (Admin, Engineer)
 */
router.get(
  '/stats/summary',
  requireMinRole('engineer'),
  getWorkPlanStats
);

/**
 * @route   GET /api/v1/workplans
 * @desc    Obtener todos los planes de trabajo
 * @access  Private
 */
router.get(
  '/',
  getAllWorkPlans
);

/**
 * @route   GET /api/v1/workplans/order/:orderId
 * @desc    Obtener plan de trabajo por orden
 * @access  Private
 */
router.get(
  '/order/:orderId',
  validateObjectId('orderId'),
  getWorkPlanByOrderId
);

/**
 * @route   GET /api/v1/workplans/:id
 * @desc    Obtener plan de trabajo por ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  getWorkPlanById
);

/**
 * @route   POST /api/v1/workplans
 * @desc    Crear plan de trabajo
 * @access  Private (Engineer, Admin)
 */
router.post(
  '/',
  requireMinRole('engineer'),
  createRateLimiter,
  createWorkPlan
);

/**
 * @route   PUT /api/v1/workplans/:id
 * @desc    Actualizar plan de trabajo
 * @access  Private (Engineer, Admin, Supervisor)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  updateWorkPlan
);

/**
 * @route   DELETE /api/v1/workplans/:id
 * @desc    Eliminar plan de trabajo
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  requireAdmin,
  deleteWorkPlan
);

/**
 * @route   POST /api/v1/workplans/:id/approve
 * @desc    Aprobar plan de trabajo
 * @access  Private (Engineer, Admin)
 */
router.post(
  '/:id/approve',
  validateObjectId('id'),
  requireMinRole('engineer'),
  approveWorkPlan
);

/**
 * @route   PATCH /api/v1/workplans/:id/cronograma/:actividadId/complete
 * @desc    Marcar actividad del cronograma como completada
 * @access  Private
 */
router.patch(
  '/:id/cronograma/:actividadId/complete',
  validateObjectId('id'),
  completeActivity
);

export default router;
