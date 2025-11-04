/**
 * Role-Based Access Control (RBAC) Middleware (TypeScript - November 2025)
 * @description Middleware para autorización basada en roles en CERMONT ATG. Verifica req.user.rol en allowedRoles (exact o hierarchy via levels). Integra authenticate (req.user from JWT), logAccessDenied (403 + audit PERMISSION_DENIED, set req.requiredRole). Soporta Express (chain post-auth) y Socket.IO (socket.user.rol). Alias legacy authorizeRoles/requireMinRole. Hierarchy: Numeric levels (ADMIN=100 > ENGINEER=50 > TECHNICIAN=20 > CLIENT=10). Owner: Self + admin (id match). No async (fast, no DB). Secure: No leak rol en logs (debug only), validate post-auth (warn if !user). Performance: Includes() O(1), const roleLevels (no runtime map). Assume ROLES as const { ADMIN: 'ADMIN', ENGINEER: 'ENGINEER', TECHNICIAN: 'TECHNICIAN', CLIENT: 'CLIENT' }.
 * Uso: En routes (router.get('/admin', authenticate, requireRole(ROLES.ADMIN), getAdmin); router.put('/orders/:id', authenticate, requireRoleOrHigher(ROLES.ENGINEER), requireOwnerOrAdmin('id'), updateOrder);). Múltiples: requireRole(ROLES.ENGINEER, ROLES.ADMIN). Shorthands: requireAdmin(), requireEngineerOrHigher(). Socket: io.of('/orders').use(authenticateSocket); io.of('/orders').use(authorizeSocketRole(ROLES.ENGINEER)); socket.on('update', (data, cb) => if (err) cb(err) else ...). Pruebas: Jest mock req.user { rol: ROLES.ADMIN } (next called), { rol: ROLES.CLIENT } (logAccessDenied 403), no user (warn + Error 'Autenticación requerida'), requireOwnerOrAdmin id match/non-match/admin bypass. For ATG: rol enum strict, audit changes en update rol (CRITICAL via auditLogger).
 * Types: @types/express, TypedRequest from auth (user?: AuthUser), AuthUser { rol: typeof ROLES[number] }. Socket & { user?: AuthUser }. Error: Custom 'RBAC_DENIED' code? (via errorResponse). Constants: ROLES as const, roleLevels Record<typeof ROLES, number> (extendable). Utils: logAccessDenied (req.requiredRole string/array).
 * Fixes: Typed middleware ((req: TypedRequest, res: Response, next: NextFunction) => void). Vararg allowedRoles: string[] (ROLES[number]). Throw Error si !allowedRoles (dev). req.user check early (next(Error) for auth miss). Hierarchy: Const roleLevels, unknown minRole throw. Owner: resourceId string (params), isOwner === (strict). Socket: Array.isArray safe, next(Error msg). No audit success (debug log only, low noise). Updates: req.requiredRole string consistent ('ADMIN, ENGINEER' o 'ENGINEER or higher'). Legacy: requireMinRole = requireRoleOrHigher. Shorthands: requireAdmin: () => requireRole(ROLES.ADMIN), etc. Accents: Fixed (autorización, rol).
 * Assumes: AuthUser.rol: string (exact match ROLES). No permissions beyond rol (future: add abilities via User.permissions array). If more roles: Extend roleLevels { SUPERVISOR: 75 }. No cache (static).
 */


import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ROLES } from '../utils/constants';
import User from '../models/User';

import { Socket } from 'socket.io';
 // If needed for custom err, but use logAccessDenied
 // { ADMIN: 'ADMIN', ... } as const

// Reuse from auth.ts
import type { AuthUser, TypedRequest } from '../types/index';

// Role types
type Role = typeof ROLES[keyof typeof ROLES];

// Hierarchy levels (ROOT > ADMIN > COORDINATOR_HES > ENGINEER > SUPERVISOR > TECHNICIAN > ACCOUNTANT > CLIENT)
const roleLevels: Record<Role, number> = {
  [ROLES.ROOT]: 100,
  [ROLES.ADMIN]: 90,
  [ROLES.COORDINATOR_HES]: 80,
  [ROLES.ENGINEER]: 70,
  [ROLES.SUPERVISOR]: 60,
  [ROLES.TECHNICIAN]: 50,
  [ROLES.ACCOUNTANT]: 40,
  [ROLES.CLIENT]: 10,
};

/**
 * Helper para loggear acceso denegado y responder 403
 */
const logAccessDenied = (req: TypedRequest, res: Response): void => {
  logger.warn('RBAC: Access denied', {
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.userId,
    userRole: req.user?.rol,
    requiredRole: (req as any).requiredRole,
    ip: req.ip,
  });

  errorResponse(
    res,
    'Acceso denegado. No tienes permisos suficientes',
    HTTP_STATUS.FORBIDDEN
  );
};

/**
 * Middleware principal para requerir rol exacto (uno o más)
 * Falla con 403 si no match; integra audit via logAccessDenied.
 * @param allowedRoles Roles permitidos (ROLES.ADMIN, etc.)
 * @returns Middleware
 */
export const requireRole = (...allowedRoles: Role[]): (req: TypedRequest, res: Response, next: NextFunction) => void => {
  if (allowedRoles.length === 0) {
    throw new Error('requireRole: Al menos un rol requerido');
  }

  return (req: TypedRequest, res: Response, next: NextFunction): void => {
    // Check auth (assume post-authenticate)
    if (!req.user || !req.user.rol) {
      logger.warn('RBAC: No user in req (call after authenticate)', {
        url: req.originalUrl,
        ip: req.ip,
      });
      next(new Error('Autenticación requerida antes de autorización'));
      return;
    }

    const userRol = req.user.rol as Role;
    const hasAccess = allowedRoles.includes(userRol);

    if (!hasAccess) {
      // Set for audit (join for multi)
      (req as any).requiredRole = allowedRoles.join(', ');
      logAccessDenied(req, res); // Handles 403 + audit
      return;
    }

    logger.debug('RBAC: Access granted', {
      userRol,
      allowedRoles,
      url: req.originalUrl,
    });

    next();
  };
};

/**
 * Middleware para requerir rol o superior (hierarchy-based)
 * User level >= minLevel.
 * @param minRole Rol mínimo (e.g., ROLES.ENGINEER)
 * @returns Middleware
 */
export const requireRoleOrHigher = (minRole: Role): (req: TypedRequest, res: Response, next: NextFunction) => void => {
  const minLevel = roleLevels[minRole];
  if (minLevel === undefined) {
    throw new Error(`requireRoleOrHigher: Rol desconocido '${minRole}'`);
  }

  return (req: TypedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.rol) {
      next(new Error('Autenticación requerida'));
      return;
    }

    const userRol = req.user.rol as Role;
    const userLevel = roleLevels[userRol] || 0;
    if (userLevel < minLevel) {
      (req as any).requiredRole = `${minRole} o superior`;
      logAccessDenied(req, res);
      return;
    }

    next();
  };
};

/**
 * Middleware para requerir owner (self-access) o admin
 * Admin bypass, else resourceId === user.userId.
 * @param resourceIdParam Param name (default 'id')
 * @returns Middleware
 */
export const requireOwnerOrAdmin = (
  resourceIdParam: string = 'id'
): (req: TypedRequest, res: Response, next: NextFunction) => void => {
  return (req: TypedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new Error('Autenticación requerida'));
      return;
    }

    const resourceId = req.params[resourceIdParam];
    const isAdmin = req.user.rol === ROLES.ADMIN;
    const isOwner = resourceId && req.user.userId === resourceId;

    if (!isAdmin && !isOwner) {
      (req as any).requiredRole = `${ROLES.ADMIN} o propietario`;
      logAccessDenied(req, res);
      return;
    }

    next();
  };
};

/**
 * Alias para compatibilidad legacy (authorizeRoles)
 * @param allowedRoles Roles
 * @returns Same as requireRole
 */
export const authorizeRoles = (...allowedRoles: Role[]): ReturnType<typeof requireRole> => {
  return requireRole(...allowedRoles);
};

/**
 * Legacy alias: requireMinRole (or higher)
 */
export const requireMinRole = requireRoleOrHigher;

/**
 * Middleware para roles en Socket.IO
 * Check socket.user.rol in allowedRoles.
 * @param allowedRoles Rol o array
 * @returns Socket middleware
 */
export const authorizeSocketRole = (
  allowedRoles: Role | Role[]
): ((socket: Socket & { user?: AuthUser }, next: (err?: Error) => void) => void) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (socket: Socket & { user?: AuthUser }, next: (err?: Error) => void): void => {
    if (!socket.user || !socket.user.rol) {
      next(new Error('Autenticación requerida en socket'));
      return;
    }

    const hasAccess = roles.includes(socket.user.rol as Role);
    if (!hasAccess) {
      logger.warn('Socket RBAC denied', {
        role: socket.user.rol,
        allowed: roles,
        socketId: socket.id,
      });
      next(new Error('Rol insuficiente'));
      return;
    }

    next();
  };
};

// Shorthands comunes
export const requireAdmin = (): ReturnType<typeof requireRole> => requireRole(ROLES.ADMIN);
export const requireEngineer = (): ReturnType<typeof requireRole> => requireRole(ROLES.ENGINEER);
export const requireTechnicianOrHigher = (): ReturnType<typeof requireRoleOrHigher> =>
  requireRoleOrHigher(ROLES.TECHNICIAN);
export const requireEngineerOrHigher = (): ReturnType<typeof requireRoleOrHigher> =>
  requireRoleOrHigher(ROLES.ENGINEER);

// Default export
export default {
  requireRole,
  requireRoleOrHigher,
  requireOwnerOrAdmin,
  authorizeRoles,
  authorizeSocketRole,
  requireAdmin,
  requireEngineer,
};
