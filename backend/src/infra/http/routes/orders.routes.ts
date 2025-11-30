/**
 * Rutas de Órdenes de Trabajo
 *
 * @file backend/src/infra/http/routes/orders.routes.ts
 */

import { Router } from 'express';
import { container } from '../../../shared/container/index.js';
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
const { ordersController } = container;

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear nueva orden de trabajo
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - title
 *               - description
 *             properties:
 *               clientId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post(
  '/',
  authorize([PERMISSIONS.ORDERS_CREATE, PERMISSIONS.CLIENT_CREATE_REQUEST]),
  validateMiddleware(createOrderSchema),
  ordersController.create.bind(ordersController)
);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar órdenes con filtros y paginación
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: technicianId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  ordersController.list.bind(ordersController)
);

/**
 * @swagger
 * /api/orders/stats:
 *   get:
 *     summary: Obtener estadísticas de órdenes
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 byStatus:
 *                   type: object
 *                 byPriority:
 *                   type: object
 *       401:
 *         description: No autenticado
 */
router.get(
  '/stats',
  authorize([PERMISSIONS.DASHBOARD_VIEW_STATS]),
  ordersController.getStats.bind(ordersController)
);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener orden por ID
 *     tags: [Orders]
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
 *         description: Detalle de la orden
 *       404:
 *         description: Orden no encontrada
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:id',
  authorize([PERMISSIONS.ORDERS_VIEW]),
  ordersController.getById.bind(ordersController)
);

/**
 * @swagger
 * /api/orders/{id}/state:
 *   patch:
 *     summary: Transicionar estado de orden
 *     tags: [Orders]
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
 *               - newState
 *             properties:
 *               newState:
 *                 type: string
 *                 enum: [solicitud, visita, po, planeacion, ejecucion, facturacion, entrega, completed]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Transición inválida
 *       404:
 *         description: Orden no encontrada
 */
router.patch(
  '/:id/state',
  authorize([PERMISSIONS.ORDERS_MANAGE]),
  ordersController.transition.bind(ordersController)
);

/**
 * @swagger
 * /api/orders/{id}/assign:
 *   patch:
 *     summary: Asignar orden a técnico
 *     tags: [Orders]
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
 *               - technicianId
 *             properties:
 *               technicianId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Orden asignada
 *       404:
 *         description: Orden o técnico no encontrado
 */
router.patch(
  '/:id/assign',
  authorize([PERMISSIONS.ORDERS_MANAGE]),
  validateMiddleware(assignOrderSchema),
  ordersController.assign.bind(ordersController)
);

/**
 * @swagger
 * /api/orders/{id}/archive:
 *   patch:
 *     summary: Archivar orden
 *     tags: [Orders]
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
 *         description: Orden archivada
 *       404:
 *         description: Orden no encontrada
 */
router.patch(
  '/:id/archive',
  authorize([PERMISSIONS.ORDERS_DELETE]),
  ordersController.archive.bind(ordersController)
);

/**
 * @swagger
 * /api/orders/{id}:
 *   patch:
 *     summary: Actualizar orden
 *     tags: [Orders]
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
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Orden actualizada
 *       404:
 *         description: Orden no encontrada
 */
router.patch(
  '/:id',
  authorize([PERMISSIONS.ORDERS_UPDATE]),
  validateMiddleware(updateOrderSchema),
  ordersController.update.bind(ordersController)
);

export default router;

