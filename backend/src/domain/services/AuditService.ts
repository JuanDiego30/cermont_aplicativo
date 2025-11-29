import type { IAuditLogRepository } from '../repositories/IAuditLogRepository.js';
import { AuditAction } from '../entities/AuditLog.js';
import { SYSTEM_USER_ID } from '../../shared/constants/system.js';
import { logger } from '../../shared/utils/logger.js';

export interface AuditLogParams {
  entityType: string;
  entityId: string;
  action: AuditAction;
  userId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
  reason?: string;
}

export class AuditService {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  /**
   * Registra un evento de auditoría.
   * Diseño "Fail-Safe": Si falla la auditoría, no interrumpe el flujo principal,
   * pero registra el error en el logger del sistema.
   */
  async log(params: AuditLogParams): Promise<void> {
    try {
      await this.auditLogRepository.create({
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        userId: params.userId,
        before: params.before ?? null,
        after: params.after ?? null,
        ip: params.ip,
        userAgent: params.userAgent,
        reason: params.reason,
      });
    } catch (error) {
      logger.error('[AuditService] Fallo crítico al registrar auditoría', {
        error: error instanceof Error ? error.message : 'Unknown',
        params,
      });
      // No re-lanzar error (Fail-Safe)
    }
  }

  // --- Helpers Semánticos ---

  async logCreate(
    entityType: string,
    entityId: string,
    userId: string,
    after: Record<string, unknown>,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    const actionKey = `CREATE_${entityType.toUpperCase()}`;
    // Intenta usar acción específica (CREATE_USER), si no existe usa genérica CREATE
    const action = Object.values(AuditAction).includes(actionKey as AuditAction)
      ? (actionKey as AuditAction)
      : AuditAction.CREATE;

    await this.log({
      entityType,
      entityId,
      action,
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
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    const actionKey = `UPDATE_${entityType.toUpperCase()}`;
    const action = Object.values(AuditAction).includes(actionKey as AuditAction)
      ? (actionKey as AuditAction)
      : AuditAction.UPDATE;

    await this.log({
      entityType,
      entityId,
      action,
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
    ip?: string,
    userAgent?: string,
    reason?: string
  ): Promise<void> {
    const actionKey = `DELETE_${entityType.toUpperCase()}`;
    const action = Object.values(AuditAction).includes(actionKey as AuditAction)
      ? (actionKey as AuditAction)
      : AuditAction.DELETE;

    await this.log({
      entityType,
      entityId,
      action,
      userId,
      before,
      ip,
      userAgent,
      reason,
    });
  }

  async logLoginFailed(
    email: string,
    ip: string,
    userAgent?: string,
    reason?: string
  ): Promise<void> {
    await this.log({
      entityType: 'User',
      entityId: email, // Usamos email porque no sabemos ID
      action: AuditAction.LOGIN_FAILED,
      userId: SYSTEM_USER_ID,
      ip,
      userAgent,
      reason,
    });
  }
}
