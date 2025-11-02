/**
 * Orders Socket Handler
 * @description Manejador de eventos de órdenes en tiempo real
 */

import Order from '../../models/Order.js';
import { logger } from '../../utils/logger.js';
import orderService from '../../services/order.service.js';

/**
 * Registrar eventos de órdenes
 */
export const registerOrdersHandlers = (io, socket) => {
  /**
   * Suscribirse a actualizaciones de una orden específica
   */
  socket.on('order:subscribe', async (data) => {
    try {
      const { orderId } = data;

      // Verificar que la orden existe
      const order = await Order.findById(orderId);
      
      if (!order) {
        socket.emit('order:subscribe:error', {
          message: 'Orden no encontrada',
          orderId,
        });
        return;
      }

      // Verificar permisos (usuario asignado, supervisor o admin)
      const hasPermission = 
        order.asignadoA.some(id => id.toString() === socket.userId) ||
        order.supervisorId?.toString() === socket.userId ||
        ['root', 'admin', 'engineer'].includes(socket.userRole);

      if (!hasPermission) {
        socket.emit('order:subscribe:error', {
          message: 'No tienes permisos para ver esta orden',
          orderId,
        });
        return;
      }

      // Unirse a la room de la orden
      socket.join(`order:${orderId}`);

      logger.info(`${socket.user.email} suscrito a orden ${orderId}`);

      // Enviar estado actual de la orden
      const orderData = await Order.findById(orderId)
        .populate('asignadoA', 'nombre email')
        .populate('supervisorId', 'nombre email')
        .lean();

      socket.emit('order:subscribe:success', {
        orderId,
        order: orderData,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error al suscribirse a orden:', error);
      socket.emit('order:subscribe:error', {
        message: 'Error al suscribirse a la orden',
      });
    }
  });

  /**
   * Desuscribirse de actualizaciones de una orden
   */
  socket.on('order:unsubscribe', (data) => {
    try {
      const { orderId } = data;

      socket.leave(`order:${orderId}`);

      logger.info(`${socket.user.email} desuscrito de orden ${orderId}`);

      socket.emit('order:unsubscribe:success', {
        orderId,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error al desuscribirse de orden:', error);
    }
  });

  /**
   * Solicitar progreso de una orden
   */
  socket.on('order:get_progress', async (data) => {
    try {
      const { orderId } = data;

      const progress = await orderService.calculateProgress(orderId);

      socket.emit('order:progress', {
        orderId,
        progress,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error al obtener progreso de orden:', error);
      socket.emit('order:progress:error', {
        message: 'Error al obtener progreso',
      });
    }
  });

  /**
   * Notificar que un usuario está viendo una orden
   */
  socket.on('order:viewing', (data) => {
    try {
      const { orderId } = data;

      // Notificar a otros usuarios suscritos
      socket.to(`order:${orderId}`).emit('order:user_viewing', {
        orderId,
        user: {
          id: socket.userId,
          nombre: socket.user.nombre,
          rol: socket.userRole,
        },
        timestamp: Date.now(),
      });

      logger.debug(`${socket.user.email} está viendo orden ${orderId}`);
    } catch (error) {
      logger.error('Error al notificar visualización de orden:', error);
    }
  });

  /**
   * Notificar que un usuario dejó de ver una orden
   */
  socket.on('order:stopped_viewing', (data) => {
    try {
      const { orderId } = data;

      // Notificar a otros usuarios suscritos
      socket.to(`order:${orderId}`).emit('order:user_stopped_viewing', {
        orderId,
        userId: socket.userId,
        timestamp: Date.now(),
      });

      logger.debug(`${socket.user.email} dejó de ver orden ${orderId}`);
    } catch (error) {
      logger.error('Error al notificar fin de visualización:', error);
    }
  });

  /**
   * Typing indicator para notas (usuario escribiendo)
   */
  socket.on('order:typing', (data) => {
    try {
      const { orderId } = data;

      socket.to(`order:${orderId}`).emit('order:user_typing', {
        orderId,
        user: {
          id: socket.userId,
          nombre: socket.user.nombre,
        },
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error en typing indicator:', error);
    }
  });

  /**
   * Stop typing indicator
   */
  socket.on('order:stopped_typing', (data) => {
    try {
      const { orderId } = data;

      socket.to(`order:${orderId}`).emit('order:user_stopped_typing', {
        orderId,
        userId: socket.userId,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error en stop typing:', error);
    }
  });

  /**
   * Solicitar lista de usuarios conectados viendo una orden
   */
  socket.on('order:get_viewers', async (data) => {
    try {
      const { orderId } = data;

      const socketsInRoom = await io.in(`order:${orderId}`).fetchSockets();

      const viewers = socketsInRoom.map(s => ({
        userId: s.userId,
        nombre: s.user?.nombre,
        rol: s.userRole,
      }));

      socket.emit('order:viewers', {
        orderId,
        viewers,
        count: viewers.length,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error('Error al obtener viewers de orden:', error);
      socket.emit('order:viewers:error', {
        message: 'Error al obtener viewers',
      });
    }
  });
};

/**
 * Notificar actualización de orden a usuarios suscritos
 */
export const notifyOrderUpdate = (io, orderId, updateData) => {
  try {
    io.to(`order:${orderId}`).emit('order:updated', {
      orderId,
      update: updateData,
      timestamp: Date.now(),
    });

    logger.debug(`Notificación de actualización enviada para orden ${orderId}`);
  } catch (error) {
    logger.error('Error al notificar actualización de orden:', error);
  }
};

/**
 * Notificar cambio de estado de orden
 */
export const notifyOrderStatusChange = (io, orderId, previousStatus, newStatus) => {
  try {
    io.to(`order:${orderId}`).emit('order:status_changed', {
      orderId,
      previousStatus,
      newStatus,
      timestamp: Date.now(),
    });

    logger.info(`Cambio de estado notificado - Orden ${orderId}: ${previousStatus} → ${newStatus}`);
  } catch (error) {
    logger.error('Error al notificar cambio de estado:', error);
  }
};

/**
 * Notificar nueva nota en orden
 */
export const notifyNewNote = (io, orderId, note, author) => {
  try {
    io.to(`order:${orderId}`).emit('order:new_note', {
      orderId,
      note,
      author: {
        id: author._id,
        nombre: author.nombre,
        rol: author.rol,
      },
      timestamp: Date.now(),
    });

    logger.debug(`Nueva nota notificada en orden ${orderId}`);
  } catch (error) {
    logger.error('Error al notificar nueva nota:', error);
  }
};

/**
 * Notificar nueva evidencia subida
 */
export const notifyNewEvidence = (io, orderId, evidence) => {
  try {
    io.to(`order:${orderId}`).emit('order:new_evidence', {
      orderId,
      evidence,
      timestamp: Date.now(),
    });

    logger.debug(`Nueva evidencia notificada en orden ${orderId}`);
  } catch (error) {
    logger.error('Error al notificar nueva evidencia:', error);
  }
};
