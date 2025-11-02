/**
 * WorkPlans Controller
 * @description Gestión de planes de trabajo (planeación de obras)
 */

import WorkPlan from '../models/WorkPlan.js';
import Order from '../models/Order.js';
import { successResponse, errorResponse, paginatedResponse, createdResponse, HTTP_STATUS } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { emitToUser, emitToRole } from '../config/socket.js';
import { WORKPLAN_STATUS } from '../utils/constants.js';

/**
 * Obtener todos los planes de trabajo con paginación
 * @route GET /api/v1/workplans
 * @access Private
 */
export const getAllWorkPlans = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    estado,
    orderId,
    unidadNegocio,
  } = req.query;

  const filter = {};

  if (estado) filter.estado = estado;
  if (orderId) filter.orderId = orderId;
  if (unidadNegocio) filter.unidadNegocio = unidadNegocio;

  const skip = (page - 1) * limit;

  const [workplans, total] = await Promise.all([
    WorkPlan.find(filter)
      .populate('orderId', 'numeroOrden clienteNombre lugar')
      .populate('responsables.ingResidente', 'nombre email')
      .populate('responsables.tecnicoElectricista', 'nombre email')
      .populate('responsables.hes', 'nombre email')
      .populate('aprobadoPor', 'nombre email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    WorkPlan.countDocuments(filter),
  ]);

  return paginatedResponse(res, workplans, parseInt(page), parseInt(limit), total);
});

/**
 * Obtener plan de trabajo por ID
 * @route GET /api/v1/workplans/:id
 * @access Private
 */
export const getWorkPlanById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const workplan = await WorkPlan.findById(id)
    .populate('orderId')
    .populate('responsables.ingResidente', 'nombre email telefono cargo')
    .populate('responsables.tecnicoElectricista', 'nombre email telefono cargo')
    .populate('responsables.hes', 'nombre email telefono cargo')
    .populate('cronograma.responsable', 'nombre email')
    .populate('aprobadoPor', 'nombre email');

  if (!workplan) {
    return errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, { workplan }, 'Plan de trabajo obtenido exitosamente');
});

/**
 * Obtener plan de trabajo por orden
 * @route GET /api/v1/workplans/order/:orderId
 * @access Private
 */
export const getWorkPlanByOrderId = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  // Verificar que la orden existe
  const order = await Order.findById(orderId);
  if (!order) {
    return errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
  }

  const workplan = await WorkPlan.findOne({ orderId })
    .populate('responsables.ingResidente', 'nombre email')
    .populate('responsables.tecnicoElectricista', 'nombre email')
    .populate('responsables.hes', 'nombre email')
    .populate('aprobadoPor', 'nombre email');

  if (!workplan) {
    return errorResponse(res, 'No existe plan de trabajo para esta orden', HTTP_STATUS.NOT_FOUND);
  }

  return successResponse(res, { workplan }, 'Plan de trabajo obtenido exitosamente');
});

/**
 * Crear nuevo plan de trabajo
 * @route POST /api/v1/workplans
 * @access Private (Engineer, Admin)
 */
export const createWorkPlan = asyncHandler(async (req, res) => {
  const workplanData = req.body;

  // Verificar que la orden existe
  const order = await Order.findById(workplanData.orderId);
  if (!order) {
    return errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
  }

  // Verificar que no existe ya un plan para esta orden
  const existingWorkplan = await WorkPlan.findOne({ orderId: workplanData.orderId });
  if (existingWorkplan) {
    return errorResponse(
      res,
      'Ya existe un plan de trabajo para esta orden',
      HTTP_STATUS.CONFLICT
    );
  }

  const workplan = await WorkPlan.create(workplanData);

  // Actualizar la orden con el workplan ID
  order.workPlanId = workplan._id;
  if (order.estado === 'pending') {
    order.estado = 'planning';
  }
  await order.save();

  logger.info(`WorkPlan created for order ${order.numeroOrden} by ${req.user.email}`);

  // Notificar a los responsables
  const responsables = [
    workplan.responsables.ingResidente,
    workplan.responsables.tecnicoElectricista,
    workplan.responsables.hes,
  ].filter(Boolean);

  responsables.forEach(responsableId => {
    emitToUser(responsableId.toString(), 'workplan_assigned', {
      workplanId: workplan._id,
      orderId: order._id,
      numeroOrden: order.numeroOrden,
    });
  });

  return createdResponse(res, { workplan }, 'Plan de trabajo creado exitosamente');
});

/**
 * Actualizar plan de trabajo
 * @route PUT /api/v1/workplans/:id
 * @access Private
 */
export const updateWorkPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const workplan = await WorkPlan.findById(id);

  if (!workplan) {
    return errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  // No permitir actualizar si está aprobado (solo admin puede)
  if (workplan.estado === WORKPLAN_STATUS.APPROVED && !['root', 'admin'].includes(req.userRole)) {
    return errorResponse(
      res,
      'No se puede modificar un plan aprobado',
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Actualizar campos
  Object.keys(updates).forEach(key => {
    if (key !== '_id' && key !== 'orderId') {
      workplan[key] = updates[key];
    }
  });

  await workplan.save();

  logger.info(`WorkPlan updated: ${workplan._id} by ${req.user.email}`);

  return successResponse(res, { workplan }, 'Plan de trabajo actualizado exitosamente');
});

/**
 * Eliminar plan de trabajo
 * @route DELETE /api/v1/workplans/:id
 * @access Private (Admin only)
 */
export const deleteWorkPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const workplan = await WorkPlan.findById(id);

  if (!workplan) {
    return errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  // Remover referencia de la orden
  await Order.findByIdAndUpdate(workplan.orderId, {
    $unset: { workPlanId: 1 },
  });

  await workplan.deleteOne();

  logger.info(`WorkPlan deleted: ${id} by ${req.user.email}`);

  return successResponse(res, null, 'Plan de trabajo eliminado exitosamente');
});

/**
 * Aprobar plan de trabajo
 * @route POST /api/v1/workplans/:id/approve
 * @access Private (Engineer, Admin)
 */
export const approveWorkPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const workplan = await WorkPlan.findById(id).populate('orderId');

  if (!workplan) {
    return errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  if (workplan.estado === WORKPLAN_STATUS.APPROVED) {
    return errorResponse(res, 'El plan ya está aprobado', HTTP_STATUS.BAD_REQUEST);
  }

  workplan.estado = WORKPLAN_STATUS.APPROVED;
  workplan.aprobadoPor = req.userId;
  workplan.fechaAprobacion = new Date();

  await workplan.save();

  // Actualizar estado de la orden
  const order = await Order.findById(workplan.orderId);
  if (order && order.estado === 'planning') {
    order.estado = 'in_progress';
    await order.save();
  }

  logger.info(`WorkPlan approved: ${workplan._id} by ${req.user.email}`);

  // Notificar a los responsables
  emitToRole('technician', 'workplan_approved', {
    workplanId: workplan._id,
    orderId: workplan.orderId,
    approvedBy: req.user.nombre,
  });

  return successResponse(res, { workplan }, 'Plan de trabajo aprobado exitosamente');
});

/**
 * Marcar actividad del cronograma como completada
 * @route PATCH /api/v1/workplans/:id/cronograma/:actividadId/complete
 * @access Private
 */
export const completeActivity = asyncHandler(async (req, res) => {
  const { id, actividadId } = req.params;

  const workplan = await WorkPlan.findById(id);

  if (!workplan) {
    return errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
  }

  const actividad = workplan.cronograma.id(actividadId);

  if (!actividad) {
    return errorResponse(res, 'Actividad no encontrada', HTTP_STATUS.NOT_FOUND);
  }

  actividad.completada = true;
  await workplan.save();

  logger.info(`Activity completed: ${actividadId} in workplan ${id} by ${req.user.email}`);

  return successResponse(res, { actividad }, 'Actividad completada exitosamente');
});

/**
 * Obtener estadísticas de planes de trabajo
 * @route GET /api/v1/workplans/stats/summary
 * @access Private (Admin, Engineer)
 */
export const getWorkPlanStats = asyncHandler(async (req, res) => {
  const stats = await WorkPlan.aggregate([
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 },
        avgCostoMateriales: { $avg: '$costoTotalMateriales' },
      },
    },
  ]);

  const totalWorkplans = await WorkPlan.countDocuments();
  const approvedWorkplans = await WorkPlan.countDocuments({ estado: WORKPLAN_STATUS.APPROVED });

  return successResponse(
    res,
    {
      stats,
      summary: {
        total: totalWorkplans,
        approved: approvedWorkplans,
        approvalRate: totalWorkplans > 0 ? ((approvedWorkplans / totalWorkplans) * 100).toFixed(2) : 0,
      },
    },
    'Estadísticas obtenidas exitosamente'
  );
});
