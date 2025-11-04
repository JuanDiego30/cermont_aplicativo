/**
 * RBAC Middleware - Role-Based Access Control (TypeScript - November 2025 - FIXED)
 * @description Control de acceso jerárquico para CERMONT ATG
 */

import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';

// Use centralized types
import { AuthUser, TypedRequest, Role } from '../types/index.js';
import { createAuditLog } from './auditLogger.js';

// ==================== ROLE HIERARCHY ====================

const ROLE_HIERARCHY: Record<string, number> = {
  root: 100,
  admin: 80,
  coordinator_hes: 70,
  engineer: 60,
  supervisor: 50,
  technician: 40,
  accountant: 30,
  client: 10,
};

// ==================== HELPERS ====================

const errorResponse = (
  res: Response,
  message: string,
  statusCode: number,
  additionalData?: any,
  errorCode?: string
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    ...additionalData,
  });
};

// ==================== MIDDLEWARES ====================

export const requireRole = (...allowedRoles: string[]) => {
  return (req: TypedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const errorCode = 'UNAUTHORIZED_NO_USER';
      const userAgent = req.get('User-Agent')?.substring(0, 100) || 'unknown';
      
      logger.warn('[RBAC] Unauthenticated access attempt', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        ua: userAgent,
      });

      createAuditLog({
        userId: null,
        action: 'ACCESS_DENIED',
        resource: 'RBAC',
        ip: req.ip,
        details: { 
          path: req.path, 
          method: req.method, 
          errorCode,
          description: 'Acceso sin autenticación'
        },
      }).catch(() => {});

      errorResponse(res, 'Autenticación requerida', HTTP_STATUS.UNAUTHORIZED, undefined, errorCode);
      return;
    }

    const userRole = req.user.rol;
    if (allowedRoles.includes(userRole)) {
      logger.debug('[RBAC] Role allowed', {
        userId: req.user.userId,
        role: userRole,
        path: req.path,
      });
      next();
      return;
    }

    const errorCode = 'FORBIDDEN_ROLE_MISMATCH';
    const userAgent = req.get('User-Agent')?.substring(0, 100) || 'unknown';
    
    logger.warn('[RBAC] Role mismatch', {
      userId: req.user.userId,
      userRole,
      required: allowedRoles,
      path: req.path,
      ip: req.ip,
    });

    createAuditLog({
      userId: req.user!.userId,
      action: 'ACCESS_DENIED',
      resource: 'RBAC',
      ip: req.ip,
      details: { 
        userRole, 
        required: allowedRoles, 
        errorCode,
        description: 'Rol insuficiente (exact match)'
      },
    }).catch(() => {});

    errorResponse(
      res,
      'Rol insuficiente para esta acción',
      HTTP_STATUS.FORBIDDEN,
      { required: allowedRoles },
      errorCode
    );
  };
};

export const requireMinRole = (minRole: string) => {
  return (req: TypedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Autenticación requerida', HTTP_STATUS.UNAUTHORIZED, undefined, 'UNAUTHORIZED_NO_USER');
      return;
    }

    const userRole = req.user.rol;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const minLevel = ROLE_HIERARCHY[minRole] || 0;

    if (userLevel >= minLevel) {
      logger.debug('[RBAC] Min role allowed', {
        userId: req.user.userId,
        userRole,
        userLevel,
        minRole,
        minLevel,
        path: req.path,
      });
      next();
      return;
    }

    const errorCode = 'FORBIDDEN_MIN_ROLE';
    const userAgent = req.get('User-Agent')?.substring(0, 100) || 'unknown';
    
    logger.warn('[RBAC] Min role insufficient', {
      userId: req.user.userId,
      userRole,
      userLevel,
      minRole,
      minLevel,
      path: req.path,
      ip: req.ip,
    });

    createAuditLog({
      userId: req.user.userId,
      userEmail: req.user.email || 'unknown',
      action: 'ACCESS_DENIED',
      resource: 'RBAC',
      ipAddress: req.ip,
      userAgent,
      endpoint: req.originalUrl,
      method: req.method,
      status: 'DENIED',
      severity: 'MEDIUM',
      description: 'Nivel de rol insuficiente',
      metadata: { userRole, userLevel, minRole, minLevel, errorCode },
    }).catch(() => {});

    errorResponse(
      res,
      'Nivel de rol insuficiente',
      HTTP_STATUS.FORBIDDEN,
      { minRole, yourRole: userRole },
      errorCode
    );
  };
};

// Helpers específicos
export const requireRoot = requireRole('root');
export const requireAdmin = requireMinRole('admin');
export const requireEngineer = requireMinRole('engineer');
export const requireSupervisor = requireMinRole('supervisor');
export const requireCoordinatorHes = requireMinRole('coordinator_hes');

export const requireOwnerOrAdmin = (resourceUserIdField: string = 'userId') => {
  return (req: TypedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Autenticación requerida', HTTP_STATUS.UNAUTHORIZED, undefined, 'UNAUTHORIZED_NO_USER');
      return;
    }

    const isAdmin = (ROLE_HIERARCHY[req.user.rol] || 0) >= (ROLE_HIERARCHY['admin'] || 0);

    let resourceUserId: string | undefined = 
      (req.params as any)[resourceUserIdField] ||
      (req.body as any)?.[resourceUserIdField] ||
      (req.query as any)[resourceUserIdField];

    const isOwner = resourceUserId !== undefined && 
                    req.user._id?.toString() === String(resourceUserId);

    if (isOwner || isAdmin) {
      logger.debug('[RBAC] Owner/Admin allowed', {
        userId: req.user.userId,
        isOwner,
        isAdmin,
        resourceUserId,
        path: req.path,
      });
      next();
      return;
    }

    const errorCode = 'FORBIDDEN_NOT_OWNER';
    const userAgent = req.get('User-Agent')?.substring(0, 100) || 'unknown';
    
    logger.warn('[RBAC] Not owner nor admin', {
      userId: req.user.userId,
      userRole: req.user.rol,
      resourceUserId,
      path: req.path,
      ip: req.ip,
    });

    createAuditLog({
      userId: req.user.userId,
      userEmail: req.user.email || 'unknown',
      action: 'ACCESS_DENIED',
      resource: 'RBAC',
      ipAddress: req.ip,
      userAgent,
      endpoint: req.originalUrl,
      method: req.method,
      status: 'DENIED',
      severity: 'MEDIUM',
      description: 'No propietario ni admin',
      metadata: { resourceUserId, userRole: req.user.role, errorCode },
    }).catch(() => {});

    errorResponse(
      res,
      'Acceso restringido a propietario o administrador',
      HTTP_STATUS.FORBIDDEN,
      { required: 'owner or admin' },
      errorCode
    );
  };
};

export const canModifyRole = (targetRoleField: string = 'rol') => {
  return (req: TypedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Autenticación requerida', HTTP_STATUS.UNAUTHORIZED, undefined, 'UNAUTHORIZED_NO_USER');
      return;
    }

    const targetRole = (req.body as any)?.[targetRoleField];

    if (!targetRole) {
      next();
      return;
    }

    const userRole = req.user.role;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

    if (targetRole === 'root' && userRole !== 'root') {
      const errorCode = 'FORBIDDEN_ROOT_ESCALATION';
      const userAgent = req.get('User-Agent')?.substring(0, 100) || 'unknown';
      
      logger.warn('[RBAC] Root escalation attempt', {
        userId: req.user.userId,
        userRole,
        targetRole,
        ip: req.ip,
      });

      createAuditLog({
        userId: req.user.userId,
        userEmail: req.user.email || 'unknown',
        action: 'ACCESS_DENIED',
        resource: 'RBAC',
        ipAddress: req.ip,
        userAgent,
        endpoint: req.originalUrl,
        method: req.method,
        status: 'DENIED',
        severity: 'HIGH',
        description: 'Intento de escalada a ROOT',
        metadata: { targetRole, errorCode },
      }).catch(() => {});

      errorResponse(res, 'Solo ROOT puede asignar rol ROOT', HTTP_STATUS.FORBIDDEN, undefined, errorCode);
      return;
    }

    if (userLevel < targetLevel) {
      const errorCode = 'FORBIDDEN_ROLE_ASCEND';
      const userAgent = req.get('User-Agent')?.substring(0, 100) || 'unknown';
      
      logger.warn('[RBAC] Role ascension attempt', {
        userId: req.user.userId,
        userRole,
        userLevel,
        targetRole,
        targetLevel,
        ip: req.ip,
      });

      createAuditLog({
        userId: req.user.userId,
        userEmail: req.user.email || 'unknown',
        action: 'ACCESS_DENIED',
        resource: 'RBAC',
        ipAddress: req.ip,
        userAgent,
        endpoint: req.originalUrl,
        method: req.method,
        status: 'DENIED',
        severity: 'HIGH',
        description: 'Intento de asignar rol superior',
        metadata: { userLevel, targetLevel, errorCode },
      }).catch(() => {});

      errorResponse(res, 'No puedes asignar roles superiores al tuyo', HTTP_STATUS.FORBIDDEN, undefined, errorCode);
      return;
    }

    logger.debug('[RBAC] Role modification allowed', {
      userId: req.user.userId,
      userRole,
      targetRole,
    });

    next();
  };
};

export const requirePermission = (
  permissionCheck: (req: TypedRequest) => Promise<boolean>,
  errorMessage: string = 'Permisos insuficientes'
) => {
  return async (req: TypedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      errorResponse(res, 'Autenticación requerida', HTTP_STATUS.UNAUTHORIZED, undefined, 'UNAUTHORIZED_NO_USER');
      return;
    }

    try {
      const hasPermission = await permissionCheck(req);
      if (hasPermission) {
        logger.debug('[RBAC] Custom permission granted', {
          userId: req.user.userId,
          path: req.path,
        });
        next();
        return;
      }

      const errorCode = 'FORBIDDEN_CUSTOM';
      const userAgent = req.get('User-Agent')?.substring(0, 100) || 'unknown';
      
      logger.warn('[RBAC] Custom permission denied', {
        userId: req.user.userId,
        userRole: req.user.role,
        path: req.path,
        ip: req.ip,
      });

      createAuditLog({
        userId: req.user.userId,
        userEmail: req.user.email || 'unknown',
        action: 'ACCESS_DENIED',
        resource: 'RBAC',
        ipAddress: req.ip,
        userAgent,
        endpoint: req.originalUrl,
        method: req.method,
        status: 'DENIED',
        severity: 'MEDIUM',
        description: 'Permiso personalizado denegado',
        metadata: { errorCode },
      }).catch(() => {});

      errorResponse(res, errorMessage, HTTP_STATUS.FORBIDDEN, undefined, errorCode);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown permission error';
      logger.error('[RBAC] Permission check error', { error: errMsg, userId: req.user?.userId });
      errorResponse(res, 'Error en verificación de permisos', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  };
};

// Aliases
export const requireAnyRole = requireRole;
export const authorizeRoles = (...roles: string[]) => requireRole(...roles);

export const requireAllRoles = (...roles: string[]) => {
  logger.warn('[RBAC] requireAllRoles deprecated for single-role system');
  return requireRole(...roles);
};

export default {
  requireRole,
  requireMinRole,
  requireRoot,
  requireAdmin,
  requireEngineer,
  requireSupervisor,
  requireCoordinatorHes,
  requireOwnerOrAdmin,
  canModifyRole,
  requirePermission,
  requireAnyRole,
  requireAllRoles,
  authorizeRoles,
};

