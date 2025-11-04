/**
 * @file orders.controller.ts
 * @description Controlador para gestión de órdenes con estado de máquina institucional
 */

import { Request, Response } from 'express';
import { successResponse, errorResponse, createdResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  transitionOrderState,
  calculateCycleTime
} from '../services/order.service.js';
import { OrderState } from '../models/Order.js';
import { z } from 'zod';
import { createAuditLog } from '../middleware/auditLogger.js';

// ==================== SCHEMAS ZOD ====================

const CreateOrderSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  client: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  workType: z.string().optional(),
  equipment: z.string().optional(),
  scheduledDate: z.string().optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  estimatedCost: z.number().min(0).optional(),
  materials: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0)
  })).optional(),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional()
});

const UpdateOrderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  location: z.string().min(1).max(200).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  workType: z.string().optional(),
  equipment: z.string().optional(),
  scheduledDate: z.string().optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  materials: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0)
  })).optional(),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional(),
  assignedTo: z.array(z.string()).optional(),
  poNumber: z.string().optional(),
  planningComplete: z.boolean().optional(),
  certificationsVerified: z.boolean().optional(),
  astApproved: z.boolean().optional(),
  actaSigned: z.boolean().optional(),
  sesApproved: z.boolean().optional(),
  invoiceApproved: z.boolean().optional()
});

const TransitionStateSchema = z.object({
  newState: z.enum([
    'Solicitud', 'Visita', 'PO', 'Planeacion', 'Ejecucion',
    'Informe', 'Acta', 'SES', 'Factura', 'Pago',
    'Cancelada', 'Rechazada', 'Pausada'
  ]),
  notes: z.string().max(500).optional()
});

const OrderListQuerySchema = z.object({
  page: z.string().default('1').transform(val => parseInt(val, 10)),
  limit: z.string().default('20').transform(val => parseInt(val, 10)),
  state: z.enum([
    'Solicitud', 'Visita', 'PO', 'Planeacion', 'Ejecucion',
    'Informe', 'Acta', 'SES', 'Factura', 'Pago',
    'Cancelada', 'Rechazada', 'Pausada'
  ]).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  assignedTo: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional()
});

// ==================== CONTROLLERS ====================

/**
 * Crear nueva orden
 */
export const createOrderController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = CreateOrderSchema.parse(req.body);
  const userId = (req as any).user?.userId;

  if (!userId) {
    errorResponse(res, 'Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const orderData = {
    ...data,
    scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined
  };

  const order = await createOrder(orderData as any, userId);

  await createAuditLog({
    userId,
    action: 'CREATE_ORDER',
    resource: 'Order',
    details: { orderNumber: order.orderNumber, orderId: order._id.toString() }
  });

  logger.info(`Order created: ${order.orderNumber} by user ${userId}`);

  createdResponse(res, order, 'Orden creada exitosamente');
});

/**
 * Obtener órdenes con filtros
 */
export const getOrdersController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const query = OrderListQuerySchema.parse(req.query);

  const filters = {
    state: query.state as OrderState,
    assignedTo: query.assignedTo,
    priority: query.priority,
    fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
    toDate: query.toDate ? new Date(query.toDate) : undefined,
    page: query.page,
    limit: query.limit
  };

  const result = await getOrders(filters);

  successResponse(res, result.orders, 'Órdenes obtenidas exitosamente', HTTP_STATUS.OK, {
    pagination: result.pagination
  });
});

/**
 * Obtener orden por ID
 */
export const getOrderByIdController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const order = await getOrderById(id);

  successResponse(res, order, 'Orden obtenida exitosamente', HTTP_STATUS.OK);
});

/**
 * Actualizar orden
 */
export const updateOrderController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = UpdateOrderSchema.parse(req.body);
  const userId = (req as any).user?.userId;

  if (!userId) {
    errorResponse(res, 'Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const updateData = {
    ...data,
    scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined
  };

  const order = await updateOrder(id, updateData as any, userId);

  await createAuditLog({
    userId,
    action: 'UPDATE_ORDER',
    resource: 'Order',
    details: { orderNumber: order.orderNumber, orderId: id }
  });

  logger.info(`Order updated: ${order.orderNumber} by user ${userId}`);

  successResponse(res, order, 'Orden actualizada exitosamente', HTTP_STATUS.OK);
});

/**
 * Transicionar estado de orden
 */
export const transitionOrderStateController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { newState, notes } = TransitionStateSchema.parse(req.body);
  const userId = (req as any).user?.userId;

  if (!userId) {
    errorResponse(res, 'Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED);
    return;
  }

  const order = await transitionOrderState(id, newState as OrderState, userId, notes);

  await createAuditLog({
    userId,
    action: 'TRANSITION_ORDER_STATE',
    resource: 'Order',
    details: {
      orderNumber: order.orderNumber,
      orderId: id,
      fromState: order.stateHistory[order.stateHistory.length - 1]?.from,
      toState: newState
    }
  });

  logger.info(`Order state transitioned: ${order.orderNumber} -> ${newState} by user ${userId}`);

  successResponse(res, order, `Estado de orden cambiado a ${newState}`, HTTP_STATUS.OK);
});

/**
 * Calcular tiempo de ciclo de orden
 */
export const calculateCycleTimeController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const cycleTime = await calculateCycleTime(id);

  successResponse(res, cycleTime, 'Tiempo de ciclo calculado exitosamente', HTTP_STATUS.OK);
});

/**
 * Obtener estadísticas de órdenes por estado
 */
export const getOrderStatsController = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Esta función necesitaría ser implementada en el servicio
  // Por ahora retornamos un placeholder
  const stats = {
    total: 0,
    byState: {},
    averageCycleTime: 0
  };

  successResponse(res, stats, 'Estadísticas obtenidas exitosamente', HTTP_STATUS.OK);
});
