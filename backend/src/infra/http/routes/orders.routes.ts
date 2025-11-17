/**
 * Rutas de Órdenes de Trabajo
 *
 * @file backend/src/infra/http/routes/orders.routes.ts
 */

import { Router } from 'express';
import { ordersController } from '../controllers/OrdersController';
import { authenticate } from '../../../shared/middlewares/authenticate';
import { authorize } from '../../../shared/middlewares/authorize';
import { validateMiddleware } from '../../../shared/middlewares/validateMiddleware';
import {
  createOrderSchema,
  updateOrderSchema,
  assignOrderSchema
} from '../schemas/validation.schemas';
import { PERMISSIONS } from '../../../shared/constants/permissions';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   POST /api/orders
 * @desc    Crear nueva orden
 * @access  Private (ADMIN, COORDINADOR)
 */
router.post(
  '/',
  authorize([PERMISSIONS.ORDERS_CREATE]),
  validateMiddleware(createOrderSchema),
    ordersController.create
);

/**
 * @route   GET /api/orders
 * @desc    Listar órdenes con filtros
 * @access  Private
 */
router.get(
  '/',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  ordersController.list
);

/**
 * @route   GET /api/orders/stats
 * @desc    Obtener estadísticas de órdenes
 * @access  Private
 */
router.get(
  '/stats',
  authorize([PERMISSIONS.DASHBOARD_VIEW_STATS]),
  ordersController.getStats
);

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener orden por ID
 * @access  Private
 */
router.get(
  '/:id',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  ordersController.getById
);

/**
 * @route   GET /api/orders/:id/history
 * @desc    Obtener historial de una orden
 * @access  Private
 */
// router.get(
//   '/:id/history',
//   authorize([PERMISSIONS.ORDERS_VIEW]),
//   ordersController.getHistory
// );

/**
 * @route   PATCH /api/orders/:id/state
 * @desc    Transicionar estado de orden
 * @access  Private
 */
router.patch(
  '/:id/state',
  authorize([PERMISSIONS.ORDERS_TRANSITION]),
  ordersController.transition
);

/**
 * @route   PATCH /api/orders/:id/assign
 * @desc    Asignar orden a técnico
 * @access  Private (ADMIN, COORDINADOR)
 */
router.patch(
  '/:id/assign',
  authorize([PERMISSIONS.ORDERS_ASSIGN]),
  validateMiddleware(assignOrderSchema),
  ordersController.assign
);

/**
 * @route   PATCH /api/orders/:id/archive
 * @desc    Archivar orden
 * @access  Private (ADMIN)
 */
router.patch(
  '/:id/archive',
  authorize([PERMISSIONS.ORDERS_ARCHIVE]),
  ordersController.archive
);

/**
 * @route   PATCH /api/orders/:id
 * @desc    Actualizar orden
 * @access  Private
 */
router.patch(
  '/:id',
  authorize([PERMISSIONS.ORDERS_UPDATE]),
  validateMiddleware(updateOrderSchema),
  ordersController.update
);

export default router;
