/**
 * Socket.IO Configuration
 * @description Configuración principal de Socket.IO para notificaciones en tiempo real
 */

import { Server } from 'socket.io';
import { verifyAccessToken } from '../config/jwt.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import { registerNotificationsHandlers } from './handlers/notifications.handler.js';
import { registerOrdersHandlers } from './handlers/orders.handler.js';

let io;

/**
 * Inicializar Socket.IO
 * @param {Object} server - Servidor HTTP de Express
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware de autenticación para Socket.IO
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Token de autenticación requerido'));
      }

      // Verificar token
      const decoded = verifyAccessToken(token);

      // Buscar usuario
      const user = await User.findById(decoded.userId).select('-password -refreshToken');

      if (!user || !user.isActive) {
        return next(new Error('Usuario inválido o inactivo'));
      }

      // Adjuntar datos del usuario al socket
      socket.userId = user._id.toString();
      socket.userRole = user.rol;
      socket.user = user;

      logger.info(`Socket conectado: ${user.email} (${socket.id})`);
      next();
    } catch (error) {
      logger.error('Error en autenticación de Socket:', error);
      next(new Error('Token inválido'));
    }
  });

  // Eventos de conexión
  io.on('connection', (socket) => {
    logger.info(`Usuario conectado: ${socket.user.email} - Socket ID: ${socket.id}`);

    // Unir a rooms por rol y usuario
    socket.join(`user:${socket.userId}`);
    socket.join(`role:${socket.userRole}`);

    // Registrar handlers de eventos
    registerNotificationsHandlers(io, socket);
    registerOrdersHandlers(io, socket);

    // Evento de desconexión
    socket.on('disconnect', (reason) => {
      logger.info(`Usuario desconectado: ${socket.user.email} - Razón: ${reason}`);
    });

    // Ping/Pong para mantener conexión
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Manejo de errores
    socket.on('error', (error) => {
      logger.error(`Error en socket ${socket.id}:`, error);
    });

    // Notificar al usuario que está conectado
    socket.emit('connected', {
      message: 'Conectado exitosamente',
      userId: socket.userId,
      role: socket.userRole,
    });
  });

  logger.info('Socket.IO inicializado correctamente');
  return io;
};

/**
 * Obtener instancia de Socket.IO
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
};

/**
 * Emitir evento a un usuario específico
 */
export const emitToUser = (userId, event, data) => {
  try {
    if (!io) {
      logger.warn('Socket.IO no inicializado - No se puede emitir evento');
      return;
    }

    io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Evento emitido a usuario ${userId}: ${event}`);
  } catch (error) {
    logger.error('Error al emitir a usuario:', error);
  }
};

/**
 * Emitir evento a todos los usuarios de un rol
 */
export const emitToRole = (role, event, data) => {
  try {
    if (!io) {
      logger.warn('Socket.IO no inicializado - No se puede emitir evento');
      return;
    }

    io.to(`role:${role}`).emit(event, data);
    logger.debug(`Evento emitido a rol ${role}: ${event}`);
  } catch (error) {
    logger.error('Error al emitir a rol:', error);
  }
};

/**
 * Emitir evento a todos los usuarios conectados
 */
export const emitToAll = (event, data) => {
  try {
    if (!io) {
      logger.warn('Socket.IO no inicializado - No se puede emitir evento');
      return;
    }

    io.emit(event, data);
    logger.debug(`Evento emitido a todos: ${event}`);
  } catch (error) {
    logger.error('Error al emitir a todos:', error);
  }
};

/**
 * Obtener usuarios conectados
 */
export const getConnectedUsers = async () => {
  try {
    if (!io) {
      return [];
    }

    const sockets = await io.fetchSockets();
    return sockets.map(socket => ({
      userId: socket.userId,
      userRole: socket.userRole,
      userName: socket.user?.nombre,
      socketId: socket.id,
    }));
  } catch (error) {
    logger.error('Error al obtener usuarios conectados:', error);
    return [];
  }
};

/**
 * Desconectar usuario específico
 */
export const disconnectUser = async (userId, reason = 'Desconectado por el servidor') => {
  try {
    if (!io) {
      return;
    }

    const sockets = await io.in(`user:${userId}`).fetchSockets();
    
    sockets.forEach(socket => {
      socket.emit('force_disconnect', { reason });
      socket.disconnect(true);
    });

    logger.info(`Usuario ${userId} desconectado: ${reason}`);
  } catch (error) {
    logger.error('Error al desconectar usuario:', error);
  }
};
