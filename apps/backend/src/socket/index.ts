/**
 * Socket.IO Configuration (TypeScript - November 2025)
 * @description Configuración central de Socket.IO para comunicaciones en tiempo real en CERMONT ATG. Maneja autenticación JWT, rooms por user/rol/order/notifications, registro de handlers modulares, y utilidades para emit/disconnect. Soporta WS/polling, CORS configurable.
 * Integra con: jwt.config (verifyAccessToken), User model (findById select minimal, activo check), handlers (notifications/orders with ExtendedSocket). Secure: Auth middleware verifica token/decoded.userId, attach socket.user { _id, email, rol, nombre, activo }, no PII in rooms (user:${_id}, role:${rol}). Error: Next(Error) rejects connection.
 * Performance: Async auth non-blocking (User.findById lean?), fetchSockets batched, no heavy queries on connect. Usage: En app.ts: const io = initializeSocket(httpServer); export { getIO, emitToUser }; En services: emitToUser(userId, 'order:assigned', { orderId }); para real-time post-mutation.
 * Extensible: Add adapter Redis para scale (io.adapter(createAdapter(redisClient))), namespace /orders. Types: ExtendedSocket with user: UserLean (no pw/refresh), emit funcs generic data. Para ATG: Rooms para workplans/cctv (similar handlers), pingInterval 25s para mobile.
 * Types: Server from 'socket.io', Socket extended user: { _id: string; email: string; rol: UserRole; nombre: string; activo: boolean }. Assumes: verifyAccessToken(token: string): { userId: string } throws on invalid. User model: interface UserLean { _id: string; email: string; rol: UserRole; nombre: string; activo: boolean; } (toObject()).
 * Fixes: io.use async next(), decoded.userId consistent, User.findById lean/select('-password'), user.activo check. Connection: Join rooms post-auth, register handlers, emit 'connected' with userId/rol. Disconnect: Call cleanup handlers (notifications/orders leave rooms), log _id no email (PII). Ping: 'pong' with ts. getConnectedUsers: Filter active sockets, map safe (user?.). disconnectUser: Fetch in room, emit 'force_disconnect', disconnect(true).
 * Integrate: En handlers/*.ts: Use socket.user._id/rol/nombre (typed). En auth.service.logout: await disconnectUser(userId, 'Logout'); blacklistedToken.add(token). En notificationService.create: emitToUser(userId, 'notification:new', payload). Cleanup: Export cleanupAll(socket: ExtendedSocket): void { cleanupNotifications(socket); cleanupOrders(socket); }; call on disconnect.
 * Missing: Redis adapter for horizontal scale (if >1 instance). Namespace: const orderNS = io.of('/orders'); orderNS.on('connection', ...). Metrics: io.engine.on('connection', () => prometheus.activeConnections.inc());. Error handler global: io.engine.on('upgradeError', err => logger.error). Tests: Mock Server, User.findById, verifyAuth emit 'connected', invalid token next(Error), getConnectedUsers len=2.
 */

import { Server, Socket } from 'socket.io';
import http from 'http'; // For httpServer: http.createServer(app)
import { verifyAccessToken } from '../config/jwt';
import User, { type UserDocument } from '../models/User';
import { logger } from '../utils/logger';
import { registerNotificationsHandlers } from './handlers/notifications.handler';
import { registerOrdersHandlers } from './handlers/orders.handler';
import { cleanupNotifications, type ExtendedSocket as NotifSocket } from './handlers/notifications.handler';
import { cleanupOrders, type ExtendedSocket as OrderSocket } from './handlers/orders.handler';
import type { Role as UserRole } from '../models/User';

// Types
interface UserPayload {
  _id: string;
  email: string;
  rol: UserRole;
  nombre: string;
  activo: boolean;
}

interface ExtendedSocket extends Socket {
  user: UserPayload;
  userId: string; // Legacy compat, use socket.user._id
  userRole: UserRole; // Legacy, use socket.user.rol
}

type HttpServer = http.Server;

let io: Server | null = null;

/**
 * Inicializar Socket.IO
 * @param server - Servidor HTTP de Express
 * @returns Instancia de Socket.IO
 */
export const initializeSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'] as const,
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Middleware de autenticación (async safe in v4)
  io.use(async (socket: ExtendedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Token de autenticación requerido'));
      }

      // Verificar token
      const decoded = verifyAccessToken(token);

      // Buscar usuario lean minimal
      const user = await User.findById(decoded.userId)
        .select('nombre email rol activo')
        .lean() as UserDocument | null;

      if (!user || !user.activo) {
        return next(new Error('Usuario inválido o inactivo'));
      }

      // Adjuntar datos (full user for handlers, legacy props)
      socket.user = {
        _id: user._id.toString(),
        email: user.email,
        rol: user.rol,
        nombre: user.nombre,
        activo: user.activo,
      };
      socket.userId = user._id.toString();
      socket.userRole = user.rol;

      logger.info(`Socket conectado: ${user._id} (${socket.id})`);
      next();
    } catch (error: any) {
      logger.error('Error en autenticación de Socket:', error);
      next(new Error('Token inválido'));
    }
  });

  // Eventos de conexión
  io.on('connection', (socket: ExtendedSocket) => {
    logger.info(`Usuario conectado: ${socket.user._id} - Socket ID: ${socket.id}`);

    // Unir a rooms por rol y usuario
    socket.join(`user:${socket.user._id}`);
    socket.join(`role:${socket.user.rol}`);

    // Registrar handlers de eventos
    registerNotificationsHandlers(io, socket);
    registerOrdersHandlers(io, socket);

    // Notificar al usuario que está conectado
    socket.emit('connected', {
      message: 'Conectado exitosamente',
      userId: socket.user._id,
      role: socket.user.rol,
    });

    // Evento de desconexión
    socket.on('disconnect', (reason) => {
      // Cleanup rooms from handlers
      cleanupNotifications(socket as NotifSocket);
      cleanupOrders(socket as OrderSocket);

      logger.info(`Usuario desconectado: ${socket.user._id} - Razón: ${reason}`);
    });

    // Ping/Pong para mantener conexión
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Manejo de errores
    socket.on('error', (error: any) => {
      logger.error(`Error en socket ${socket.id}:`, error);
    });
  });

  logger.info('Socket.IO inicializado correctamente');
  return io;
};

/**
 * Obtener instancia de Socket.IO
 * @returns Instancia de Socket.IO
 * @throws Error si no inicializado
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO no ha sido inicializado');
  }
  return io;
};

/**
 * Emitir evento a un usuario específico
 * @param userId - ID del usuario
 * @param event - Nombre del evento
 * @param data - Datos a enviar
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
  try {
    if (!io) {
      logger.warn('Socket.IO no inicializado - No se puede emitir evento');
      return;
    }

    io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Evento emitido a usuario ${userId}: ${event}`);
  } catch (error: any) {
    logger.error('Error al emitir a usuario:', error);
  }
};

/**
 * Emitir evento a todos los usuarios de un rol
 * @param role - Rol del usuario
 * @param event - Nombre del evento
 * @param data - Datos a enviar
 */
export const emitToRole = (role: UserRole, event: string, data: any): void => {
  try {
    if (!io) {
      logger.warn('Socket.IO no inicializado - No se puede emitir evento');
      return;
    }

    io.to(`role:${role}`).emit(event, data);
    logger.debug(`Evento emitido a rol ${role}: ${event}`);
  } catch (error: any) {
    logger.error('Error al emitir a rol:', error);
  }
};

/**
 * Emitir evento a todos los usuarios conectados
 * @param event - Nombre del evento
 * @param data - Datos a enviar
 */
export const emitToAll = (event: string, data: any): void => {
  try {
    if (!io) {
      logger.warn('Socket.IO no inicializado - No se puede emitir evento');
      return;
    }

    io.emit(event, data);
    logger.debug(`Evento emitido a todos: ${event}`);
  } catch (error: any) {
    logger.error('Error al emitir a todos:', error);
  }
};

/**
 * Obtener usuarios conectados
 * @returns Lista de usuarios conectados { userId, userRole, userName, socketId }
 */
export const getConnectedUsers = async (): Promise<Array<{ userId: string; userRole: UserRole; userName: string; socketId: string }>> => {
  try {
    if (!io) {
      return [];
    }

    const sockets = await io.fetchSockets();
    return sockets
      .filter((s) => (s as ExtendedSocket).user)
      .map((s) => {
        const socket = s as ExtendedSocket;
        return {
          userId: socket.user._id,
          userRole: socket.user.rol,
          userName: socket.user.nombre,
          socketId: socket.id,
        };
      });
  } catch (error: any) {
    logger.error('Error al obtener usuarios conectados:', error);
    return [];
  }
};

/**
 * Desconectar usuario específico
 * @param userId - ID del usuario
 * @param reason - Razón de desconexión (default: 'Desconectado por el servidor')
 */
export const disconnectUser = async (userId: string, reason: string = 'Desconectado por el servidor'): Promise<void> => {
  try {
    if (!io) {
      return;
    }

    const sockets = await io.in(`user:${userId}`).fetchSockets();
    
    sockets.forEach((socket) => {
      const extSocket = socket as ExtendedSocket;
      extSocket.emit('force_disconnect', { reason });
      extSocket.disconnect(true);
    });

    logger.info(`Usuario ${userId} desconectado: ${reason}`);
  } catch (error: any) {
    logger.error('Error al desconectar usuario:', error);
  }
};
