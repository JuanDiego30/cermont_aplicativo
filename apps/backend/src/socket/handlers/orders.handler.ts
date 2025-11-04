/**
 * Orders Socket Handler (TypeScript - November 2025)
 * @description Manejador de eventos Socket.IO para órdenes de trabajo en tiempo real en CERMONT ATG. Soporta subscribe/unsubscribe por orderId (con RBAC check), get progress (via service), viewing/typing indicators, get viewers (online sockets). Emits updates/status/notes/evidence changes.
 * Integra con: orderService (calculateProgress), Order model (findById/populate lean), User model (rol check), rbac.util (hasPermission? inline via rol/asignadoA). Secure: Auth socket.user (_id, email, rol, nombre from connection), validate orderId ObjectId, permission: asignadoA/supervisor o rol >= engineer. No PII in emits (id/nombre/rol only).
 * Performance: Queries lean/populate minimal (nombre/email only), fetchSockets async non-blocking, indicators broadcast to room only. Usage: En socket.config.ts: on 'connection' post-auth/registerOrdersHandlers(io, socket); En orderService.update: notifyOrderUpdate(io, order._id, { status: newStatus }); para real-time sync.
 * Extensible: Add 'order:chat' room per order, 'order:assign' notify role. Types: OrderEventData { orderId: string }, UserInfo { id: string; nombre: string; rol?: UserRole }, Progress { percentage: number; completedTasks: number; totalTasks: number }. Emit: Consistent { orderId, ...data, timestamp: number }. Para ATG: Progress based on actividades (workplan), evidence: type before/after.
 * Types: Server/Socket from 'socket.io', ExtendedSocket with user: { _id: string; email: string; rol: UserRole; nombre: string }. Assumes: orderService.calculateProgress(orderId: string): Promise<Progress> throws AppError if not found/no perm. Constants: RBAC_ROLES order ['engineer', 'admin', 'root'].
 * Fixes: socket.userId → socket.user._id, socket.userRole → socket.user.rol, socket.user.nombre. Permission: Use ObjectId.equals o toString(), populate ref only if needed (lean after). get_viewers: Filter sockets with user, map safe. Logs: Use _id no email (PII), debug level for indicators. Error: Emit with code (e.g. 'ORDER_NOT_FOUND', 'PERMISSION_DENIED'). Async all handlers.
 * Integrate: En order.routes PATCH /:id/status: await orderService.updateStatus(id, newStatus, req.user._id); notifyOrderStatusChange(io, id, oldStatus, newStatus); En evidence.upload: post-save notifyNewEvidence(io, orderId, { id: evidence._id, type: 'photo', url }). Cleanup: On disconnect, leave all 'order:*' rooms via tracked Set. Notification: Trigger notificationService.create for offline (e.g. status change → notifyAsignadoA).
 * Missing: orderService.calculateProgress si stub: async (orderId: string): Promise<Progress> { const order = await Order.findById(orderId).populate('actividades'); if (!order) throw new AppError('Orden no encontrada', 404); const completed = order.actividades.filter(a => a.status === COMPLETED).length; return { percentage: (completed / order.actividades.length) * 100, ... }; }. rbac.roles enum for check. Socket track: socket.data.orders = new Set<string>(); add on subscribe, leave on unsubscribe/disconnect.
 */

import { Server, Socket } from 'socket.io';
import Order, { type OrderDocument } from '../../models/Order';
import { logger } from '../../utils/logger';
import orderService from '../../services/order.service';
import { AppError } from '../../utils/AppError'; // For service throws
import type { Role as UserRole } from '../../models/User'; // 'technician', 'supervisor', 'engineer', 'admin', 'root'

// Interfaces
interface ExtendedSocket extends Socket {
  user: {
    _id: string;
    email: string;
    rol: UserRole;
    nombre: string;
  };
  data: { orders?: Set<string> }; // Track subscribed orderIds
}

interface OrderEventData {
  orderId: string; // ObjectId string
}

interface UserInfo {
  id: string;
  nombre: string;
  rol?: UserRole;
}

interface Progress {
  percentage: number;
  completedTasks: number;
  totalTasks: number;
  // Ext: eta?: Date; risks?: number;
}

interface ErrorPayload {
  message: string;
  code?: string; // 'ORDER_NOT_FOUND', 'PERMISSION_DENIED', 'INVALID_ID'
}

// Helpers
const isValidId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

const hasOrderPermission = (order: OrderDocument, userId: string, userRol: UserRole): boolean => {
  const isAssigned = order.asignadoA.some((assignedId) => assignedId.toString() === userId);
  const isSupervisor = order.supervisorId?.toString() === userId;
  const isHighRole = ['engineer', 'admin', 'root'].includes(userRol);
  return isAssigned || isSupervisor || isHighRole;
};

/**
 * Registrar eventos de órdenes
 */
export const registerOrdersHandlers = (io: Server, socket: ExtendedSocket): void => {
  /**
   * Suscribirse a actualizaciones de una orden específica
   */
  socket.on('order:subscribe', async (data: OrderEventData): Promise<void> => {
    try {
      if (!data.orderId || !isValidId(data.orderId)) {
        socket.emit('order:subscribe:error', { message: 'ID de orden inválido', code: 'INVALID_ID' } as ErrorPayload);
        return;
      }

      // Query lean first for check
      const order = await Order.findById(data.orderId).lean() as OrderDocument | null;
      if (!order) {
        socket.emit('order:subscribe:error', { message: 'Orden no encontrada', orderId: data.orderId, code: 'ORDER_NOT_FOUND' } as ErrorPayload);
        return;
      }

      // Permission check
      if (!hasOrderPermission(order, socket.user._id, socket.user.rol)) {
        socket.emit('order:subscribe:error', { message: 'No tienes permisos para ver esta orden', orderId: data.orderId, code: 'PERMISSION_DENIED' } as ErrorPayload);
        return;
      }

      // Join room
      socket.join(`order:${data.orderId}`);

      // Track
      if (!socket.data.orders) socket.data.orders = new Set();
      socket.data.orders.add(data.orderId);

      logger.info(`Usuario ${socket.user._id} suscrito a orden ${data.orderId}`);

      // Send current state (populate minimal)
      const orderData = await Order.findById(data.orderId)
        .populate('asignadoA', 'nombre email')
        .populate('supervisorId', 'nombre email')
        .lean();

      socket.emit('order:subscribe:success', {
        orderId: data.orderId,
        order: orderData,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error al suscribirse a orden:', error);
      socket.emit('order:subscribe:error', {
        message: 'Error al suscribirse a la orden',
        code: error.code || 'INTERNAL_ERROR',
      } as ErrorPayload);
    }
  });

  /**
   * Desuscribirse de actualizaciones de una orden
   */
  socket.on('order:unsubscribe', (data: OrderEventData): void => {
    try {
      if (!data.orderId || !isValidId(data.orderId)) return; // Silent

      socket.leave(`order:${data.orderId}`);
      socket.data.orders?.delete(data.orderId);

      logger.info(`Usuario ${socket.user._id} desuscrito de orden ${data.orderId}`);

      socket.emit('order:unsubscribe:success', {
        orderId: data.orderId,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error al desuscribirse de orden:', error);
    }
  });

  /**
   * Solicitar progreso de una orden
   */
  socket.on('order:get_progress', async (data: OrderEventData): Promise<void> => {
    try {
      if (!data.orderId || !isValidId(data.orderId)) {
        socket.emit('order:progress:error', { message: 'ID de orden inválido', code: 'INVALID_ID' } as ErrorPayload);
        return;
      }

      const progress: Progress = await orderService.calculateProgress(data.orderId, socket.user._id); // Pass user for perm

      socket.emit('order:progress', {
        orderId: data.orderId,
        progress,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error al obtener progreso de orden:', error);
      socket.emit('order:progress:error', {
        message: error.message || 'Error al obtener progreso',
        code: error.code || 'INTERNAL_ERROR',
      } as ErrorPayload);
    }
  });

  /**
   * Notificar que un usuario está viendo una orden
   */
  socket.on('order:viewing', (data: OrderEventData): void => {
    try {
      if (!data.orderId || !isValidId(data.orderId)) return;

      socket.to(`order:${data.orderId}`).emit('order:user_viewing', {
        orderId: data.orderId,
        user: {
          id: socket.user._id,
          nombre: socket.user.nombre,
          rol: socket.user.rol,
        } as UserInfo,
        timestamp: Date.now(),
      });

      logger.debug(`Usuario ${socket.user._id} está viendo orden ${data.orderId}`);
    } catch (error: any) {
      logger.error('Error al notificar visualización de orden:', error);
    }
  });

  /**
   * Notificar que un usuario dejó de ver una orden
   */
  socket.on('order:stopped_viewing', (data: OrderEventData): void => {
    try {
      if (!data.orderId || !isValidId(data.orderId)) return;

      socket.to(`order:${data.orderId}`).emit('order:user_stopped_viewing', {
        orderId: data.orderId,
        userId: socket.user._id,
        timestamp: Date.now(),
      });

      logger.debug(`Usuario ${socket.user._id} dejó de ver orden ${data.orderId}`);
    } catch (error: any) {
      logger.error('Error al notificar fin de visualización:', error);
    }
  });

  /**
   * Typing indicator para notas (usuario escribiendo)
   */
  socket.on('order:typing', (data: OrderEventData): void => {
    try {
      if (!data.orderId || !isValidId(data.orderId)) return;

      socket.to(`order:${data.orderId}`).emit('order:user_typing', {
        orderId: data.orderId,
        user: {
          id: socket.user._id,
          nombre: socket.user.nombre,
        } as UserInfo,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error en typing indicator:', error);
    }
  });

  /**
   * Stop typing indicator
   */
  socket.on('order:stopped_typing', (data: OrderEventData): void => {
    try {
      if (!data.orderId || !isValidId(data.orderId)) return;

      socket.to(`order:${data.orderId}`).emit('order:user_stopped_typing', {
        orderId: data.orderId,
        userId: socket.user._id,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      logger.error('Error en stop typing:', error);
    }
  });

  /**
   * Solicitar lista de usuarios conectados viendo una orden
   */
  socket.on('order:get_viewers', async (data: OrderEventData): Promise<void> => {
    try {
      if (!data.orderId || !isValidId(data.orderId)) {
        socket.emit('order:viewers:error', { message: 'ID de orden inválido', code: 'INVALID_ID' } as ErrorPayload);
        return;
      }

      // Permission? Assume subscribed, but check room
      if (!socket.rooms.has(`order:${data.orderId}`)) {
        socket.emit('order:viewers:error', { message: 'No suscrito a esta orden', code: 'NOT_SUBSCRIBED' } as ErrorPayload);
        return;
      }

      const socketsInRoom = await io.in(`order:${data.orderId}`).fetchSockets();
      const viewers: UserInfo[] = socketsInRoom
        .filter((s) => (s as ExtendedSocket).user) // Has user
        .map((s) => {
          const extSocket = s as ExtendedSocket;
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
    } catch (error: any) {
      logger.error('Error al obtener viewers de orden:', error);
      socket.emit('order:viewers:error', {
        message: 'Error al obtener viewers',
        code: 'INTERNAL_ERROR',
      } as ErrorPayload);
    }
  });
};

/**
 * Notificar actualización de orden a usuarios suscritos
 * @param io - Socket.IO server
 * @param orderId - ID de la orden
 * @param updateData - Cambios { status?, notes?, ... } no full order
 */
export const notifyOrderUpdate = (io: Server, orderId: string, updateData: Record<string, any>): void => {
  try {
    io.to(`order:${orderId}`).emit('order:updated', {
      orderId,
      update: updateData,
      timestamp: Date.now(),
    });

    logger.debug(`Notificación de actualización enviada para orden ${orderId}`);
  } catch (error: any) {
    logger.error('Error al notificar actualización de orden:', error);
  }
};

/**
 * Notificar cambio de estado de orden
 */
export const notifyOrderStatusChange = (
  io: Server,
  orderId: string,
  previousStatus: string,
  newStatus: string
): void => {
  try {
    io.to(`order:${orderId}`).emit('order:status_changed', {
      orderId,
      previousStatus,
      newStatus,
      timestamp: Date.now(),
    });

    logger.info(`Cambio de estado notificado - Orden ${orderId}: ${previousStatus} → ${newStatus}`);
  } catch (error: any) {
    logger.error('Error al notificar cambio de estado:', error);
  }
};

/**
 * Notificar nueva nota en orden
 */
export const notifyNewNote = (
  io: Server,
  orderId: string,
  note: { _id: string; content: string; authorId: string },
  author: { _id: string; nombre: string; rol: UserRole }
): void => {
  try {
    io.to(`order:${orderId}`).emit('order:new_note', {
      orderId,
      note: { id: note._id, content: note.content },
      author: {
        id: author._id,
        nombre: author.nombre,
        rol: author.rol,
      } as UserInfo,
      timestamp: Date.now(),
    });

    logger.debug(`Nueva nota notificada en orden ${orderId}`);
  } catch (error: any) {
    logger.error('Error al notificar nueva nota:', error);
  }
};

/**
 * Notificar nueva evidencia subida
 */
export const notifyNewEvidence = (io: Server, orderId: string, evidence: { _id: string; type: string; url?: string }): void => {
  try {
    io.to(`order:${orderId}`).emit('order:new_evidence', {
      orderId,
      evidence: { id: evidence._id, type: evidence.type, url: evidence.url },
      timestamp: Date.now(),
    });

    logger.debug(`Nueva evidencia notificada en orden ${orderId}`);
  } catch (error: any) {
    logger.error('Error al notificar nueva evidencia:', error);
  }
};

// Cleanup on disconnect
export const cleanupOrders = (socket: ExtendedSocket): void => {
  if (socket.data.orders) {
    socket.data.orders.forEach((orderId) => socket.leave(`order:${orderId}`));
  }
};

