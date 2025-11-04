/**
 * @file orders.routes.ts
 * @description Rutas para gestión de órdenes con estado de máquina institucional
 */

import { Router } from 'express';
import {
  createOrderController,
  getOrdersController,
  getOrderByIdController,
  updateOrderController,
  transitionOrderStateController,
  calculateCycleTimeController,
  getOrderStatsController
} from '../controllers/orders.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole, requireAdmin } from '../middleware/rbac.js';
import { validateObjectId } from '../middleware/validate.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

// ==================== ROUTER ====================

const router = Router();

// Auth required for all routes
router.use(authenticate);

// ============================================================================
// ORDER CRUD ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/orders
 * @desc    Crear nueva orden
 * @access  Private (engineer+)
 */
router.post(
  '/',
  requireMinRole('engineer'),
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }),
  createOrderController
);

/**
 * @route   GET /api/v1/orders
 * @desc    Listar órdenes con filtros
 * @access  Private
 */
router.get('/', getOrdersController);

/**
 * @route   GET /api/v1/orders/:id
 * @desc    Obtener orden por ID
 * @access  Private
 */
router.get('/:id', validateObjectId('id'), getOrderByIdController);

/**
 * @route   PUT /api/v1/orders/:id
 * @desc    Actualizar orden
 * @access  Private (supervisor+)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  updateOrderController
);

// ============================================================================
// ORDER STATE MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   PATCH /api/v1/orders/:id/transition
 * @desc    Transicionar estado de orden
 * @access  Private (supervisor+)
 */
router.patch(
  '/:id/transition',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  transitionOrderStateController
);

/**
 * @route   GET /api/v1/orders/:id/cycle-time
 * @desc    Calcular tiempo de ciclo de orden
 * @access  Private
 */
router.get('/:id/cycle-time', validateObjectId('id'), calculateCycleTimeController);

// ============================================================================
// ORDER ANALYTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/orders/stats
 * @desc    Estadísticas de órdenes
 * @access  Private (engineer+)
 */
router.get('/stats', requireMinRole('engineer'), getOrderStatsController);

export default router;

