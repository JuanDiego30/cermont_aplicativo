/**
 * Rutas de Planes de Trabajo
 *
 * @file backend/src/infra/http/routes/workplans.routes.ts
 */

import { Router } from 'express';
import { WorkPlansController } from '../controllers/WorkPlansController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { validateMiddleware } from '../../../shared/middlewares/validateMiddleware.js';
import {
  createWorkPlanSchema,
  updateWorkPlanSchema,
  approveWorkPlanSchema,
  rejectWorkPlanSchema
} from '../schemas/validation.schemas.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Todas las rutas requieren autenticaci�n
router.use(authenticate);

/**
 * @route   POST /api/workplans
 * @desc    Crear plan de trabajo
 * @access  Private
 */
router.post(
  '/',
  authorize([PERMISSIONS.WORKPLANS_CREATE]),
  validateMiddleware(createWorkPlanSchema),
  WorkPlansController.create
);

/**
 * @route   GET /api/workplans/:id
 * @desc    Obtener plan de trabajo por ID
 * @access  Private
 */
router.get(
  '/:id',
  authorize([PERMISSIONS.WORKPLANS_VIEW]),
  WorkPlansController.getById
);

/**
 * @route   PATCH /api/workplans/:id
 * @desc    Actualizar plan de trabajo
 * @access  Private
 */
router.patch(
  '/:id',
  authorize([PERMISSIONS.WORKPLANS_UPDATE]),
  validateMiddleware(updateWorkPlanSchema),
  WorkPlansController.update
);

/**
 * @route   POST /api/workplans/:id/approve
 * @desc    Aprobar plan de trabajo
 * @access  Private
 */
router.post(
  '/:id/approve',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  validateMiddleware(approveWorkPlanSchema),
  WorkPlansController.approve
);

/**
 * @route   POST /api/workplans/:id/reject
 * @desc    Rechazar plan de trabajo
 * @access  Private
 */
router.post(
  '/:id/reject',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  validateMiddleware(rejectWorkPlanSchema),
  WorkPlansController.reject
);

/**
 * @route   GET /api/workplans/:id/pdf
 * @desc    Generar PDF del plan de trabajo
 * @access  Private
 */
// router.get(
//   '/:id/pdf',
//   authorize([PERMISSIONS.WORKPLANS_VIEW]),
//   WorkPlansController.generatePDF
// );

export default router;
