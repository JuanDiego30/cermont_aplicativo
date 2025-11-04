/**
 * @file order.service.ts
 * @description Servicio de gestión de órdenes con validación de transiciones
 */

import { Order, OrderState, IOrder, ALLOWED_TRANSITIONS } from '../models/Order.js';
import Evidence from '../models/Evidence.js';
import { AppError } from '../utils/errorHandler.js';
import { HTTP_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';
import { Types } from 'mongoose';

/**
 * Transicionar estado de una orden con validaciones
 */
export async function transitionOrderState(
  orderId: string,
  newState: OrderState,
  userId: string,
  notes?: string
): Promise<IOrder> {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
  }

  const currentState = order.state;

  // Validar que la transición esté permitida
  if (!ALLOWED_TRANSITIONS[currentState].includes(newState)) {
    throw new AppError(
      `Invalid transition from ${currentState} to ${newState}. Allowed: ${ALLOWED_TRANSITIONS[currentState].join(', ')}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Validar prerrequisitos
  await validateStatePrerequisites(order, newState);

  // Aplicar transición
  order.state = newState;
  order.stateHistory.push({
    from: currentState,
    to: newState,
    by: new Types.ObjectId(userId),
    at: new Date(),
    notes
  });

  // Actualizar timestamp específico del estado
  const stateTimestampField = `${newState}At` as keyof IOrder;
  if (stateTimestampField in order) {
    (order as any)[stateTimestampField] = new Date();
  }

  await order.save();

  logger.info('Order state transitioned', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    from: currentState,
    to: newState,
    by: userId
  });

  return order;
}

/**
 * Validar prerrequisitos documentales para cada transición
 */
async function validateStatePrerequisites(order: IOrder, newState: OrderState): Promise<void> {
  switch (newState) {
    case OrderState.Planeacion:
      if (!order.poNumber) {
        throw new AppError('PO number is required before moving to planning phase', HTTP_STATUS.BAD_REQUEST);
      }
      break;

    case OrderState.Ejecucion:
      if (!order.planningComplete) {
        throw new AppError('Work plan must be completed before execution', HTTP_STATUS.BAD_REQUEST);
      }
      if (!order.certificationsVerified) {
        throw new AppError('Worker certifications must be verified before execution', HTTP_STATUS.BAD_REQUEST);
      }
      if (!order.astApproved) {
        throw new AppError('AST (Job Safety Analysis) must be approved before execution', HTTP_STATUS.BAD_REQUEST);
      }
      break;

    case OrderState.Informe:
      // Verificar evidencias mínimas
      const evidenceCount = await Evidence.countDocuments({ orderId: order._id });
      if (evidenceCount < 3) {
        throw new AppError(
          `Minimum 3 evidences required before generating report. Current: ${evidenceCount}`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
      break;

    case OrderState.SES:
      if (!order.actaSigned) {
        throw new AppError('Acta must be signed before submitting SES', HTTP_STATUS.BAD_REQUEST);
      }
      break;

    case OrderState.Factura:
      if (!order.sesApproved) {
        throw new AppError('SES must be approved before generating invoice', HTTP_STATUS.BAD_REQUEST);
      }
      break;

    case OrderState.Pago:
      if (!order.invoiceApproved) {
        throw new AppError('Invoice must be approved before marking as paid', HTTP_STATUS.BAD_REQUEST);
      }
      break;
  }
}

/**
 * Obtener órdenes con filtros
 */
export async function getOrders(filters: {
  state?: OrderState;
  assignedTo?: string;
  priority?: string;
  fromDate?: Date;
  toDate?: Date;
  page?: number;
  limit?: number;
}) {
  const { state, assignedTo, priority, fromDate, toDate, page = 1, limit = 20 } = filters;

  const query: any = {};

  if (state) query.state = state;
  if (assignedTo) query.assignedTo = assignedTo;
  if (priority) query.priority = priority;

  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = fromDate;
    if (toDate) query.createdAt.$lte = toDate;
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .lean(),
    Order.countDocuments(query)
  ]);

  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Calcular tiempos de ciclo por orden (para KPIs)
 */
export async function calculateCycleTime(orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);

  const phases = [
    { name: 'Solicitud → Visita', start: order.solicitudAt, end: order.visitaAt },
    { name: 'Visita → PO', start: order.visitaAt, end: order.poAt },
    { name: 'PO → Planeación', start: order.poAt, end: order.planeacionAt },
    { name: 'Planeación → Ejecución', start: order.planeacionAt, end: order.ejecucionAt },
    { name: 'Ejecución → Informe', start: order.ejecucionAt, end: order.informeAt },
    { name: 'Informe → Acta', start: order.informeAt, end: order.actaAt },
    { name: 'Acta → SES', start: order.actaAt, end: order.sesAt },
    { name: 'SES → Factura', start: order.sesAt, end: order.facturaAt },
    { name: 'Factura → Pago', start: order.facturaAt, end: order.pagoAt }
  ];

  const cycleTimes = phases.map((phase) => {
    if (!phase.start || !phase.end) {
      return { phase: phase.name, durationDays: null };
    }
    const durationMs = phase.end.getTime() - phase.start.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    return { phase: phase.name, durationDays: Math.round(durationDays * 10) / 10 };
  });

  const totalDays =
    order.pagoAt && order.solicitudAt
      ? (order.pagoAt.getTime() - order.solicitudAt.getTime()) / (1000 * 60 * 60 * 24)
      : null;

  return {
    orderNumber: order.orderNumber,
    cycleTimes,
    totalCycleDays: totalDays ? Math.round(totalDays * 10) / 10 : null
  };
}

/**
 * Crear nueva orden
 */
export async function createOrder(orderData: {
  title: string;
  description: string;
  client: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  workType?: string;
  equipment?: string;
  scheduledDate?: Date;
  estimatedHours?: number;
  estimatedCost?: number;
  materials?: Array<{ name: string; quantity: number }>;
  documents?: string[];
  notes?: string;
}, userId: string): Promise<IOrder> {
  const orderNumber = await generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    title: orderData.title,
    description: orderData.description,
    client: orderData.client,
    location: orderData.location,
    priority: orderData.priority,
    workType: orderData.workType,
    equipment: orderData.equipment,
    scheduledDate: orderData.scheduledDate,
    estimatedHours: orderData.estimatedHours,
    estimatedCost: orderData.estimatedCost,
    materials: orderData.materials,
    documents: orderData.documents,
    notes: orderData.notes,
    state: OrderState.Solicitud,
    createdBy: new Types.ObjectId(userId),
    solicitudAt: new Date(),
    stateHistory: [{
      from: null,
      to: OrderState.Solicitud,
      by: new Types.ObjectId(userId),
      at: new Date(),
      notes: 'Order created'
    }]
  });

  logger.info('Order created', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    createdBy: userId
  });

  return order;
}

/**
 * Generar número de orden único
 */
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await Order.countDocuments({ orderNumber: new RegExp(`^OT-${year}`) });
  const nextNumber = (count + 1).toString().padStart(4, '0');
  return `OT-${year}-${nextNumber}`;
}

/**
 * Obtener orden por ID
 */
export async function getOrderById(orderId: string): Promise<IOrder> {
  const order = await Order.findById(orderId)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');

  if (!order) {
    throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
  }

  return order;
}

/**
 * Actualizar orden
 */
export async function updateOrder(
  orderId: string,
  updateData: Partial<{
    title: string;
    description: string;
    location: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    workType: string;
    equipment: string;
    scheduledDate: Date;
    estimatedHours: number;
    estimatedCost: number;
    actualCost: number;
    materials: Array<{ name: string; quantity: number }>;
    documents: string[];
    notes: string;
    assignedTo: string[];
    poNumber: string;
    planningComplete: boolean;
    certificationsVerified: boolean;
    astApproved: boolean;
    actaSigned: boolean;
    sesApproved: boolean;
    invoiceApproved: boolean;
  }>,
  userId: string
): Promise<IOrder> {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', HTTP_STATUS.NOT_FOUND);
  }

  // Agregar al historial de cambios
  order.updatesHistory.push({
    updatedBy: new Types.ObjectId(userId),
    updatedAt: new Date(),
    changes: updateData
  });

  Object.assign(order, updateData);
  await order.save();

  logger.info('Order updated', {
    orderId: order._id,
    orderNumber: order.orderNumber,
    updatedBy: userId
  });

  return order;
}
