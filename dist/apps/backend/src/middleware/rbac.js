import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import { ROLES } from '../utils/constants';
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
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
                userEmail: 'anonymous',
                action: 'ACCESS_DENIED',
                resource: 'RBAC',
                ipAddress: req.ip,
                userAgent,
                endpoint: req.originalUrl,
                method: req.method,
                status: 'FAILED',
                severity: 'HIGH',
                description: 'Acceso sin autenticación',
                metadata: { errorCode },
            }).catch(() => { });
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
            description: 'Rol insuficiente (exact match)',
            metadata: { userRole, required: allowedRoles, errorCode },
        }).catch(() => { });
        errorResponse(res, 'Rol insuficiente para esta acción', HTTP_STATUS.FORBIDDEN, { required: allowedRoles }, errorCode);
    };
};
export const requireMinRole = (minRole) => {
    return (req, res, next) => {
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
        }).catch(() => { });
        errorResponse(res, 'Nivel de rol insuficiente', HTTP_STATUS.FORBIDDEN, { minRole, yourRole: userRole }, errorCode);
    };
};
export const requireRoot = requireRole(ROLES.ROOT);
export const requireAdmin = requireMinRole(ROLES.ADMIN);
export const requireEngineer = requireMinRole(ROLES.ENGINEER);
export const requireSupervisor = requireMinRole(ROLES.SUPERVISOR);
export const requireCoordinatorHes = requireMinRole(ROLES.COORDINATOR_HES);
export const requireOwnerOrAdmin = (resourceUserIdField = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            errorResponse(res, 'Autenticación requerida', HTTP_STATUS.UNAUTHORIZED, undefined, 'UNAUTHORIZED_NO_USER');
            return;
        }
        const isAdmin = (ROLE_HIERARCHY[req.user.rol] || 0) >= (ROLE_HIERARCHY[ROLES.ADMIN] || 0);
        let resourceUserId = req.params[resourceUserIdField] ||
            req.body[resourceUserIdField] ||
            req.query[resourceUserIdField];
        const isOwner = resourceUserId && req.user._id?.toString() === resourceUserId.toString();
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
            metadata: { resourceUserId, userRole: req.user.rol, errorCode },
        }).catch(() => { });
        errorResponse(res, 'Acceso restringido a propietario o administrador', HTTP_STATUS.FORBIDDEN, { required: 'owner or admin' }, errorCode);
    };
};
export const canModifyRole = (targetRoleField = 'rol') => {
    return (req, res, next) => {
        if (!req.user) {
            errorResponse(res, 'Autenticación requerida', HTTP_STATUS.UNAUTHORIZED, undefined, 'UNAUTHORIZED_NO_USER');
            return;
        }
        const targetRole = req.body?.[targetRoleField];
        if (!targetRole) {
            next();
            return;
        }
        const userRole = req.user.rol;
        const userLevel = ROLE_HIERARCHY[userRole] || 0;
        const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
        if (targetRole === ROLES.ROOT && userRole !== ROLES.ROOT) {
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
            }).catch(() => { });
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
            }).catch(() => { });
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
export const requirePermission = (permissionCheck, errorMessage = 'Permisos insuficientes') => {
    return async (req, res, next) => {
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
                userRole: req.user.rol,
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
            }).catch(() => { });
            errorResponse(res, errorMessage, HTTP_STATUS.FORBIDDEN, undefined, errorCode);
            return;
        }
        catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown permission error';
            logger.error('[RBAC] Permission check error', { error: errMsg, userId: req.user?.userId });
            errorResponse(res, 'Error en verificación de permisos', HTTP_STATUS.INTERNAL_SERVER_ERROR);
        }
    };
};
export const requireAnyRole = requireRole;
export const requireAllRoles = (...roles) => {
    logger.warn('[RBAC] requireAllRoles deprecated for single-role system');
    return requireRole(...roles);
};
export const authorizeRoles = (...roles) => requireRole(...roles);
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
};
//# sourceMappingURL=rbac.js.map