import Order from '../models/Order';
import User from '../models/User';
import { autoPaginate } from '../utils/pagination';
import { AppError } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { ORDER_STATUS } from '../utils/constants';
import notificationService from './notification.service';
import AuditLog from '../models/AuditLog';
import cacheService from './cache.service';
class OrderService {
    async generateOrderNumber() {
        const year = new Date().getFullYear();
        const count = await Order.countDocuments({ numeroOrden: new RegExp(`^OT-${year}`) });
        const nextNumber = (count + 1).toString().padStart(4, '0');
        return `OT-${year}-${nextNumber}`;
    }
    async list(filters = {}, options = {}) {
        try {
            const cacheKey = `orders:list:${JSON.stringify({ ...filters, page: options.page, limit: options.limit, sort: options.sort })}`;
            return await cacheService.wrap(cacheKey, async () => {
                const result = await autoPaginate(Order, filters, {
                    ...options,
                    populate: [
                        { path: 'asignadoA', select: 'nombre email rol' },
                        { path: 'supervisorId', select: 'nombre email' },
                        { path: 'workPlanId', select: 'titulo progresoActividades' },
                    ],
                    sort: options.sort || { createdAt: -1 },
                });
                return result;
            }, 180);
        }
        catch (error) {
            logger.error('[OrderService] Error listando �rdenes:', error);
            throw error;
        }
    }
    async getById(orderId) {
        try {
            const cacheKey = `order:${orderId}`;
            return await cacheService.wrap(cacheKey, async () => {
                const order = await Order.findById(orderId)
                    .populate('asignadoA', 'nombre email rol')
                    .populate('supervisorId', 'nombre email')
                    .populate('workPlanId')
                    .lean();
                if (!order) {
                    throw new AppError('Orden no encontrada', 404, { code: 'ORDER_NOT_FOUND' });
                }
                return order;
            }, 300);
        }
        catch (error) {
            logger.error(`[OrderService] Error obteniendo orden ${orderId}:`, error);
            throw error;
        }
    }
    async create(orderData, userId) {
        try {
            if (!orderData.numeroOrden) {
                orderData.numeroOrden = await this.generateOrderNumber();
            }
            const existingOrder = await Order.findOne({ numeroOrden: orderData.numeroOrden });
            if (existingOrder) {
                throw new AppError('El n�mero de orden ya existe', 409, 'ORDER_NUMBER_EXISTS');
            }
            const order = await Order.create({ ...orderData, clienteNombre: orderData.cliente });
            await cacheService.delPattern('orders:list:*');
            await AuditLog.log({
                action: 'CREATE_ORDER',
                userEmail: 'system@cermont.com',
                resource: 'Order',
                resourceId: order._id,
                description: `Order created: ${order.numeroOrden}`,
                changes: { after: { numeroOrden: order.numeroOrden } },
            });
            await notificationService.notifyOrderCreated(order, { _id: userId, nombre: 'Usuario' });
            logger.info(`[OrderService] Orden creada: ${order.numeroOrden} por ${userId}`);
            return order;
        }
        catch (error) {
            logger.error('[OrderService] Error creando orden:', error);
            throw error;
        }
    }
    async update(orderId, updateData, userId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
            }
            const { numeroOrden, historial, ...allowedUpdate } = updateData;
            order.historial.push({
                accion: 'Actualizaci�n',
                usuario: userId,
                detalles: allowedUpdate,
                fecha: new Date(),
            });
            Object.assign(order, allowedUpdate);
            await order.save();
            await cacheService.del(`order:${orderId}`);
            await cacheService.delPattern('orders:list:*');
            await auditService.createAuditLog({
                accion: 'UPDATE_ORDER',
                usuarioId: userId,
                entidad: 'Order',
                entidadId: orderId,
                detalles: allowedUpdate,
            });
            logger.info(`[OrderService] Orden actualizada: ${order.numeroOrden} por ${userId}`);
            return order;
        }
        catch (error) {
            logger.error(`[OrderService] Error actualizando orden ${orderId}:`, error);
            throw error;
        }
    }
    async assignUsers(orderId, userIds, userId, supervisorId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
            }
            const users = await User.find({ _id: { $in: userIds }, activo: true }).select('nombre email _id');
            if (users.length !== userIds.length) {
                throw new AppError('Algunos usuarios no existen o est�n inactivos', 400, 'INVALID_USERS');
            }
            order.asignadoA = userIds;
            if (supervisorId) {
                const supervisor = await User.findById(supervisorId).select('activo');
                if (!supervisor || !supervisor.activo) {
                    throw new AppError('Supervisor inv�lido o inactivo', 400, 'INVALID_SUPERVISOR');
                }
                order.supervisorId = supervisorId;
            }
            order.historial.push({
                accion: 'Usuarios asignados',
                usuario: userId,
                detalles: { usuarios: userIds, supervisor: supervisorId },
                fecha: new Date(),
            });
            await order.save();
            await cacheService.del(`order:${orderId}`);
            await cacheService.delPattern('orders:list:*');
            await auditService.createAuditLog({
                accion: 'ASSIGN_USERS_ORDER',
                usuarioId: userId,
                entidad: 'Order',
                entidadId: orderId,
                detalles: { userIds, supervisorId },
            });
            const assignedBy = { _id: userId, nombre: 'Asignador' };
            await notificationService.notifyOrderAssigned(order, users, assignedBy);
            logger.info(`[OrderService] Usuarios asignados a orden ${order.numeroOrden} por ${userId}`);
            return order;
        }
        catch (error) {
            logger.error('[OrderService] Error asignando usuarios:', error);
            throw error;
        }
    }
    async changeStatus(orderId, newStatus, userId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
            }
            const previousStatus = order.estado;
            const validTransitions = {
                [ORDER_STATUS.PENDING]: [ORDER_STATUS.PLANNING, ORDER_STATUS.CANCELLED],
                [ORDER_STATUS.PLANNING]: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.CANCELLED],
                [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
                [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.INVOICING],
                [ORDER_STATUS.INVOICING]: [ORDER_STATUS.INVOICED],
                [ORDER_STATUS.INVOICED]: [ORDER_STATUS.PAID],
                [ORDER_STATUS.PAID]: [],
                [ORDER_STATUS.CANCELLED]: [],
            };
            if (!validTransitions[previousStatus]?.includes(newStatus)) {
                throw new AppError(`Transici�n inv�lida: ${previousStatus} ? ${newStatus}`, 400, 'INVALID_STATUS_TRANSITION');
            }
            order.estado = newStatus;
            if (newStatus === ORDER_STATUS.COMPLETED) {
                order.fechaFinReal = new Date();
            }
            order.historial.push({
                accion: 'Cambio de estado',
                usuario: userId,
                detalles: { estadoAnterior: previousStatus, estadoNuevo: newStatus },
                fecha: new Date(),
            });
            await order.save();
            await cacheService.del(`order:${orderId}`);
            await cacheService.delPattern('orders:list:*');
            await auditService.createAuditLog({
                accion: 'CHANGE_STATUS_ORDER',
                usuarioId: userId,
                entidad: 'Order',
                entidadId: orderId,
                detalles: { previousStatus, newStatus },
            });
            const changedBy = { _id: userId, nombre: 'Cambiante' };
            await notificationService.notifyOrderStatusChanged(order, previousStatus, newStatus, changedBy);
            logger.info(`[OrderService] Estado de orden ${order.numeroOrden}: ${previousStatus} ? ${newStatus} por ${userId}`);
            return order;
        }
        catch (error) {
            logger.error('[OrderService] Error cambiando estado de orden:', error);
            throw error;
        }
    }
    async addNote(orderId, nota, userId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
            }
            order.notas.push({
                contenido: nota.contenido,
                autor: userId,
                createdAt: new Date(),
            });
            await order.save();
            await cacheService.del(`order:${orderId}`);
            await auditService.createAuditLog({
                accion: 'ADD_NOTE_ORDER',
                usuarioId: userId,
                entidad: 'Order',
                entidadId: orderId,
                detalles: { contenido: nota.contenido.substring(0, 100) + '...' },
            });
            const addedBy = { _id: userId, nombre: 'Autor' };
            const noteData = { contenido: nota.contenido, createdAt: new Date() };
            await notificationService.notifyOrderNoteAdded(order, noteData, addedBy);
            logger.info(`[OrderService] Nota agregada a orden ${order.numeroOrden} por ${userId}`);
            return order;
        }
        catch (error) {
            logger.error('[OrderService] Error agregando nota:', error);
            throw error;
        }
    }
    async delete(orderId, userId) {
        try {
            const order = await Order.findById(orderId);
            if (!order) {
                throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
            }
            if (![ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED].includes(order.estado)) {
                throw new AppError('Solo se pueden eliminar �rdenes pendientes o canceladas', 400, 'CANNOT_DELETE_ACTIVE_ORDER');
            }
            order.isActive = false;
            order.historial.push({
                accion: 'Orden eliminada',
                usuario: userId,
                fecha: new Date(),
            });
            await order.save();
            await cacheService.del(`order:${orderId}`);
            await cacheService.delPattern('orders:list:*');
            await auditService.createAuditLog({
                accion: 'DELETE_ORDER',
                usuarioId: userId,
                entidad: 'Order',
                entidadId: orderId,
            });
            logger.info(`[OrderService] Orden eliminada: ${order.numeroOrden} por ${userId}`);
            return order;
        }
        catch (error) {
            logger.error(`[OrderService] Error eliminando orden ${orderId}:`, error);
            throw error;
        }
    }
    async getStats(filters = {}) {
        try {
            const cacheKey = `orders:stats:${JSON.stringify(filters)}`;
            return await cacheService.wrap(cacheKey, async () => {
                const baseFilter = { isActive: true, isArchived: false, ...filters };
                const statusKeys = Object.values(ORDER_STATUS);
                const countPromises = statusKeys.map(status => Order.countDocuments({ ...baseFilter, estado: status }));
                const [total] = await Promise.all([
                    Order.countDocuments(baseFilter),
                    ...countPromises,
                ]);
                const byStatusCounts = await Promise.all(countPromises);
                const byStatus = {};
                statusKeys.forEach((status, i) => { byStatus[status] = byStatusCounts[i]; });
                const overdue = await Order.countDocuments({
                    ...baseFilter,
                    fechaFinEstimada: { $lt: new Date() },
                    fechaFinReal: null,
                    estado: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.PLANNING, ORDER_STATUS.IN_PROGRESS] },
                });
                const costStats = await Order.aggregate([
                    { $match: baseFilter },
                    {
                        $group: {
                            _id: null,
                            totalEstimado: { $sum: '$costoEstimado' },
                            totalReal: { $sum: '$costoReal' },
                            promedioCostoEstimado: { $avg: '$costoEstimado' },
                            promedioCostoReal: { $avg: '$costoReal' },
                        },
                    },
                ]);
                return {
                    total,
                    byStatus,
                    overdue,
                    costs: costStats[0] || { totalEstimado: 0, totalReal: 0, promedioCostoEstimado: 0, promedioCostoReal: 0 },
                };
            }, 600);
        }
        catch (error) {
            logger.error('[OrderService] Error obteniendo estad�sticas:', error);
            throw error;
        }
    }
    async calculateProgress(orderId) {
        try {
            const order = await Order.findById(orderId).populate('workPlanId').lean();
            if (!order) {
                throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
            }
            let progress = order.progreso || 0;
            if (order.workPlanId) {
                const activityProgress = order.workPlanId.progresoActividades || 0;
                progress = (progress + activityProgress) / 2;
            }
            return Math.round(progress);
        }
        catch (error) {
            logger.error('[OrderService] Error calculando progreso:', error);
            throw error;
        }
    }
    async getUpcomingDeadlines(daysAhead = 7) {
        try {
            const cacheKey = `orders:upcoming:${daysAhead}`;
            return await cacheService.wrap(cacheKey, async () => {
                const today = new Date();
                const futureDate = new Date(today);
                futureDate.setDate(futureDate.getDate() + daysAhead);
                const orders = await Order.find({
                    isActive: true,
                    isArchived: false,
                    fechaFinEstimada: { $gte: today, $lte: futureDate },
                    estado: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.PLANNING, ORDER_STATUS.IN_PROGRESS] },
                })
                    .populate('asignadoA', 'nombre email')
                    .populate('supervisorId', 'nombre email')
                    .sort({ fechaFinEstimada: 1 })
                    .lean();
                return orders;
            }, 3600);
        }
        catch (error) {
            logger.error('[OrderService] Error obteniendo �rdenes pr�ximas a vencer:', error);
            throw error;
        }
    }
}
export default new OrderService();
//# sourceMappingURL=order.service.js.map