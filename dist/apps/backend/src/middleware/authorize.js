import { logger } from '../utils/logger';
import { ROLES } from '../utils/constants';
const roleLevels = {
    [ROLES.CLIENT]: 10,
    [ROLES.TECHNICIAN]: 20,
    [ROLES.ENGINEER]: 50,
    [ROLES.ADMIN]: 100,
};
export const requireRole = (...allowedRoles) => {
    if (allowedRoles.length === 0) {
        throw new Error('requireRole: Al menos un rol requerido');
    }
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            logger.warn('RBAC: No user in req (call after authenticate)', {
                url: req.originalUrl,
                ip: req.ip,
            });
            next(new Error('Autenticación requerida antes de autorización'));
            return;
        }
        const userRol = req.user.rol;
        const hasAccess = allowedRoles.includes(userRol);
        if (!hasAccess) {
            req.requiredRole = allowedRoles.join(', ');
            logAccessDenied(req, res);
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
export const requireRoleOrHigher = (minRole) => {
    const minLevel = roleLevels[minRole];
    if (minLevel === undefined) {
        throw new Error(`requireRoleOrHigher: Rol desconocido '${minRole}'`);
    }
    return (req, res, next) => {
        if (!req.user || !req.user.rol) {
            next(new Error('Autenticación requerida'));
            return;
        }
        const userRol = req.user.rol;
        const userLevel = roleLevels[userRol] || 0;
        if (userLevel < minLevel) {
            req.requiredRole = `${minRole} o superior`;
            logAccessDenied(req, res);
            return;
        }
        next();
    };
};
export const requireOwnerOrAdmin = (resourceIdParam = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            next(new Error('Autenticación requerida'));
            return;
        }
        const resourceId = req.params[resourceIdParam];
        const isAdmin = req.user.rol === ROLES.ADMIN;
        const isOwner = resourceId && req.user.userId === resourceId;
        if (!isAdmin && !isOwner) {
            req.requiredRole = `${ROLES.ADMIN} o propietario`;
            logAccessDenied(req, res);
            return;
        }
        next();
    };
};
export const authorizeRoles = (...allowedRoles) => {
    return requireRole(...allowedRoles);
};
export const requireMinRole = requireRoleOrHigher;
export const authorizeSocketRole = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return (socket, next) => {
        if (!socket.user || !socket.user.rol) {
            next(new Error('Autenticación requerida en socket'));
            return;
        }
        const hasAccess = roles.includes(socket.user.rol);
        if (!hasAccess) {
            logger.warn('Socket RBAC denied', {
                rol: socket.user.rol,
                allowed: roles,
                socketId: socket.id,
            });
            next(new Error('Rol insuficiente'));
            return;
        }
        next();
    };
};
export const requireAdmin = () => requireRole(ROLES.ADMIN);
export const requireEngineer = () => requireRole(ROLES.ENGINEER);
export const requireTechnicianOrHigher = () => requireRoleOrHigher(ROLES.TECHNICIAN);
export const requireEngineerOrHigher = () => requireRoleOrHigher(ROLES.ENGINEER);
export default {
    requireRole,
    requireRoleOrHigher,
    requireOwnerOrAdmin,
    authorizeRoles,
    authorizeSocketRole,
    requireAdmin,
    requireEngineer,
};
//# sourceMappingURL=authorize.js.map