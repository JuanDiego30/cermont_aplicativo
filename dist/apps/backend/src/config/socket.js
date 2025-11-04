import { Server } from 'socket.io';
import { verifyAccessToken } from './jwt';
import { logger } from '../utils/logger';
let io = null;
export const initializeSocket = (httpServer) => {
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
        : ['http://localhost:3000'];
    if (corsOrigins.length === 0) {
        logger.warn('CORS_ORIGINS empty, using default localhost:3000');
        corsOrigins.push('http://localhost:3000');
    }
    const isProduction = process.env.NODE_ENV === 'production';
    const adapter = process.env.USE_REDIS_ADAPTER ? undefined : undefined;
    const ioOptions = {
        cors: {
            origin: corsOrigins,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
        pingInterval: 25000,
        maxHttpBufferSize: 1e6,
        adapter,
        ...(isProduction && { transports: ['polling', 'websocket'] }),
    };
    io = new Server(httpServer, ioOptions);
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token ||
                socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                const err = new Error('Authentication error: Token required');
                logger.warn(`Socket auth failed (no token): ${socket.id}`);
                return next(err);
            }
            const decoded = await verifyAccessToken(token);
            if (!decoded.userId) {
                const err = new Error('Authentication error: Invalid user in token');
                logger.warn(`Socket auth failed (invalid user): ${socket.id}`);
                return next(err);
            }
            socket.userId = decoded.userId;
            socket.userRole = decoded.role || 'user';
            logger.debug(`Socket authenticated: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);
            next();
        }
        catch (error) {
            const err = error;
            logger.error(`Socket authentication error (${socket.id}):`, err.message);
            next(new Error(`Authentication error: ${err.message}`));
        }
    });
    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id} (User: ${socket.userId})`);
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
        }
        if (socket.userRole) {
            socket.join(`role:${socket.userRole}`);
        }
        socket.on('disconnect', (reason) => {
            logger.info(`Socket disconnected: ${socket.id} (User: ${socket.userId}, Reason: ${reason})`);
        });
        socket.on('error', (error) => {
            logger.error(`Socket error (${socket.id}):`, error.message);
            socket.emit('server-error', { message: 'Unexpected server error', code: 'SOCKET_ERROR' });
        });
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });
    });
    logger.info('✅ Socket.IO initialized');
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initializeSocket first.');
    }
    return io;
};
export const emitToUser = (userId, event, data) => {
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
export const emitToRole = (role, event, data) => {
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
export const broadcastToAll = (event, data) => {
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
export const closeSocket = async () => {
    if (io) {
        logger.info('Closing Socket.IO connections...');
        await new Promise((resolve) => {
            io.close(() => {
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
//# sourceMappingURL=socket.js.map