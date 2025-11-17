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

// Todas las rutas requieren autenticaci�n
router.use(authenticate);

/**
 * @route   GET /api/reports/activity/:orderId
 * @desc    Generar informe de actividad
 * @access  Private
 */
router.get(
  '/activity/:orderId',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  ReportsController.generateActivity
);

/**
 * @route   POST /api/reports/acta-entrega/:orderId
 * @desc    Generar acta de entrega
 * @access  Private
 */
router.post(
  '/acta-entrega/:orderId',
  authorize([PERMISSIONS.WORKPLANS_APPROVE]),
  ReportsController.generateActa
);

/**
 * @route   POST /api/reports/ses/:orderId
 * @desc    Generar formato SES
 * @access  Private
 */
router.post(
  '/ses/:orderId',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  ReportsController.generateSES
);

/**
 * @route   GET /api/reports/costs/:workPlanId
 * @desc    Generar reporte de costos
 * @access  Private
 */
router.get(
  '/costs/:workPlanId',
  authorize([PERMISSIONS.WORKPLANS_VIEW]),
  ReportsController.generateCosts
);

/**
 * @route   GET /api/reports/dashboard
 * @desc    Generar reporte del dashboard
 * @access  Private
 */
router.get(
  '/dashboard',
  authorize([PERMISSIONS.DASHBOARD_VIEW_STATS]),
  ReportsController.generateDashboard
);

export default router;
