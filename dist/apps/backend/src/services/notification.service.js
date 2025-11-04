import { emitToUser, emitToRole } from '';
import { logger } from '';
import { sendWelcomeEmail, sendPasswordChangedEmail, sendOrderAssignedEmail, sendOrderStatusChangeEmail, } from '';
let User;
class NotificationService {
    async notifyOrderCreated(order, createdBy = null) {
        try {
            const safeCreatedBy = createdBy?.nombre || 'Sistema';
            const data = {
                orderId: order._id.toString(),
                numeroOrden: order.numeroOrden,
                clienteNombre: order.clienteNombre,
                createdBy: safeCreatedBy,
                createdAt: order.createdAt || new Date(),
            };
            emitToRole('admin', 'new_order', data);
            logger.info(`[NotificationService] Notificaci�n de orden creada enviada: ${order.numeroOrden} por ${safeCreatedBy}`);
        }
        catch (error) {
            logger.error('[NotificationService] Error notificando creaci�n de orden:', error.message);
        }
    }
    async notifyOrderAssigned(order, assignedUsers, assignedBy) {
        if (!assignedUsers.length)
            return;
        try {
            const safeAssignedBy = assignedBy.nombre;
            const assignedAt = new Date();
            const baseData = {
                orderId: order._id.toString(),
                numeroOrden: order.numeroOrden,
                clienteNombre: order.clienteNombre,
                assignedBy: safeAssignedBy,
                assignedAt,
            };
            assignedUsers.forEach((user) => {
                emitToUser(user._id, 'order_assigned', { ...baseData });
            });
            const emailPromises = assignedUsers.map((user) => sendOrderAssignedEmail(user, order, assignedBy).catch((err) => {
                logger.error(`[NotificationService] Email fail para ${user._id}:`, err.message);
                return { success: false };
            }));
            await Promise.all(emailPromises);
            logger.info(`[NotificationService] Notificaciones de asignaci�n enviadas: ${order.numeroOrden} a ${assignedUsers.length} usuarios`);
        }
        catch (error) {
            logger.error('[NotificationService] Error notificando asignaci�n de orden:', error.message);
        }
    }
    async notifyOrderStatusChanged(order, previousStatus, newStatus, changedBy) {
        try {
            const safeChangedBy = changedBy.nombre;
            const changedAt = new Date();
            const involvedUserIds = [...(order.asignadoA || []), order.supervisorId].filter(Boolean);
            if (involvedUserIds.length === 0)
                return;
            const baseData = {
                orderId: order._id.toString(),
                numeroOrden: order.numeroOrden,
                previousStatus,
                newStatus,
                changedBy: safeChangedBy,
                changedAt,
            };
            involvedUserIds.forEach((userId) => {
                emitToUser(userId, 'order_status_changed', baseData);
            });
            emitToRole('admin', 'order_status_changed', baseData);
            const involvedUsers = await this.getInvolvedUsers(involvedUserIds);
            if (involvedUsers.length > 0) {
                await sendOrderStatusChangeEmail(involvedUsers, order, previousStatus, newStatus);
            }
            logger.info(`[NotificationService] Notificaciones de cambio de estado enviadas: ${order.numeroOrden} (${previousStatus} ? ${newStatus})`);
        }
        catch (error) {
            logger.error('[NotificationService] Error notificando cambio de estado:', error.message);
        }
    }
    async notifyOrderNoteAdded(order, note, addedBy) {
        try {
            const safeAddedBy = addedBy.nombre;
            const involvedUserIds = [...(order.asignadoA || []), order.supervisorId].filter(Boolean);
            const addedById = addedBy._id.toString();
            const baseData = {
                orderId: order._id.toString(),
                numeroOrden: order.numeroOrden,
                note: note.contenido,
                addedBy: safeAddedBy,
                addedAt: note.createdAt || new Date(),
            };
            involvedUserIds.forEach((userId) => {
                if (userId !== addedById) {
                    emitToUser(userId, 'order_note_added', baseData);
                }
            });
            logger.info(`[NotificationService] Notificaci�n de nota enviada: ${order.numeroOrden} por ${safeAddedBy}`);
        }
        catch (error) {
            logger.error('[NotificationService] Error notificando nueva nota:', error.message);
        }
    }
    async notifyUserCreated(user, createdBy = null) {
        try {
            const safeCreatedBy = createdBy?.nombre || 'Sistema';
            await sendWelcomeEmail(user).catch((err) => logger.error('[NotificationService] Welcome email fail:', err.message));
            emitToRole('admin', 'new_user', {
                userId: user._id,
                nombre: user.nombre,
                email: user.email.substring(0, 3) + '...',
                rol: user.rol,
                createdBy: safeCreatedBy,
                createdAt: user.createdAt || new Date(),
            });
            logger.info(`[NotificationService] Notificaciones de usuario creado enviadas: ${user.email.substring(0, 3)}...@${user.email.split('@')[1]}`);
        }
        catch (error) {
            logger.error('[NotificationService] Error notificando creaci�n de usuario:', error.message);
        }
    }
    async notifyPasswordChanged(user) {
        try {
            await sendPasswordChangedEmail(user).catch((err) => logger.error('[NotificationService] Password email fail:', err.message));
            emitToUser(user._id, 'password_changed', {
                changedAt: new Date(),
                message: 'Tu contrase�a ha sido cambiada exitosamente',
            });
            logger.info(`[NotificationService] Notificaci�n de cambio de contrase�a enviada: ${user.email.substring(0, 3)}...`);
        }
        catch (error) {
            logger.error('[NotificationService] Error notificando cambio de contrase�a:', error.message);
        }
    }
    async notifyUpcomingDeadlines(orders) {
        if (!orders.length)
            return;
        try {
            const now = new Date();
            const ordersData = orders.map((order) => ({
                orderId: order._id.toString(),
                numeroOrden: order.numeroOrden,
                clienteNombre: order.clienteNombre,
                fechaFinEstimada: order.fechaFinEstimada,
                diasRestantes: Math.ceil((new Date(order.fechaFinEstimada).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            }));
            emitToRole('admin', 'upcoming_deadlines', {
                orders: ordersData,
                notifiedAt: now,
            });
            logger.info(`[NotificationService] Notificaci�n de �rdenes pr�ximas a vencer enviada (${orders.length} �rdenes)`);
        }
        catch (error) {
            logger.error('[NotificationService] Error notificando �rdenes pr�ximas a vencer:', error.message);
        }
    }
    async getInvolvedUsers(userIds) {
        try {
            if (!User) {
                const { default: UserModel } = await import('../models/User.ts');
                User = UserModel;
            }
            return await User.find({ _id: { $in: userIds } }).select('nombre email _id').lean();
        }
        catch (error) {
            logger.error('[NotificationService] Error obteniendo usuarios involucrados:', error.message);
            return [];
        }
    }
}
export default new NotificationService();
//# sourceMappingURL=notification.service.js.map