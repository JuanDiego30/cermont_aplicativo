/**
 * Notifications Socket Handler
 * @description Manejador de eventos de notificaciones en tiempo real
 */

import { logger } from '../../utils/logger.js';

/**
 * Registrar eventos de notificaciones
 */
export const registerNotificationsHandlers = (io, socket) => {
  /**
   * Marcar notificación como leída
   */
  socket.on('notification:read', async (data) => {
    try {
      const { notificationId } = data;

      logger.info(`Notificación ${notificationId} marcada como leída por ${socket.user.email}`);

      // Confirmar al cliente
      socket.emit('notification:read:success', {
        notificationId,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error al marcar notificación como leída:', error);
      socket.emit('notification:read:error', {
        message: 'Error al marcar notificación como leída',
      });
    }
  });

  /**
   * Marcar todas las notificaciones como leídas
   */
  socket.on('notification:read_all', async () => {
    try {
      logger.info(`Todas las notificaciones marcadas como leídas por ${socket.user.email}`);

      // Confirmar al cliente
      socket.emit('notification:read_all:success', {
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error al marcar todas las notificaciones:', error);
      socket.emit('notification:read_all:error', {
        message: 'Error al marcar notificaciones',
      });
    }
  });

  /**
   * Solicitar notificaciones no leídas
   */
  socket.on('notification:get_unread', async () => {
    try {
      // TODO: Implementar lógica para obtener notificaciones no leídas
      // Por ahora enviamos un array vacío
      const unreadNotifications = [];

      socket.emit('notification:unread', {
        notifications: unreadNotifications,
        count: unreadNotifications.length,
      });
    } catch (error) {
      logger.error('Error al obtener notificaciones no leídas:', error);
      socket.emit('notification:error', {
        message: 'Error al obtener notificaciones',
      });
    }
  });

  /**
   * Suscribirse a notificaciones de tipo específico
   */
  socket.on('notification:subscribe', (data) => {
    try {
      const { types = [] } = data;

      types.forEach(type => {
        socket.join(`notification:${type}`);
      });

      logger.info(`${socket.user.email} suscrito a notificaciones: ${types.join(', ')}`);

      socket.emit('notification:subscribe:success', {
        types,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error al suscribirse a notificaciones:', error);
      socket.emit('notification:subscribe:error', {
        message: 'Error en suscripción',
      });
    }
  });

  /**
   * Desuscribirse de notificaciones de tipo específico
   */
  socket.on('notification:unsubscribe', (data) => {
    try {
      const { types = [] } = data;

      types.forEach(type => {
        socket.leave(`notification:${type}`);
      });

      logger.info(`${socket.user.email} desuscrito de notificaciones: ${types.join(', ')}`);

      socket.emit('notification:unsubscribe:success', {
        types,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error al desuscribirse de notificaciones:', error);
    }
  });
};

/**
 * Enviar notificación a usuario específico
 */
export const sendNotificationToUser = (io, userId, notification) => {
  try {
    io.to(`user:${userId}`).emit('notification:new', notification);
    logger.info(`Notificación enviada a usuario ${userId}: ${notification.type}`);
  } catch (error) {
    logger.error('Error al enviar notificación:', error);
  }
};

/**
 * Enviar notificación a rol específico
 */
export const sendNotificationToRole = (io, role, notification) => {
  try {
    io.to(`role:${role}`).emit('notification:new', notification);
    logger.info(`Notificación enviada a rol ${role}: ${notification.type}`);
  } catch (error) {
    logger.error('Error al enviar notificación a rol:', error);
  }
};

/**
 * Enviar notificación broadcast
 */
export const sendBroadcastNotification = (io, notification) => {
  try {
    io.emit('notification:broadcast', notification);
    logger.info(`Notificación broadcast enviada: ${notification.type}`);
  } catch (error) {
    logger.error('Error al enviar notificación broadcast:', error);
  }
};
