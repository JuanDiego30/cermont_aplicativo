import { Server } from 'socket.io';
import { verifyAccessToken } from '';
import User from '';
import { logger } from '';
import { registerNotificationsHandlers } from '';
import { registerOrdersHandlers } from '';
import { cleanupNotifications } from '';
import { cleanupOrders } from '';
let io = null;
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
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                return next(new Error('Token de autenticación requerido'));
            }
            const decoded = verifyAccessToken(token);
            const user = await User.findById(decoded.userId)
                .select('nombre email rol activo')
                .lean();
            if (!user || !user.activo) {
                return next(new Error('Usuario inválido o inactivo'));
            }
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
        }
        catch (error) {
            logger.error('Error en autenticación de Socket:', error);
            next(new Error('Token inválido'));
        }
    });
    io.on('connection', (socket) => {
        logger.info(`Usuario conectado: ${socket.user._id} - Socket ID: ${socket.id}`);
        socket.join(`user:${socket.user._id}`);
        socket.join(`role:${socket.user.rol}`);
        registerNotificationsHandlers(io, socket);
        registerOrdersHandlers(io, socket);
        socket.emit('connected', {
            message: 'Conectado exitosamente',
            userId: socket.user._id,
            role: socket.user.rol,
        });
        socket.on('disconnect', (reason) => {
            cleanupNotifications(socket);
            cleanupOrders(socket);
            logger.info(`Usuario desconectado: ${socket.user._id} - Razón: ${reason}`);
        });
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });
        socket.on('error', (error) => {
            logger.error(`Error en socket ${socket.id}:`, error);
        });
    });
    logger.info('Socket.IO inicializado correctamente');
    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO no ha sido inicializado');
    }
    return io;
};
export const emitToUser = (userId, event, data) => {
    try {
        if (!io) {
            logger.warn('Socket.IO no inicializado - No se puede emitir evento');
            return;
        }
        io.to(`user:${userId}`).emit(event, data);
        logger.debug(`Evento emitido a usuario ${userId}: ${event}`);
    }
    catch (error) {
        logger.error('Error al emitir a usuario:', error);
    }
};
export const emitToRole = (role, event, data) => {
    try {
        if (!io) {
            logger.warn('Socket.IO no inicializado - No se puede emitir evento');
            return;
        }
        io.to(`role:${role}`).emit(event, data);
        logger.debug(`Evento emitido a rol ${role}: ${event}`);
    }
    catch (error) {
        logger.error('Error al emitir a rol:', error);
    }
};
export const emitToAll = (event, data) => {
    try {
        if (!io) {
            logger.warn('Socket.IO no inicializado - No se puede emitir evento');
            return;
        }
        io.emit(event, data);
        logger.debug(`Evento emitido a todos: ${event}`);
    }
    catch (error) {
        logger.error('Error al emitir a todos:', error);
    }
};
export const getConnectedUsers = async () => {
    try {
        if (!io) {
            return [];
        }
        const sockets = await io.fetchSockets();
        return sockets
            .filter((s) => s.user)
            .map((s) => {
            const socket = s;
            return {
                userId: socket.user._id,
                userRole: socket.user.rol,
                userName: socket.user.nombre,
                socketId: socket.id,
            };
        });
    }
    catch (error) {
        logger.error('Error al obtener usuarios conectados:', error);
        return [];
    }
};
export const disconnectUser = async (userId, reason = 'Desconectado por el servidor') => {
    try {
        if (!io) {
            return;
        }
        const sockets = await io.in(`user:${userId}`).fetchSockets();
        sockets.forEach((socket) => {
            const extSocket = socket;
            extSocket.emit('force_disconnect', { reason });
            extSocket.disconnect(true);
        });
        logger.info(`Usuario ${userId} desconectado: ${reason}`);
    }
    catch (error) {
        logger.error('Error al desconectar usuario:', error);
    }
};
//# sourceMappingURL=index.js.map