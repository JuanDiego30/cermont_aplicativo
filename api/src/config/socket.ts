// ============================================
// Socket.IO Manager - Cermont FSM
// ============================================

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './logger.js';

export let io: Server;

// Map de usuarios conectados
const connectedUsers = new Map<string, Set<string>>();

// ============================================
// Inicialización
// ============================================

export function initSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    maxHttpBufferSize: 1e6, // 1MB
    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // Middleware de autenticación
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

  // Conexión
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`User connected via Socket.IO`, {
      socketId: socket.id,
      userId,
    });

    // Registrar usuario conectado
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId)!.add(socket.id);

    // Unirse a sala personal
    socket.join(`user:${userId}`);

    // Notificar que está online
    socket.broadcast.emit('user:online', { userId });

    // Setup handlers
    setupOrdenHandlers(socket);
    setupEjecucionHandlers(socket);
    setupEvidenciaHandlers(socket);
    setupChatHandlers(socket);

    // Disconnect
    socket.on('disconnect', (reason: string) => {
      logger.info(`User disconnected`, {
        socketId: socket.id,
        userId,
        reason,
      });

      // Remover de usuarios conectados
      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
          // Notificar offline solo si no hay más sockets
          socket.broadcast.emit('user:offline', { userId });
        }
      }
    });

    // Error handling
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

// ============================================
// Handlers de Órdenes
// ============================================

function setupOrdenHandlers(socket: Socket) {
  // Suscribirse a actualizaciones de una orden
  socket.on('orden:subscribe', (ordenId: string) => {
    socket.join(`orden:${ordenId}`);
    logger.debug(`User subscribed to orden`, {
      userId: socket.data.userId,
      ordenId,
    });
  });

  // Desuscribirse
  socket.on('orden:unsubscribe', (ordenId: string) => {
    socket.leave(`orden:${ordenId}`);
    logger.debug(`User unsubscribed from orden`, {
      userId: socket.data.userId,
      ordenId,
    });
  });
}

// ============================================
// Handlers de Ejecución
// ============================================

function setupEjecucionHandlers(socket: Socket) {
  // Suscribirse a ejecución
  socket.on('ejecucion:subscribe', (ejecucionId: string) => {
    socket.join(`ejecucion:${ejecucionId}`);
    logger.debug(`User subscribed to ejecucion`, {
      userId: socket.data.userId,
      ejecucionId,
    });
  });

  // Actualización de progreso en vivo
  socket.on('ejecucion:progress', (data: { ejecucionId: string; avance: number }) => {
    io.to(`ejecucion:${data.ejecucionId}`).emit('ejecucion:update', {
      ejecucionId: data.ejecucionId,
      avance: data.avance,
      timestamp: new Date().toISOString(),
      updatedBy: socket.data.userId,
    });
  });

  // Desuscribirse
  socket.on('ejecucion:unsubscribe', (ejecucionId: string) => {
    socket.leave(`ejecucion:${ejecucionId}`);
  });
}

// ============================================
// Handlers de Evidencias
// ============================================

function setupEvidenciaHandlers(socket: Socket) {
  // Nueva evidencia subida
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

// ============================================
// Handlers de Chat (opcional)
// ============================================

function setupChatHandlers(socket: Socket) {
  // Unirse a sala de chat de orden
  socket.on('chat:join', (ordenId: string) => {
    socket.join(`chat:${ordenId}`);
  });

  // Enviar mensaje
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

  // Salir de sala
  socket.on('chat:leave', (ordenId: string) => {
    socket.leave(`chat:${ordenId}`);
  });
}

// ============================================
// Funciones de Emisión desde Servicios
// ============================================

/**
 * Notificar actualización de orden
 */
export function notifyOrdenUpdated(ordenId: string, data: any) {
  if (!io) return;

  io.to(`orden:${ordenId}`).emit('orden:updated', {
    ...data,
    timestamp: new Date().toISOString(),
  });

  logger.debug('Orden update emitted', { ordenId });
}

/**
 * Notificar cambio de estado de orden
 */
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

/**
 * Notificar progreso de ejecución
 */
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

/**
 * Notificar nueva evidencia
 */
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

/**
 * Notificar a usuarios específicos
 */
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

/**
 * Notificar a un usuario específico
 */
export function notifyUser(userId: string, event: string, data: any) {
  if (!io) return;

  io.to(`user:${userId}`).emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast a todos los usuarios conectados
 */
export function broadcastToAll(event: string, data: any) {
  if (!io) return;

  io.emit(event, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Obtener usuarios conectados
 */
export function getConnectedUsers(): string[] {
  return Array.from(connectedUsers.keys());
}

/**
 * Verificar si un usuario está conectado
 */
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
