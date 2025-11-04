/**
 * Auth Middleware (TypeScript - November 2025)
 * @description Verificación de tokens JWT (access/refresh) con rotación, blacklist, y carga de usuario en CERMONT ATG. Soporta Express (req.user) y Socket.IO (socket.user). Integra User model (activo/rol), BlacklistedToken (isBlacklisted async), audit (createAuditLog para success/fail/expired/inactive/revoked). Usa lean() perf, sanitizeUserData (omit password/refreshToken/tokens). Token extract: Bearer > cookie (secure HttpOnly in prod). Errors: 401 UNAUTHORIZED (no token/invalid/expired/revoked), 403 FORBIDDEN (inactive), 500 internal. OptionalAuth: Skip errors, attach if valid. Socket: auth.token/headers.authorization lowercase, next(err). Secure: Validate ObjectId strict (regex), no leak sensibles, rate-limit login elsewhere. Performance: Sequential verify+find+blacklist (fast indexes), no parallel/cache (lean sufficient). Assume verifyAccessToken throws TokenExpiredError/JsonWebTokenError.
 * Uso: Routes (router.use('/private', authenticate); router.get('/public', optionalAuth, handle);). Socket: io.use(authenticateSocket); socket.on('join', (data, cb) => if (socket.user) ... else cb('Unauthorized');). Login: res.cookie('accessToken', accessToken, {httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'strict'}); Logout: Blacklist access+refresh. Pruebas: Jest mock verifyAccessToken (valid/invalid/expired), mock User.findById.lean (active/inactive/null select('-password')), mock BlacklistedToken.isBlacklisted (true/false), expect(req.user).toEqual({userId:'id', email:'test', rol:ROLES.ENGINEER}), expect(errorResponse).res.status(401), audit calls (SUCCESS/FAILURE low/medium/high). For ATG: rol enum check en rbac, userId string consistent (_id.toString()).
 * Types: @types/express@4.18.x (Request/Response/NextFunction), @types/jsonwebtoken@9.x, @types/cookie-parser@1.4.x, @types/socket.io@3.x (Socket). AuthUser {userId:string, email:string, rol:ROLES[number], nombre?:string, ...} sanitized. TypedRequest = Request & {user?:AuthUser; cookies?:Record<string,string>; pagination?:{page:number;limit:number;skip:number;totalPages:number;}}. IUserLean {_id:ObjectId, email:string, rol:string, activo:boolean, ...} exclude password. Constants: AUDIT_ACTIONS extend 'AUTH_REQUIRED'|'TOKEN_BLACKLISTED'|'USER_INACTIVE_ACCESS'|'AUTH_ERROR'|'LOGIN_SUCCESS'|'AUTH_FAILED'. Utils: sanitizeUserData inline (omit _id/password/refreshToken, userId:_id?.toString()), logLoginFailed=audit wrapper, getToken(req). BlacklistedToken static isBlacklisted(token:string):Promise<boolean> = await findOne({token, expires:{$gt:Date.now()}}).
 * Fixes: Imports (NextFunction/express types, createAuditLog/auditLogger), TypedRequest extend Request (ip/originalUrl/get/headers.authorization/cookies), AuthUser _id?:string (TS18048/2339), ROLES as const union (TS2537), Response cast/loose (TS2345), sanitizeUserData/logLoginFailed impl (TS2304), audit actions strings, optional chaining req.user?. (strictNullChecks), socket headers lowercase/auth.token. Updates: getToken DRY, audit severity/Partial details, validateObjectId used, no AppError (direct). Assume User schema: {_id:ObjectId, email:string unique, rol:ROLES, activo:bool default true, index:{email:1, activo:1, _id:1}}. BlacklistedToken: {token:string unique, userId:ObjectId, expires:Date, type:'access'|'refresh'}, index:{token:1, expires:1} TTL expires+1d. Cookie-parser middleware before auth (req.cookies).
 * Model Assumes: User: {_id, email, rol, activo, nombre?, telefono?, cargo?} exclude password/refreshToken en select. No Redis cache (lean fast <1ms).
 */

import { Request, Response, NextFunction } from 'express';
import type { ParamsDictionary, ParsedQs } from 'express-serve-static-core';
import { Socket } from 'socket.io';
import { Types } from 'mongoose';
import { HTTP_STATUS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken } from '../config/jwt.js';
import BlacklistedToken from '../models/BlacklistedToken.js';
import User from '../models/User.js';
import { createAuditLog } from '../middleware/auditLogger.js';

// Use centralized types
import { AuthUser, TypedRequest, AuditAction, Role } from '../types/index.js';

// IUserLean (query result)
interface IUserLean {
  _id: Types.ObjectId;
  email: string;
  rol: string;
  activo: boolean;
  nombre?: string;
  telefono?: string;
  cargo?: string;
  // Exclude: password, refreshToken
}

/**
 * Sanitize user data (inline DRY, omit sensibles)
 */
const sanitizeUserData = (user: IUserLean): Partial<AuthUser> => {
  const { _id, email, rol, nombre, telefono, cargo, activo } = user;
  const clean: Partial<AuthUser> = {
    userId: _id.toString(),
    _id: _id.toString(),
    email,
    rol,
    nombre,
    telefono,
    cargo,
  };
  // Activo implicit (checked prior)
  return clean;
};

/**
 * Log failed login/audit wrapper
 */
const logLoginFailed = async (
  userId: string | null,
  ip: string,
  ua: string,
  reason: string
): Promise<void> => {
  await createAuditLog({
    userId,
    action: 'AUTH_FAILED' as AuditAction,
    resource: 'Auth',
    ip,
    details: { reason },
  });
};

/**
 * Extract token (DRY)
 */
const getToken = (req: TypedRequest): string | null => {
  const authHeader = req.headers.authorization; // lowercase
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return req.cookies?.accessToken || null;
};

/**
 * Validate ObjectId hex
 */
const validateObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

/**
 * Middleware de autenticación principal (requerida)
 * @param req TypedRequest
 * @param res Response
 * @param next NextFunction
 */
export const authenticate = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getToken(req);
    if (!token) {
  await createAuditLog({
    userId: null,
    action: 'AUTH_REQUIRED' as AuditAction,
    resource: 'Auth',
    ip: req.ip || 'unknown',
    details: { method: req.method, url: req.originalUrl },
  });
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Autenticación requerida. Token no proporcionado',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    // Blacklist check
    const isBlacklisted = await BlacklistedToken.isBlacklisted(token);
    if (isBlacklisted) {
      await createAuditLog({
        userId: null,
        action: 'TOKEN_BLACKLISTED' as AuditAction,
        resource: 'Auth',
        ip: req.ip || 'unknown',
        details: { url: req.originalUrl },
      });
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token revocado. Inicia sesión nuevamente',
        code: 'TOKEN_BLACKLISTED',
      });
      return;
    }

    // Verify JWT
    const decoded = await verifyAccessToken(token);

    // Validate userId
    if (!validateObjectId(decoded.userId)) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token inválido: ID de usuario malformado',
      });
      return;
    }

    // Find user lean
    const user = await User.findById(decoded.userId)
      .select('-password -refreshToken')
      .lean() as IUserLean | null;

    if (!user) {
      await logLoginFailed(null, req.ip || 'unknown', req.get('User-Agent') || 'unknown', 'Usuario no encontrado');
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Usuario no encontrado',
      });
      return;
    }

    // Active check
    if (!user.activo) {
      await createAuditLog({
        userId: decoded.userId,
        action: 'USER_INACTIVE_ACCESS' as AuditAction,
        resource: 'Auth',
        ip: req.ip || 'unknown',
        details: { email: user.email },
      });
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'Usuario inactivo. Contacta al administrador',
      });
      return;
    }

    // Sanitize and attach
    const sanitizedUser = sanitizeUserData(user);
    req.user = {
      userId: sanitizedUser.userId || decoded.userId,
      email: sanitizedUser.email || user.email,
      nombre: user.nombre || '',
      rol: user.rol as Role,
      active: user.activo,
      cedula: user.cedula,
      telefono: user.telefono,
      cargo: user.cargo,
      especialidad: user.especialidad,
      createdAt: new Date(),
    };

    // Audit success
    await createAuditLog({
      userId: req.user!.userId,
      action: 'LOGIN_SUCCESS' as AuditAction,
      resource: 'Auth',
      ip: req.ip || 'unknown',
      details: { email: req.user!.email, url: req.originalUrl },
    });

    next();
  } catch (error) {
    logger.error('Error en autenticación:', {
      error: (error as Error).message,
      ip: req.ip,
      ua: req.get('User-Agent'),
      url: req.originalUrl,
    });

    // JWT specific
    if ((error as any).name === 'TokenExpiredError' || (error as Error).message.includes('expired')) {
      await logLoginFailed(null, req.ip || 'unknown', req.get('User-Agent') || 'unknown', 'Token expirado');
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Sesión expirada. Inicia sesión nuevamente',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    if (
      (error as any).name === 'JsonWebTokenError' ||
      (error as Error).message.includes('invalid') ||
      (error as Error).message.includes('malformed')
    ) {
      await logLoginFailed(null, req.ip || 'unknown', req.get('User-Agent') || 'unknown', 'Token inválido');
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    // General error
    await createAuditLog({
      userId: null,
      action: 'AUTH_ERROR' as AuditAction,
      resource: 'Auth',
      ip: req.ip || 'unknown',
      details: { error: (error as Error).message },
    });

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno de autenticación',
    });
  }
};

/**
 * Autenticación opcional
 * No falla sin token; adjunta si válido/activo.
 */
export const optionalAuth = async (
  req: TypedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getToken(req);
    if (!token) {
      next(); // Anonymous
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
      .lean() as IUserLean | null;

    if (user?.activo) {
      const sanitizedUser = sanitizeUserData(user);
      req.user = {
        ...sanitizedUser,
        userId: sanitizedUser.userId || decoded.userId,
        rol: user.rol,
      };
    }

    next();
  } catch (error) {
    logger.debug('Optional auth skipped due to error:', {
      error: (error as Error).message,
      ip: req.ip,
    });
    next(); // Continue unauthenticated
  }
};

/**
 * Alias para authenticate
 */
export const requireAuth = authenticate;

/**
 * Middleware para Socket.IO autenticación
 * Adjunta user a socket; errors via next(err)
 */
export const authenticateSocket = async (
  socket: Socket & { user?: AuthUser; userId?: string; rol?: string },
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization as string)?.startsWith('Bearer ')
        ? (socket.handshake.headers.authorization as string).split(' ')[1]
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
      .lean() as IUserLean | null;

    if (!user || !user.activo) {
      logger.warn('Socket auth: Invalid/inactive user', {
        userId: decoded.userId,
        socketId: socket.id,
      });
      next(new Error('Usuario inválido o inactivo'));
      return;
    }

    // Attach sanitized
    const sanitizedUser = sanitizeUserData(user);
    socket.user = {
      ...sanitizedUser,
      userId: sanitizedUser.userId || decoded.userId,
      rol: user.rol,
    };
    socket.userId = socket.user.userId;
    socket.rol = socket.user.rol;

    logger.debug('Socket authenticated:', { userId: socket.userId, socketId: socket.id });

    next();
  } catch (error) {
    logger.error('Socket auth error:', {
      error: (error as Error).message,
      socketId: socket.id,
      ip: socket.handshake.address,
    });
    next(new Error(`Error de autenticación: ${(error as Error).message}`));
  }
};

export default {
  authenticate,
  optionalAuth,
  requireAuth,
  authenticateSocket,
};
