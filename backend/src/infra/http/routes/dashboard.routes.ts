/**
 * Rutas del Dashboard
 *
 * @file backend/src/infra/http/routes/dashboard.routes.ts
 */

import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { dashboardController } from '../controllers/DashboardController.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Middleware de autenticación global para rutas de dashboard
router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/metrics:
 *   get:
 *     summary: Obtener métricas principales (KPIs)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                 activeOrders:
 *                   type: integer
 *                 completedOrders:
 *                   type: integer
 *                 avgCompletionTime:
 *                   type: number
 */
router.get(
  '/metrics',
  authorize([PERMISSIONS.DASHBOARD_VIEW_METRICS]),
  dashboardController.getMetrics
);

/**
 * @swagger
 * /api/dashboard/metrics/advanced:
 *   get:
 *     summary: Obtener métricas avanzadas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas avanzadas con tendencias
 */
router.get(
  '/metrics/advanced',
  authorize([PERMISSIONS.DASHBOARD_VIEW_METRICS]),
  dashboardController.getAdvancedMetrics
);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Obtener estadísticas generales
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas generales del sistema
 */
router.get(
  '/stats',
  authorize([PERMISSIONS.DASHBOARD_VIEW_STATS]),
  dashboardController.getGeneralStats
);

/**
 * @swagger
 * /api/dashboard/orders/by-state/{state}:
 *   get:
 *     summary: Obtener órdenes por estado
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *           enum: [solicitud, visita, po, planeacion, ejecucion, facturacion, entrega, completed]
 *     responses:
 *       200:
 *         description: Lista de órdenes en el estado especificado
 */
router.get(
  '/orders/by-state/:state',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  dashboardController.getOrdersByState
);

/**
 * @swagger
 * /api/dashboard/orders/active:
 *   get:
 *     summary: Obtener órdenes activas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes activas
 */
router.get(
  '/orders/active',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  dashboardController.getActiveOrders
);

/**
 * @swagger
 * /api/dashboard/work-plans/pending:
 *   get:
 *     summary: Obtener planes de trabajo pendientes
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planes pendientes de aprobación
 */
router.get(
  '/work-plans/pending',
  authorize([PERMISSIONS.WORKPLANS_VIEW]),
  dashboardController.getPendingWorkPlans
);

/**
 * @swagger
 * /api/dashboard/my-stats:
 *   get:
 *     summary: Obtener estadísticas del usuario actual
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas personales del usuario
 */
router.get(
  '/my-stats',
  authorize([PERMISSIONS.DASHBOARD_VIEW]),
  dashboardController.getMyStats
);

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Obtener actividad reciente
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de actividades recientes
 */
router.get(
  '/recent-activity',
  authorize([PERMISSIONS.DASHBOARD_VIEW]),
  dashboardController.getRecentActivity
);

/**
 * @swagger
 * /api/dashboard/cache/clear:
 *   post:
 *     summary: Limpiar caché de métricas
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Caché limpiado exitosamente
 *       403:
 *         description: Sin permisos de administrador
 */
router.post(
  '/cache/clear',
  authorize([PERMISSIONS.DASHBOARD_CLEAR_CACHE]),
  dashboardController.clearCache
);

export default router;
