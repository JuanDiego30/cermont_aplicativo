import mongoose from 'mongoose';
import WorkPlan from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { asyncHandler } from '../utils/response';
import { emitToRole } from '../utils/response';
import { z } from 'zod';
import { createAuditLog } from '../utils/response';
const WorkPlanListQuerySchema = z.object({
    page: z.string().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
    limit: z.string().default('10').transform((val) => Math.min(50, Math.max(1, parseInt(val, 10)))),
    estado: z.enum(WORKPLAN_STATUS).optional(),
    orderId: z.string().optional(),
    unidadNegocio: z.string().optional().max(50),
});
const CreateWorkPlanSchema = z.object({
    orderId: z.string(),
    titulo: z.string().min(5, 'Título mínimo 5 caracteres').max(200),
    descripcion: z.string().min(10).max(1000).optional(),
    unidadNegocio: z.string().min(1).max(50),
    responsables: z.object({
        ingResidente: z.string().optional(),
        tecnicoElectricista: z.string().optional(),
        hes: z.string().optional(),
    }).optional(),
    cronograma: z.array(z.object({
        actividad: z.string().min(1).max(200),
        responsable: z.string(),
        fechaInicio: z.string().datetime('Fecha inicio inválida'),
        fechaFin: z.string().datetime('Fecha fin inválida'),
        completada: z.boolean().default(false),
    })).min(1, 'Al menos una actividad en cronograma'),
    costoTotalMateriales: z.number().min(0).optional(),
});
const UpdateWorkPlanSchema = CreateWorkPlanSchema.partial().omit({ orderId: true });
UpdateWorkPlanSchema.refine((data) => Object.keys(data).length > 0, { message: 'Al menos un campo para actualizar' });
const CompleteActivitySchema = z.object({
    actividadId: z.string(),
});
const validateObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
export const getAllWorkPlans = asyncHandler(async (req, res) => {
    requireEngineerOrHigher(req);
    const query = WorkPlanListQuerySchema.parse(req.query);
    const filters = { activo: true };
    if (query.estado)
        filters.estado = query.estado;
    if (query.orderId) {
        let order;
        if (validateObjectId(query.orderId)) {
            order = await Order.findById(query.orderId).lean();
        }
        else {
            order = await Order.findOne({ numeroOrden: query.orderId }).lean();
        }
        if (!order) {
            errorResponse(res, 'Orden inválida', HTTP_STATUS.BAD_REQUEST);
            return;
        }
        filters.orderId = order._id;
    }
    if (query.unidadNegocio)
        filters.unidadNegocio = query.unidadNegocio;
    const skip = (query.page - 1) * query.limit;
    const [workplans, total] = await Promise.all([
        WorkPlan.find(filters)
            .populate('orderId', 'numeroOrden clienteNombre lugar estado')
            .populate('responsables.ingResidente', 'nombre email telefono cargo')
            .populate('responsables.tecnicoElectricista', 'nombre email telefono cargo')
            .populate('responsables.hes', 'nombre email telefono cargo')
            .populate('aprobadoPor', 'nombre email cargo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(query.limit)
            .lean(),
        WorkPlan.countDocuments(filters),
    ]);
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_WORKPLANS',
        resource: 'WorkPlan',
        details: { page: query.page, limit: query.limit, estado: query.estado, unidadNegocio: query.unidadNegocio },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    paginatedResponse(res, { data: workplans }, query.page, query.limit, total, 'Planes de trabajo obtenidos exitosamente', { timestamp: new Date().toISOString() });
});
export const getWorkPlanById = asyncHandler(async (req, res) => {
    requireAuthenticated(req);
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de plan inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const workplan = await WorkPlan.findOne({ _id: id, activo: true })
        .populate('orderId', 'numeroOrden clienteNombre lugar estado')
        .populate('responsables.ingResidente', 'nombre email telefono cargo')
        .populate('responsables.tecnicoElectricista', 'nombre email telefono cargo')
        .populate('responsables.hes', 'nombre email telefono cargo')
        .populate('cronograma.responsable', 'nombre email')
        .populate('aprobadoPor', 'nombre email cargo')
        .populate('creadoPor', 'nombre email')
        .lean();
    if (!workplan) {
        errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_WORKPLAN',
        resource: 'WorkPlan',
        resourceId: id,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: workplan }, 'Plan de trabajo obtenido exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getWorkPlanByOrderId = asyncHandler(async (req, res) => {
    requireAuthenticated(req);
    const { orderId } = req.params;
    let order;
    if (validateObjectId(orderId)) {
        order = await Order.findById(orderId).lean();
    }
    else {
        order = await Order.findOne({ numeroOrden: orderId }).lean();
    }
    if (!order) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const workplan = await WorkPlan.findOne({ orderId: order._id, activo: true })
        .populate('responsables.ingResidente', 'nombre email')
        .populate('responsables.tecnicoElectricista', 'nombre email')
        .populate('responsables.hes', 'nombre email')
        .populate('aprobadoPor', 'nombre email')
        .populate('creadoPor', 'nombre email')
        .lean();
    if (!workplan) {
        errorResponse(res, 'No existe plan de trabajo para esta orden', HTTP_STATUS.NOT_FOUND);
        return;
    }
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_WORKPLAN_BY_ORDER',
        resource: 'WorkPlan',
        resourceId: workplan._id.toString(),
        details: { orderId: order._id },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: workplan }, 'Plan de trabajo obtenido exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const createWorkPlan = asyncHandler(async (req, res) => {
    requireEngineerOrHigher(req);
    const data = CreateWorkPlanSchema.parse(req.body);
    const { orderId } = data;
    let order;
    if (validateObjectId(orderId)) {
        order = await Order.findById(orderId).lean();
    }
    else {
        order = await Order.findOne({ numeroOrden: orderId }).lean();
    }
    if (!order) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (order.creadoPor.toString() !== req.user._id?.toString() && req.user.rol !== ROLES.ADMIN) {
        errorResponse(res, 'No tienes permisos para esta orden', HTTP_STATUS.FORBIDDEN);
        return;
    }
    const existingWorkplan = await WorkPlan.findOne({ orderId: order._id, activo: true });
    if (existingWorkplan) {
        errorResponse(res, 'Ya existe un plan de trabajo activo para esta orden', HTTP_STATUS.CONFLICT);
        return;
    }
    const workplanData = {
        ...data,
        orderId: order._id,
        estado: WORKPLAN_STATUS.DRAFT,
        creadoPor: req.user.userId,
        activo: true,
    };
    const workplan = await WorkPlan.create(workplanData);
    await Order.findByIdAndUpdate(order._id, { $addToSet: { workplans: workplan._id } });
    logger.info(`WorkPlan creado para orden ${order.numeroOrden} por ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'CREATE_WORKPLAN',
        resource: 'WorkPlan',
        resourceId: workplan._id.toString(),
        details: { orderId: order._id, titulo: data.titulo },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    emitToRole(ROLES.TECHNICIAN, 'workplan_created', {
        workplanId: workplan._id,
        orderId: order._id,
        createdBy: req.user.nombre,
    });
    await workplan.populate([
        { path: 'orderId', select: 'numeroOrden clienteNombre lugar estado' },
        { path: 'responsables.ingResidente', select: 'nombre email' },
        { path: 'responsables.tecnicoElectricista', select: 'nombre email' },
        { path: 'responsables.hes', select: 'nombre email' },
        { path: 'creadoPor', select: 'nombre email' },
    ]);
    createdResponse(res, { data: workplan.toObject() }, 'Plan de trabajo creado exitosamente', { timestamp: new Date().toISOString() });
});
export const updateWorkPlan = asyncHandler(async (req, res) => {
    requireEngineerOrHigher(req);
    const { id } = req.params;
    const updates = UpdateWorkPlanSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de plan inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const workplan = await WorkPlan.findOne({ _id: id, activo: true });
    if (!workplan) {
        errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (workplan.estado === WORKPLAN_STATUS.APPROVED && req.user.rol !== ROLES.ADMIN) {
        errorResponse(res, 'No se puede modificar un plan aprobado', HTTP_STATUS.FORBIDDEN);
        return;
    }
    if (workplan.creadoPor.toString() !== req.user._id?.toString() && req.user.rol !== ROLES.ADMIN) {
        errorResponse(res, 'No tienes permisos para esta actualización', HTTP_STATUS.FORBIDDEN);
        return;
    }
    Object.assign(workplan, updates);
    await workplan.save({ validateModifiedOnly: true });
    logger.info(`WorkPlan actualizado: ${id} por ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'UPDATE_WORKPLAN',
        resource: 'WorkPlan',
        resourceId: id,
        details: { changes: Object.keys(updates), titulo: workplan.titulo },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    await workplan.populate('orderId responsables.creadoPor');
    successResponse(res, { data: workplan.toObject() }, 'Plan de trabajo actualizado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const deleteWorkPlan = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de plan inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const workplan = await WorkPlan.findOneAndUpdate({ _id: id, activo: true }, { activo: false, deletedAt: new Date() }, { new: true }).lean();
    if (!workplan) {
        errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    await Order.findByIdAndUpdate(workplan.orderId, { $pull: { workplans: id } });
    logger.info(`WorkPlan eliminado: ${id} por ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'DELETE_WORKPLAN',
        resource: 'WorkPlan',
        resourceId: id,
        details: { titulo: workplan.titulo },
        status: 'SUCCESS',
        severity: 'HIGH',
    });
    successResponse(res, null, 'Plan de trabajo eliminado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const approveWorkPlan = asyncHandler(async (req, res) => {
    requireEngineerOrHigher(req);
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de plan inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const workplan = await WorkPlan.findOne({ _id: id, activo: true }).populate('orderId');
    if (!workplan) {
        errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (workplan.estado === WORKPLAN_STATUS.APPROVED) {
        errorResponse(res, 'El plan ya está aprobado', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    workplan.estado = WORKPLAN_STATUS.APPROVED;
    workplan.aprobadoPor = req.user.userId;
    workplan.fechaAprobacion = new Date();
    await workplan.save();
    const order = await Order.findById(workplan.orderId);
    if (order && order.estado === 'planning') {
        order.estado = 'in_progress';
        await order.save();
    }
    logger.info(`WorkPlan aprobado: ${id} por ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'APPROVE_WORKPLAN',
        resource: 'WorkPlan',
        resourceId: id,
        details: { titulo: workplan.titulo },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    emitToRole(ROLES.TECHNICIAN, 'workplan_approved', {
        workplanId: workplan._id,
        orderId: workplan.orderId,
        approvedBy: req.user.nombre,
    });
    successResponse(res, { data: workplan.toObject() }, 'Plan de trabajo aprobado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const completeActivity = asyncHandler(async (req, res) => {
    requireAuthenticated(req);
    const { id, actividadId } = req.params;
    if (!validateObjectId(id) || !validateObjectId(actividadId)) {
        errorResponse(res, 'IDs inválidos', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const workplan = await WorkPlan.findOne({ _id: id, activo: true });
    if (!workplan) {
        errorResponse(res, 'Plan de trabajo no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const actividad = workplan.cronograma.id(actividadId);
    if (!actividad || actividad.completada) {
        errorResponse(res, 'Actividad no encontrada o ya completada', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    if (actividad.responsable.toString() !== req.user._id?.toString() && req.user.rol !== ROLES.ADMIN) {
        errorResponse(res, 'No autorizado para completar esta actividad', HTTP_STATUS.FORBIDDEN);
        return;
    }
    actividad.completada = true;
    const totalActivities = workplan.cronograma.length;
    const completedCount = workplan.cronograma.filter((a) => a.completada).length + 1;
    workplan.progreso = Math.round((completedCount / totalActivities) * 100);
    await workplan.save();
    logger.info(`Actividad completada: ${actividadId} en workplan ${id} por ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'COMPLETE_ACTIVITY',
        resource: 'WorkPlan',
        resourceId: id,
        details: { actividadId, actividad: actividad.actividad },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: { actividad: actividad.toObject(), progreso: workplan.progreso } }, 'Actividad completada exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getWorkPlanStats = asyncHandler(async (req, res) => {
    requireEngineerOrHigher(req);
    const matchStage = { activo: true };
    const stats = await WorkPlan.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$estado',
                count: { $sum: 1 },
                avgCostoMateriales: { $avg: '$costoTotalMateriales' },
                totalProgreso: { $sum: '$progreso' },
            },
        },
        { $sort: { count: -1 } },
    ]);
    const totalWorkplans = await WorkPlan.countDocuments({ activo: true });
    const approvedWorkplans = await WorkPlan.countDocuments({ activo: true, estado: WORKPLAN_STATUS.APPROVED });
    const approvalRate = totalWorkplans > 0 ? ((approvedWorkplans / totalWorkplans) * 100).toFixed(2) : '0';
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_WORKPLAN_STATS',
        resource: 'WorkPlan',
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, {
        data: {
            stats,
            summary: {
                total: totalWorkplans,
                approved: approvedWorkplans,
                approvalRate,
            },
        },
    }, 'Estadísticas obtenidas exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
//# sourceMappingURL=workplans.controller.js.map