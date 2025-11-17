import type { IAuditLogRepository } from '../repositories/IAuditLogRepository';
import { AuditAction } from '../entities/AuditLog';
import { SYSTEM_USER_ID } from '../../shared/constants/system';

/**
 * Parámetros para crear un log de auditoría
 * @interface AuditLogParams
 */
export interface AuditLogParams {
  /** Tipo de entidad afectada (e.g., 'User', 'Order', 'WorkPlan') */
  entityType: string;
  /** ID de la entidad afectada */
  entityId: string;
  /** Acción realizada sobre la entidad */
  action: AuditAction;
  /** ID del usuario que realizó la acción */
  userId: string;
  /** Estado previo de la entidad (opcional) */
  before?: Record<string, unknown>;
  /** Estado posterior de la entidad (opcional) */
  after?: Record<string, unknown>;
  /** Dirección IP del usuario (opcional) */
  ip?: string;
  /** User-Agent del navegador/cliente (opcional) */
  userAgent?: string;
  /** Razón o comentario sobre la acción (opcional) */
  reason?: string;
}

/**
 * Interface: Servicio de Auditoría
 * Contrato para el servicio que facilita la creación de logs de auditoría
 * @interface IAuditService
 * @since 1.0.0
 */
export interface IAuditService {
  /**
   * Registra un log de auditoría genérico
   * @param {AuditLogParams} params - Parámetros del log
   * @returns {Promise<void>}
   */
  log(params: AuditLogParams): Promise<void>;

  /**
   * Registra un login exitoso
   * @param {string} userId - ID del usuario
   * @param {string} ip - Dirección IP
   * @param {string} [userAgent] - User-Agent (opcional)
   * @returns {Promise<void>}
   */
  logLogin(userId: string, ip: string, userAgent?: string): Promise<void>;

  /**
   * Registra un logout
   * @param {string} userId - ID del usuario
   * @param {string} ip - Dirección IP
   * @param {string} [userAgent] - User-Agent (opcional)
   * @returns {Promise<void>}
   */
  logLogout(userId: string, ip: string, userAgent?: string): Promise<void>;

  /**
   * Registra un intento de login fallido
   * @param {string} email - Email del intento
   * @param {string} ip - Dirección IP
   * @param {string} [userAgent] - User-Agent (opcional)
   * @param {string} [reason] - Razón del fallo (opcional)
   * @returns {Promise<void>}
   */
  logLoginFailed(email: string, ip: string, userAgent?: string, reason?: string): Promise<void>;

  /**
   * Registra una creación de entidad
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {string} userId - ID del usuario
   * @param {Record<string, unknown>} after - Estado posterior
   * @param {string} ip - Dirección IP
   * @param {string} [userAgent] - User-Agent (opcional)
   * @returns {Promise<void>}
   */
  logCreate(
    entityType: string,
    entityId: string,
    userId: string,
    after: Record<string, unknown>,
    ip: string,
    userAgent?: string,
  ): Promise<void>;

  /**
   * Registra una actualización de entidad
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {string} userId - ID del usuario
   * @param {Record<string, unknown>} before - Estado previo
   * @param {Record<string, unknown>} after - Estado posterior
   * @param {string} ip - Dirección IP
   * @param {string} [userAgent] - User-Agent (opcional)
   * @returns {Promise<void>}
   */
  logUpdate(
    entityType: string,
    entityId: string,
    userId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    ip: string,
    userAgent?: string,
  ): Promise<void>;

  /**
   * Registra una eliminación de entidad
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {string} userId - ID del usuario
   * @param {Record<string, unknown>} before - Estado previo
   * @param {string} ip - Dirección IP
   * @param {string} [userAgent] - User-Agent (opcional)
   * @param {string} [reason] - Razón de la eliminación (opcional)
   * @returns {Promise<void>}
   */
  logDelete(
    entityType: string,
    entityId: string,
    userId: string,
    before: Record<string, unknown>,
    ip: string,
    userAgent?: string,
    reason?: string,
  ): Promise<void>;

  /**
   * Registra una transición de estado
   * @param {string} entityType - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {string} userId - ID del usuario
   * @param {string} oldState - Estado anterior
   * @param {string} newState - Estado nuevo
   * @param {string} ip - Dirección IP
   * @param {string} [userAgent] - User-Agent (opcional)
   * @returns {Promise<void>}
   */
  logTransition(
    entityType: string,
    entityId: string,
    userId: string,
    oldState: string,
    newState: string,
    ip: string,
    userAgent?: string,
  ): Promise<void>;
}

/**
 * Servicio: Auditoría
 * Helper para crear logs de auditoría de forma consistente
 * Implementa fail-safe logging (errores no interrumpen operaciones principales)
 * @class AuditService
 * @implements {IAuditService}
 * @since 1.0.0
 */
export class AuditService implements IAuditService {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  /**
   * Registra una acción de auditoría genérica
   * Fail-safe: errores se loguean pero no se propagan
   * @param {AuditLogParams} params - Parámetros del log
   * @returns {Promise<void>}
   */
  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.auditLogRepository.create({
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId,
        before: params.before,
        after: params.after,
        ip: params.ip,
        userAgent: params.userAgent,
        reason: params.reason,
      });

      console.info(
        `[AuditService] 📝 Log: ${params.action} on ${params.entityType}:${params.entityId} by ${params.userId}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[AuditService] ❌ Error creating audit log: ${errorMessage}`, {
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        error,
      });

      // TODO: Considerar enviar alerta a sistema de monitoreo (e.g., Sentry)
      // No lanzar error para no interrumpir la operación principal
    }
  }

  async logLogin(userId: string, ip: string, userAgent?: string): Promise<void> {
    await this.log({
      entityType: 'User',
      entityId: userId,
      action: AuditAction.LOGIN,
      userId,
      ip,
      userAgent,
    });
  }

  async logLogout(userId: string, ip: string, userAgent?: string): Promise<void> {
    await this.log({
      entityType: 'User',
      entityId: userId,
      action: AuditAction.LOGOUT,
      userId,
      ip,
      userAgent,
    });
  }

  async logLoginFailed(
    email: string,
    ip: string,
    userAgent?: string,
    reason?: string,
  ): Promise<void> {
    await this.log({
      entityType: 'User',
      entityId: email,
      action: AuditAction.LOGIN_FAILED,
      userId: SYSTEM_USER_ID,
      ip,
      userAgent,
      reason,
    });
  }

  async logCreate(
    entityType: string,
    entityId: string,
    userId: string,
    after: Record<string, unknown>,
    ip: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action: AuditAction.CREATE,
      userId,
      after,
      ip,
      userAgent,
    });
  }

  async logUpdate(
    entityType: string,
    entityId: string,
    userId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    ip: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action: AuditAction.UPDATE,
      userId,
      before,
      after,
      ip,
      userAgent,
    });
  }

  async logDelete(
    entityType: string,
    entityId: string,
    userId: string,
    before: Record<string, unknown>,
    ip: string,
    userAgent?: string,
    reason?: string,
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action: AuditAction.DELETE,
      userId,
      before,
      ip,
      userAgent,
      reason,
    });
  }

  async logTransition(
    entityType: string,
    entityId: string,
    userId: string,
    oldState: string,
    newState: string,
    ip: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      entityType,
      entityId,
      action: AuditAction.TRANSITION,
      userId,
      before: { state: oldState },
      after: { state: newState },
      ip,
      userAgent,
    });
  }
}
