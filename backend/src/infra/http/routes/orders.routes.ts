/**
 * Rutas de Órdenes de Trabajo
 *
 * @file backend/src/infra/http/routes/orders.routes.ts
 */

import { Router } from 'express';
import { OrdersController } from '../controllers/OrdersController.js'; // Asegurar importación correcta de la clase
import { authenticate } from '../../../shared/middlewares/authenticate.js';
import { authorize } from '../../../shared/middlewares/authorize.js';
import { validateMiddleware } from '../../../shared/middlewares/validateMiddleware.js';
import {
  createOrderSchema,
  updateOrderSchema,
  assignOrderSchema
} from '../schemas/validation.schemas.js';
import { PERMISSIONS } from '../../../shared/constants/permissions.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   POST /api/orders
 * @desc    Crear nueva orden
 * @access  Private (ADMIN, COORDINADOR, CLIENTE)
 */
router.post(
  '/',
  // Se usa CLIENT_CREATE_REQUESTS (plural) según el archivo de permisos actualizado
  authorize([PERMISSIONS.ORDERS_CREATE, PERMISSIONS.CLIENT_CREATE_REQUEST]), 
  validateMiddleware(createOrderSchema),
  OrdersController.create
);

/**
 * @route   GET /api/orders
 * @desc    Listar órdenes con filtros
 * @access  Private
 */
router.get(
  '/',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  OrdersController.list
);

/**
 * @route   GET /api/orders/stats
 * @desc    Obtener estadísticas de órdenes
 * @access  Private
 */
router.get(
  '/stats',
  // Usar DASHBOARD_VIEW_STATS o ORDERS_VIEW según preferencia
  authorize([PERMISSIONS.DASHBOARD_VIEW_STATS]),
  OrdersController.getStats
);

/**
 * @route   GET /api/orders/:id
 * @desc    Obtener orden por ID
 * @access  Private
 */
router.get(
  '/:id',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  OrdersController.getById
);

/**
 * @route   PATCH /api/orders/:id/state
 * @desc    Transicionar estado de orden
 * @access  Private
 */
router.patch(
  '/:id/state',
  // Asegurarse que ORDERS_MANAGE o ORDERS_UPDATE cubra esto si ORDERS_TRANSITION no existe
  authorize([PERMISSIONS.ORDERS_MANAGE]), 
  OrdersController.transition
);

/**
 * @route   PATCH /api/orders/:id/assign
 * @desc    Asignar orden a técnico
 * @access  Private (ADMIN, COORDINADOR)
 */
router.patch(
  '/:id/assign',
  // Asegurarse que ORDERS_MANAGE cubra la asignación si ORDERS_ASSIGN no existe
  authorize([PERMISSIONS.ORDERS_MANAGE]), 
  validateMiddleware(assignOrderSchema),
  OrdersController.assign
);

/**
 * @route   PATCH /api/orders/:id/archive
 * @desc    Archivar orden
 * @access  Private (ADMIN)
 */
router.patch(
  '/:id/archive',
  // Asegurarse que ORDERS_DELETE o ORDERS_MANAGE cubra esto si ORDERS_ARCHIVE no existe
  authorize([PERMISSIONS.ORDERS_DELETE]), 
  OrdersController.archive
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
  OrdersController.update
);

export default router;

