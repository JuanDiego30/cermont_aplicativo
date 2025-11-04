/**
 * Notifications Socket Handler (TypeScript - November 2025)
 * @description Manejador de eventos Socket.IO para notificaciones en tiempo real en CERMONT ATG. Soporta mark read (single/all), get unread (query model), subscribe/unsubscribe rooms por type (e.g. 'order_update', 'workplan_approve').
 * Integra con: notificationService (create/send/read/markAll/getUnread for user), User model (socket.user._id/email/rol from auth.middleware), io.rooms for scalability. Secure: Auth via socket.user (set in connection handler), validate notificationId exists/user owns, no PII in rooms (userId/rol hashes?). Emit no sensitive data.
 * Performance: Async handlers non-blocking, query lean/select minimal, limit unread to 50 recent. Usage: En socket.config.ts: io.on('connection', (socket) => { authenticateSocket(socket); registerNotificationsHandlers(io, socket); }); En services: await notificationService.create({ userId, type: 'order_assigned', data: { orderId } }); // Auto emit via service.
 * Extensible: Add 'notification:delete' (soft), 'notification:pref' (sound/vibrate). Types: Notification { id: string; type: NotificationType; title?: string; message: string; data?: any; read: boolean; timestamp: Date; }. Emit events consistent (success/error with code). Para ATG: Types enum { ORDER_UPDATE: 'order_update', WORKPLAN_APPROVE: 'workplan_approve', USER_MENTION: 'user_mention', SYSTEM_ALERT: 'system_alert' }.
 * Types: Server from 'socket.io', Socket extended with user: { _id: string; email: string; rol: UserRole }. Data: ReadData { notificationId: string }, SubscribeData { types: NotificationType[] }. Error: Emit 'error' with { message: string; code?: string }. Assumes: notificationService.getUnread(userId: string, limit?: number): Promise<Notification[]>, markRead(notificationId: string, userId: string): Promise<void>, markAllRead(userId: string): Promise<void>.
 * Fixes: Integrate TODO in get_unread con service query (unread: { read: false }, sort: -createdAt, limit 50, populate user? no). Validate data (e.g. notificationId ObjectId), user auth check. Logs: Mask email (userId only). Subscribe: Validate types in NOTIFICATION_TYPES enum. Send funcs: Optional filter by rol/user online (io.sockets.adapter.rooms). Error handling: Try/catch all, emit error.
 * Integrate: En notification.service.create(notification: CreateNotificationDto): Promise<Notification> { const notif = await Notification.create(...); await sendNotificationToUser(io, userId, { ...notif.toObject(), read: false }); return notif; } En connection: socket.join(`user:${socket.user._id}`); socket.join(`role:${socket.user.rol}`); Para broadcast system alerts. Cleanup: On disconnect, leave all rooms.
 * Missing: models/Notification.ts si no existe (Schema above). services/notification.service.ts: CRUD with userId ref, create/send/mark, getUnread(filter). enum NOTIFICATION_TYPES from constants. Socket auth: En connection handler, verify JWT from socket.handshake.auth.token, set socket.user = jwt.verify(token).usersService.getById(decoded._id). Real-time: Post-mutation (e.g. orderService.assign: notificationService.notifyAssignedUsers(order.asignadoA, { type: 'order_assigned', data: { orderId } })).
 */

import { Server, Socket } from 'socket.io';
import { logger } from '../../utils/logger';
import notificationService from '../../services/notification.service'; // Para CRUD ops
import { NOTIFICATION_TYPES } from '../../models/Notification';
import type { Role as UserRole } from '../../models/User'; // From user
import type { Notification } from '../../models/Notification'; // Lean doc

// Interfaces
interface ExtendedSocket extends Socket {
  user?: {
    _id: string;
    email: string;
    rol: UserRole;
  };
  data: { notifications?: Set<string> }; // Track subscribed types
}

interface ReadData {
  notificationId: string; // ObjectId string
}

interface SubscribeData {
  types: string[]; // NotificationType[]
}

interface NotificationPayload {
  id: string;
  type: string;
  title?: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  timestamp: number; // ms
  // No userId, PII
}

interface ErrorPayload {
  message: string;
  code?: string; // e.g. 'NOTIFICATION_NOT_FOUND'
}

// Validate ObjectId string (simple regex, or import mongoose.Types.ObjectId.isValid)
const isValidId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

/**
 * Registrar eventos de notificaciones
 */
export const registerNotificationsHandlers = (io: Server, socket: ExtendedSocket): void => {
  /**
   * Marcar notificación como leída
   */
  socket.on('notification:read', async (data: ReadData): Promise<void> => {
    try {
      if (!socket.user?._id) {
        socket.emit('notification:read:error', { message: 'Usuario no autenticado' } as ErrorPayload);
        return;
      }
      if (!data.notificationId || !isValidId(data.notificationId)) {
        socket.emit('notification:read:error', { message: 'ID de notificación inválido', code: 'INVALID_ID' } as ErrorPayload);
        return;
      }

      await notificationService.markRead(data.notificationId, socket.user._id);

      logger.info(`Notificación ${data.notificationId} marcada como leída por usuario ${socket.user._id}`);

      socket.emit('notification:read:success', {
        notificationId: data.notificationId,
        timestamp: Date.now(),
      } as NotificationPayload);
    } catch (error: any) {
      logger.error('Error al marcar notificación como leída:', error);
      socket.emit('notification:read:error', {
        message: 'Error al marcar notificación como leída',
        code: error.code || 'INTERNAL_ERROR',
      } as ErrorPayload);
    }
  });

  /**
   * Marcar todas las notificaciones como leídas
   */
  socket.on('notification:read_all', async (): Promise<void> => {
    try {
      if (!socket.user?._id) {
        socket.emit('notification:read_all:error', { message: 'Usuario no autenticado' } as ErrorPayload);
        return;
      }

      await notificationService.markAllRead(socket.user._id);

      logger.info(`Todas las notificaciones marcadas como leídas por usuario ${socket.user._id}`);

      socket.emit('notification:read_all:success', {
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error al marcar todas las notificaciones:', error);
      socket.emit('notification:read_all:error', {
        message: 'Error al marcar notificaciones',
        code: error.code || 'INTERNAL_ERROR',
      } as ErrorPayload);
    }
  });

  /**
   * Solicitar notificaciones no leídas
   */
  socket.on('notification:get_unread', async (): Promise<void> => {
    try {
      if (!socket.user?._id) {
        socket.emit('notification:error', { message: 'Usuario no autenticado' } as ErrorPayload);
        return;
      }

      const unreadNotifications: Notification[] = await notificationService.getUnread(
        socket.user._id,
        { limit: 50, sort: { createdAt: -1 } } // Recent 50
      );

      const payload: { notifications: NotificationPayload[]; count: number } = {
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
    } catch (error: any) {
      logger.error('Error al obtener notificaciones no leídas:', error);
      socket.emit('notification:error', {
        message: 'Error al obtener notificaciones',
        code: error.code || 'INTERNAL_ERROR',
      } as ErrorPayload);
    }
  });

  /**
   * Suscribirse a notificaciones de tipo específico
   */
  socket.on('notification:subscribe', (data: SubscribeData): void => {
    try {
      if (!socket.user?._id) {
        socket.emit('notification:subscribe:error', { message: 'Usuario no autenticado' } as ErrorPayload);
        return;
      }

      const validTypes = data.types.filter((type) => NOTIFICATION_TYPES.includes(type as any));
      if (validTypes.length === 0) {
        socket.emit('notification:subscribe:error', { message: 'Tipos de notificación inválidos' } as ErrorPayload);
        return;
      }

      validTypes.forEach((type) => {
        socket.join(`notification:${type}`);
      });

      // Track in socket.data for cleanup
      if (!socket.data.notifications) socket.data.notifications = new Set();
      validTypes.forEach((type) => socket.data.notifications?.add(type));

      logger.info(`Usuario ${socket.user._id} suscrito a notificaciones: ${validTypes.join(', ')}`);

      socket.emit('notification:subscribe:success', {
        types: validTypes,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error al suscribirse a notificaciones:', error);
      socket.emit('notification:subscribe:error', {
        message: 'Error en suscripción',
        code: 'SUBSCRIBE_ERROR',
      } as ErrorPayload);
    }
  });

  /**
   * Desuscribirse de notificaciones de tipo específico
   */
  socket.on('notification:unsubscribe', (data: SubscribeData): void => {
    try {
      if (!socket.user?._id) return; // Silent, no error

      const validTypes = data.types.filter((type) => NOTIFICATION_TYPES.includes(type as any));

      validTypes.forEach((type) => {
        socket.leave(`notification:${type}`);
        socket.data.notifications?.delete(type);
      });

      logger.info(`Usuario ${socket.user._id} desuscrito de notificaciones: ${validTypes.join(', ')}`);

      socket.emit('notification:unsubscribe:success', {
        types: validTypes,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error al desuscribirse de notificaciones:', error);
      // No emit error, silent fail
    }
  });
};

/**
 * Enviar notificación a usuario específico
 * @param io - Socket.IO server
 * @param userId - ID del usuario (string)
 * @param notification - Payload sin PII
 */
export const sendNotificationToUser = (io: Server, userId: string, notification: NotificationPayload): void => {
  try {
    // Optional: Check if user online: io.sockets.adapter.rooms.has(`user:${userId}`)
    io.to(`user:${userId}`).emit('notification:new', notification);
    logger.info(`Notificación enviada a usuario ${userId}: ${notification.type}`);
  } catch (error: any) {
    logger.error('Error al enviar notificación:', error);
  }
};

/**
 * Enviar notificación a rol específico
 * @param io - Socket.IO server
 * @param role - Rol del usuario (UserRole)
 * @param notification - Payload
 */
export const sendNotificationToRole = (io: Server, role: UserRole, notification: NotificationPayload): void => {
  try {
    io.to(`role:${role}`).emit('notification:new', notification);
    logger.info(`Notificación enviada a rol ${role}: ${notification.type}`);
  } catch (error: any) {
    logger.error('Error al enviar notificación a rol:', error);
  }
};

/**
 * Enviar notificación broadcast
 * @param io - Socket.IO server
 * @param notification - Payload (system alerts, no user-specific)
 */
export const sendBroadcastNotification = (io: Server, notification: NotificationPayload): void => {
  try {
    io.emit('notification:broadcast', notification);
    logger.info(`Notificación broadcast enviada: ${notification.type}`);
  } catch (error: any) {
    logger.error('Error al enviar notificación broadcast:', error);
  }
};

// Cleanup on disconnect (export or call in connection)
export const cleanupNotifications = (socket: ExtendedSocket): void => {
  if (socket.data.notifications) {
    socket.data.notifications.forEach((type) => socket.leave(`notification:${type}`));
  }
  socket.leave(`user:${socket.user?._id || ''}`);
  socket.leave(`role:${socket.user?.rol || ''}`);
};
