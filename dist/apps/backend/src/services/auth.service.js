import { Types } from 'mongoose';
import User from '';
import { generateTokenPair, verifyRefreshToken } from '';
import { logger } from '';
import * as crypto from 'crypto';
import { ROLES } from '';
import { createAuditLog } from '';
import { CustomError } from '';
import { REFRESH_TOKEN_DAYS, PASSWORD_RESET_HOURS, LOCKOUT_MINUTES, MAX_LOGIN_ATTEMPTS } from '';
const validateRole = (role) => ROLES.includes(role);
export const authenticateUser = async (email, password, metadata = {}) => {
    try {
        if (!email || !password) {
            throw new CustomError('Email y contraseña requeridos', 'INVALID_INPUT');
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findByEmail(normalizedEmail).select('+password +loginAttempts +lockUntil +isActive +isLocked +tokenVersion +role').lean();
        if (!user) {
            await new Promise(resolve => setTimeout(resolve, 100));
            await createAuditLog({ accion: 'LOGIN_FAIL', usuarioId: null, detalles: { email: normalizedEmail, ip: metadata.ip } });
            throw new CustomError('Credenciales inválidas', 'INVALID_CREDENTIALS');
        }
        if (user.isLocked) {
            const lockTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60));
            await createAuditLog({ accion: 'LOGIN_LOCKED', usuarioId: new Types.ObjectId(user._id), detalles: { email: user.email, ip: metadata.ip } });
            throw new CustomError(`Cuenta bloqueada. Intenta en ${lockTime} minutos`, 'ACCOUNT_LOCKED');
        }
        if (!user.isActive) {
            throw new CustomError('Usuario inactivo', 'INACTIVE_USER');
        }
        const isPasswordValid = await User.comparePassword(password, user.password);
        if (!isPasswordValid) {
            await User.incrementLoginAttempts(user._id);
            const attempts = (await User.findById(user._id).select('loginAttempts').lean())?.loginAttempts || 0;
            if (attempts >= MAX_LOGIN_ATTEMPTS) {
                await User.lockAccount(user._id, new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000));
            }
            await createAuditLog({ accion: 'LOGIN_FAIL', usuarioId: new Types.ObjectId(user._id), detalles: { email: user.email, attempts, ip: metadata.ip } });
            throw new CustomError('Credenciales inválidas', 'INVALID_CREDENTIALS');
        }
        await User.resetLoginAttempts(user._id, metadata.ip);
        if (user.tokenVersion === undefined || user.tokenVersion === null) {
            user.tokenVersion = 0;
            await User.findByIdAndUpdate(user._id, { tokenVersion: 0 });
        }
        const payload = {
            userId: user._id.toString(),
            role: user.role,
        };
        if (!validateRole(payload.role)) {
            throw new CustomError('Rol inválido', 'INVALID_ROLE');
        }
        const tokens = await generateTokenPair(payload, metadata);
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + REFRESH_TOKEN_DAYS);
        await User.addRefreshToken(user._id, tokens.refreshToken, refreshExpiresAt, metadata.device, metadata.ip, metadata.userAgent);
        await createAuditLog({ accion: 'LOGIN_SUCCESS', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip, device: metadata.device } });
        logger.info(`Usuario autenticado: ${user.email} from ${metadata.device || 'unknown'}`);
        return {
            user: user.toAuthJSON ? await User.toAuthJSON(user) : { _id: user._id, email: user.email, role: user.role },
            tokens,
        };
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error en autenticación:', { email, error: error.message });
        throw new CustomError('Error interno de autenticación', 'AUTH_ERROR', error.message);
    }
};
export const refreshUserTokens = async (refreshToken, metadata = {}) => {
    try {
        if (!refreshToken) {
            throw new CustomError('Refresh token requerido', 'INVALID_INPUT');
        }
        const decoded = await verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.userId).select('+tokenVersion +refreshTokens +isActive +role').lean();
        if (!user || !user.isActive) {
            throw new CustomError('Usuario no encontrado o inactivo', 'USER_NOT_FOUND');
        }
        if (!User.hasValidRefreshToken(user, refreshToken)) {
            await createAuditLog({ accion: 'REFRESH_FAIL_INVALID', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip } });
            throw new CustomError('Refresh token inválido o expirado', 'INVALID_REFRESH_TOKEN');
        }
        if (decoded.tokenVersion !== user.tokenVersion) {
            await createAuditLog({ accion: 'REFRESH_FAIL_OUTDATED', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip } });
            throw new CustomError('Token desactualizado. Inicia sesión nuevamente', 'OUTDATED_TOKEN');
        }
        await User.removeRefreshToken(user._id, refreshToken);
        const newPayload = {
            userId: user._id.toString(),
            role: user.role,
            tokenVersion: user.tokenVersion,
        };
        const newTokens = await generateTokenPair(newPayload, metadata);
        const newRefreshExpiresAt = new Date();
        newRefreshExpiresAt.setDate(newRefreshExpiresAt.getDate() + REFRESH_TOKEN_DAYS);
        await User.addRefreshToken(user._id, newTokens.refreshToken, newRefreshExpiresAt, metadata.device, metadata.ip, metadata.userAgent);
        await createAuditLog({ accion: 'TOKEN_REFRESH', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip, device: metadata.device } });
        logger.info(`Tokens renovados para: ${user.email}`);
        return newTokens;
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error al renovar tokens:', { error: error.message });
        throw new CustomError('Error al renovar tokens', 'REFRESH_ERROR', error.message);
    }
};
export const logoutUser = async (userId, refreshToken, metadata = {}) => {
    try {
        if (!Types.ObjectId.isValid(userId)) {
            throw new CustomError('UserId inválido', 'INVALID_ID');
        }
        const user = await User.findById(userId).select('+refreshTokens').lean();
        if (!user) {
            throw new CustomError('Usuario no encontrado', 'USER_NOT_FOUND');
        }
        if (refreshToken) {
            await User.removeRefreshToken(user._id, refreshToken);
        }
        await createAuditLog({ accion: 'LOGOUT', usuarioId: new Types.ObjectId(userId), detalles: { ip: metadata.ip || 'unknown', full: !!refreshToken } });
        logger.info(`Usuario cerró sesión: ${user.email}`);
        return true;
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error al cerrar sesión:', { userId, error: error.message });
        throw new CustomError('Error al cerrar sesión', 'LOGOUT_ERROR', error.message);
    }
};
export const logoutAllDevices = async (userId, metadata = {}) => {
    try {
        if (!Types.ObjectId.isValid(userId)) {
            throw new CustomError('UserId inválido', 'INVALID_ID');
        }
        const user = await User.findById(userId).lean();
        if (!user) {
            throw new CustomError('Usuario no encontrado', 'USER_NOT_FOUND');
        }
        await User.invalidateAllTokens(user._id);
        await createAuditLog({ accion: 'LOGOUT_ALL', usuarioId: new Types.ObjectId(userId), detalles: { ip: metadata.ip || 'unknown', reason: metadata.reason } });
        logger.info(`Usuario cerró todas las sesiones: ${user.email}`);
        return true;
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error al cerrar todas las sesiones:', { userId, error: error.message });
        throw new CustomError('Error al cerrar todas las sesiones', 'LOGOUT_ALL_ERROR', error.message);
    }
};
export const getActiveSessions = async (userId) => {
    try {
        if (!Types.ObjectId.isValid(userId))
            return [];
        const user = await User.findById(userId).select('+refreshTokens').lean();
        if (!user) {
            throw new CustomError('Usuario no encontrado', 'USER_NOT_FOUND');
        }
        const now = new Date();
        const activeSessions = user.refreshTokens
            ?.filter((rt) => rt.expiresAt > now)
            .map((rt) => ({
            device: rt.device || 'unknown',
            ip: rt.ip || 'unknown',
            userAgent: rt.userAgent || 'unknown',
            createdAt: rt.createdAt,
            expiresAt: rt.expiresAt,
        })) || [];
        return activeSessions;
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error al obtener sesiones:', { userId, error: error.message });
        throw new CustomError('Error al obtener sesiones', 'SESSIONS_ERROR', error.message);
    }
};
export const changeUserPassword = async (userId, currentPassword, newPassword, metadata = {}) => {
    try {
        if (!Types.ObjectId.isValid(userId) || !currentPassword || !newPassword) {
            throw new CustomError('Parámetros requeridos', 'INVALID_INPUT');
        }
        const user = await User.findById(userId).select('+password').lean();
        if (!user) {
            throw new CustomError('Usuario no encontrado', 'USER_NOT_FOUND');
        }
        const isCurrentValid = await User.comparePassword(currentPassword, user.password);
        if (!isCurrentValid) {
            await createAuditLog({ accion: 'PASSWORD_CHANGE_FAIL', usuarioId: new Types.ObjectId(userId), detalles: { ip: metadata.ip } });
            throw new CustomError('Contraseña actual incorrecta', 'INVALID_CURRENT_PASSWORD');
        }
        const isSame = await User.comparePassword(newPassword, user.password);
        if (isSame) {
            throw new CustomError('La nueva contraseña debe ser diferente', 'SAME_PASSWORD');
        }
        const session = await User.startSession();
        await session.withTransaction(async () => {
            const userDoc = await User.findById(userId).session(session);
            if (!userDoc)
                throw new CustomError('Usuario no encontrado en transacción', 'USER_NOT_FOUND');
            userDoc.password = newPassword;
            await userDoc.invalidateAllTokens();
            await userDoc.save({ session });
        });
        await session.endSession();
        await createAuditLog({ accion: 'PASSWORD_CHANGE', usuarioId: new Types.ObjectId(userId), detalles: { ip: metadata.ip } });
        logger.info(`Contraseña cambiada para: ${user.email}`);
        return true;
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error al cambiar contraseña:', { userId, error: error.message });
        throw new CustomError('Error al cambiar contraseña', 'PASSWORD_CHANGE_ERROR', error.message);
    }
};
export const generatePasswordResetToken = async (email, metadata = {}) => {
    try {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).lean();
        if (!user || !user.isActive) {
            await createAuditLog({ accion: 'RESET_REQUEST_FAIL', usuarioId: null, detalles: { email: normalizedEmail, ip: metadata.ip } });
            return null;
        }
        const resetToken = crypto.randomUUID();
        const resetTokenExpiry = new Date(Date.now() + PASSWORD_RESET_HOURS * 60 * 60 * 1000);
        await User.findOneAndUpdate({ _id: user._id, email: normalizedEmail }, { passwordResetToken: resetToken, passwordResetExpires: resetTokenExpiry });
        await createAuditLog({ accion: 'RESET_TOKEN_GENERATED', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip } });
        logger.info(`Token de reset generado para: ${user.email}`);
        return {
            resetToken,
            email: user.email,
            expiresAt: resetTokenExpiry,
        };
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error al generar token de reset:', { email, error: error.message });
        throw new CustomError('Error al generar token de reset', 'RESET_TOKEN_ERROR', error.message);
    }
};
export const resetPasswordWithToken = async (token, newPassword, metadata = {}) => {
    try {
        if (!token || !newPassword) {
            throw new CustomError('Token y nueva contraseña requeridos', 'INVALID_INPUT');
        }
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() },
        }).lean();
        if (!user) {
            await createAuditLog({ accion: 'RESET_FAIL_INVALID', usuarioId: null, detalles: { ip: metadata.ip } });
            throw new CustomError('Token inválido o expirado', 'INVALID_RESET_TOKEN');
        }
        const session = await User.startSession();
        await session.withTransaction(async () => {
            const userDoc = await User.findOne({ _id: user._id, passwordResetToken: token }).session(session);
            if (!userDoc)
                throw new CustomError('Token inválido en transacción', 'INVALID_RESET_TOKEN');
            userDoc.password = newPassword;
            userDoc.passwordResetToken = undefined;
            userDoc.passwordResetExpires = undefined;
            await userDoc.invalidateAllTokens();
            await userDoc.save({ session });
        });
        await session.endSession();
        await createAuditLog({ accion: 'PASSWORD_RESET', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip } });
        logger.info(`Contraseña restablecida para: ${user.email}`);
        return true;
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error al restablecer contraseña:', { error: error.message });
        throw new CustomError('Error al restablecer contraseña', 'RESET_PASSWORD_ERROR', error.message);
    }
};
export const getActiveSessionsCount = async (userId) => {
    try {
        if (!Types.ObjectId.isValid(userId))
            return 0;
        const user = await User.findById(userId).select('+refreshTokens').lean();
        if (!user)
            return 0;
        const now = new Date();
        return user.refreshTokens?.filter((rt) => rt.expiresAt > now).length || 0;
    }
    catch (error) {
        logger.error('Error al contar sesiones activas:', { userId, error: error.message });
        return 0;
    }
};
//# sourceMappingURL=auth.service.js.map