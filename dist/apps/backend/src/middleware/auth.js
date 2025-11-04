import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { verifyAccessToken } from '../config/jwt';
import BlacklistedToken from '../models/BlacklistedToken';
import User from '../models/User';
const validateObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
export const authenticate = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.cookies?.accessToken;
        if (!token) {
            await createAuditLog({
                userId: null,
                action: 'AUTH_REQUIRED',
                resource: 'Auth',
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                status: 'FAILURE',
                severity: 'LOW',
                description: `Token requerido para ${req.method} ${req.originalUrl}`,
            });
            errorResponse(res, 'Autenticación requerida. Token no proporcionado', HTTP_STATUS.UNAUTHORIZED, [], 'AUTH_REQUIRED');
            return;
        }
        const isBlacklisted = await BlacklistedToken.isBlacklisted(token);
        if (isBlacklisted) {
            await createAuditLog({
                userId: null,
                action: 'TOKEN_BLACKLISTED',
                resource: 'Auth',
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                status: 'FAILURE',
                severity: 'HIGH',
                description: `Token revocado usado en ${req.originalUrl}`,
            });
            errorResponse(res, 'Token revocado. Inicia sesión nuevamente', HTTP_STATUS.UNAUTHORIZED, [], 'TOKEN_BLACKLISTED');
            return;
        }
        const decoded = await verifyAccessToken(token);
        if (!validateObjectId(decoded.userId)) {
            errorResponse(res, 'Token inválido: ID de usuario malformado', HTTP_STATUS.UNAUTHORIZED);
            return;
        }
        const user = await User.findById(decoded.userId)
            .select('-password -refreshToken')
            .lean();
        if (!user) {
            await logLoginFailed(null, req.ip || 'unknown', req.get('User-Agent') || 'unknown', 'Usuario no encontrado');
            errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.UNAUTHORIZED);
            return;
        }
        if (!user.activo) {
            await createAuditLog({
                userId: decoded.userId,
                userEmail: user.email,
                action: 'USER_INACTIVE_ACCESS',
                resource: 'Auth',
                ipAddress: req.ip || 'unknown',
                userAgent: req.get('User-Agent') || 'unknown',
                status: 'FAILURE',
                severity: 'MEDIUM',
                description: `Intento de acceso por usuario inactivo: ${user.email}`,
            });
            errorResponse(res, 'Usuario inactivo. Contacta al administrador', HTTP_STATUS.FORBIDDEN);
            return;
        }
        const sanitizedUser = sanitizeUserData(user);
        req.user = {
            ...sanitizedUser,
            userId: sanitizedUser._id?.toString() || decoded.userId,
            rol: sanitizedUser.rol,
        };
        delete req.user._id;
        await createAuditLog({
            userId: req.user.userId,
            userEmail: req.user.email,
            action: 'LOGIN_SUCCESS',
            resource: 'Auth',
            ipAddress: req.ip || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            status: 'SUCCESS',
            severity: 'LOW',
            description: `Acceso exitoso para ${req.user.email} en ${req.originalUrl}`,
        });
        next();
    }
    catch (error) {
        logger.error('Error en autenticación:', {
            error: error.message,
            ip: req.ip,
            ua: req.get('User-Agent'),
            url: req.originalUrl,
        });
        if (error.name === 'TokenExpiredError' || error.message.includes('expired')) {
            await logLoginFailed(null, req.ip || 'unknown', req.get('User-Agent') || 'unknown', 'Token expirado');
            errorResponse(res, 'Sesión expirada. Inicia sesión nuevamente', HTTP_STATUS.UNAUTHORIZED, [], 'TOKEN_EXPIRED');
            return;
        }
        if (error.name === 'JsonWebTokenError' ||
            error.message.includes('invalid') ||
            error.message.includes('malformed')) {
            await logLoginFailed(null, req.ip || 'unknown', req.get('User-Agent') || 'unknown', 'Token inválido');
            errorResponse(res, 'Token inválido', HTTP_STATUS.UNAUTHORIZED, [], 'INVALID_TOKEN');
            return;
        }
        await createAuditLog({
            userId: null,
            action: 'AUTH_ERROR',
            resource: 'Auth',
            ipAddress: req.ip || 'unknown',
            userAgent: req.get('User-Agent') || 'unknown',
            status: 'FAILURE',
            severity: 'HIGH',
            description: `Error de autenticación: ${error.message}`,
            details: { errorMessage: error.message },
        });
        errorResponse(res, 'Error interno de autenticación', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};
export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.cookies?.accessToken;
        if (!token) {
            next();
            return;
        }
        if (await BlacklistedToken.isBlacklisted(token)) {
            logger.debug('Optional auth: Blacklisted token ignored', { ip: req.ip });
            next();
            return;
        }
        const decoded = await verifyAccessToken(token);
        if (!validateObjectId(decoded.userId)) {
            next();
            return;
        }
        const user = await User.findById(decoded.userId)
            .select('-password -refreshToken')
            .lean();
        if (user?.activo) {
            const sanitizedUser = sanitizeUserData(user);
            req.user = {
                ...sanitizedUser,
                userId: sanitizedUser._id?.toString() || decoded.userId,
                rol: sanitizedUser.rol,
            };
            delete req.user._id;
        }
        next();
    }
    catch (error) {
        logger.debug('Optional auth skipped due to error:', {
            error: error.message,
            ip: req.ip,
        });
        next();
    }
};
export const requireAuth = authenticate;
export const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token ||
            socket.handshake.headers.authorization?.startsWith('Bearer ')
            ? socket.handshake.headers.authorization.split(' ')[1]
            : null;
        if (!token) {
            logger.warn('Socket auth: No token provided', { socketId: socket.id });
            next(new Error('Autenticación requerida'));
            return;
        }
        if (await BlacklistedToken.isBlacklisted(token)) {
            next(new Error('Token revocado'));
            return;
        }
        const decoded = await verifyAccessToken(token);
        if (!validateObjectId(decoded.userId)) {
            next(new Error('Token inválido'));
            return;
        }
        const user = await User.findById(decoded.userId)
            .select('-password -refreshToken')
            .lean();
        if (!user || !user.activo) {
            logger.warn('Socket auth: Invalid/inactive user', {
                userId: decoded.userId,
                socketId: socket.id,
            });
            next(new Error('Usuario inválido o inactivo'));
            return;
        }
        const sanitizedUser = sanitizeUserData(user);
        socket.user = {
            ...sanitizedUser,
            userId: sanitizedUser._id?.toString() || decoded.userId,
            rol: sanitizedUser.rol,
        };
        delete socket.user._id;
        socket.userId = socket.user.userId;
        socket.rol = socket.user.rol;
        logger.debug('Socket authenticated:', { userId: socket.userId, socketId: socket.id });
        next();
    }
    catch (error) {
        logger.error('Socket auth error:', {
            error: error.message,
            socketId: socket.id,
            ip: socket.handshake.address,
        });
        next(new Error('Error de autenticación: ' + error.message));
    }
};
export default { authenticate, optionalAuth, requireAuth, authenticateSocket };
//# sourceMappingURL=auth.js.map