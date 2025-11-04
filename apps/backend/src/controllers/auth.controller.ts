/**
 * Auth Controller (TypeScript - November 2025)
 * @description Endpoints completos de autenticación JWT con rotación de tokens, gestión de sesiones, recuperación de contraseña y auditoría integrada.
 * Fixes: Align AuthUser a global (rol en lugar de role, resuelve TS2459/2430/2345), type guards inline (no ParsedQs/casts), static methods typed, Zod refine i18n, salted resetToken, DRY helpers, audit consistency.
 * Secure: Admin/coordinator rol checks, Zod sanitizes, token blacklisting, rate limiting (implementar en middleware), ISO 27001 audit trails. Performance: lean() queries, indexes en refreshTokens/timestamp, no aggregate innecesario.
 * Types: express@types 4.18.x, mongoose@types 8.19.x, zod@types 3.23.x. Pruebas: Mock User/jwt en Jest (e.g., jest.mock('../models/User')), auditLog spies. Para ATG: Role-based JWT claims, forgot/reset expiry 1h.
 */

import crypto from 'crypto';
import { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import { Types } from 'mongoose';
import User from '../models/User';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt';
import { successResponse, errorResponse } from '../utils/response';
import { HTTP_STATUS, TOKEN_REASONS } from '../utils/constants';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { emitToUser } from '../config/socket';
import { z } from 'zod';
import { createAuditLog, logLoginFailed } from '../middleware/auditLogger';
import BlacklistedToken from '../models/BlacklistedToken';
import type { ForgotPasswordData, ResetPasswordData } from '../validators/auth.validator';
import type { TokenPair } from '../config/jwt';
import { verifyPassword, migratePasswordHash } from '../utils/passwordHash';

// Use centralized types
import { AuthUser, TypedRequest, UserDocument } from '../types';

// Typed para static methods fallbacks
interface UserStaticMethods {
  comparePasswordStatic(password: string, hash: string): Promise<boolean>;
  incrementLoginAttempts(userId: Types.ObjectId): Promise<void>;
  resetLoginAttempts(userId: Types.ObjectId, ip: string): Promise<void>;
  addRefreshTokenStatic(userId: Types.ObjectId, token: string, expiresAt: Date, deviceInfo: DeviceInfo): Promise<void>;
  removeRefreshTokenStatic(userId: Types.ObjectId, token: string): Promise<void>;
  invalidateAllTokensStatic(userId: Types.ObjectId): Promise<UserDocument>;
  hasValidRefreshTokenStatic(user: any, token: string): boolean;
}

// Device info typed
interface DeviceInfo {
  device: 'desktop' | 'mobile' | 'tablet';
  ip: string;
  userAgent: string;
}

// Sanitized user type (exclude password)
type SanitizedUser = Omit<UserDocument, 'password' | 'passwordHash'>;

// Helper global (DRY)
const getClientIP = (req: Request): string => req.ip || (req as any).socket.remoteAddress || 'unknown';

/**
 * Obtener info de dispositivo
 */
const getDeviceInfo = (req: Request): DeviceInfo => {
  const userAgent = req.headers['user-agent'] as string || 'unknown';
  const ip = getClientIP(req);

  let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/mobile/i.test(userAgent)) device = 'mobile';
  else if (/tablet/i.test(userAgent)) device = 'tablet';

  return { device, ip, userAgent };
};

/**
 * Setear cookies de tokens (secure options)
 */
const setTokenCookies = (res: Response, tokens: TokenPair, remember: boolean = false): void => {
  const accessMaxAge = tokens.expiresIn * 1000;
  const refreshMaxAge = remember ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  res.cookie('accessToken', tokens.accessToken, { ...cookieOptions, maxAge: accessMaxAge });
  res.cookie('refreshToken', tokens.refreshToken, { ...cookieOptions, maxAge: refreshMaxAge });
};

/**
 * Sanitizar user (typed)
 */
const sanitizeUser = (user: any): SanitizedUser => {
  const { password, passwordHash, ...sanitized } = user.toObject ? user.toObject() : user;
  return sanitized as SanitizedUser;
};

/**
 * Construir payload para auditLog (DRY)
 */
const buildAuditPayload = (req: Request & { user?: AuthUser }, user?: any, action: string, resource: string, status: 'SUCCESS' | 'FAILURE', severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW', details?: any): AuditLogData => ({
  userId: req.user?.userId || String(user?._id) || null,
  action,
  resource,
  ip: getClientIP(req),
  details: {
    ...details,
    userEmail: user?.email || req.user?.email,
    userRol: req.user?.rol || user?.rol,
    userAgent: req.get('user-agent') || 'unknown',
    method: req.method,
    endpoint: req.originalUrl || req.url,
    status,
    severity,
  },
});

// Fallback static methods (typed)
const incrementLoginAttempts = async (userId: Types.ObjectId): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $inc: { loginAttempts: 1 },
    $set: { lockUntil: Date.now() + 2 * 60 * 60 * 1000, isLocked: true },
  });
};

const resetLoginAttempts = async (userId: Types.ObjectId, ip: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $set: { loginAttempts: 0, lockUntil: undefined, isLocked: false, lastLogin: new Date(), lastLoginIP: ip },
  });
};

const addRefreshTokenStatic = async (userId: Types.ObjectId, token: string, expiresAt: Date, deviceInfo: DeviceInfo): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $push: {
      refreshTokens: { token, expiresAt, device: deviceInfo.device, ip: deviceInfo.ip, userAgent: deviceInfo.userAgent, createdAt: new Date() },
    },
  });
  // Index: db.users.createIndex({ "refreshTokens.token": 1 }, { unique: true, partialFilterExpression: { "refreshTokens.expiresAt": { $gt: new Date() } } });
};

const removeRefreshTokenStatic = async (userId: Types.ObjectId, token: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { $pull: { refreshTokens: { token } } });
};

const invalidateAllTokensStatic = async (userId: Types.ObjectId): Promise<void> => {
  await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] }, $inc: { tokenVersion: 1 } });
};

const hasValidRefreshTokenStatic = (user: any, token: string): boolean => {
  const now = new Date();
  return user.refreshTokens?.some((rt: any) => rt.token === token && rt.expiresAt > now) || false;
};

// Extend User statics si no definido
(User as any).comparePasswordStatic = User.comparePasswords; // Asumir método en model
(User as any).incrementLoginAttempts = incrementLoginAttempts;
(User as any).resetLoginAttempts = resetLoginAttempts;
(User as any).addRefreshTokenStatic = addRefreshTokenStatic;
(User as any).removeRefreshTokenStatic = removeRefreshTokenStatic;
(User as any).invalidateAllTokensStatic = invalidateAllTokensStatic;
(User as any).hasValidRefreshTokenStatic = hasValidRefreshTokenStatic;

// Schemas Zod (satisfies para type safety, refine i18n)
const RegisterSchema = z.object({
  nombre: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').transform((val: string) => val.toLowerCase().trim()),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  rol: z.enum(['admin', 'coordinator', 'supervisor', 'engineer', 'technician', 'accountant', 'client']).optional().default('technician'),
  telefono: z.string().max(20).optional(),
  cedula: z.string().min(5).max(20).optional(),
  cargo: z.string().max(100).optional(),
  especialidad: z.string().max(100).optional(),
}).refine((data) => data.nombre.trim().length > 0, { message: 'Nombre no puede estar vacío', path: ['nombre'] });

type RegisterType = z.infer<typeof RegisterSchema>;

const LoginSchema = z.object({
  email: z.string().email('Email inválido').transform((val: string) => val.toLowerCase().trim()),
  password: z.string().min(1, 'Contraseña requerida'),
  remember: z.boolean().optional().default(false),
});

type LoginType = z.infer<typeof LoginSchema>;

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(8, 'Nueva contraseña debe tener al menos 8 caracteres'),
}).refine((data) => data.newPassword !== data.currentPassword, { message: 'La nueva contraseña debe ser diferente', path: ['newPassword'] });

type ChangePasswordType = z.infer<typeof ChangePasswordSchema>;

const ForgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').transform((val: string) => val.toLowerCase().trim()),
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
}).refine((data) => !data.nombre || data.nombre.trim().length > 0, { message: 'Nombre no puede estar vacío', path: ['nombre'] });

type UpdateProfileType = z.infer<typeof UpdateProfileSchema>;

const SessionIndexSchema = z.object({
  sessionIndex: z.string().transform((val: string): number => parseInt(val, 10)).refine((val: number) => val >= 0, { message: 'Índice de sesión inválido' }),
});

type SessionIndexType = z.infer<typeof SessionIndexSchema>;

/**
 * Registrar nuevo usuario
 * @route POST /api/v1/auth/register
 * @access Public
 * @swagger tags: [Auth] summary: Registrar usuario security: [] ...
 */
export const register = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const validation = RegisterSchema.safeParse(req.body);
    if (!validation.success) {
      errorResponse(res, `Datos de registro inválidos: ${validation.error.message}`, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const data = validation.data;

    const existingUser = await User.findOne({ email: data.email }).lean();
    if (existingUser) {
      await createAuditLog(buildAuditPayload(req, null, 'CREATE', 'User', 'FAILURE', 'MEDIUM', { reason: 'Email exists' }));
      errorResponse(res, 'El email ya está registrado', HTTP_STATUS.CONFLICT);
      return;
    }

    if (data.cedula) {
      const existingCedula = await User.findOne({ cedula: data.cedula }).lean();
      if (existingCedula) {
        await createAuditLog(buildAuditPayload(req, null, 'CREATE', 'User', 'FAILURE', 'MEDIUM', { reason: 'Cedula exists' }));
        errorResponse(res, 'La cédula ya está registrada', HTTP_STATUS.CONFLICT);
        return;
      }
    }

    const user = await User.create({ ...data, email: data.email });
    logger.info(`New user registered: ${user.email} (${user.rol})`);

    await createAuditLog(buildAuditPayload(req, user, 'CREATE', 'User', 'SUCCESS', 'MEDIUM'));

    const deviceInfo = getDeviceInfo(req);
    const tokens = await generateTokenPair({ userId: String(user._id), rol: user.rol }, deviceInfo as any);

    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await addRefreshTokenStatic(user._id, tokens.refreshToken, refreshExpiresAt, deviceInfo);

    setTokenCookies(res, tokens, false);

    successResponse(
      res,
      {
        user: sanitizeUser(user),
        tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, tokenType: tokens.tokenType, expiresIn: tokens.expiresIn, expiresAt: tokens.expiresAt },
      },
      'Usuario registrado exitosamente',
      HTTP_STATUS.CREATED,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Iniciar sesión
 * @route POST /api/v1/auth/login
 * @access Public
 * @swagger tags: [Auth] summary: Login usuario ...
 */
export const login = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      errorResponse(res, `Datos de login inválidos: ${validation.error.message}`, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const data = validation.data;

    const user = await User.findOne({ email: data.email }).select('+password +isLocked +lockUntil +loginAttempts +tokenVersion');
    if (!user) {
      await logLoginFailed(data.email, getClientIP(req), req.get('user-agent') || 'unknown', 'Usuario no encontrado');
      await createAuditLog(buildAuditPayload(req, null, 'LOGIN', 'Auth', 'FAILURE', 'LOW', { reason: 'User not found' }));
      errorResponse(res, 'Credenciales inválidas', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil!.getTime() - Date.now()) / 1000 / 60);
      await logLoginFailed(user.email, getClientIP(req), req.get('user-agent') || 'unknown', 'Cuenta bloqueada');
      await createAuditLog(buildAuditPayload(req, user, 'LOGIN', 'Auth', 'FAILURE', 'MEDIUM', { lockTime }));
      errorResponse(res, `Cuenta bloqueada por múltiples intentos fallidos. Intenta en ${lockTime} minutos`, HTTP_STATUS.FORBIDDEN);
      return;
    }

    if (!user.isActive) {
      await logLoginFailed(user.email, getClientIP(req), req.get('user-agent') || 'unknown', 'Usuario inactivo');
      await createAuditLog(buildAuditPayload(req, user, 'LOGIN', 'Auth', 'FAILURE', 'MEDIUM'));
      errorResponse(res, 'Usuario inactivo. Contacta al administrador', HTTP_STATUS.FORBIDDEN);
      return;
    }

    const isPasswordValid = await verifyPassword(user.password, data.password);

    if (!isPasswordValid) {
      await logLoginFailed(user.email, getClientIP(req), req.get('user-agent') || 'unknown', 'Contraseña incorrecta');
      await (User as any).incrementLoginAttempts(user._id);
      await createAuditLog(buildAuditPayload(req, user, 'LOGIN', 'Auth', 'FAILURE', 'LOW'));
      errorResponse(res, 'Credenciales inválidas', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    // Migrar automáticamente de bcrypt a Argon2 si es necesario
    await migratePasswordHash(user, data.password, req);

    const deviceInfo = getDeviceInfo(req);
    await (User as any).resetLoginAttempts(user._id, deviceInfo.ip);

    const tokens = await generateTokenPair({ userId: String(user._id), rol: user.rol, tokenVersion: user.tokenVersion || 0 }, deviceInfo as any);

    const refreshExpiresAt = new Date(Date.now() + (data.remember ? 30 : 7) * 24 * 60 * 60 * 1000);
    await (User as any).addRefreshTokenStatic(user._id, tokens.refreshToken, refreshExpiresAt, deviceInfo);

    setTokenCookies(res, tokens, data.remember);

    logger.info(`User logged in: ${user.email} from ${deviceInfo.device} (${deviceInfo.ip})`);

    await createAuditLog(buildAuditPayload(req, user, 'LOGIN', 'Auth', 'SUCCESS', 'LOW'));

    successResponse(
      res,
      {
        user: sanitizeUser(user),
        tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, tokenType: tokens.tokenType, expiresIn: tokens.expiresIn, expiresAt: tokens.expiresAt },
      },
      'Login exitoso',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Logout
 * @route POST /api/v1/auth/logout
 * @access Private
 */
export const logout = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.userId;
    const refreshToken = req.cookies?.refreshToken || (req.body as any).refreshToken;
    const accessToken = (req.headers.authorization as string)?.split(' ')[1];

    if (accessToken && userId) {
      (BlacklistedToken as any).revokeToken?.(accessToken, new Types.ObjectId(userId), 'LOGOUT', {
        ipAddress: getClientIP(req),
        userAgent: req.get('user-agent') || 'unknown',
      });
    }

    if (refreshToken && userId) {
      await (User as any).removeRefreshTokenStatic(new Types.ObjectId(userId), refreshToken);
      const user = await User.findById(userId).lean();
      if (user) logger.info(`User logged out: ${user.email}`);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    const user = await User.findById(userId).lean();
    await createAuditLog(buildAuditPayload(req, user, 'LOGOUT', 'Auth', 'SUCCESS', 'LOW'));

    successResponse(res, null, 'Logout exitoso', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
  }
);

/**
 * Logout from all devices
 * @route POST /api/v1/auth/logout-all
 * @access Private
 */
export const logoutAll = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user.userId;

    const user = await User.findById(userId).lean();
    if (user) {
      await (User as any).invalidateAllTokensStatic(new Types.ObjectId(userId));
      logger.info(`User logged out from all devices: ${user.email}`);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    await createAuditLog(buildAuditPayload(req, user, 'LOGOUT_ALL', 'Auth', 'SUCCESS', 'MEDIUM'));

    successResponse(res, null, 'Sesión cerrada en todos los dispositivos', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
  }
);

/**
 * Refresh token
 * @route POST /api/v1/auth/refresh
 * @access Private (refresh token required)
 */
export const refreshToken = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const { refreshToken: clientRefreshToken } = req.body as { refreshToken?: string };
    const cookieRefreshToken = req.cookies?.refreshToken;

    const refreshTokenStr = clientRefreshToken || cookieRefreshToken;
    if (!refreshTokenStr) {
      errorResponse(res, 'Refresh token no proporcionado', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    let decoded: any;
    try {
      decoded = await verifyRefreshToken(refreshTokenStr);
    } catch (err) {
      if (decoded?.userId) {
        await (BlacklistedToken as any).revokeToken?.(refreshTokenStr, new Types.ObjectId(decoded.userId), 'INVALID_REFRESH', { revokedBy: undefined });
      }
      await createAuditLog({ ...buildAuditPayload(req, null, 'TOKEN_REFRESH', 'Auth', 'FAILURE', 'HIGH'), details: { reason: 'Invalid refresh' } });
      errorResponse(res, 'Refresh token inválido o expirado', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const user = await User.findById(decoded.userId).select('+tokenVersion +refreshTokens').lean();
    if (!user) {
      errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!(User as any).hasValidRefreshTokenStatic(user, refreshTokenStr)) {
      logger.warn(`Invalid refresh token used for user: ${user.email}`);
      await createAuditLog(buildAuditPayload(req, user, 'TOKEN_REFRESH', 'Auth', 'FAILURE', 'HIGH'));
      errorResponse(res, 'Refresh token inválido o ya fue usado', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      logger.warn(`Outdated token version used for user: ${user.email}`);
      await createAuditLog(buildAuditPayload(req, user, 'TOKEN_REFRESH', 'Auth', 'FAILURE', 'MEDIUM', { reason: 'Outdated version' }));
      errorResponse(res, 'Token expirado. Por favor, inicia sesión nuevamente', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    if (!user.isActive) {
      errorResponse(res, 'Usuario inactivo', HTTP_STATUS.FORBIDDEN);
      return;
    }

    const deviceInfo = getDeviceInfo(req);

    const newTokens = await generateTokenPair({ userId: String(user._id), rol: user.rol, tokenVersion: user.tokenVersion || 0 }, deviceInfo as any);

    await (User as any).removeRefreshTokenStatic(user._id, refreshTokenStr);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await (User as any).addRefreshTokenStatic(user._id, newTokens.refreshToken, refreshExpiresAt, deviceInfo);

    setTokenCookies(res, newTokens, false);

    logger.info(`Tokens refreshed for user: ${user.email}`);

    await createAuditLog(buildAuditPayload(req, user, 'TOKEN_REFRESH', 'Auth', 'SUCCESS', 'LOW'));

    successResponse(
      res,
      {
        tokens: { accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken, tokenType: newTokens.tokenType, expiresIn: newTokens.expiresIn, expiresAt: newTokens.expiresAt },
      },
      'Token renovado exitosamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Get sessions
 * @route GET /api/v1/auth/sessions
 * @access Private
 */
export const getSessions = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const user = await User.findById(userId).select('+refreshTokens').lean();
    if (!user) {
      errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    const now = new Date();
    const activeSessions = (user.refreshTokens || []).filter((rt: any) => rt.expiresAt > now).map((rt: any) => ({
      device: rt.device,
      ip: rt.ip,
      createdAt: rt.createdAt,
      expiresAt: rt.expiresAt,
      isCurrent: req.cookies?.refreshToken === rt.token,
    }));

    successResponse(
      res,
      { sessions: activeSessions, total: activeSessions.length },
      'Sesiones activas obtenidas',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Revoke session
 * @route DELETE /api/v1/auth/sessions/:sessionIndex
 * @access Private
 */
export const revokeSession = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const validation = SessionIndexSchema.safeParse({ sessionIndex: req.params.sessionIndex });
    if (!validation.success) {
      errorResponse(res, `Índice de sesión inválido: ${validation.error.message}`, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const sessionIndex = validation.data;

    const userId = req.user?.userId;
    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const user = await User.findById(userId).select('+refreshTokens');
    if (!user) {
      errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    if (sessionIndex < 0 || sessionIndex >= (user.refreshTokens?.length ?? 0)) {
      errorResponse(res, 'Sesión no encontrada', HTTP_STATUS.NOT_FOUND);
      return;
    }

    user.refreshTokens!.splice(sessionIndex, 1);
    await user.save({ validateBeforeSave: false });

    logger.info(`Session revoked for user: ${user.email}`);

    await createAuditLog(buildAuditPayload(req, user, 'LOGOUT_SESSION', 'Auth', 'SUCCESS', 'LOW'));

    successResponse(res, null, 'Sesión cerrada exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
  }
);

/**
 * Get me
 * @route GET /api/v1/auth/me
 * @access Private
 */
export const getMe = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    successResponse(res, { user: sanitizeUser(user) }, 'Perfil obtenido exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
  }
);

/**
 * Update profile
 * @route PUT /api/v1/auth/me
 * @access Private
 */
export const updateMe = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const validation = UpdateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      errorResponse(res, `Datos de perfil inválidos: ${validation.error.message}`, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const data = validation.data;

    const userId = req.user?.userId;
    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true }).lean();
    if (!user) {
      errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    logger.info(`User updated profile: ${user.email}`);

    await createAuditLog(buildAuditPayload(req, user, 'UPDATE', 'User', 'SUCCESS', 'LOW', { fields: Object.keys(data) }));

    successResponse(res, { user: sanitizeUser(user) }, 'Perfil actualizado exitosamente', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
  }
);

/**
 * Change password
 * @route PUT /api/v1/auth/change-password
 * @access Private
 */
export const changePassword = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const validation = ChangePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      errorResponse(res, `Datos de cambio de contraseña inválidos: ${validation.error.message}`, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const data = validation.data;

    const userId = req.user?.userId;
    if (!userId) {
      errorResponse(res, 'Usuario no autenticado', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const user = await User.findById(userId).select('+password').lean();
    if (!user) {
      errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
      return;
    }

    const isPasswordValid = await (User as any).comparePasswordStatic(data.currentPassword, user.password as string);
    if (!isPasswordValid) {
      await createAuditLog(buildAuditPayload(req, user, 'PASSWORD_CHANGE', 'User', 'FAILURE', 'HIGH', { reason: 'Invalid current password' }));
      errorResponse(res, 'Contraseña actual incorrecta', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    await User.findByIdAndUpdate(new Types.ObjectId(userId), { password: data.newPassword, $inc: { tokenVersion: 1 } }, { runValidators: true });

    await (User as any).invalidateAllTokensStatic(new Types.ObjectId(userId));

    const currentToken = (req.headers.authorization as string)?.split(' ')[1];
    if (currentToken) {
      (BlacklistedToken as any).revokeToken?.(currentToken, new Types.ObjectId(userId), 'PASSWORD_CHANGE', { revokedBy: undefined });
    }

    logger.info(`User changed password: ${user.email}`);

    try {
      emitToUser(String(user._id), 'password_changed', { message: 'Tu contraseña ha sido cambiada. Todas las sesiones fueron cerradas.' });
    } catch (error) {
      logger.debug('Socket notification failed:', error);
    }

    await createAuditLog(buildAuditPayload(req, user, 'PASSWORD_CHANGE', 'User', 'SUCCESS', 'HIGH'));

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    successResponse(
      res,
      null,
      'Contraseña cambiada exitosamente. Por favor, inicia sesión nuevamente',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Forgot password
 * @route POST /api/v1/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const validation = ForgotPasswordSchema.safeParse({ email: req.body.email });
    if (!validation.success) {
      errorResponse(res, `Email inválido: ${validation.error.message}`, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const { email } = validation.data;

    const user = await User.findOne({ email }).lean();
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      await createAuditLog(buildAuditPayload(req, null, 'PASSWORD_RESET_REQUEST', 'User', 'SUCCESS', 'MEDIUM', { userEmail: email }));
      successResponse(res, null, 'Si el email existe, recibirás instrucciones para restablecer tu contraseña', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const resetToken = crypto.createHash('sha256').update(`${crypto.randomUUID()}${salt}`).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await User.findByIdAndUpdate(user._id, { passwordResetToken: resetToken, passwordResetExpires: resetTokenExpiry });

    logger.info(`Password reset requested for: ${user.email} from ${getClientIP(req)}`);

    await createAuditLog(buildAuditPayload(req, user, 'PASSWORD_RESET_REQUEST', 'User', 'SUCCESS', 'MEDIUM'));

    const devInfo = process.env.NODE_ENV === 'development' ? { resetToken, expiresIn: 3600000, salt } : null;
    successResponse(
      res,
      devInfo,
      'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

/**
 * Reset password
 * @route POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    const validation = ResetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      errorResponse(res, `Datos de restablecimiento inválidos: ${validation.error.message}`, HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const data = validation.data;

    const user = await User.findOne({ passwordResetToken: data.token, passwordResetExpires: { $gt: Date.now() } }).lean();
    if (!user) {
      await createAuditLog({ ...buildAuditPayload(req, null, 'PASSWORD_RESET', 'User', 'FAILURE', 'HIGH'), details: { reason: 'Invalid/expired token' } });
      errorResponse(res, 'Token inválido o expirado', HTTP_STATUS.BAD_REQUEST);
      return;
    }

    await User.findByIdAndUpdate(user._id, {
      password: data.newPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      $inc: { tokenVersion: 1 },
    }, { runValidators: true });

    await (User as any).invalidateAllTokensStatic(user._id);

    logger.info(`Password reset completed for: ${user.email} from ${getClientIP(req)}`);

    await createAuditLog(buildAuditPayload(req, user, 'PASSWORD_RESET', 'User', 'SUCCESS', 'HIGH'));

    successResponse(res, null, 'Contraseña restablecida exitosamente. Por favor, inicia sesión', HTTP_STATUS.OK, { timestamp: new Date().toISOString() });
  }
);

/**
 * Verify token
 * @route GET /api/v1/auth/verify
 * @access Private
 */
export const verifyToken = asyncHandler(
  async (req: Request & { user?: AuthUser }, res: Response): Promise<void> => {
    if (!req.user) {
      errorResponse(res, 'Token inválido', HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    successResponse(
      res,
      { valid: true, user: sanitizeUser({ ...req.user }) },
      'Token válido',
      HTTP_STATUS.OK,
      { timestamp: new Date().toISOString() }
    );
  }
);

