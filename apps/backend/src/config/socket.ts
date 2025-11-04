/**
 * Socket.IO Configuration (TypeScript - November 2025)
 * @description Configuración de Socket.IO para real-time communication, con auth JWT y rooms por user/role.
 * Uso: En server.ts (const io = initializeSocket(httpServer);). Env: CORS_ORIGINS='http://localhost:3000,https://frontend.com'.
 * Integrado con: jwt (verifyAccessToken), logger (info/debug/warn/error). Secure: Auth middleware async, CORS strict, buffer limits.
 * Performance: Ping intervals, in-memory adapter (Redis via env future). Extensible: Agrega Redis adapter para scale.
 * Types: @types/socket.io, @types/socket.io-parser. Pruebas: Mock io en Jest (jest.mock('socket.io')). Para ATG: Emits para workplan updates.
 * Fixes: Typed Server/Client, socket.data.userId (extended Socket), async auth, error typing. Graceful close async.
 */

import { Server, Socket } from 'socket.io';
import http from 'http';
import { verifyAccessToken } from './jwt';
import { logger } from '../utils/logger';
import { TokenPayload } from './jwt'; // Import types from jwt.ts (reuse TokenPayload)

let io: Server | null = null;

// Extend Socket type para custom data (userId, role)
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

/**
 * Initialize Socket.IO server
 * @param httpServer - HTTP server instance
 * @returns Socket.IO server instance
 */
export const initializeSocket = (httpServer: http.Server): Server => {
  const corsOrigins: string[] = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean) 
    : ['http://localhost:3000'];
  
  if (corsOrigins.length === 0) {
    logger.warn('CORS_ORIGINS empty, using default localhost:3000');
    corsOrigins.push('http://localhost:3000');
  }

  const isProduction: boolean = process.env.NODE_ENV === 'production';
  
  // Adapter: In-memory default; future Redis if env.USE_REDIS_ADAPTER
  const adapter = process.env.USE_REDIS_ADAPTER ? undefined : undefined; // Stub; implement ioredis if true

  const ioOptions: Record<string, any> = {
    cors: {
      origin: corsOrigins,
      methods: ['GET', 'POST'], // Explicit for security
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6, // 1MB limit anti-DoS
    adapter,
    ...(isProduction && { transports: ['polling', 'websocket'] }), // Polling first en prod
  };

  io = new Server(httpServer, ioOptions);

  // Authentication middleware - Typed async
  io.use(async (socket: AuthenticatedSocket, next: (err?: Error) => void): Promise<void> => {
    try {
      const token: string | undefined = socket.handshake.auth?.token as string || 
        (socket.handshake.headers.authorization as string)?.split(' ')[1];

      if (!token) {
        const err = new Error('Authentication error: Token required');
        logger.warn(`Socket auth failed (no token): ${socket.id}`);
        return next(err);
      }

      const decoded: TokenPayload = await verifyAccessToken(token);
      if (!decoded.userId) {
        const err = new Error('Authentication error: Invalid user in token');
        logger.warn(`Socket auth failed (invalid user): ${socket.id}`);
        return next(err);
      }

      socket.userId = decoded.userId;
      socket.userRole = decoded.role || 'user';
      logger.debug(`Socket authenticated: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);
      next();
    } catch (error: unknown) {
      const err = error as Error;
      logger.error(`Socket authentication error (${socket.id}):`, err.message);
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  // Connection handler - Typed socket
  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join role-specific room
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`);
    }

    // Custom events para ATG (e.g., real-time order updates)
    // socket.on('join-workplan', (workplanId: string) => { socket.join(`workplan:${workplanId}`); });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${socket.userId}, Reason: ${reason})`);
      // Auto-cleanup rooms by Socket.IO
    });

    // Handle errors - Client feedback
    socket.on('error', (error: Error) => {
      logger.error(`Socket error (${socket.id}):`, error.message);
      socket.emit('server-error', { message: 'Unexpected server error', code: 'SOCKET_ERROR' });
    });

    // Ping for health checks
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

/**
 * Get Socket.IO instance
 * @returns Server instance
 * @throws Error if not initialized
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit to specific user
 * @param userId - Target user ID
 * @param event - Event name
 * @param data - Payload data
 */
export const emitToUser = (userId: string, event: string, data?: Record<string, unknown>): void => {
  if (!io) {
    logger.warn('emitToUser: Socket.IO not initialized');
    return;
  }
  if (!userId) {
    logger.warn('emitToUser: userId required');
    return;
  }
  io.to(`user:${userId}`).emit(event, {
    ...data,
    timestamp: Date.now(),
  });
  logger.debug(`Emitted to user ${userId}: ${event}`);
};

/**
 * Emit to specific role
 * @param role - Target role
 * @param event - Event name
 * @param data - Payload data
 */
export const emitToRole = (role: string, event: string, data?: Record<string, unknown>): void => {
  if (!io) {
    logger.warn('emitToRole: Socket.IO not initialized');
    return;
  }
  if (!role) {
    logger.warn('emitToRole: role required');
    return;
  }
  io.to(`role:${role}`).emit(event, {
    ...data,
    timestamp: Date.now(),
  });
  logger.debug(`Emitted to role ${role}: ${event}`);
};

/**
 * Broadcast to all connected clients
 * @param event - Event name
 * @param data - Payload data
 */
export const broadcastToAll = (event: string, data?: Record<string, unknown>): void => {
  if (!io) {
    logger.warn('broadcastToAll: Socket.IO not initialized');
    return;
  }
  io.emit(event, {
    ...data,
    timestamp: Date.now(),
  });
  logger.info(`Broadcasted to all: ${event}`);
};

/**
 * Close Socket.IO gracefully (async)
 */
export const closeSocket = async (): Promise<void> => {
  if (io) {
    logger.info('Closing Socket.IO connections...');
    await new Promise<void>((resolve) => {
      io!.close(() => {
        logger.info('Socket.IO closed');
        io = null;
        resolve();
      });
    });
  }
};

export default { 
  initializeSocket, 
  getIO, 
  emitToUser, 
  emitToRole, 
  broadcastToAll, 
  closeSocket 
};

