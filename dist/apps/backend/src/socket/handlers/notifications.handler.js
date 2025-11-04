import { logger } from '';
import notificationService from '';
import { NOTIFICATION_TYPES } from '';
const isValidId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
export const registerNotificationsHandlers = (io, socket) => {
    socket.on('notification:read', async (data) => {
        try {
            if (!socket.user?._id) {
                socket.emit('notification:read:error', { message: 'Usuario no autenticado' });
                return;
            }
            if (!data.notificationId || !isValidId(data.notificationId)) {
                socket.emit('notification:read:error', { message: 'ID de notificación inválido', code: 'INVALID_ID' });
                return;
            }
            await notificationService.markRead(data.notificationId, socket.user._id);
            logger.info(`Notificación ${data.notificationId} marcada como leída por usuario ${socket.user._id}`);
            socket.emit('notification:read:success', {
                notificationId: data.notificationId,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error al marcar notificación como leída:', error);
            socket.emit('notification:read:error', {
                message: 'Error al marcar notificación como leída',
                code: error.code || 'INTERNAL_ERROR',
            });
        }
    });
    socket.on('notification:read_all', async () => {
        try {
            if (!socket.user?._id) {
                socket.emit('notification:read_all:error', { message: 'Usuario no autenticado' });
                return;
            }
            await notificationService.markAllRead(socket.user._id);
            logger.info(`Todas las notificaciones marcadas como leídas por usuario ${socket.user._id}`);
            socket.emit('notification:read_all:success', {
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error al marcar todas las notificaciones:', error);
            socket.emit('notification:read_all:error', {
                message: 'Error al marcar notificaciones',
                code: error.code || 'INTERNAL_ERROR',
            });
        }
    });
    socket.on('notification:get_unread', async () => {
        try {
            if (!socket.user?._id) {
                socket.emit('notification:error', { message: 'Usuario no autenticado' });
                return;
            }
            const unreadNotifications = await notificationService.getUnread(socket.user._id, { limit: 50, sort: { createdAt: -1 } });
            const payload = {
                notifications: unreadNotifications.map((n) => ({
                    id: n._id.toString(),
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    data: n.data,
                    read: n.read,
                    timestamp: n.createdAt.getTime(),
                })),
                count: unreadNotifications.length,
            };
            socket.emit('notification:unread', payload);
        }
        catch (error) {
            logger.error('Error al obtener notificaciones no leídas:', error);
            socket.emit('notification:error', {
                message: 'Error al obtener notificaciones',
                code: error.code || 'INTERNAL_ERROR',
            });
        }
    });
    socket.on('notification:subscribe', (data) => {
        try {
            if (!socket.user?._id) {
                socket.emit('notification:subscribe:error', { message: 'Usuario no autenticado' });
                return;
            }
            const validTypes = data.types.filter((type) => NOTIFICATION_TYPES.includes(type));
            if (validTypes.length === 0) {
                socket.emit('notification:subscribe:error', { message: 'Tipos de notificación inválidos' });
                return;
            }
            validTypes.forEach((type) => {
                socket.join(`notification:${type}`);
            });
            if (!socket.data.notifications)
                socket.data.notifications = new Set();
            validTypes.forEach((type) => socket.data.notifications?.add(type));
            logger.info(`Usuario ${socket.user._id} suscrito a notificaciones: ${validTypes.join(', ')}`);
            socket.emit('notification:subscribe:success', {
                types: validTypes,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error al suscribirse a notificaciones:', error);
            socket.emit('notification:subscribe:error', {
                message: 'Error en suscripción',
                code: 'SUBSCRIBE_ERROR',
            });
        }
    });
    socket.on('notification:unsubscribe', (data) => {
        try {
            if (!socket.user?._id)
                return;
            const validTypes = data.types.filter((type) => NOTIFICATION_TYPES.includes(type));
            validTypes.forEach((type) => {
                socket.leave(`notification:${type}`);
                socket.data.notifications?.delete(type);
            });
            logger.info(`Usuario ${socket.user._id} desuscrito de notificaciones: ${validTypes.join(', ')}`);
            socket.emit('notification:unsubscribe:success', {
                types: validTypes,
                timestamp: Date.now(),
            });
        }
        catch (error) {
            logger.error('Error al desuscribirse de notificaciones:', error);
        }
    });
};
export const sendNotificationToUser = (io, userId, notification) => {
    try {
        io.to(`user:${userId}`).emit('notification:new', notification);
        logger.info(`Notificación enviada a usuario ${userId}: ${notification.type}`);
    }
    catch (error) {
        logger.error('Error al enviar notificación:', error);
    }
};
export const sendNotificationToRole = (io, role, notification) => {
    try {
        io.to(`role:${role}`).emit('notification:new', notification);
        logger.info(`Notificación enviada a rol ${role}: ${notification.type}`);
    }
    catch (error) {
        logger.error('Error al enviar notificación a rol:', error);
    }
};
export const sendBroadcastNotification = (io, notification) => {
    try {
        io.emit('notification:broadcast', notification);
        logger.info(`Notificación broadcast enviada: ${notification.type}`);
    }
    catch (error) {
        logger.error('Error al enviar notificación broadcast:', error);
    }
};
export const cleanupNotifications = (socket) => {
    if (socket.data.notifications) {
        socket.data.notifications.forEach((type) => socket.leave(`notification:${type}`));
    }
    socket.leave(`user:${socket.user?._id || ''}`);
    socket.leave(`role:${socket.user?.rol || ''}`);
};
//# sourceMappingURL=notifications.handler.js.map