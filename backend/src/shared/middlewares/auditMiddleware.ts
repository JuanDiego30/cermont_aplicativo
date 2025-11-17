import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../../domain/services/AuditService.js';
import { auditLogRepository } from '../../infra/db/repositories/AuditLogRepository.js';
import { logger } from '../utils/logger.js';
import { SYSTEM_USER_ID } from '../constants/system.js';

/**
 * ========================================
 * AUDIT MIDDLEWARE
 * ========================================
 * Middleware para registrar acciones en el sistema de auditoría.
 * Captura información de la request y registra en audit logs.
 */

/**
 * Mapeo de acciones HTTP a eventos de auditoría
 */
/**
 * Middleware de auditoría
 * Registra acciones importantes del sistema
 */
export function auditMiddleware(action: string = 'HTTP_REQUEST', entityType: string = 'system') {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Capturar información antes de procesar
    const startTime = Date.now();
    const originalJson = res.json;

    // Override res.json para capturar respuesta
    res.json = function (data) {
      // Registrar auditoría de forma asíncrona (no bloquear respuesta)
      setImmediate(async () => {
        const auditService = new AuditService(auditLogRepository);
        const duration = Date.now() - startTime;

        try {
          const entityId = req.params.id || req.params.orderId || 'system';
          
          await auditService.log({
            entityType,
            entityId,
            action: action as any,
            userId: (req as any).user?.userId || SYSTEM_USER_ID,
            ip: req.ip || req.socket?.remoteAddress || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            reason: `HTTP ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`,
          });
        } catch (err: any) {
          logger.error('Failed to log audit event', {
            error: err.message,
            action,
            entityType,
            entityId: req.params.id,
          });
        }
      });

      // Llamar al método original
      return originalJson.call(this, data);
    };

    next();
  };
}
