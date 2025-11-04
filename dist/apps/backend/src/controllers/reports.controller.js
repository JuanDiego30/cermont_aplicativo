import CctvReport from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import Evidence from '../utils/response';
import { asyncHandler } from '../utils/response';
import { emitToRole, emitToUser } from '../utils/logger';
import { z } from 'zod';
import { createAuditLog } from '../utils/response';
const CctvListQuerySchema = z.object({
    page: z.string().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
    limit: z.string().default('10').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10)))),
    lugar: z.string().optional().max(100),
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),
    tecnicoId: z.string().optional().refine((id) => /^[0-9a-fA-F]{24}$/.test(id), { message: 'tecnicoId inválido' }),
    orderId: z.string().optional().refine((id) => /^[0-9a-fA-F]{24}$/.test(id), { message: 'orderId inválido' }),
});
const CreateCctvReportSchema = z.object({
    orderId: z.string().optional().refine((id) => /^[0-9a-fA-F]{24}$/.test(id), { message: 'orderId inválido' }),
    lugar: z.string().min(1, 'Lugar requerido').max(200),
    descripcion: z.string().min(10, 'Descripción mínima 10 caracteres').max(2000),
    hallazgos: z.string().optional().max(2000),
    recomendaciones: z.string().optional().max(2000),
    fecha: z.string().default(() => new Date().toISOString()),
});
const UpdateCctvReportSchema = z.object({
    descripcion: z.string().min(10).max(2000).optional(),
    hallazgos: z.string().max(2000).optional(),
    recomendaciones: z.string().max(2000).optional(),
});
const ApproveSchema = z.object({});
const validateObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
export const getAllCctvReports = asyncHandler(async (req, res) => {
    requireTechnicianOrHigher(req);
    const query = CctvListQuerySchema.parse(req.query);
    const filter = { isActive: true };
    if (query.lugar)
        filter.lugar = { $regex: query.lugar, $options: 'i' };
    if (query.orderId)
        filter.orderId = query.orderId;
    if (query.tecnicoId)
        filter.tecnicoId = query.tecnicoId;
    if (query.fechaInicio || query.fechaFin) {
        filter.fecha = {};
        if (query.fechaInicio)
            filter.fecha.$gte = new Date(query.fechaInicio);
        if (query.fechaFin)
            filter.fecha.$lte = new Date(query.fechaFin + 'T23:59:59.999Z');
    }
    if (req.user.role === 'technician') {
        filter.tecnicoId = req.user.userId;
    }
    const skip = (query.page - 1) * query.limit;
    const [reports, total] = await Promise.all([
        CctvReport.find(filter)
            .populate('orderId', 'numeroOrden clienteNombre')
            .populate('tecnicoId', 'nombre email')
            .populate('aprobadoPor', 'nombre email')
            .sort({ fecha: -1 })
            .skip(skip)
            .limit(query.limit)
            .lean(),
        CctvReport.countDocuments(filter),
    ]);
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_CCTV_REPORTS',
        resource: 'CctvReport',
        details: { page: query.page, limit: query.limit, filters: { ...query, tecnicoId: undefined } },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    paginatedResponse(res, { data: reports }, query.page, query.limit, total, 'Reportes CCTV obtenidos exitosamente', { timestamp: new Date().toISOString() });
});
export const getCctvReportById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de reporte inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const report = await CctvReport.findOne({ _id: id, isActive: true })
        .populate('orderId', 'numeroOrden clienteNombre lugar')
        .populate('tecnicoId', 'nombre email telefono cargo')
        .populate('aprobadoPor', 'nombre email')
        .lean();
    if (!report) {
        errorResponse(res, 'Reporte no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (req.user.role === 'technician' && report.tecnicoId?._id.toString() !== req.user.userId) {
        errorResponse(res, 'No tienes permiso para ver este reporte', HTTP_STATUS.FORBIDDEN);
        return;
    }
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_CCTV_REPORT',
        resource: 'CctvReport',
        resourceId: id,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: report }, 'Reporte obtenido exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const createCctvReport = asyncHandler(async (req, res) => {
    const rolesAllowed = ['technician', 'supervisor', 'engineer'];
    if (!rolesAllowed.includes(req.user.role)) {
        errorResponse(res, 'Rol no autorizado para crear reportes CCTV', HTTP_STATUS.FORBIDDEN);
        return;
    }
    const data = {
        ...CreateCctvReportSchema.parse(req.body),
        tecnicoId: req.user.userId,
        fecha: CreateCctvReportSchema.parse(req.body).fecha || new Date().toISOString(),
    };
    if (data.orderId) {
        const order = await Order.findById(data.orderId).lean();
        if (!order || !order.isActive) {
            errorResponse(res, 'Orden no encontrada o inactiva', HTTP_STATUS.NOT_FOUND);
            return;
        }
    }
    const report = await CctvReport.create(data);
    logger.info(`CCTV report created: ${report._id} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'CREATE',
        resource: 'CctvReport',
        resourceId: report._id.toString(),
        details: { lugar: data.lugar, orderId: data.orderId },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    const notifyData = {
        reportId: report._id,
        lugar: report.lugar,
        tecnico: req.user.nombre,
    };
    emitToRole('supervisor', 'cctv_report_created', notifyData);
    emitToRole('engineer', 'cctv_report_created', { ...notifyData, tecnico: undefined });
    createdResponse(res, { data: report }, 'Reporte CCTV creado exitosamente', { timestamp: new Date().toISOString() });
});
export const updateCctvReport = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = UpdateCctvReportSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de reporte inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const report = await CctvReport.findOne({ _id: id, isActive: true });
    if (!report) {
        errorResponse(res, 'Reporte no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const isCreator = report.tecnicoId.toString() === req.user.userId;
    const isHigher = ['supervisor', 'engineer', 'admin'].includes(req.user.role);
    if (!isCreator && !isHigher) {
        errorResponse(res, 'No tienes permiso para editar este reporte', HTTP_STATUS.FORBIDDEN);
        return;
    }
    Object.assign(report, updates);
    await report.save({ validateModifiedOnly: true });
    logger.info(`CCTV report updated: ${report._id} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'UPDATE',
        resource: 'CctvReport',
        resourceId: id,
        details: { changes: Object.keys(updates) },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    await report.populate('orderId', 'numeroOrden clienteNombre');
    await report.populate('tecnicoId', 'nombre email');
    await report.populate('aprobadoPor', 'nombre email');
    successResponse(res, { data: report.toJSON() }, 'Reporte actualizado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const deleteCctvReport = asyncHandler(async (req, res) => {
    requireAdminOrEngineer(req);
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de reporte inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const report = await CctvReport.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false, deletedAt: new Date() }, { new: true }).lean();
    if (!report) {
        errorResponse(res, 'Reporte no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    logger.info(`CCTV report soft-deleted: ${id} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'DELETE',
        resource: 'CctvReport',
        resourceId: id,
        details: { lugar: report.lugar },
        status: 'SUCCESS',
        severity: 'HIGH',
    });
    successResponse(res, null, 'Reporte eliminado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const approveCctvReport = asyncHandler(async (req, res) => {
    requireSupervisorOrHigher(req);
    const { id } = req.params;
    ApproveSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de reporte inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const report = await CctvReport.findOne({ _id: id, isActive: true });
    if (!report) {
        errorResponse(res, 'Reporte no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (report.aprobadoPor) {
        errorResponse(res, 'El reporte ya está aprobado', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    report.aprobadoPor = req.user.userId;
    report.fechaAprobacion = new Date();
    await report.save();
    logger.info(`CCTV report approved: ${report._id} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'APPROVE',
        resource: 'CctvReport',
        resourceId: id,
        details: { lugar: report.lugar },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    emitToUser(report.tecnicoId.toString(), 'report_approved', {
        reportId: report._id,
        lugar: report.lugar,
        approvedBy: req.user.nombre,
    });
    await report.populate('orderId', 'numeroOrden clienteNombre');
    await report.populate('tecnicoId', 'nombre email');
    await report.populate('aprobadoPor', 'nombre email');
    successResponse(res, { data: report.toJSON() }, 'Reporte aprobado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getReportsByOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    if (!validateObjectId(orderId)) {
        errorResponse(res, 'ID de orden inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const order = await Order.findOne({ _id: orderId, isActive: true }).lean();
    if (!order) {
        errorResponse(res, 'Orden no encontrada o inactiva', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const isAssigned = order.asignados?.some((u) => u.toString() === req.user.userId) ||
        ['coordinator', 'supervisor', 'engineer', 'admin'].includes(req.user.role);
    if (!isAssigned) {
        errorResponse(res, 'No tienes permiso para ver reportes de esta orden', HTTP_STATUS.FORBIDDEN);
        return;
    }
    const [cctvReports, evidences] = await Promise.all([
        CctvReport.find({ orderId, isActive: true })
            .populate('tecnicoId', 'nombre email')
            .sort({ fecha: -1 })
            .lean(),
        Evidence.find({ orderId, isActive: true })
            .populate('uploadedBy', 'nombre email')
            .sort({ fecha: -1 })
            .lean(),
    ]);
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_REPORTS_BY_ORDER',
        resource: 'CctvReport/Evidence',
        resourceId: orderId,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, {
        data: {
            cctvReports,
            evidences
        }
    }, 'Reportes obtenidos exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
//# sourceMappingURL=reports.controller.js.map