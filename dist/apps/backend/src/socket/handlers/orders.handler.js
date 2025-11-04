import Order from '';
import { logger } from '';
import orderService from '';
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
const hasOrderPermission = (order, userId, userRol) => {
    const isAssigned = order.asignadoA.some((assignedId) => assignedId.toString() === userId);
    const isSupervisor = order.supervisorId?.toString() === userId;
    const isHighRole = ['engineer', 'admin', 'root'].includes(userRol);
    return isAssigned || isSupervisor || isHighRole;
};
export const registerOrdersHandlers = (io, socket) => {
    socket.on('order:subscribe', async (data) => {
        try {
            if (!data.orderId || !isValidId(data.orderId)) {
                socket.emit('order:subscribe:error', { message: 'ID de orden inválido', code: 'INVALID_ID' });
                return;
            }
            const order = await Order.findById(data.orderId).lean();
            if (!order) {
                socket.emit('order:subscribe:error', { message: 'Orden no encontrada', orderId: data.orderId, code: 'ORDER_NOT_FOUND' });
                return;
            }
            if (!hasOrderPermission(order, socket.user._id, socket.user.rol)) {
                socket.emit('order:subscribe:error', { message: 'No tienes permisos para ver esta orden', orderId: data.orderId, code: 'PERMISSION_DENIED' });
                return;
            }
            socket.join(`order:${data.orderId}`);
            if (!socket.data.orders)
                socket.data.orders = new Set();
            socket.data.orders.add(data.orderId);
            logger.info(`Usuario ${socket.user._id} suscrito a orden ${data.orderId}`);
            const orderData = await Order.findById(data.orderId)
                .populate('asignadoA', 'nombre email')
                .populate('supervisorId', 'nombre email')
                .lean();
            socket.emit('order:subscribe:success', {
                orderId: data.orderId,
                order: orderData,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error al suscribirse a orden:', error);
            socket.emit('order:subscribe:error', {
                message: 'Error al suscribirse a la orden',
                code: error.code || 'INTERNAL_ERROR',
            });
        }
    });
    socket.on('order:unsubscribe', (data) => {
        try {
            if (!data.orderId || !isValidId(data.orderId))
                return;
            socket.leave(`order:${data.orderId}`);
            socket.data.orders?.delete(data.orderId);
            logger.info(`Usuario ${socket.user._id} desuscrito de orden ${data.orderId}`);
            socket.emit('order:unsubscribe:success', {
                orderId: data.orderId,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error al desuscribirse de orden:', error);
        }
    });
    socket.on('order:get_progress', async (data) => {
        try {
            if (!data.orderId || !isValidId(data.orderId)) {
                socket.emit('order:progress:error', { message: 'ID de orden inválido', code: 'INVALID_ID' });
                return;
            }
            const progress = await orderService.calculateProgress(data.orderId, socket.user._id);
            socket.emit('order:progress', {
                orderId: data.orderId,
                progress,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error al obtener progreso de orden:', error);
            socket.emit('order:progress:error', {
                message: error.message || 'Error al obtener progreso',
                code: error.code || 'INTERNAL_ERROR',
            });
        }
    });
    socket.on('order:viewing', (data) => {
        try {
            if (!data.orderId || !isValidId(data.orderId))
                return;
            socket.to(`order:${data.orderId}`).emit('order:user_viewing', {
                orderId: data.orderId,
                user: {
                    id: socket.user._id,
                    nombre: socket.user.nombre,
                    rol: socket.user.rol,
                },
                timestamp: Date.now(),
            });
            logger.debug(`Usuario ${socket.user._id} está viendo orden ${data.orderId}`);
        }
        catch (error) {
            logger.error('Error al notificar visualización de orden:', error);
        }
    });
    socket.on('order:stopped_viewing', (data) => {
        try {
            if (!data.orderId || !isValidId(data.orderId))
                return;
            socket.to(`order:${data.orderId}`).emit('order:user_stopped_viewing', {
                orderId: data.orderId,
                userId: socket.user._id,
                timestamp: Date.now(),
            });
            logger.debug(`Usuario ${socket.user._id} dejó de ver orden ${data.orderId}`);
        }
        catch (error) {
            logger.error('Error al notificar fin de visualización:', error);
        }
    });
    socket.on('order:typing', (data) => {
        try {
            if (!data.orderId || !isValidId(data.orderId))
                return;
            socket.to(`order:${data.orderId}`).emit('order:user_typing', {
                orderId: data.orderId,
                user: {
                    id: socket.user._id,
                    nombre: socket.user.nombre,
                },
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error en typing indicator:', error);
        }
    });
    socket.on('order:stopped_typing', (data) => {
        try {
            if (!data.orderId || !isValidId(data.orderId))
                return;
            socket.to(`order:${data.orderId}`).emit('order:user_stopped_typing', {
                orderId: data.orderId,
                userId: socket.user._id,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error en stop typing:', error);
        }
    });
    socket.on('order:get_viewers', async (data) => {
        try {
            if (!data.orderId || !isValidId(data.orderId)) {
                socket.emit('order:viewers:error', { message: 'ID de orden inválido', code: 'INVALID_ID' });
                return;
            }
            if (!socket.rooms.has(`order:${data.orderId}`)) {
                socket.emit('order:viewers:error', { message: 'No suscrito a esta orden', code: 'NOT_SUBSCRIBED' });
                return;
            }
            const socketsInRoom = await io.in(`order:${data.orderId}`).fetchSockets();
            const viewers = socketsInRoom
                .filter((s) => s.user)
                .map((s) => {
                const extSocket = s;
                return {
                    id: extSocket.user._id,
                    nombre: extSocket.user.nombre,
                    rol: extSocket.user.rol,
                };
            });
            socket.emit('order:viewers', {
                orderId: data.orderId,
                viewers,
                count: viewers.length,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error al obtener viewers de orden:', error);
            socket.emit('order:viewers:error', {
                message: 'Error al obtener viewers',
                code: 'INTERNAL_ERROR',
            });
        }
    });
};
export const notifyOrderUpdate = (io, orderId, updateData) => {
    try {
        io.to(`order:${orderId}`).emit('order:updated', {
            orderId,
            update: updateData,
            timestamp: Date.now(),
        });
        logger.debug(`Notificación de actualización enviada para orden ${orderId}`);
    }
    catch (error) {
        logger.error('Error al notificar actualización de orden:', error);
    }
};
export const notifyOrderStatusChange = (io, orderId, previousStatus, newStatus) => {
    try {
        io.to(`order:${orderId}`).emit('order:status_changed', {
            orderId,
            previousStatus,
            newStatus,
            timestamp: Date.now(),
        });
        logger.info(`Cambio de estado notificado - Orden ${orderId}: ${previousStatus} → ${newStatus}`);
    }
    catch (error) {
        logger.error('Error al notificar cambio de estado:', error);
    }
};
export const notifyNewNote = (io, orderId, note, author) => {
    try {
        io.to(`order:${orderId}`).emit('order:new_note', {
            orderId,
            note: { id: note._id, content: note.content },
            author: {
                id: author._id,
                nombre: author.nombre,
                rol: author.rol,
            },
            timestamp: Date.now(),
        });
        logger.debug(`Nueva nota notificada en orden ${orderId}`);
    }
    catch (error) {
        logger.error('Error al notificar nueva nota:', error);
    }
};
export const notifyNewEvidence = (io, orderId, evidence) => {
    try {
        io.to(`order:${orderId}`).emit('order:new_evidence', {
            orderId,
            evidence: { id: evidence._id, type: evidence.type, url: evidence.url },
            timestamp: Date.now(),
        });
        logger.debug(`Nueva evidencia notificada en orden ${orderId}`);
    }
    catch (error) {
        logger.error('Error al notificar nueva evidencia:', error);
    }
};
export const cleanupOrders = (socket) => {
    if (socket.data.orders) {
        socket.data.orders.forEach((orderId) => socket.leave(`order:${orderId}`));
    }
};
//# sourceMappingURL=orders.handler.js.map