import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { dashboardController } from '../controllers/DashboardController.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Middleware de autenticación global para rutas de dashboard
router.use(authenticate);

/**
 * @route   GET /api/dashboard/metrics
 * @desc    Obtener métricas principales (KPIs)
 * @access  Private (Admin, Coordinador)
 */
router.get(
  '/metrics',
  authorize([PERMISSIONS.DASHBOARD_VIEW_METRICS]),
  dashboardController.getMetrics
);

/**
 * @route   GET /api/dashboard/metrics/advanced
 * @desc    Obtener métricas avanzadas
 * @access  Private (Admin, Coordinador)
 */
router.get(
  '/metrics/advanced',
  authorize([PERMISSIONS.DASHBOARD_VIEW_METRICS]),
  dashboardController.getAdvancedMetrics
);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Obtener estadísticas generales
 * @access  Private (Admin, Coordinador)
 */
router.get(
  '/stats',
  authorize([PERMISSIONS.DASHBOARD_VIEW_STATS]),
  dashboardController.getGeneralStats
);

/**
 * @route   GET /api/dashboard/orders/by-state/:state
 * @desc    Obtener órdenes por estado
 * @access  Private
 */
router.get(
  '/orders/by-state/:state',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  dashboardController.getOrdersByState
);

/**
 * @route   GET /api/dashboard/orders/active
 * @desc    Obtener órdenes activas
 * @access  Private
 */
router.get(
  '/orders/active',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  dashboardController.getActiveOrders
);

/**
 * @route   GET /api/dashboard/work-plans/pending
 * @desc    Obtener work plans pendientes
 * @access  Private (Admin, Coordinador)
 */
router.get(
  '/work-plans/pending',
  authorize([PERMISSIONS.WORKPLANS_VIEW]),
  dashboardController.getPendingWorkPlans
);

/**
 * @route   GET /api/dashboard/my-stats
 * @desc    Obtener estadísticas del usuario
 * @access  Private
 */
router.get(
  '/my-stats',
  authorize([PERMISSIONS.DASHBOARD_VIEW]),
  dashboardController.getMyStats
);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Obtener actividad reciente
 * @access  Private
 */
router.get(
  '/recent-activity',
  authorize([PERMISSIONS.DASHBOARD_VIEW]),
  dashboardController.getRecentActivity
);

/**
 * @route   POST /api/dashboard/cache/clear
 * @desc    Limpiar caché de métricas
 * @access  Private (Solo Admin)
 */
router.post(
  '/cache/clear',
  authorize([PERMISSIONS.DASHBOARD_CLEAR_CACHE]),
  dashboardController.clearCache
);

export default router;
