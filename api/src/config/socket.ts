/**
 * Gestor de comunicación en tiempo real usando Socket.IO para Cermont. Maneja conexiones
 * WebSocket autenticadas con JWT, salas (rooms) para órdenes/ejecuciones/chat, y tracking
 * de usuarios conectados. Proporciona handlers para eventos de negocio (actualizaciones
 * de órdenes, progreso de ejecución, evidencias, chat) y funciones de emisión desde
 * servicios backend hacia clientes específicos, grupos o broadcast global.
 */

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './logger.js';

export let io: Server;

const connectedUsers = new Map<string, Set<string>>();

export function initSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1e6,
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  io.use((socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const secret = process.env.JWT_SECRET || 'secret';
      const decoded = jwt.verify(token, secret) as any;
      socket.data.userId = decoded.userId;
      socket.data.user = decoded;
      next();
    } catch (error) {
      logger.warn('Socket auth failed:', { error: String(error) });
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`User connected via Socket.IO`, {
      socketId: socket.id,
      userId,
    });

    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId)!.add(socket.id);

    socket.join(`user:${userId}`);

    socket.broadcast.emit('user:online', { userId });

    setupOrdenHandlers(socket);
    setupEjecucionHandlers(socket);
    setupEvidenciaHandlers(socket);
    setupChatHandlers(socket);

    socket.on('disconnect', (reason: string) => {
      logger.info(`User disconnected`, {
        socketId: socket.id,
        userId,
        reason,
      });

      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
          socket.broadcast.emit('user:offline', { userId });
        }
      }
    });

    socket.on('error', (error: Error) => {
      logger.error('Socket error:', {
        socketId: socket.id,
        userId,
        error: String(error),
      });
    });
  });

  logger.info('Socket.IO initialized');
  return io;
}

function setupOrdenHandlers(socket: Socket) {
  socket.on('orden:subscribe', (ordenId: string) => {
    socket.join(`orden:${ordenId}`);
    logger.debug(`User subscribed to orden`, {
      userId: socket.data.userId,
      ordenId,
    });
  });

  socket.on('orden:unsubscribe', (ordenId: string) => {
    socket.leave(`orden:${ordenId}`);
    logger.debug(`User unsubscribed from orden`, {
      userId: socket.data.userId,
      ordenId,
    });
  });
}

function setupEjecucionHandlers(socket: Socket) {
  socket.on('ejecucion:subscribe', (ejecucionId: string) => {
    socket.join(`ejecucion:${ejecucionId}`);
    logger.debug(`User subscribed to ejecucion`, {
      userId: socket.data.userId,
      ejecucionId,
    });
  });

  socket.on('ejecucion:progress', (data: { ejecucionId: string; avance: number }) => {
    io.to(`ejecucion:${data.ejecucionId}`).emit('ejecucion:update', {
      ejecucionId: data.ejecucionId,
      avance: data.avance,
      timestamp: new Date().toISOString(),
      updatedBy: socket.data.userId,
    });
  });

  socket.on('ejecucion:unsubscribe', (ejecucionId: string) => {
    socket.leave(`ejecucion:${ejecucionId}`);
  });
}

function setupEvidenciaHandlers(socket: Socket) {
  socket.on('evidencia:uploaded', (data: {
    ordenId: string;
    ejecucionId: string;
    tipo: string;
    url: string;
  }) => {
    io.to(`orden:${data.ordenId}`).emit('evidencia:new', {
      ...data,
      timestamp: new Date().toISOString(),
      uploadedBy: socket.data.userId,
    });
  });
}

function setupChatHandlers(socket: Socket) {
  socket.on('chat:join', (ordenId: string) => {
    socket.join(`chat:${ordenId}`);
  });

  socket.on('chat:message', (data: {
    ordenId: string;
    message: string;
  }) => {
    io.to(`chat:${data.ordenId}`).emit('chat:message', {
      ordenId: data.ordenId,
      message: data.message,
      userId: socket.data.userId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('chat:leave', (ordenId: string) => {
    socket.leave(`chat:${ordenId}`);
  });
}

export function notifyOrdenUpdated(ordenId: string, data: any) {
  if (!io) return;

  io.to(`orden:${ordenId}`).emit('orden:updated', {
    ...data,
    timestamp: new Date().toISOString(),
  });

  logger.debug('Orden update emitted', { ordenId });
}

export function notifyOrdenEstadoChanged(
  ordenId: string,
  estado: string,
  userId: string
) {
  if (!io) return;

  io.to(`orden:${ordenId}`).emit('orden:estado', {
    ordenId,
    estado,
    changedBy: userId,
    timestamp: new Date().toISOString(),
  });
}

export function notifyEjecucionProgress(
  ejecucionId: string,
  progress: number,
  details?: any
) {
  if (!io) return;

  io.to(`ejecucion:${ejecucionId}`).emit('ejecucion:progress', {
    ejecucionId,
    progress,
    details,
    timestamp: new Date().toISOString(),
  });
}

export function notifyEvidenciaUploaded(
  ordenId: string,
  evidencia: any
) {
  if (!io) return;

  io.to(`orden:${ordenId}`).emit('evidencia:new', {
    ...evidencia,
    timestamp: new Date().toISOString(),
  });
}

export function notifyUsers(
  userIds: string[],
  event: string,
  data: any
) {
  if (!io) return;

  userIds.forEach((userId) => {
    io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  });
}

export function notifyUser(userId: string, event: string, data: any) {
  if (!io) return;

  io.to(`user:${userId}`).emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastToAll(event: string, data: any) {
  if (!io) return;

  io.emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

export function getConnectedUsers(): string[] {
  return Array.from(connectedUsers.keys());
}

export function isUserConnected(userId: string): boolean {
  return connectedUsers.has(userId);
}

export default {
  initSocket,
  notifyOrdenUpdated,
  notifyOrdenEstadoChanged,
  notifyEjecucionProgress,
  notifyEvidenciaUploaded,
  notifyUsers,
  notifyUser,
  broadcastToAll,
  getConnectedUsers,
  isUserConnected,
};

