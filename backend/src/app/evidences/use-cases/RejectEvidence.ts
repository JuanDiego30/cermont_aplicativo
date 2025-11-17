/**
 * Use Case: Rechazar evidencia
 * Resuelve: Rechazo de evidencias con razón
 * 
 * @file backend/src/app/evidences/use-cases/RejectEvidence.ts
 */

import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository';
import { EvidenceStatus } from '../../../domain/entities/Evidence';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para rechazar evidencia
 */
export interface RejectEvidenceDto {
  evidenceId: string;
  rejectedBy: string;
  reason: string;
}

/**
 * Error de rechazo
 */
export class RejectEvidenceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'RejectEvidenceError';
  }
}

/**
 * Use Case: Rechazar Evidencia
 * @class RejectEvidence
 */
export class RejectEvidence {
  constructor(
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: RejectEvidenceDto): Promise<void> {
    try {
      this.validateDto(dto);

      // 1. Verificar que la evidencia existe
      const evidence = await this.evidenceRepository.findById(dto.evidenceId);

      if (!evidence) {
        throw new RejectEvidenceError(
          `Evidencia ${dto.evidenceId} no encontrada`,
          'EVIDENCE_NOT_FOUND',
          404
        );
      }

      // 2. Verificar que esté pendiente
      if (evidence.status !== EvidenceStatus.PENDING) {
        throw new RejectEvidenceError(
          `La evidencia ya está ${evidence.status}`,
          'INVALID_STATUS',
          400
        );
      }

      // 3. Rechazar evidencia
      await this.evidenceRepository.reject(dto.evidenceId, dto.rejectedBy, dto.reason);

      // 4. Registrar en auditoría
      await this.auditService.log({
        entityType: 'Evidence',
        entityId: dto.evidenceId,
        action: AuditAction.UPDATE,
        userId: dto.rejectedBy,
        before: { status: EvidenceStatus.PENDING },
        after: { status: EvidenceStatus.REJECTED },
        reason: dto.reason,
      });

      logger.info('[RejectEvidence] Evidencia rechazada', {
        evidenceId: dto.evidenceId,
        rejectedBy: dto.rejectedBy,
      });
    } catch (error) {
      if (error instanceof RejectEvidenceError) {
        throw error;
      }

      logger.error('[RejectEvidence] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new RejectEvidenceError(
        'Error interno al rechazar evidencia',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: RejectEvidenceDto): void {
    try {
      dto.evidenceId = ObjectIdValidator.validate(dto.evidenceId, 'ID de la evidencia');
      dto.rejectedBy = ObjectIdValidator.validate(dto.rejectedBy, 'ID del usuario');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new RejectEvidenceError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }

    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new RejectEvidenceError(
        'Debe proporcionar una razón para rechazar',
        'MISSING_REASON',
        400
      );
    }

    if (dto.reason.length < 10) {
      throw new RejectEvidenceError(
        'La razón debe tener al menos 10 caracteres',
        'REASON_TOO_SHORT',
        400
      );
    }
  }
}
