import crypto from 'crypto';
import { Types } from 'mongoose';
import User from '../models/User.js';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { emitToUser } from '../config/socket.js';
import { z } from 'zod';
import { createAuditLog, logLoginFailed } from '../middleware/auditLogger.js';
import BlacklistedToken from '../models/BlacklistedToken.js';
const comparePasswordStatic = async (plainPassword, hashedPassword) => {
    const bcrypt = await import('bcrypt');
    return bcrypt.default.compare(plainPassword, hashedPassword);
};
const incrementLoginAttempts = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $inc: { loginAttempts: 1 },
        $set: {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000,
            isLocked: true
        }
    });
};
const resetLoginAttempts = async (userId, ip) => {
    await User.findByIdAndUpdate(userId, {
        $set: {
            loginAttempts: 0,
            lockUntil: undefined,
            isLocked: false,
            lastLogin: new Date(),
            lastLoginIP: ip
        }
    });
};
const addRefreshTokenStatic = async (userId, token, expiresAt, deviceInfo) => {
    await User.findByIdAndUpdate(userId, {
        $push: {
            refreshTokens: {
                token,
                expiresAt,
                device: deviceInfo.device,
                ip: deviceInfo.ip,
                userAgent: deviceInfo.userAgent,
                createdAt: new Date()
            }
        }
    });
};
const removeRefreshTokenStatic = async (userId, token) => {
    await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token } }
    });
};
const invalidateAllTokensStatic = async (userId) => {
    await User.findByIdAndUpdate(userId, {
        $set: {
            refreshTokens: [],
            tokenVersion: { $inc: { tokenVersion: 1 } }
        }
    });
};
const hasValidRefreshTokenStatic = (user, token) => {
    const now = new Date();
    return user.refreshTokens?.some((rt) => rt.token === token && rt.expiresAt > now) || false;
};
const getDeviceInfo = (req) => {
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    let device = 'desktop';
    if (/mobile/i.test(userAgent))
        device = 'mobile';
    else if (/tablet/i.test(userAgent))
        device = 'tablet';
    return {
        device,
        ip,
        userAgent,
    };
};
const setTokenCookies = (res, tokens, remember = false) => {
    const accessMaxAge = tokens.expiresIn * 1000;
    const refreshMaxAge = remember
        ? 30 * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    };
    res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
        maxAge: accessMaxAge,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: refreshMaxAge,
    });
};
const sanitizeUser = (user) => {
    const { password, passwordHash, ...sanitized } = user;
    return sanitized;
};
const RegisterSchema = z.object({
    nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
    email: z.string().email('Email inválido').transform((val) => val.toLowerCase()),
    password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
    rol: z.enum(['admin', 'coordinator', 'supervisor', 'engineer', 'technician', 'accountant', 'client']).optional().default('technician'),
    telefono: z.string().max(20).optional(),
    cedula: z.string().min(5).max(20).optional(),
    cargo: z.string().max(100).optional(),
    especialidad: z.string().max(100).optional(),
});
const LoginSchema = z.object({
    email: z.string().email('Email inválido').transform((val) => val.toLowerCase()),
    password: z.string().min(1, 'Contraseña requerida'),
    remember: z.boolean().optional().default(false),
});
const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'Nueva contraseña debe tener al menos 8 caracteres'),
});
const ForgotPasswordSchema = z.object({
    email: z.string().email('Email inválido').transform((val) => val.toLowerCase()),
});
const ResetPasswordSchema = z.object({
    token: z.string().min(1, 'Token requerido'),
    newPassword: z.string().min(8, 'Nueva contraseña debe tener al menos 8 caracteres'),
});
const UpdateProfileSchema = z.object({
    nombre: z.string().min(2).max(100).optional(),
    telefono: z.string().max(20).optional(),
    cargo: z.string().max(100).optional(),
    especialidad: z.string().max(100).optional(),
});
const SessionIndexSchema = z.object({
    sessionIndex: z.string().transform((val) => parseInt(val, 10)).refine((val) => val >= 0, { message: 'Índice de sesión inválido' }),
});
export const register = asyncHandler(async (req, res) => {
    const validation = RegisterSchema.safeParse(req.body);
    if (!validation.success) {
        errorResponse(res, 'Datos de registro inválidos', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const data = validation.data;
    const existingUser = await User.findOne({ email: data.email }).lean();
    if (existingUser) {
        errorResponse(res, 'El email ya está registrado', HTTP_STATUS.CONFLICT);
        return;
    }
    if (data.cedula) {
        const existingCedula = await User.findOne({ cedula: data.cedula }).lean();
        if (existingCedula) {
            errorResponse(res, 'La cédula ya está registrada', HTTP_STATUS.CONFLICT);
            return;
        }
    }
    const user = await User.create({
        ...data,
        email: data.email.toLowerCase(),
    });
    logger.info(`New user registered: ${user.email} (${user.rol})`);
    await createAuditLog({
        userId: String(user._id),
        userEmail: user.email,
        userRol: user.rol,
        action: 'CREATE',
        resource: 'User',
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        method: req.method,
        endpoint: req.originalUrl || req.url,
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    const deviceInfo = getDeviceInfo(req);
    const tokens = await generateTokenPair({
        userId: String(user._id),
        role: user.rol,
    }, { ...deviceInfo });
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
    await User.findByIdAndUpdate(String(user._id), {
        $push: { refreshTokens: { token: tokens.refreshToken, expiresAt: refreshExpiresAt, device: deviceInfo.device, ip: deviceInfo.ip, userAgent: deviceInfo.userAgent } }
    }).exec();
    setTokenCookies(res, tokens, false);
    successResponse(res, {
        user: sanitizeUser(user.toObject()),
        tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: tokens.tokenType,
            expiresIn: tokens.expiresIn,
            expiresAt: tokens.expiresAt,
        },
    }, 'Usuario registrado exitosamente', HTTP_STATUS.CREATED, { timestamp: new Date().toISOString() });
});
export const login = asyncHandler(async (req, res) => {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
        errorResponse(res, 'Datos de login inválidos', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const data = validation.data;
    const user = await User.findOne({ email: data.email })
        .select('+password +isLocked +lockUntil +loginAttempts +tokenVersion')
        .lean();
    if (!user) {
        await logLoginFailed(data.email, req.ip, req.get('user-agent') || 'unknown', 'Usuario no encontrado');
        errorResponse(res, 'Credenciales inválidas', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    if (user.isLocked) {
        const lockTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
        await logLoginFailed(user.email, req.ip, req.get('user-agent') || 'unknown', 'Cuenta bloqueada');
        errorResponse(res, `Cuenta bloqueada por múltiples intentos fallidos. Intenta en ${lockTime} minutos`, HTTP_STATUS.FORBIDDEN);
        return;
    }
    if (!user.isActive) {
        await logLoginFailed(user.email, req.ip, req.get('user-agent') || 'unknown', 'Usuario inactivo');
        errorResponse(res, 'Usuario inactivo. Contacta al administrador', HTTP_STATUS.FORBIDDEN);
        return;
    }
    const isPasswordValid = await comparePasswordStatic(data.password, user.password);
    if (!isPasswordValid) {
        await logLoginFailed(user.email, req.ip || 'unknown', req.get('user-agent') || 'unknown', 'Contraseña incorrecta');
        await incrementLoginAttempts(new Types.ObjectId(String(user._id)));
        errorResponse(res, 'Credenciales inválidas', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const deviceInfo = getDeviceInfo(req);
    await resetLoginAttempts(new Types.ObjectId(String(user._id)), deviceInfo.ip);
    const tokens = await generateTokenPair({
        userId: String(user._id),
        role: user.rol,
        tokenVersion: user.tokenVersion || 0,
    }, deviceInfo);
    const refreshExpiresAt = new Date();
    const daysToAdd = data.remember ? 30 : 7;
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + daysToAdd);
    await addRefreshTokenStatic(new Types.ObjectId(String(user._id)), tokens.refreshToken, refreshExpiresAt, deviceInfo);
    setTokenCookies(res, tokens, data.remember);
    logger.info(`User logged in: ${user.email} from ${deviceInfo.device} (${deviceInfo.ip})`);
    await createAuditLog({
        userId: String(user._id),
        userEmail: user.email,
        userRol: user.rol,
        action: 'LOGIN',
        resource: 'Auth',
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
        method: 'POST',
        endpoint: '/api/v1/auth/login',
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, {
        user: sanitizeUser(user),
        tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            tokenType: tokens.tokenType,
            expiresIn: tokens.expiresIn,
            expiresAt: tokens.expiresAt,
        },
    }, 'Login exitoso', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const logout = asyncHandler(async (req, res) => {
    const userId = req.user?.userId;
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (accessToken && userId) {
        await BlacklistedToken.revokeToken?.(accessToken, userId, 'LOGOUT', {
            ipAddress: req.ip || 'unknown',
            userAgent: req.get('user-agent') || 'unknown',
        });
    }
    if (refreshToken) {
        await removeRefreshTokenStatic(userId, refreshToken);
        const user = await User.findById(userId).lean();
        if (user)
            logger.info(`User logged out: ${user.email}`);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    const user = await User.findById(userId).lean();
    await createAuditLog({
        userId,
        userEmail: user?.email,
        userRol: user?.rol,
        action: 'LOGOUT',
        resource: 'Auth',
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
        method: 'POST',
        endpoint: '/api/v1/auth/logout',
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, null, 'Logout exitoso', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const logoutAll = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId).lean();
    if (user) {
        await invalidateAllTokensStatic(userId);
        logger.info(`User logged out from all devices: ${user.email}`);
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    await createAuditLog({
        userId,
        userEmail: user?.email || 'unknown',
        userRol: user?.rol,
        action: 'LOGOUT_ALL',
        resource: 'Auth',
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        method: req.method,
        endpoint: req.originalUrl || req.url,
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    successResponse(res, null, 'Sesión cerrada en todos los dispositivos', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: clientRefreshToken } = req.body;
    const cookieRefreshToken = req.cookies?.refreshToken;
    const refreshTokenStr = clientRefreshToken || cookieRefreshToken;
    if (!refreshTokenStr) {
        errorResponse(res, 'Refresh token no proporcionado', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    let decoded;
    try {
        decoded = await verifyRefreshToken(refreshTokenStr);
    }
    catch {
        await BlacklistedToken.revokeToken(refreshTokenStr, new Types.ObjectId(decoded.userId), 'INVALID_REFRESH', { revokedBy: 'system' });
        errorResponse(res, 'Refresh token inválido o expirado', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const user = await User.findById(decoded.userId)
        .select('+tokenVersion +refreshTokens')
        .lean();
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    if (!hasValidRefreshTokenStatic(user, refreshTokenStr)) {
        logger.warn(`Invalid refresh token used for user: ${user.email}`);
        errorResponse(res, 'Refresh token inválido o ya fue usado', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    if (decoded.tokenVersion !== user.tokenVersion) {
        logger.warn(`Outdated token version used for user: ${user.email}`);
        errorResponse(res, 'Token expirado. Por favor, inicia sesión nuevamente', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    if (!user.isActive) {
        errorResponse(res, 'Usuario inactivo', HTTP_STATUS.FORBIDDEN);
        return;
    }
    const deviceInfo = getDeviceInfo(req);
    const newTokens = await generateTokenPair({
        userId: String(user._id),
        role: user.rol,
        tokenVersion: user.tokenVersion || 0,
    }, deviceInfo);
    await removeRefreshTokenStatic(decoded.userId, refreshTokenStr);
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
    await addRefreshTokenStatic(decoded.userId, newTokens.refreshToken, refreshExpiresAt, deviceInfo);
    setTokenCookies(res, newTokens, false);
    logger.info(`Tokens refreshed for user: ${user.email}`);
    await createAuditLog({
        userId: decoded.userId,
        userEmail: user.email,
        userRol: user.rol,
        action: 'TOKEN_REFRESH',
        resource: 'Auth',
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
        method: req.method,
        endpoint: req.originalUrl,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, {
        tokens: {
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken,
            tokenType: newTokens.tokenType,
            expiresIn: newTokens.expiresIn,
            expiresAt: newTokens.expiresAt,
        },
    }, 'Token renovado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getSessions = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId)
        .select('+refreshTokens')
        .lean();
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const now = new Date();
    const activeSessions = (user.refreshTokens || [])
        ?.filter((rt) => rt.expiresAt > now)
        .map((rt) => ({
        device: rt.device,
        ip: rt.ip,
        createdAt: rt.createdAt,
        expiresAt: rt.expiresAt,
        isCurrent: req.cookies?.refreshToken === rt.token,
    })) || [];
    successResponse(res, {
        sessions: activeSessions,
        total: activeSessions.length,
    }, 'Sesiones activas obtenidas', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const revokeSession = asyncHandler(async (req, res) => {
    const validation = SessionIndexSchema.safeParse({ sessionIndex: req.params.sessionIndex });
    if (!validation.success) {
        errorResponse(res, 'Índice de sesión inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const sessionIndex = validation.data.sessionIndex;
    const user = await User.findById(req.user.userId)
        .select('+refreshTokens');
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    if (sessionIndex < 0 || sessionIndex >= (user.refreshTokens?.length ?? 0)) {
        errorResponse(res, 'Sesión no encontrada', HTTP_STATUS.NOT_FOUND);
        return;
    }
    user.refreshTokens.splice(sessionIndex, 1);
    await user.save({ validateBeforeSave: false });
    logger.info(`Session revoked for user: ${user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        userEmail: user.email,
        userRol: user.rol,
        action: 'LOGOUT_SESSION',
        resource: 'Auth',
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
        method: req.method,
        endpoint: req.originalUrl || req.url,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, null, 'Sesión cerrada exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId).lean();
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    successResponse(res, { user: sanitizeUser(user) }, 'Perfil obtenido exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const updateMe = asyncHandler(async (req, res) => {
    const validation = UpdateProfileSchema.safeParse(req.body);
    if (!validation.success) {
        errorResponse(res, 'Datos de perfil inválidos', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const data = validation.data;
    const user = await User.findByIdAndUpdate(req.user.userId, { $set: data }, { new: true, runValidators: true }).lean();
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    logger.info(`User updated profile: ${user.email}`);
    await createAuditLog({
        userId: req.user.userId,
        userEmail: user.email,
        userRol: user.rol,
        action: 'UPDATE',
        resource: 'User',
        details: 'Profile update',
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
        method: req.method,
        endpoint: req.originalUrl || req.url,
        status: 'SUCCESS',
        severity: 'LOW',
    });
    successResponse(res, { user: sanitizeUser(user) }, 'Perfil actualizado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const changePassword = asyncHandler(async (req, res) => {
    const validation = ChangePasswordSchema.safeParse(req.body);
    if (!validation.success) {
        errorResponse(res, 'Datos de cambio de contraseña inválidos', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const data = validation.data;
    const user = await User.findById(req.user.userId)
        .select('+password')
        .lean();
    if (!user) {
        errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
        return;
    }
    const isPasswordValid = await comparePasswordStatic(data.currentPassword, user.password);
    if (!isPasswordValid) {
        errorResponse(res, 'Contraseña actual incorrecta', HTTP_STATUS.UNAUTHORIZED);
        return;
    }
    const isSamePassword = await comparePasswordStatic(data.newPassword, user.password);
    if (isSamePassword) {
        errorResponse(res, 'La nueva contraseña debe ser diferente a la actual', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    await User.findByIdAndUpdate(req.user.userId, {
        password: data.newPassword,
        $inc: { tokenVersion: 1 },
    }, { runValidators: true });
    await invalidateAllTokensStatic(req.user.userId);
    const currentToken = req.headers.authorization?.split(' ')[1];
    if (currentToken) {
        await BlacklistedToken.revokeToken?.(currentToken, req.user.userId, 'PASSWORD_CHANGE', { ipAddress: req.ip });
    }
    logger.info(`User changed password: ${user.email}`);
    try {
        emitToUser(String(user._id), 'password_changed', {
            message: 'Tu contraseña ha sido cambiada. Todas las sesiones fueron cerradas.',
        });
    }
    catch (error) {
        logger.debug('Socket notification failed:', error);
    }
    await createAuditLog({
        userId: req.user.userId,
        userEmail: user.email,
        userRol: user.rol,
        action: 'PASSWORD_CHANGE',
        resource: 'User',
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
        method: req.method,
        endpoint: req.originalUrl || req.url,
        status: 'SUCCESS',
        severity: 'HIGH',
    });
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    successResponse(res, null, 'Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const forgotPassword = asyncHandler(async (req, res) => {
    const validation = ForgotPasswordSchema.safeParse({ email: req.body.email });
    if (!validation.success) {
        errorResponse(res, 'Email inválido', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const { email } = validation.data;
    const user = await User.findOne({ email }).lean();
    if (!user) {
        logger.info(`Password reset requested for non-existent email: ${email}`);
        successResponse(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
        return;
    }
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpiry,
    });
    logger.info(`Password reset requested for: ${user.email} from ${req.ip}`);
    await createAuditLog({
        userId: String(user._id),
        userEmail: user.email,
        action: 'PASSWORD_RESET_REQUEST',
        resource: 'User',
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
        method: req.method,
        endpoint: req.originalUrl || req.url,
        status: 'SUCCESS',
        severity: 'MEDIUM',
    });
    const devInfo = process.env.NODE_ENV === 'development' ? { resetToken, expiresIn: 3600000 } : null;
    successResponse(res, devInfo, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const resetPassword = asyncHandler(async (req, res) => {
    const validation = ResetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
        errorResponse(res, 'Datos de restablecimiento inválidos', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    const data = validation.data;
    const user = await User.findOne({
        passwordResetToken: data.token,
        passwordResetExpires: { $gt: Date.now() },
    }).lean();
    if (!user) {
        errorResponse(res, 'Token inválido o expirado', HTTP_STATUS.BAD_REQUEST);
        return;
    }
    await User.findByIdAndUpdate(user._id, {
        password: data.newPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        $inc: { tokenVersion: 1 },
    }, { runValidators: true });
    await invalidateAllTokensStatic(user._id);
    logger.info(`Password reset completed for: ${user.email} from ${req.ip}`);
    await createAuditLog({
        userId: String(user._id),
        userEmail: user.email,
        action: 'PASSWORD_RESET',
        resource: 'User',
        ipAddress: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
        method: req.method,
        endpoint: req.originalUrl || req.url,
        status: 'SUCCESS',
        severity: 'HIGH',
    });
    successResponse(res, null, 'Contraseña restablecida exitosamente. Por favor, inicia sesión', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
export const verifyToken = asyncHandler(async (req, res) => {
    successResponse(res, {
        valid: true,
        user: sanitizeUser({ ...req.user }),
    }, 'Token válido', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
});
//# sourceMappingURL=auth.controller.js.map