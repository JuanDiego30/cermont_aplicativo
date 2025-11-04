import { successResponse, errorResponse, createdResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { ORDER_STATUS } from '../utils/constants';
import orderService from '../services/order.service';
import notificationService from '../services/notification.service';
import { z } from 'zod';
import { createAuditLog } from '../middleware/auditLogger';
const OrderListQuerySchema = z.object({
    cursor: z.string().optional(),
    page: z.string().default('1').transform((val) => parseInt(val, 10)).refine((val) => val > 0, { message: 'page > 0' }),
    limit: z.string().default('20').transform((val) => parseInt(val, 10)).refine((val) => val > 0 && val <= 100, { message: 'limit 1-100' }),
    status: z.enum(ORDER_STATUS).optional(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    cliente: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().max(100).optional(),
});
const CreateOrderSchema = z.object({
    titulo: z.string().min(1, 'T�tulo requerido').max(200),
    descripcion: z.string().min(10, 'Descripci�n debe tener al menos 10 caracteres').max(1000),
    clienteNombre: z.string().min(1).max(100),
    ubicacion: z.string().min(1).max(200),
    prioridad: z.enum(['low', 'medium', 'high', 'critical']),
    fechaProgramada: z.string().optional(),
    horasEstimadas: z.number().min(0).max(1000).optional(),
    costoEstimado: z.number().min(0).optional(),
});
const UpdateOrderSchema = z.object({
    titulo: z.string().min(1).max(200).optional(),
    descripcion: z.string().min(10).max(1000).optional(),
    ubicacion: z.string().min(1).max(200).optional(),
    prioridad: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    fechaProgramada: z.string().optional(),
    horasEstimadas: z.number().min(0).max(1000).optional(),
    costoEstimado: z.number().min(0).optional(),
});
const AddNoteSchema = z.object({
    contenido: z.string().min(1, 'Contenido requerido').max(500),
});
const UpdateStatusSchema = z.object({
    estado: z.enum(ORDER_STATUS),
});
const AssignUsersSchema = z.object({
    userIds: z.array(z.string().refine((id) => /^[0-9a-fA-F]{24}$/.test(id), { message: 'ObjectId inv�lido' })).min(1),
    supervisorId: z.string().refine((id) => /^[0-9a-fA-F]{24}$/.test(id), { message: 'Supervisor ObjectId inv�lido' }).optional(),
});
const OrderStatsQuerySchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    cliente: z.string().optional(),
});
const UpcomingDeadlinesQuerySchema = z.object({
    days: z.string().default('7').transform((val) => parseInt(val, 10)).refine((val) => val >= 1 && val <= 90, { message: 'days 1-90' }),
});
const validateObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
export const getAllOrders = asyncHandler(async (req, res) => {
    const query = OrderListQuerySchema.parse({
        ...req.query,
        page: req.query.page || '1',
        limit: req.query.limit || '20',
    });
    const filters = {
        isActive: true,
        isArchived: false,
        $or: []
    };
    if (query.status)
        filters.estado = query.status;
    if (query.priority)
        filters.prioridad = query.priority;
    if (query.cliente)
        filters.clienteNombre = { $regex: query.cliente, $options: 'i' };
    if (query.startDate || query.endDate) {
        filters.fechaInicioEstimada = {};
        if (query.startDate)
            filters.fechaInicioEstimada.$gte = new Date(query.startDate);
        if (query.endDate)
            filters.fechaInicioEstimada.$lte = new Date(query.endDate + 'T23:59:59.999Z');
    }
    if (query.search) {
        const searchRegex = { $regex: query.search, $options: 'i' };
        filters.$or = [
            { numeroOrden: searchRegex },
            { clienteNombre: searchRegex },
            { descripcion: searchRegex },
        ];
    }
    const result = await orderService.list(filters, {
        cursor: query.cursor,
        page: query.page,
        limit: query.limit,
        sort: { createdAt: -1 },
    });
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_ORDERS',
        resource: 'Order',
        queryParams: { page: query.page, limit: query.limit },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, {
        data: result.docs,
    }, '�rdenes obtenidas exitosamente', HTTP_STATUS.OK, {
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
    });
});
export const getOrderById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de orden inv�lido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const order = await orderService.getById(id);
    if (!order) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_ORDER',
        resource: 'Order',
        resourceId: id,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: order }, 'Orden obtenida exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const createOrder = asyncHandler(async (req, res) => {
    requireCoordinatorOrAdmin(req);
    const data = CreateOrderSchema.parse(req.body);
    const orderData = {
        ...data,
        creadoPor: req.user.userId,
        estado: 'pending',
        numeroOrden: await orderService.generateOrderNumber(),
    };
    const order = await orderService.create(orderData, req.user.userId);
    await notificationService.notifyOrderCreated(order, req.user);
    logger.info(`Orden creada: ${order.numeroOrden} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'CREATE',
        resource: 'Order',
        resourceId: order._id.toString(),
        details: { numeroOrden: order.numeroOrden },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    createdResponse(res, { data: order }, 'Orden creada exitosamente');
});
export const updateOrder = asyncHandler(async (req, res) => {
    requireCoordinatorOrAdmin(req);
    const { id } = req.params;
    const data = UpdateOrderSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de orden inv�lido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const order = await orderService.update(id, data, req.user.userId);
    if (!order) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    logger.info(`Orden actualizada: ${order.numeroOrden} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'UPDATE',
        resource: 'Order',
        resourceId: id,
        details: { changes: Object.keys(data) },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: order }, 'Orden actualizada exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const deleteOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de orden inv�lido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const order = await orderService.delete(id, req.user.userId);
    if (!order) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    logger.info(`Orden eliminada: ${order.numeroOrden} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'DELETE',
        resource: 'Order',
        resourceId: id,
        details: { numeroOrden: order.numeroOrden },
        status: 'SUCCESS',
        severity: 'HIGH',
    });
    successResponse(res, null, 'Orden eliminada exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const addNote = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { contenido } = AddNoteSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de orden inv�lido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const order = await orderService.addNote(id, { contenido }, req.user.userId);
    if (!order) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    await notificationService.notifyOrderNoteAdded(order, { contenido }, req.user);
    logger.info(`Nota agregada a orden ${order.numeroOrden} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'ADD_NOTE',
        resource: 'Order',
        resourceId: id,
        details: { noteContent: contenido.substring(0, 50) + '...' },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: order }, 'Nota agregada exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { estado: newStatus } = UpdateStatusSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de orden inv�lido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const currentOrder = await orderService.getById(id);
    if (!currentOrder) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const previousStatus = currentOrder.estado;
    const order = await orderService.changeStatus(id, newStatus, req.user.userId);
    await notificationService.notifyOrderStatusChanged(order, previousStatus, newStatus, req.user);
    logger.info(`Estado de orden ${order.numeroOrden}: ${previousStatus} ? ${newStatus} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'UPDATE_STATUS',
        resource: 'Order',
        resourceId: id,
        details: { previous: previousStatus, new: newStatus },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    successResponse(res, { data: order }, 'Estado de orden actualizado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const assignUsers = asyncHandler(async (req, res) => {
    requireCoordinatorOrAdmin(req);
    const { id } = req.params;
    const data = AssignUsersSchema.parse(req.body);
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de orden inv�lido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const order = await orderService.assignUsers(id, data.userIds, data.supervisorId, req.user.userId);
    if (!order) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const assignedUsers = await orderService.getUsersByIds(data.userIds);
    await notificationService.notifyOrderAssigned(order, assignedUsers, req.user);
    logger.info(`Usuarios asignados a orden ${order.numeroOrden} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'ASSIGN_USERS',
        resource: 'Order',
        resourceId: id,
        details: { userIds: data.userIds.length, supervisorId: data.supervisorId },
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    successResponse(res, { data: order }, 'Usuarios asignados exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getOrderStats = asyncHandler(async (req, res) => {
    requireCoordinatorOrAdmin(req);
    const query = OrderStatsQuerySchema.parse(req.query);
    const filters = {};
    if (query.startDate || query.endDate) {
        filters.fechaInicioEstimada = {};
        if (query.startDate)
            filters.fechaInicioEstimada.$gte = new Date(query.startDate);
        if (query.endDate)
            filters.fechaInicioEstimada.$lte = new Date(query.endDate + 'T23:59:59.999Z');
    }
    if (query.cliente)
        filters.clienteNombre = query.cliente;
    const stats = await orderService.getStats(filters);
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_STATS',
        resource: 'Order',
        details: { filters },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: stats }, 'Estad�sticas de �rdenes obtenidas exitosamente', HTTP_STATUS.OK, {
        timestamp: new Date().toISOString(),
        filters: query,
    });
});
export const archiveOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de orden inv�lido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const order = await orderService.update(id, { isArchived: true }, req.user.userId);
    if (!order) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    logger.info(`Orden archivada: ${order.numeroOrden} por ${req.user.nombre}`);
    await createAuditLog({
        userId: req.user.userId,
        action: 'ARCHIVE',
        resource: 'Order',
        resourceId: id,
        details: { numeroOrden: order.numeroOrden },
        status: 'SUCCESS',
        severity: 'HIGH',
    });
    successResponse(res, null, 'Orden archivada exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getOrderProgress = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!validateObjectId(id)) {
        errorResponse(res, 'ID de orden inv�lido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const progress = await orderService.calculateProgress(id);
    if (progress === null) {
        errorResponse(res, 'Orden no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_PROGRESS',
        resource: 'Order',
        resourceId: id,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: { progress } }, 'Progreso de orden obtenido exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getUpcomingDeadlines = asyncHandler(async (req, res) => {
    requireCoordinatorOrAdmin(req);
    const { days } = UpcomingDeadlinesQuerySchema.parse({ days: req.query.days || '7' });
    const orders = await orderService.getUpcomingDeadlines(days);
    await createAuditLog({
        userId: req.user.userId,
        action: 'GET_UPCOMING',
        resource: 'Order',
        details: { days },
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { data: orders }, '�rdenes pr�ximas a vencer obtenidas exitosamente', HTTP_STATUS.OK, {
        timestamp: new Date().toISOString(),
        days,
    });
});
//# sourceMappingURL=orders.controller.js.map