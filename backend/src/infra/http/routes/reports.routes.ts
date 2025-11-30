/**
 * Rutas de Reportes
 *
 * @file backend/src/infra/http/routes/reports.routes.ts
 */

import { Router } from 'express';
import { ReportsController } from '../controllers/ReportsController.js';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/reports/activity/{orderId}:
 *   get:
 *     summary: Generar informe de actividad de una orden
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Informe de actividad generado
 *       404:
 *         description: Orden no encontrada
 */
router.get(
  '/activity/:orderId',
  authorize([PERMISSIONS.REPORTS_VIEW, PERMISSIONS.ORDERS_VIEW]),
  ReportsController.generateActivity
);

/**
 * @swagger
 * /api/reports/acta-entrega/{orderId}:
 *   post:
 *     summary: Generar acta de entrega
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Acta de entrega generada
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Orden no encontrada
 */
router.post(
  '/acta-entrega/:orderId',
  authorize([PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.WORKPLANS_APPROVE]),
  ReportsController.generateActa
);

/**
 * @swagger
 * /api/reports/ses/{orderId}:
 *   post:
 *     summary: Generar formato SES
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Formato SES generado
 *       404:
 *         description: Orden no encontrada
 */
router.post(
  '/ses/:orderId',
  authorize([PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.ORDERS_VIEW]),
  ReportsController.generateSES
);

/**
 * @swagger
 * /api/reports/costs/{workPlanId}:
 *   get:
 *     summary: Generar reporte de costos de un plan de trabajo
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workPlanId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reporte de costos generado
 *       404:
 *         description: Plan de trabajo no encontrado
 */
router.get(
  '/costs/:workPlanId',
  authorize([PERMISSIONS.REPORTS_VIEW, PERMISSIONS.WORKPLANS_VIEW]),
  ReportsController.generateCosts
);

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Generar reporte del dashboard
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte del dashboard generado
 */
router.get(
  '/dashboard',
  authorize([PERMISSIONS.DASHBOARD_VIEW_STATS]),
  ReportsController.generateDashboard
);

/**
 * @swagger
 * /api/reports/pending-actas:
 *   get:
 *     summary: Obtener listado de actas pendientes por generar
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     description: Retorna órdenes completadas hace más de 12 horas sin acta generada
 *     responses:
 *       200:
 *         description: Lista de órdenes con actas pendientes
 */
router.get(
  '/pending-actas',
  authorize([PERMISSIONS.REPORTS_VIEW, PERMISSIONS.ADMIN_FULL_ACCESS]),
  ReportsController.getPendingActas
);

export default router;
