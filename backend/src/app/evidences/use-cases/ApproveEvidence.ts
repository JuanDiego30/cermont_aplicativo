import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import { Evidence, EvidenceStatus } from '../../../domain/entities/Evidence.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const APPROVAL_CONFIG = {
  MAX_COMMENT_LENGTH: 1000,
  APPROVABLE_STATUS: EvidenceStatus.PENDING,
} as const;

const ERROR_MESSAGES = {
  EVIDENCE_NOT_FOUND: (id: string) => `Evidencia con ID ${id} no encontrada`,
  INVALID_STATUS: (current: EvidenceStatus) =>
    `Solo se pueden aprobar evidencias pendientes. Estado actual: ${current}`,
  ALREADY_APPROVED: (approvedAt: Date) =>
    `La evidencia ya fue aprobada el ${approvedAt.toISOString()}`,
  MISSING_EVIDENCE_ID: 'El ID de la evidencia es requerido',
  MISSING_APPROVED_BY: 'El ID del usuario aprobador es requerido',
  INVALID_COMMENTS_TYPE: 'Los comentarios deben ser una cadena de texto',
  COMMENTS_TOO_LONG: `Los comentarios no pueden exceder ${APPROVAL_CONFIG.MAX_COMMENT_LENGTH} caracteres`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[ApproveEvidenceUseCase]',
} as const;

interface ApproveEvidenceParams {
  /** ID único de la evidencia a aprobar */
  evidenceId: string;
  /** ID del usuario que realiza la aprobación */
  approvedBy: string;
  /** Comentarios opcionales sobre la aprobación (máx. 1000 caracteres) */
  comments?: string;
  /** IP del usuario que aprueba (para auditoría) */
  ip?: string;
  /** User-Agent del usuario que aprueba (para auditoría) */
  userAgent?: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class ApproveEvidenceUseCase {
  constructor(
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(params: ApproveEvidenceParams): Promise<Evidence> {
    this.validateInputParams(params);

    const evidence = await this.fetchEvidence(params.evidenceId);
    this.validateEvidenceCanBeApproved(evidence);

    const updatedEvidence = await this.updateEvidenceToApproved(evidence.id, params);

    const auditContext = this.extractAuditContext(params);
    await this.logApprovalEvent(evidence, params.approvedBy, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Evidencia aprobada exitosamente`, {
      evidenceId: evidence.id,
      approvedBy: params.approvedBy,
      orderId: evidence.orderId,
    });

    return updatedEvidence;
  }

  private validateInputParams(params: ApproveEvidenceParams): void {
    if (!params.evidenceId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_EVIDENCE_ID);
    }

    if (!params.approvedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_APPROVED_BY);
    }

    if (params.comments !== undefined) {
      this.validateComments(params.comments);
    }
  }

  private validateComments(comments: unknown): void {
    if (typeof comments !== 'string') {
      throw new Error(ERROR_MESSAGES.INVALID_COMMENTS_TYPE);
    }

    if (comments.length > APPROVAL_CONFIG.MAX_COMMENT_LENGTH) {
      throw new Error(ERROR_MESSAGES.COMMENTS_TOO_LONG);
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

  private validateEvidenceCanBeApproved(evidence: Evidence): void {
    if (evidence.status !== APPROVAL_CONFIG.APPROVABLE_STATUS) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Estado inválido para aprobación`, {
        evidenceId: evidence.id,
        currentStatus: evidence.status,
        requiredStatus: APPROVAL_CONFIG.APPROVABLE_STATUS,
      });
      
      // Si ya está aprobada, dar mensaje específico
      if (evidence.status === EvidenceStatus.APPROVED) {
        throw new Error(ERROR_MESSAGES.ALREADY_APPROVED(evidence.approvedAt || new Date()));
      }
      
      throw new Error(ERROR_MESSAGES.INVALID_STATUS(evidence.status));
    }
  }

  private async updateEvidenceToApproved(
    evidenceId: string,
    params: ApproveEvidenceParams
  ): Promise<Evidence> {
    const approvalData = {
      status: EvidenceStatus.APPROVED,
      approvedBy: params.approvedBy,
      approvalComments: params.comments?.trim() || undefined,
      approvedAt: new Date(),
    };

    try {
      return await this.evidenceRepository.update(evidenceId, approvalData);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error actualizando evidencia`, {
        evidenceId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(params: ApproveEvidenceParams): AuditContext {
    return {
      ip: params.ip || 'unknown',
      userAgent: params.userAgent || 'unknown',
    };
  }

  private async logApprovalEvent(
    evidence: Evidence,
    approvedBy: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Evidence',
        entityId: evidence.id,
        action: AuditAction.APPROVE_EVIDENCE,
        userId: approvedBy,
        before: {
          status: evidence.status,
          approvedBy: evidence.approvedBy,
          approvedAt: evidence.approvedAt,
        },
        after: {
          status: EvidenceStatus.APPROVED,
          approvedBy,
          approvedAt: new Date(),
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: 'Evidencia aprobada manualmente',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        evidenceId: evidence.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}





