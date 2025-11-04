/**
 * Audit Middleware
 * @description Middleware para auditoría de acciones sensibles
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import { logger } from '../utils/logger.js';

export interface AuditLogEntry {
  timestamp: Date;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  method: string;
  path: string;
  statusCode?: number;
  changes?: Record<string, any>;
}

/**
 * Middleware para auditar acciones
 * @param action Tipo de acción (CREATE, UPDATE, DELETE, etc)
 * @param resource Recurso afectado (User, Order, etc)
 */
export const auditLogger = (action: string, resource: string) => {
  return async (
    req: AuthRequest | Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auditLog: AuditLogEntry = {
        timestamp: new Date(),
        userId: (req as AuthRequest).user?.userId,
        action,
        resource,
        ip: req.ip || 'unknown',
        method: req.method,
        path: req.path,
      };

      // Capturar cambios en el body
      if (req.body && ['CREATE', 'UPDATE', 'PATCH'].includes(action)) {
        auditLog.changes = req.body;
      }

      // Capturar ID del recurso
      if (req.params.id) {
        auditLog.resourceId = req.params.id;
      }

      // Log a nivel INFO
      logger.info(`[AUDIT] ${action} on ${resource}`, auditLog);

      next();
    } catch (error) {
      logger.error('Audit logger error:', error);
      next();
    }
  };
};

/**
 * Log de error crítico (fallido login, violación de seguridad, etc)
 */
export const auditLogError = (
  action: string,
  resource: string,
  severity: 'WARNING' | 'ERROR' | 'CRITICAL' = 'ERROR'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const logEntry: AuditLogEntry = {
      timestamp: new Date(),
      userId: (req as AuthRequest).user?.userId,
      action,
      resource,
      ip: req.ip || 'unknown',
      method: req.method,
      path: req.path,
    };

    if (severity === 'CRITICAL') {
      logger.error(`[AUDIT-${severity}] ${action} on ${resource}`, logEntry);
    } else {
      logger.warn(`[AUDIT-${severity}] ${action} on ${resource}`, logEntry);
    }

    next();
  };
};