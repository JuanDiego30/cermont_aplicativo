import ToolKit from '../models/ToolKit';
import { successResponse, errorResponse, paginatedResponse, createdResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { createAuditLog } from '../middleware/auditLogger';
const TOOLKIT_CATEGORIES = ['electrico', 'telecomunicaciones', 'CCTV', 'instrumentacion', 'general'];
const ToolKitListQuerySchema = z.object({
    page: z.string().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
    limit: z.string().default('10').transform((val) => Math.min(50, Math.max(1, parseInt(val, 10)))),
    categoria: z.enum(TOOLKIT_CATEGORIES).optional(),
    search: z.string().optional().max(100),
});
const CreateToolKitSchema = z.object({
    nombre: z.string().min(1, 'Nombre requerido').max(100),
    descripcion: z.string().min(10, 'Descripción mínima 10 caracteres').max(500).optional(),
    categoria: z.enum(TOOLKIT_CATEGORIES),
    herramientas: z.array(z.object({
        nombre: z.string().min(1).max(100),
        cantidad: z.number().min(1).max(100),
        unidad: z.string().max(20).optional(),
    })).optional().default([]),
    equipos: z.array(z.object({
        nombre: z.string().min(1).max(100),
        cantidad: z.number().min(1),
        observaciones: z.string().max(200).optional(),
    })).optional().default([]),
    elementosSeguridad: z.array(z.object({
        nombre: z.string().min(1).max(100),
        cantidad: z.number().min(1),
    })).optional().default([]),
});
const UpdateToolKitSchema = CreateToolKitSchema.partial();
UpdateToolKitSchema.refine((data) => !data.creadoPor && !data.vecesUtilizado, {
    message: 'Campos no actualizables (creadoPor, vecesUtilizado)',
    path: ['creadoPor'],
});
const CloneToolKitSchema = z.object({
    nombre: z.string().min(1).max(100),
});
const MostUsedQuerySchema = z.object({
    limit: z.string().default('10').transform((val) => Math.min(20, Math.max(1, parseInt(val, 10)))),
});
const validateObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
export const getAllToolKits = asyncHandler(async (req, res) => {
    requireSupervisorOrHigher(req);
    const query = ToolKitListQuerySchema.parse(req.query);
    const filter = { isActive: true };
    if (query.categoria)
        filter.categoria = query.categoria;
    if (query.search) {
        const searchRegex = { $regex: query.search, $options: 'i' };
        filter.$or = [
            { nombre: searchRegex },
            { descripcion: searchRegex },
        ];
    }
    const skip = (query.page - 1) * query.limit;
    const [toolkits, total] = await Promise.all([
        ToolKit.find(filter)
            .populate('creadoPor', 'nombre email')
            .sort({ vecesUtilizado: -1, nombre: 1 })
            .skip(skip)
            .limit(query.limit)
            .lean(),
        ToolKit.countDocuments(filter),
    ]);
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_TOOLKITS',
        resource: 'ToolKit',
        details: { page: query.page, limit: query.limit, categoria: query.categoria },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    paginatedResponse(res, toolkits, { page: query.page, limit: query.limit, total }, 'Kits de herramientas obtenidos exitosamente');
});
export const getToolKitById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de kit inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const toolkit = await ToolKit.findOne({ _id: id, isActive: true })
        .populate('creadoPor', 'nombre email cargo')
        .lean();
    if (!toolkit) {
        errorResponse(res, 'Kit de herramientas no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_TOOLKIT',
        resource: 'ToolKit',
        resourceId: id,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: toolkit }, 'Kit obtenido exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getToolKitsByCategory = asyncHandler(async (req, res) => {
    const { categoria } = req.params;
    if (!TOOLKIT_CATEGORIES.includes(categoria)) {
        errorResponse(res, `Categoría inválida. Válidas: ${TOOLKIT_CATEGORIES.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const toolkits = await ToolKit.find({ categoria, isActive: true })
        .populate('creadoPor', 'nombre email')
        .sort({ vecesUtilizado: -1 })
        .lean();
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_TOOLKITS_BY_CATEGORY',
        resource: 'ToolKit',
        details: { categoria },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: { toolkits, count: toolkits.length } }, `Kits de ${categoria} obtenidos exitosamente`, HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const createToolKit = asyncHandler(async (req, res) => {
    requireSupervisorOrHigher(req);
    const data = {
        ...CreateToolKitSchema.parse(req.body),
        creadoPor: req.user.userId,
    };
    const existingToolkit = await ToolKit.findOne({ nombre: { $regex: new RegExp(`^${data.nombre}$`, 'i') } });
    if (existingToolkit) {
        errorResponse(res, 'Ya existe un kit con ese nombre', HTTP_STATUS.CONFLICT);
        return;
    }
    const toolkit = await ToolKit.create(data);
    logger.info(`ToolKit created: ${toolkit.nombre} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'CREATE',
        resource: 'ToolKit',
        resourceId: toolkit._id.toString(),
        details: { nombre: data.nombre, categoria: data.categoria },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    createdResponse(res, { data: toolkit }, 'Kit creado exitosamente');
});
export const updateToolKit = asyncHandler(async (req, res) => {
    requireSupervisorOrHigher(req);
    const { id } = req.params;
    const updates = UpdateToolKitSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de kit inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const toolkit = await ToolKit.findOne({ _id: id, isActive: true });
    if (!toolkit) {
        errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (updates.nombre && updates.nombre.toLowerCase() !== toolkit.nombre.toLowerCase()) {
        const existingToolkit = await ToolKit.findOne({
            nombre: { $regex: new RegExp(`^${updates.nombre}$`, 'i') }
        });
        if (existingToolkit) {
            errorResponse(res, 'Ya existe un kit con ese nombre', HTTP_STATUS.CONFLICT);
            return;
        }
    }
    Object.assign(toolkit, updates);
    await toolkit.save({ validateModifiedOnly: true });
    logger.info(`ToolKit updated: ${toolkit.nombre} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'UPDATE',
        resource: 'ToolKit',
        resourceId: id,
        details: { changes: Object.keys(updates), nombre: toolkit.nombre },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    await toolkit.populate('creadoPor', 'nombre email');
    successResponse(res, { data: toolkit.toJSON() }, 'Kit actualizado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const deleteToolKit = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de kit inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const toolkit = await ToolKit.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false, deletedAt: new Date() }, { new: true }).lean();
    if (!toolkit) {
        errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    logger.info(`ToolKit soft deleted: ${toolkit.nombre} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'DELETE',
        resource: 'ToolKit',
        resourceId: id,
        details: { nombre: toolkit.nombre },
        status: 'SUCCESS',
        severity: 'HIGH',
    });
    successResponse(res, null, 'Kit eliminado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const incrementToolKitUsage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de kit inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const toolkit = await ToolKit.findOneAndUpdate({ _id: id, isActive: true }, { $inc: { vecesUtilizado: 1 } }, { new: true, lean: true });
    if (!toolkit) {
        errorResponse(res, 'Kit no encontrado o inactivo', HTTP_STATUS.NOT_FOUND);
        return;
    }
    logger.info(`ToolKit used: ${toolkit.nombre} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'USE_TOOLKIT',
        resource: 'ToolKit',
        resourceId: id,
        details: { nombre: toolkit.nombre },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: { ...toolkit, vecesUtilizado: toolkit.vecesUtilizado } }, 'Uso registrado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getMostUsedToolKits = asyncHandler(async (req, res) => {
    requireSupervisorOrHigher(req);
    const { limit } = MostUsedQuerySchema.parse({ limit: req.query.limit || '10' });
    const toolkits = await ToolKit.find({ isActive: true })
        .sort({ vecesUtilizado: -1 })
        .limit(limit)
        .populate('creadoPor', 'nombre email')
        .lean();
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_MOST_USED_TOOLKITS',
        resource: 'ToolKit',
        details: { limit },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: toolkits }, 'Kits más utilizados obtenidos exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const cloneToolKit = asyncHandler(async (req, res) => {
    requireSupervisorOrHigher(req);
    const { id } = req.params;
    const { nombre } = CloneToolKitSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de kit inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const originalToolkit = await ToolKit.findOne({ _id: id, isActive: true }).lean();
    if (!originalToolkit) {
        errorResponse(res, 'Kit original no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const existingToolkit = await ToolKit.findOne({ nombre: { $regex: new RegExp(`^${nombre}$`, 'i') } });
    if (existingToolkit) {
        errorResponse(res, 'Ya existe un kit con ese nombre', HTTP_STATUS.CONFLICT);
        return;
    }
    const clonedData = {
        nombre,
        descripcion: `Clon de: ${originalToolkit.nombre}`,
        categoria: originalToolkit.categoria,
        herramientas: originalToolkit.herramientas || [],
        equipos: originalToolkit.equipos || [],
        elementosSeguridad: originalToolkit.elementosSeguridad || [],
        creadoPor: req.user.userId,
        vecesUtilizado: 0,
        isActive: true,
    };
    const clonedToolkit = await ToolKit.create(clonedData);
    logger.info(`ToolKit cloned: ${originalToolkit.nombre} -> ${nombre} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'CLONE',
        resource: 'ToolKit',
        resourceId: clonedToolkit._id.toString(),
        details: { originalId: id, nombre },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    createdResponse(res, { data: clonedToolkit }, 'Kit clonado exitosamente');
});
export const toggleToolKitActive = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de kit inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const toolkit = await ToolKit.findByIdAndUpdate(id, [
        { $set: { isActive: { $not: '$isActive' } } },
        { $set: { updatedAt: new Date() } },
    ], { new: true, lean: true });
    if (!toolkit || toolkit.isActive === undefined) {
        errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const action = toolkit.isActive ? 'activated' : 'deactivated';
    logger.info(`ToolKit ${action}: ${toolkit.nombre} by ${req.user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        action: `TOGGLE_${toolkit.isActive ? 'ACTIVATE' : 'DEACTIVATE'}`,
        resource: 'ToolKit',
        resourceId: id,
        details: { nombre: toolkit.nombre, newState: toolkit.isActive },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: toolkit }, `Kit ${toolkit.isActive ? 'activado' : 'desactivado'} exitosamente`, HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getToolKitStats = asyncHandler(async (req, res) => {
    requireSupervisorOrHigher(req);
    const stats = await ToolKit.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$categoria',
                count: { $sum: 1 },
                totalUsage: { $sum: '$vecesUtilizado' },
                avgUsage: { $avg: '$vecesUtilizado' },
            },
        },
        { $sort: { totalUsage: -1 } },
    ]);
    const totalToolkits = await ToolKit.countDocuments({ isActive: true });
    const totalUsageAgg = await ToolKit.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$vecesUtilizado' } } },
    ]);
    const totalUsage = totalUsageAgg[0] ? totalUsageAgg[0].total : 0;
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_TOOLKIT_STATS',
        resource: 'ToolKit',
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, {
        data: {
            stats,
            summary: { totalToolkits, totalUsage }
        }
    }, 'Estadísticas obtenidas exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
//# sourceMappingURL=toolkits.controller.js.map