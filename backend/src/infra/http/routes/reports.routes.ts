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
 * @route   GET /api/reports/activity/:orderId
 * @desc    Generar informe de actividad
 * @access  Private
 */
router.get(
  '/activity/:orderId',
  authorize([PERMISSIONS.REPORTS_VIEW, PERMISSIONS.ORDERS_VIEW]),
  ReportsController.generateActivity
);

/**
 * @route   POST /api/reports/acta-entrega/:orderId
 * @desc    Generar acta de entrega
 * @access  Private
 */
router.post(
  '/acta-entrega/:orderId',
  authorize([PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.WORKPLANS_APPROVE]),
  ReportsController.generateActa
);

/**
 * @route   POST /api/reports/ses/:orderId
 * @desc    Generar formato SES
 * @access  Private
 */
router.post(
  '/ses/:orderId',
  authorize([PERMISSIONS.REPORTS_GENERATE, PERMISSIONS.ORDERS_VIEW]),
  ReportsController.generateSES
);

/**
 * @route   GET /api/reports/costs/:workPlanId
 * @desc    Generar reporte de costos
 * @access  Private
 */
router.get(
  '/costs/:workPlanId',
  authorize([PERMISSIONS.REPORTS_VIEW, PERMISSIONS.WORKPLANS_VIEW]),
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

// --- Rutas Nuevas para Automatización (Tesis) ---

/**
 * @route   GET /api/reports/pending-actas
 * @desc    Obtener listado de actas pendientes por generar (>12h)
 * @access  Private (Admin/Coordinador)
 */
router.get(
  '/pending-actas',
  authorize([PERMISSIONS.REPORTS_VIEW, PERMISSIONS.ADMIN_FULL_ACCESS]),
  ReportsController.getPendingActas
);

export default router;
