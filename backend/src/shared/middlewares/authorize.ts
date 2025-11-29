import { Request, Response, NextFunction } from 'express';
import { Permission, ROLE_PERMISSIONS, hasAnyPermission, hasAllPermissions } from '../constants/permissions.js';
import { logger } from '../utils/logger.js';

/**
 * ========================================
 * AUTHORIZATION MIDDLEWARE
 * ========================================
 * Middleware de autorizaci�n basado en permisos (PBAC - Permission-Based Access Control).
 * Verifica si el usuario autenticado tiene los permisos necesarios para acceder al recurso.
 * 
 * **Requisitos:**
 * - Usuario debe estar autenticado (usa middleware `authenticate` primero)
 * - Usuario debe tener al menos uno de los permisos requeridos (OR logic por defecto)
 * 
 * @see ROLE_PERMISSIONS para mapeo de roles a permisos
 */

/**
 * Middleware de autorizaci�n con l�gica OR
 * Verifica si el usuario tiene AL MENOS UNO de los permisos requeridos.
 *
 * @param requiredPermissions - Lista de permisos requeridos (OR logic)
 * @returns Middleware de Express
 * 
 * @example
 * ```typescript
 * import { authorize } from './middlewares/authorize.js';
 * import { PERMISSIONS } from './constants/permissions.js';
 * 
 * // Usuario debe tener ORDERS_VIEW O ORDERS_VIEW_ALL O ORDERS_VIEW_OWN
 * router.get('/orders', 
 *   authenticate,
 *   authorize([PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_VIEW_ALL, PERMISSIONS.ORDERS_VIEW_OWN]),
 *   ordersController.list
 * );
 * ```
 */
export function authorize(requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Verificar que el usuario est� autenticado
      if (!req.user || !req.user.role) {
        logger.warn('Authorization failed: User not authenticated', {
          path: req.path,
          method: req.method,
          ip: req.ip,
        });

        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      const userRole = req.user.role.toLowerCase() as keyof typeof ROLE_PERMISSIONS;

      // Obtener permisos del rol del usuario
      const userPermissions = ROLE_PERMISSIONS[userRole];

      if (!userPermissions) {
        logger.error('Authorization failed: Invalid role', {
          role: userRole,
          userId: req.user.userId,
          path: req.path,
        });

        res.status(403).json({
          type: 'https://httpstatuses.com/403',
          title: 'Forbidden',
          status: 403,
          detail: 'Rol no v�lido',
        });
        return;
      }

      // Verificar si el usuario tiene al menos uno de los permisos requeridos (OR logic)
      const hasPermission = hasAnyPermission(userRole, requiredPermissions);

      if (!hasPermission) {
        logger.warn('Authorization failed: Insufficient permissions', {
          userId: req.user.userId,
          role: userRole,
          required: requiredPermissions,
          path: req.path,
          method: req.method,
        });

        res.status(403).json({
          type: 'https://httpstatuses.com/403',
          title: 'Forbidden',
          status: 403,
          detail: 'No tienes permisos para realizar esta acci�n',
        });
        return;
      }

      // Usuario autorizado, continuar
      logger.debug('Authorization successful', {
        userId: req.user.userId,
        role: userRole,
        path: req.path,
      });

      next();
    } catch (error: any) {
      logger.error('Authorization error', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.userId,
        path: req.path,
      });

      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  };
}

/**
 * Middleware de autorizaci�n con l�gica AND
 * Verifica si el usuario tiene TODOS los permisos requeridos.
 *
 * @param requiredPermissions - Lista de permisos requeridos (AND logic)
 * @returns Middleware de Express
 * 
 * @example
 * ```typescript
 * // Usuario debe tener USERS_VIEW Y USERS_UPDATE
 * router.put('/users/:id',
 *   authenticate,
 *   authorizeAll([PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_UPDATE]),
 *   usersController.update
 * );
 * ``` 
 */
export function authorizeAll(requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user || !req.user.role) {
        logger.warn('Authorization (ALL) failed: User not authenticated', {
          path: req.path,
          method: req.method,
        });

        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      const userRole = req.user.role.toUpperCase() as keyof typeof ROLE_PERMISSIONS;
      const userPermissions = ROLE_PERMISSIONS[userRole];

      if (!userPermissions) {
        logger.error('Authorization (ALL) failed: Invalid role', {
          role: userRole,
          userId: req.user.userId,
        });

        res.status(403).json({
          type: 'https://httpstatuses.com/403',
          title: 'Forbidden',
          status: 403,
          detail: 'Rol no v�lido',
        });
        return;
      }

      // Verificar si el usuario tiene TODOS los permisos requeridos (AND logic)
      const hasAllPerms = hasAllPermissions(userRole, requiredPermissions);

      if (!hasAllPerms) {
        logger.warn('Authorization (ALL) failed: Missing required permissions', {
          userId: req.user.userId,
          role: userRole,
          required: requiredPermissions,
          path: req.path,
        });

        res.status(403).json({
          type: 'https://httpstatuses.com/403',
          title: 'Forbidden',
          status: 403,
          detail: 'No tienes todos los permisos necesarios',
        });
        return;
      }

      next();
    } catch (error: any) {
      logger.error('Authorization (ALL) error', {
        error: error.message,
        userId: req.user?.userId,
      });

      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  };
}

/**
 * Middleware para autorizar solo al propietario del recurso
 * Verifica que el userId del recurso coincida con el userId autenticado
 *
 * @param getUserIdFromResource - Funci�n que extrae el userId del recurso
 * @returns Middleware de Express
 * 
 * @example
 * ```typescript
 * // Solo el usuario due�o puede acceder
 * router.get('/profile/:id',
 *   authenticate,
 *   authorizeOwner((req) => req.params.id),
 *   usersController.getProfile
 * );
 * ```
 */
export function authorizeOwner(getUserIdFromResource: (req: Request) => string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      const resourceUserId = getUserIdFromResource(req);

      if (req.user.userId !== resourceUserId) {
        logger.warn('Authorization (Owner) failed: User is not owner', {
          userId: req.user.userId,
          resourceUserId,
          path: req.path,
        });

        res.status(403).json({
          type: 'https://httpstatuses.com/403',
          title: 'Forbidden',
          status: 403,
          detail: 'No tienes permiso para acceder a este recurso',
        });
        return;
      }

      next();
    } catch (error: any) {
      logger.error('Authorization (Owner) error', {
        error: error.message,
        userId: req.user?.userId,
      });

      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: 'Error interno del servidor',
      });
    }
  };
}
