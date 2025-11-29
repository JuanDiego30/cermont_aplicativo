/**
 * Use Case: Eliminar evidencia
 * Resuelve: Eliminación segura de evidencias con archivo físico
 * 
 * @file backend/src/app/evidences/use-cases/DeleteEvidence.ts
 */

import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import type { IFileStorageService } from '../../../domain/services/IFileStorageService.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import type { Evidence } from '../../../domain/entities/Evidence.js';

const VALIDATION_CONFIG = {
  MIN_REASON_LENGTH: 1,
  MAX_REASON_LENGTH: 500,
} as const;

const ERROR_MESSAGES = {
  EVIDENCE_NOT_FOUND: (id: string) => `Evidencia ${id} no encontrada`,
  MISSING_EVIDENCE_ID: 'El ID de la evidencia es requerido',
  MISSING_DELETED_BY: 'El ID del usuario es requerido',
  MISSING_REASON: 'Debe proporcionar una razón para la eliminación',
  REASON_TOO_LONG: `La razón no puede exceder ${VALIDATION_CONFIG.MAX_REASON_LENGTH} caracteres`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[DeleteEvidenceUseCase]',
} as const;

interface DeleteEvidenceInput {
  evidenceId: string;
  deletedBy: string;
  reason: string;
  ip?: string;
  userAgent?: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class DeleteEvidenceUseCase {
  constructor(
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly fileStorageService: IFileStorageService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: DeleteEvidenceInput): Promise<void> {
    this.validateInput(input);

    const evidence = await this.fetchEvidence(input.evidenceId);

    await this.deletePhysicalFile(evidence);
    await this.deleteFromDatabase(evidence.id);

    const auditContext = this.extractAuditContext(input);
    await this.logDeletionEvent(evidence, input.deletedBy, input.reason, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Evidencia eliminada exitosamente`, {
      evidenceId: evidence.id,
      deletedBy: input.deletedBy,
      orderId: evidence.orderId,
    });
  }

  private validateInput(input: DeleteEvidenceInput): void {
    if (!input.evidenceId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_EVIDENCE_ID);
    }

    if (!input.deletedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_DELETED_BY);
    }

    this.validateReason(input.reason);
  }

  private validateReason(reason: unknown): void {
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_REASON);
    }

    if (reason.length > VALIDATION_CONFIG.MAX_REASON_LENGTH) {
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

  private async deletePhysicalFile(evidence: Evidence): Promise<void> {
    if (!evidence.filePath) {
      logger.info(`${LOG_CONTEXT.USE_CASE} Sin archivo físico para eliminar`, {
        evidenceId: evidence.id,
      });
      return;
    }

    try {
      await this.fileStorageService.delete(evidence.filePath);
      logger.info(`${LOG_CONTEXT.USE_CASE} Archivo físico eliminado`, {
        evidenceId: evidence.id,
        filePath: evidence.filePath,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error eliminando archivo físico (continuando)`, {
        evidenceId: evidence.id,
        filePath: evidence.filePath,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      // No lanzamos error: permitimos eliminar el registro aunque falle el archivo
    }
  }

  private async deleteFromDatabase(evidenceId: string): Promise<void> {
    try {
      await this.evidenceRepository.delete(evidenceId);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error eliminando de BD`, {
        evidenceId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: DeleteEvidenceInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logDeletionEvent(
    evidence: Evidence,
    deletedBy: string,
    reason: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Evidence',
        entityId: evidence.id,
        action: AuditAction.DELETE_EVIDENCE,
        userId: deletedBy,
        before: {
          fileName: evidence.fileName,
          filePath: evidence.filePath,
          status: evidence.status,
          orderId: evidence.orderId,
          stage: evidence.stage,
        },
        after: null, // No hay estado después de un delete
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        evidenceId: evidence.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

