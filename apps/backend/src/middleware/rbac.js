/**
 * RBAC Middleware - Role-Based Access Control
 * @description Control de acceso basado en roles jerárquicos (root → admin → usuario)
 */

import { ROLES, ROLE_HIERARCHY } from '../utils/constants.js';
import { errorResponse, HTTP_STATUS } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * Verificar si el usuario tiene uno de los roles permitidos
 * @param {...string} allowedRoles - Lista de roles permitidos
 * @returns {Function} Middleware function
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Verificar que el usuario está autenticado
    if (!req.user) {
      logger.warn('Intento de acceso sin autenticación', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
      
      return errorResponse(
        res,
        'No autenticado. Por favor, inicia sesión',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const userRole = req.user.rol;

    // Verificar si el usuario tiene uno de los roles permitidos
    if (allowedRoles.includes(userRole)) {
      logger.debug(`Acceso permitido para rol: ${userRole}`, {
        userId: req.userId,
        path: req.path,
      });
      
      return next();
    }

    // Acceso denegado
    logger.warn('Acceso denegado por rol insuficiente', {
      userId: req.userId,
      userRole,
      requiredRoles: allowedRoles,
      path: req.path,
      method: req.method,
    });

    return errorResponse(
      res,
      'No tienes permisos para realizar esta acción',
      HTTP_STATUS.FORBIDDEN
    );
  };
};

/**
 * Verificar si el usuario tiene al menos el nivel de rol mínimo requerido
 * Basado en jerarquía: root > admin > coordinator_hes > engineer > supervisor > technician > accountant > client
 * @param {string} minRole - Rol mínimo requerido
 * @returns {Function} Middleware function
 */
export const requireMinRole = (minRole) => {
  return (req, res, next) => {
    // Verificar que el usuario está autenticado
    if (!req.user) {
      return errorResponse(
        res,
        'No autenticado. Por favor, inicia sesión',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.rol] || 0;
    const minRoleLevel = ROLE_HIERARCHY[minRole] || 0;

    // Verificar si el nivel del usuario es igual o superior al mínimo requerido
    if (userRoleLevel >= minRoleLevel) {
      logger.debug(`Acceso permitido - Nivel de rol: ${userRoleLevel} >= ${minRoleLevel}`, {
        userId: req.userId,
        userRole: req.user.rol,
        minRole,
      });
      
      return next();
    }

    // Acceso denegado
    logger.warn('Acceso denegado - Nivel de rol insuficiente', {
      userId: req.userId,
      userRole: req.user.rol,
      userLevel: userRoleLevel,
      requiredLevel: minRoleLevel,
      path: req.path,
    });

    return errorResponse(
      res,
      'No tienes suficientes permisos para realizar esta acción',
      HTTP_STATUS.FORBIDDEN
    );
  };
};

/**
 * Verificar si el usuario es ROOT
 * Solo el rol ROOT puede acceder
 */
export const requireRoot = requireRole(ROLES.ROOT);

/**
 * Verificar si el usuario es ADMIN o superior
 * ROOT y ADMIN pueden acceder
 */
export const requireAdmin = requireMinRole(ROLES.ADMIN);

/**
 * Verificar si el usuario es ENGINEER o superior
 * ROOT, ADMIN y ENGINEER pueden acceder
 */
export const requireEngineer = requireMinRole(ROLES.ENGINEER);

/**
 * Verificar si el usuario es SUPERVISOR o superior
 * ROOT, ADMIN, ENGINEER y SUPERVISOR pueden acceder
 */
export const requireSupervisor = requireMinRole(ROLES.SUPERVISOR);

/**
 * Verificar si el usuario es COORDINATOR_HES o superior
 * ROOT, ADMIN y COORDINATOR_HES pueden acceder
 */
export const requireCoordinatorHes = requireMinRole(ROLES.COORDINATOR_HES);

/**
 * Verificar si el usuario es propietario del recurso o tiene permisos de administrador
 * @param {string} resourceUserIdField - Campo del request que contiene el ID del propietario
 * @returns {Function} Middleware function
 */
export const requireOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    // Verificar que el usuario está autenticado
    if (!req.user) {
      return errorResponse(
        res,
        'No autenticado. Por favor, inicia sesión',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Verificar si es administrador (nivel >= admin)
    const isAdmin = ROLE_HIERARCHY[req.user.rol] >= ROLE_HIERARCHY[ROLES.ADMIN];

    // Obtener el ID del propietario del recurso desde params o body
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

    // Verificar si es el propietario
    const isOwner = resourceUserId && resourceUserId.toString() === req.user._id.toString();

    // Permitir acceso si es propietario o administrador
    if (isOwner || isAdmin) {
      logger.debug('Acceso permitido - Propietario o Admin', {
        userId: req.userId,
        isOwner,
        isAdmin,
        resourceUserId,
      });
      
      return next();
    }

    // Acceso denegado
    logger.warn('Acceso denegado - No es propietario ni admin', {
      userId: req.userId,
      userRole: req.user.rol,
      resourceUserId,
      path: req.path,
    });

    return errorResponse(
      res,
      'No tienes permisos para acceder a este recurso',
      HTTP_STATUS.FORBIDDEN
    );
  };
};

/**
 * Verificar si el usuario puede modificar el rol especificado
 * Solo ROOT puede modificar otros ROOT
 * ADMIN no puede modificar ROOT
 * @param {string} targetRoleField - Campo del request que contiene el rol objetivo
 * @returns {Function} Middleware function
 */
export const canModifyRole = (targetRoleField = 'rol') => {
  return (req, res, next) => {
    // Verificar que el usuario está autenticado
    if (!req.user) {
      return errorResponse(
        res,
        'No autenticado. Por favor, inicia sesión',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const targetRole = req.body[targetRoleField];

    // Si no se está modificando el rol, permitir continuar
    if (!targetRole) {
      return next();
    }

    // Solo ROOT puede modificar/crear otros usuarios ROOT
    if (targetRole === ROLES.ROOT && req.user.rol !== ROLES.ROOT) {
      logger.warn('Intento de crear/modificar usuario ROOT sin permisos', {
        userId: req.userId,
        userRole: req.user.rol,
        targetRole,
      });

      return errorResponse(
        res,
        'Solo usuarios ROOT pueden crear o modificar otros usuarios ROOT',
        HTTP_STATUS.FORBIDDEN
      );
    }

    // Verificar que el usuario tiene nivel suficiente para asignar el rol
    const userLevel = ROLE_HIERARCHY[req.user.rol] || 0;
    const targetLevel = ROLE_HIERARCHY[targetRole] || 0;

    if (userLevel < targetLevel) {
      logger.warn('Intento de asignar rol superior al propio', {
        userId: req.userId,
        userRole: req.user.rol,
        userLevel,
        targetRole,
        targetLevel,
      });

      return errorResponse(
        res,
        'No puedes asignar un rol superior al tuyo',
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
};

/**
 * Verificar permisos personalizados
 * @param {Function} permissionCheck - Función que retorna true si tiene permiso
 * @param {string} errorMessage - Mensaje de error personalizado
 * @returns {Function} Middleware function
 */
export const requirePermission = (permissionCheck, errorMessage = 'No tienes permisos para esta acción') => {
  return async (req, res, next) => {
    // Verificar que el usuario está autenticado
    if (!req.user) {
      return errorResponse(
        res,
        'No autenticado. Por favor, inicia sesión',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    try {
      // Ejecutar la verificación de permisos personalizada
      const hasPermission = await permissionCheck(req);

      if (hasPermission) {
        return next();
      }

      logger.warn('Acceso denegado - Verificación de permisos personalizada', {
        userId: req.userId,
        userRole: req.user.rol,
        path: req.path,
      });

      return errorResponse(res, errorMessage, HTTP_STATUS.FORBIDDEN);
    } catch (error) {
      logger.error('Error en verificación de permisos personalizada:', error);
      return errorResponse(
        res,
        'Error al verificar permisos',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  };
};

/**
 * Middleware para permitir acceso a múltiples roles con lógica OR
 * @param {...string} roles - Lista de roles permitidos
 * @returns {Function} Middleware function
 */
export const requireAnyRole = (...roles) => {
  return requireRole(...roles);
};

/**
 * Middleware para requerir TODOS los roles especificados (lógica AND)
 * Nota: En la práctica, esto casi nunca se usa ya que un usuario tiene un solo rol
 * @param {...string} roles - Lista de roles requeridos
 * @returns {Function} Middleware function
 */
export const requireAllRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(
        res,
        'No autenticado',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const hasAllRoles = roles.every(role => req.user.rol === role);

    if (hasAllRoles) {
      return next();
    }

    return errorResponse(
      res,
      'No tienes todos los roles requeridos',
      HTTP_STATUS.FORBIDDEN
    );
  };
};
