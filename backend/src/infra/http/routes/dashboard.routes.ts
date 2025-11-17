import { Router } from 'express';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { authorize } from '../../../shared/middlewares/authorize';
import { dashboardController } from '../controllers/DashboardController';
import { PERMISSIONS } from '../../../shared/constants/permissions';

const router = Router();

/**
 * @route   GET /api/dashboard/metrics
 * @desc    Obtener métricas principales (KPIs)
 * @access  Private (Admin, Coordinador)
 */
router.get(
  '/metrics',
  authenticate,
  authorize([PERMISSIONS.DASHBOARD_VIEW_METRICS]),
  (req, res) => dashboardController.getMetrics(req, res)
);

/**
 * @route   GET /api/dashboard/stats
 * @desc    Obtener estadísticas generales
 * @access  Private (Admin, Coordinador)
 */
router.get(
  '/stats',
  authenticate,
  authorize([PERMISSIONS.DASHBOARD_VIEW_STATS]),
  (req, res) => dashboardController.getGeneralStats(req, res)
);

/**
 * @route   GET /api/dashboard/orders/by-state/:state
 * @desc    Obtener órdenes por estado
 * @access  Private
 */
router.get(
  '/orders/by-state/:state',
  authenticate,
  authorize([PERMISSIONS.ORDERS_VIEW]),
  (req, res) => dashboardController.getOrdersByState(req, res)
);

/**
 * @route   GET /api/dashboard/orders/active
 * @desc    Obtener órdenes activas
 * @access  Private
 */
router.get(
  '/orders/active',
  authenticate,
  authorize([PERMISSIONS.ORDERS_VIEW]),
  (req, res) => dashboardController.getActiveOrders(req, res)
);

/**
 * @route   GET /api/dashboard/work-plans/pending
 * @desc    Obtener work plans pendientes
 * @access  Private (Admin, Coordinador)
 */
router.get(
  '/work-plans/pending',
  authenticate,
  authorize([PERMISSIONS.WORKPLANS_VIEW]),
  (req, res) => dashboardController.getPendingWorkPlans(req, res)
);

/**
 * @route   GET /api/dashboard/my-stats
 * @desc    Obtener estadísticas del usuario
 * @access  Private
 */
router.get(
  '/my-stats',
  authenticate,
  authorize([PERMISSIONS.DASHBOARD_VIEW]),
  (req, res) => dashboardController.getMyStats(req, res)
);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Obtener actividad reciente
 * @access  Private
 */
router.get(
  '/recent-activity',
  authenticate,
  authorize([PERMISSIONS.DASHBOARD_VIEW]),
  (req, res) => dashboardController.getRecentActivity(req, res)
);

/**
 * @route   POST /api/dashboard/cache/clear
 * @desc    Limpiar caché de métricas
 * @access  Private (Solo Admin)
 */
router.post(
  '/cache/clear',
  authenticate,
  authorize([PERMISSIONS.DASHBOARD_CLEAR_CACHE]),
  (req, res) => dashboardController.clearCache(req, res)
);

export default router;
