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

// Middleware global de autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/workplans:
 *   post:
 *     summary: Crear plan de trabajo
 *     tags: [WorkPlans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - title
 *               - tasks
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     estimatedHours:
 *                       type: number
 *               estimatedStartDate:
 *                 type: string
 *                 format: date-time
 *               estimatedEndDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Plan de trabajo creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authorize([PERMISSIONS.WORKPLANS_CREATE]),
  validateMiddleware(createWorkPlanSchema),
  WorkPlansController.create
);

/**
 * @swagger
 * /api/workplans/{id}:
 *   get:
 *     summary: Obtener plan de trabajo por ID
 *     tags: [WorkPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalle del plan de trabajo
 *       404:
 *         description: Plan no encontrado
 */
router.get(
  '/:id',
  authorize([PERMISSIONS.WORKPLANS_VIEW]),
  WorkPlansController.getById
);

/**
 * @swagger
 * /api/workplans/{id}:
 *   patch:
 *     summary: Actualizar plan de trabajo
 *     tags: [WorkPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tasks:
 *                 type: array
 *     responses:
 *       200:
 *         description: Plan actualizado
 *       404:
 *         description: Plan no encontrado
 */
router.patch(
  '/:id',
  authorize([PERMISSIONS.WORKPLANS_UPDATE]),
  validateMiddleware(updateWorkPlanSchema),
  WorkPlansController.update
);

/**
 * @swagger
 * /api/workplans/{id}/approve:
 *   post:
 *     summary: Aprobar plan de trabajo
 *     tags: [WorkPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan aprobado
 *       404:
 *         description: Plan no encontrado
 *       400:
 *         description: Plan no puede ser aprobado en estado actual
 */
router.post(
  '/:id/approve',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  validateMiddleware(approveWorkPlanSchema),
  WorkPlansController.approve
);

/**
 * @swagger
 * /api/workplans/{id}/reject:
 *   post:
 *     summary: Rechazar plan de trabajo
 *     tags: [WorkPlans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Motivo del rechazo
 *     responses:
 *       200:
 *         description: Plan rechazado
 *       404:
 *         description: Plan no encontrado
 *       400:
 *         description: Plan no puede ser rechazado en estado actual
 */
router.post(
  '/:id/reject',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  validateMiddleware(rejectWorkPlanSchema),
  WorkPlansController.reject
);

/*
 * Ruta pendiente de implementación para PDF
 * router.get(
 *   '/:id/pdf',
 *   authorize([PERMISSIONS.WORKPLANS_VIEW]),
 *   WorkPlansController.generatePDF
 * );
 */

export default router;

