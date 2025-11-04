/**
 * Auth Service (TypeScript - November 2025 - FINAL)
 * @description Servicios de autenticación seguros CERMONT ATG
 */

import { Types } from 'mongoose';
import User, { IUser, IUserModel } from '../models/User';
import { generateTokenPair, verifyRefreshToken } from '../config/jwt';
import { logger } from '../utils/logger';
import * as crypto from 'crypto';
import { createAuditLog } from '../middleware/auditLogger';

// ==================== CONSTANTS ====================

// Define las constantes localmente (si no existen en constants.ts)
const ROLES_ARRAY = ['root', 'admin', 'coordinator_hes', 'engineer', 'supervisor', 'technician', 'accountant', 'client'] as const;
type Role = typeof ROLES_ARRAY[number];

const REFRESH_TOKEN_DAYS = 7;
const PASSWORD_RESET_HOURS = 1;
const LOCKOUT_MINUTES = 15;
const MAX_LOGIN_ATTEMPTS = 5;

// ==================== ERROR CLASS ====================

class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// ==================== INTERFACES ====================

interface Metadata {
  ip?: string;
  device?: string;
  userAgent?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: Partial<IUser>;
  tokens: TokenPair;
}

interface Session {
  device: string;
  ip: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
}

interface ResetTokenResult {
  resetToken: string;
  email: string;
  expiresAt: Date;
}

// ==================== HELPERS ====================

const validateRole = (role: string): role is Role => {
  return ROLES_ARRAY.includes(role as Role);
};

// ==================== SERVICES ====================

export const authenticateUser = async (email: string, password: string, metadata: Metadata = {}): Promise<AuthResult> => {
  try {
    if (!email || !password) {
      throw new AppError('Email y contraseña requeridos', 'INVALID_INPUT');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail })
      .select('+password +loginAttempts +lockUntil +isActive +isLocked +tokenVersion +rol')
      .lean();

    if (!user) {
      await new Promise(resolve => setTimeout(resolve, 100));
      await createAuditLog({ accion: 'LOGIN_FAIL', usuarioId: null, detalles: { email: normalizedEmail, ip: metadata.ip } } as any);
      throw new AppError('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    if (user.isLocked) {
      const lockTime = Math.ceil((user.lockUntil!.getTime() - Date.now()) / (1000 * 60));
      await createAuditLog({ accion: 'LOGIN_LOCKED', usuarioId: new Types.ObjectId(user._id), detalles: { email: user.email, ip: metadata.ip } } as any);
      throw new AppError(`Cuenta bloqueada. Intenta en ${lockTime} minutos`, 'ACCOUNT_LOCKED');
    }

    if (!user.isActive) {
      throw new AppError('Usuario inactivo', 'INACTIVE_USER');
    }

    const userDoc = await User.findById(user._id).select('+password');
    if (!userDoc) throw new AppError('Usuario no encontrado', 'USER_NOT_FOUND');

    const isPasswordValid = await userDoc.comparePassword(password);
    if (!isPasswordValid) {
      await User.incrementLoginAttempts(user._id);
      const attempts = (await User.findById(user._id).select('loginAttempts').lean())?.loginAttempts || 0;
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        await User.findByIdAndUpdate(user._id, { 
          isLocked: true, 
          lockUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) 
        });
      }
      await createAuditLog({ accion: 'LOGIN_FAIL', usuarioId: new Types.ObjectId(user._id), detalles: { email: user.email, attempts, ip: metadata.ip } } as any);
      throw new AppError('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    await User.resetLoginAttempts(user._id, metadata.ip || undefined);

    if (user.tokenVersion === undefined || user.tokenVersion === null) {
      await User.findByIdAndUpdate(user._id, { tokenVersion: 0 });
      user.tokenVersion = 0;
    }

    const payload = {
      userId: user._id.toString(),
      role: user.rol || 'client',
      tokenVersion: user.tokenVersion || 0,
    };

    if (!validateRole(payload.role)) {
      throw new AppError('Rol inválido', 'INVALID_ROLE');
    }

    const tokens = await generateTokenPair(payload, { 
      device: 'desktop',
      ip: metadata.ip || '', 
      userAgent: metadata.userAgent || '',
    });

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await User.addRefreshTokenStatic(user._id, tokens.refreshToken, refreshExpiresAt, metadata.device || undefined);

    await createAuditLog({ accion: 'LOGIN_SUCCESS', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip, device: metadata.device } } as any);

    logger.info(`Usuario autenticado: ${user.email} from ${metadata.device || 'unknown'}`);

    return {
      user: { _id: user._id, email: user.email, rol: user.rol, nombre: user.nombre },
      tokens,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error en autenticación:', { email, error: (error as Error).message });
    throw new AppError('Error interno de autenticación', 'AUTH_ERROR', (error as Error).message);
  }
};

export const refreshUserTokens = async (refreshToken: string, metadata: Metadata = {}): Promise<TokenPair> => {
  try {
    if (!refreshToken) {
      throw new AppError('Refresh token requerido', 'INVALID_INPUT');
    }

    const decoded = await verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId).select('+tokenVersion +refreshTokens +isActive +rol').lean();
    
    if (!user || !user.isActive) {
      throw new AppError('Usuario no encontrado o inactivo', 'USER_NOT_FOUND');
    }

    const hasValidToken = user.refreshTokens?.some((rt: any) => 
      rt.token === refreshToken && rt.expiresAt > new Date()
    );

    if (!hasValidToken) {
      await createAuditLog({ accion: 'REFRESH_FAIL_INVALID', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip } } as any);
      throw new AppError('Refresh token inválido o expirado', 'INVALID_REFRESH_TOKEN');
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      await createAuditLog({ accion: 'REFRESH_FAIL_OUTDATED', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip } } as any);
      throw new AppError('Token desactualizado. Inicia sesión nuevamente', 'OUTDATED_TOKEN');
    }

    await User.removeRefreshTokenStatic(user._id, refreshToken);

    const newPayload = {
      userId: user._id.toString(),
      role: user.rol || 'client',
      tokenVersion: user.tokenVersion || 0,
    };

    const newTokens = await generateTokenPair(newPayload, { 
      device: 'desktop',
      ip: metadata.ip || '', 
      userAgent: metadata.userAgent || '',
    });

    const newRefreshExpiresAt = new Date();
    newRefreshExpiresAt.setDate(newRefreshExpiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await User.addRefreshTokenStatic(user._id, newTokens.refreshToken, newRefreshExpiresAt, metadata.device || undefined);

    await createAuditLog({ accion: 'TOKEN_REFRESH', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip, device: metadata.device } } as any);

    logger.info(`Tokens renovados para: ${user.email}`);
    return newTokens;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error al renovar tokens:', { error: (error as Error).message });
    throw new AppError('Error al renovar tokens', 'REFRESH_ERROR', (error as Error).message);
  }
};

export const logoutUser = async (userId: string, refreshToken?: string, metadata: Partial<Metadata> = {}): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('UserId inválido', 'INVALID_ID');
    }

    const user = await User.findById(userId).select('+refreshTokens').lean();
    if (!user) {
      throw new AppError('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (refreshToken) {
      await User.removeRefreshTokenStatic(user._id, refreshToken);
    }

    await createAuditLog({ accion: 'LOGOUT', usuarioId: new Types.ObjectId(userId), detalles: { ip: metadata.ip || 'unknown', full: !!refreshToken } } as any);

    logger.info(`Usuario cerró sesión: ${user.email}`);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error al cerrar sesión:', { userId, error: (error as Error).message });
    throw new AppError('Error al cerrar sesión', 'LOGOUT_ERROR', (error as Error).message);
  }
};

export const logoutAllDevices = async (userId: string, metadata: Partial<Metadata> & { reason?: string } = {}): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('UserId inválido', 'INVALID_ID');
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      throw new AppError('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    await User.invalidateAllTokensStatic(user._id);

    await createAuditLog({ accion: 'LOGOUT_ALL', usuarioId: new Types.ObjectId(userId), detalles: { ip: metadata.ip || 'unknown', reason: metadata.reason } } as any);

    logger.info(`Usuario cerró todas las sesiones: ${user.email}`);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error al cerrar todas las sesiones:', { userId, error: (error as Error).message });
    throw new AppError('Error al cerrar todas las sesiones', 'LOGOUT_ALL_ERROR', (error as Error).message);
  }
};

export const getActiveSessions = async (userId: string): Promise<Session[]> => {
  try {
    if (!Types.ObjectId.isValid(userId)) return [];

    const user = await User.findById(userId).select('+refreshTokens').lean();
    if (!user) {
      throw new AppError('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    const now = new Date();
    const activeSessions: Session[] = user.refreshTokens
      ?.filter((rt: any) => rt.expiresAt > now)
      .map((rt: any) => ({
        device: rt.device || 'unknown',
        ip: rt.ip || 'unknown',
        userAgent: rt.userAgent || 'unknown',
        createdAt: rt.createdAt,
        expiresAt: rt.expiresAt,
      })) || [];

    return activeSessions;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error al obtener sesiones:', { userId, error: (error as Error).message });
    throw new AppError('Error al obtener sesiones', 'SESSIONS_ERROR', (error as Error).message);
  }
};

export const changeUserPassword = async (userId: string, currentPassword: string, newPassword: string, metadata: Partial<Metadata> = {}): Promise<boolean> => {
  try {
    if (!Types.ObjectId.isValid(userId) || !currentPassword || !newPassword) {
      throw new AppError('Parámetros requeridos', 'INVALID_INPUT');
    }

    const userDoc = await User.findById(userId).select('+password');
    if (!userDoc) {
      throw new AppError('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    const isCurrentValid = await userDoc.comparePassword(currentPassword);
    if (!isCurrentValid) {
      await createAuditLog({ accion: 'PASSWORD_CHANGE_FAIL', usuarioId: new Types.ObjectId(userId), detalles: { ip: metadata.ip } } as any);
      throw new AppError('Contraseña actual incorrecta', 'INVALID_CURRENT_PASSWORD');
    }

    const isSame = await userDoc.comparePassword(newPassword);
    if (isSame) {
      throw new AppError('La nueva contraseña debe ser diferente', 'SAME_PASSWORD');
    }

    const session = await User.startSession();
    await session.withTransaction(async () => {
      const user = await User.findById(userId).session(session);
      if (!user) throw new AppError('Usuario no encontrado en transacción', 'USER_NOT_FOUND');
      user.password = newPassword;
      await user.invalidateAllTokens();
      await user.save({ session });
    });
    await session.endSession();

    await createAuditLog({ accion: 'PASSWORD_CHANGE', usuarioId: new Types.ObjectId(userId), detalles: { ip: metadata.ip } } as any);

    logger.info(`Contraseña cambiada para: ${userDoc.email}`);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error al cambiar contraseña:', { userId, error: (error as Error).message });
    throw new AppError('Error al cambiar contraseña', 'PASSWORD_CHANGE_ERROR', (error as Error).message);
  }
};

export const generatePasswordResetToken = async (email: string, metadata: Partial<Metadata> = {}): Promise<ResetTokenResult | null> => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).lean();
    if (!user || !user.isActive) {
      await createAuditLog({ accion: 'RESET_REQUEST_FAIL', usuarioId: null, detalles: { email: normalizedEmail, ip: metadata.ip } } as any);
      return null;
    }

    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + PASSWORD_RESET_HOURS * 60 * 60 * 1000);

    await User.findOneAndUpdate(
      { _id: user._id, email: normalizedEmail },
      { passwordResetToken: resetToken, passwordResetExpires: resetTokenExpiry }
    );

    await createAuditLog({ accion: 'RESET_TOKEN_GENERATED', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip } } as any);

    logger.info(`Token de reset generado para: ${user.email}`);
    return {
      resetToken,
      email: user.email,
      expiresAt: resetTokenExpiry,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error al generar token de reset:', { email, error: (error as Error).message });
    throw new AppError('Error al generar token de reset', 'RESET_TOKEN_ERROR', (error as Error).message);
  }
};

export const resetPasswordWithToken = async (token: string, newPassword: string, metadata: Partial<Metadata> = {}): Promise<boolean> => {
  try {
    if (!token || !newPassword) {
      throw new AppError('Token y nueva contraseña requeridos', 'INVALID_INPUT');
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).lean();
    
    if (!user) {
      await createAuditLog({ accion: 'RESET_FAIL_INVALID', usuarioId: null, detalles: { ip: metadata.ip } } as any);
      throw new AppError('Token inválido o expirado', 'INVALID_RESET_TOKEN');
    }

    const session = await User.startSession();
    await session.withTransaction(async () => {
      const userDoc = await User.findOne({ _id: user._id, passwordResetToken: token }).session(session);
      if (!userDoc) throw new AppError('Token inválido en transacción', 'INVALID_RESET_TOKEN');
      userDoc.password = newPassword;
      userDoc.passwordResetToken = undefined;
      userDoc.passwordResetExpires = undefined;
      await userDoc.invalidateAllTokens();
      await userDoc.save({ session });
    });
    await session.endSession();

    await createAuditLog({ accion: 'PASSWORD_RESET', usuarioId: new Types.ObjectId(user._id), detalles: { ip: metadata.ip } } as any);

    logger.info(`Contraseña restablecida para: ${user.email}`);
    return true;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error al restablecer contraseña:', { error: (error as Error).message });
    throw new AppError('Error al restablecer contraseña', 'RESET_PASSWORD_ERROR', (error as Error).message);
  }
};

export const getActiveSessionsCount = async (userId: string): Promise<number> => {
  try {
    if (!Types.ObjectId.isValid(userId)) return 0;

    const user = await User.findById(userId).select('+refreshTokens').lean();
    if (!user) return 0;

    const now = new Date();
    return user.refreshTokens?.filter((rt: any) => rt.expiresAt > now).length || 0;
  } catch (error) {
    logger.error('Error al contar sesiones activas:', { userId, error: (error as Error).message });
    return 0;
  }
};
