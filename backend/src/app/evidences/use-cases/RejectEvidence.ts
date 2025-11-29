/**
 * Use Case: Rechazar evidencia
 * Resuelve: Rechazo de evidencias con razón detallada
 * 
 * @file backend/src/app/evidences/use-cases/RejectEvidence.ts
 */

import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import { Evidence, EvidenceStatus } from '../../../domain/entities/Evidence.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const REJECTION_CONFIG = {
  MIN_REASON_LENGTH: 10,
  MAX_REASON_LENGTH: 1000,
  REJECTABLE_STATUS: EvidenceStatus.PENDING,
} as const;

const ERROR_MESSAGES = {
  EVIDENCE_NOT_FOUND: (id: string) => `Evidencia ${id} no encontrada`,
  INVALID_STATUS: (current: EvidenceStatus) =>
    `Solo se pueden rechazar evidencias pendientes. Estado actual: ${current}`,
  ALREADY_REJECTED: (rejectedAt: Date) =>
    `La evidencia ya fue rechazada el ${rejectedAt.toISOString()}`,
  MISSING_EVIDENCE_ID: 'El ID de la evidencia es requerido',
  MISSING_REJECTED_BY: 'El ID del usuario es requerido',
  MISSING_REASON: 'Debe proporcionar una razón para el rechazo',
  REASON_TOO_SHORT: `La razón debe tener al menos ${REJECTION_CONFIG.MIN_REASON_LENGTH} caracteres`,
  REASON_TOO_LONG: `La razón no puede exceder ${REJECTION_CONFIG.MAX_REASON_LENGTH} caracteres`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[RejectEvidenceUseCase]',
} as const;

interface RejectEvidenceInput {
  evidenceId: string;
  rejectedBy: string;
  reason: string;
  ip?: string;
  userAgent?: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class RejectEvidenceUseCase {
  constructor(
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: RejectEvidenceInput): Promise<Evidence> {
    this.validateInput(input);

    const evidence = await this.fetchEvidence(input.evidenceId);
    this.validateEvidenceCanBeRejected(evidence);

    const updatedEvidence = await this.updateEvidenceToRejected(evidence.id, input);

    const auditContext = this.extractAuditContext(input);
    await this.logRejectionEvent(evidence, input.rejectedBy, input.reason, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Evidencia rechazada exitosamente`, {
      evidenceId: evidence.id,
      rejectedBy: input.rejectedBy,
      orderId: evidence.orderId,
    });

    return updatedEvidence;
  }

  private validateInput(input: RejectEvidenceInput): void {
    if (!input.evidenceId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_EVIDENCE_ID);
    }

    if (!input.rejectedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_REJECTED_BY);
    }

    this.validateReason(input.reason);
  }

  private validateReason(reason: unknown): void {
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_REASON);
    }

    const trimmedLength = reason.trim().length;

    if (trimmedLength < REJECTION_CONFIG.MIN_REASON_LENGTH) {
      throw new Error(ERROR_MESSAGES.REASON_TOO_SHORT);
    }

    if (trimmedLength > REJECTION_CONFIG.MAX_REASON_LENGTH) {
      throw new Error(ERROR_MESSAGES.REASON_TOO_LONG);
    }
  }

  private async fetchEvidence(evidenceId: string): Promise<Evidence> {
    const evidence = await this.evidenceRepository.findById(evidenceId);

    if (!evidence) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Evidencia no encontrada`, { evidenceId });
      throw new Error(ERROR_MESSAGES.EVIDENCE_NOT_FOUND(evidenceId));
    }

    return evidence;
  }

  private validateEvidenceCanBeRejected(evidence: Evidence): void {
    if (evidence.status !== REJECTION_CONFIG.REJECTABLE_STATUS) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Estado inválido para rechazo`, {
        evidenceId: evidence.id,
        currentStatus: evidence.status,
        requiredStatus: REJECTION_CONFIG.REJECTABLE_STATUS,
      });
      
      // Si ya está rechazada, dar mensaje específico
      if (evidence.status === EvidenceStatus.REJECTED) {
        throw new Error(ERROR_MESSAGES.ALREADY_REJECTED(evidence.rejectedAt || new Date()));
      }
      
      throw new Error(ERROR_MESSAGES.INVALID_STATUS(evidence.status));
    }
  }

  private async updateEvidenceToRejected(
    evidenceId: string,
    input: RejectEvidenceInput
  ): Promise<Evidence> {
    const rejectionData = {
      status: EvidenceStatus.REJECTED,
      rejectedBy: input.rejectedBy,
      rejectionReason: input.reason.trim(),
      rejectedAt: new Date(),
    };

    try {
      return await this.evidenceRepository.update(evidenceId, rejectionData);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error actualizando evidencia`, {
        evidenceId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: RejectEvidenceInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logRejectionEvent(
    evidence: Evidence,
    rejectedBy: string,
    reason: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Evidence',
        entityId: evidence.id,
        action: AuditAction.REJECT_EVIDENCE,
        userId: rejectedBy,
        before: {
          status: evidence.status,
          approvedBy: evidence.approvedBy,
          approvedAt: evidence.approvedAt,
          rejectedBy: evidence.rejectedBy,
          rejectedAt: evidence.rejectedAt,
        },
        after: {
          status: EvidenceStatus.REJECTED,
          rejectedBy,
          rejectedAt: new Date(),
          rejectionReason: reason,
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: `Evidencia rechazada: ${reason}`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        evidenceId: evidence.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

