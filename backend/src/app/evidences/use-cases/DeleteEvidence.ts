/**
 * Use Case: Eliminar evidencia
 * Resuelve: Eliminaci�n segura de evidencias con archivo
 * 
 * @file backend/src/app/evidences/use-cases/DeleteEvidence.ts
 */

import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository';
import { fileStorageService } from '../../../infra/services/FileStorageService';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para eliminar evidencia
 */
export interface DeleteEvidenceDto {
  evidenceId: string;
  deletedBy: string;
  reason: string;
}

/**
 * Error de eliminaci�n
 */
export class DeleteEvidenceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'DeleteEvidenceError';
  }
}

/**
 * Use Case: Eliminar Evidencia
 * @class DeleteEvidence
 */
export class DeleteEvidence {
  constructor(
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: DeleteEvidenceDto): Promise<void> {
    try {
      this.validateDto(dto);

      // 1. Verificar que la evidencia existe
      const evidence = await this.evidenceRepository.findById(dto.evidenceId);

      if (!evidence) {
        throw new DeleteEvidenceError(
          `Evidencia ${dto.evidenceId} no encontrada`,
          'EVIDENCE_NOT_FOUND',
          404
        );
      }

      // 2. Eliminar archivo f�sico
      if (evidence.filePath) {
        try {
          await fileStorageService.delete(evidence.filePath);
          logger.info('[DeleteEvidence] Archivo eliminado', {
            filePath: evidence.filePath,
          });
        } catch (error) {
          logger.warn('[DeleteEvidence] Error eliminando archivo f�sico', {
            filePath: evidence.filePath,
            error: error instanceof Error ? error.message : 'Unknown',
          });
        }
      }

      // 3. Eliminar evidencia de BD
      await this.evidenceRepository.delete(dto.evidenceId);

      // 4. Registrar en auditor�a
      await this.auditService.log({
        entityType: 'Evidence',
        entityId: dto.evidenceId,
        action: AuditAction.DELETE,
        userId: dto.deletedBy,
        before: evidence,
        after: {} as Record<string, unknown>,
        reason: dto.reason,
      });

      logger.info('[DeleteEvidence] Evidencia eliminada', {
        evidenceId: dto.evidenceId,
        deletedBy: dto.deletedBy,
      });
    } catch (error) {
      if (error instanceof DeleteEvidenceError) {
        throw error;
      }

      logger.error('[DeleteEvidence] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new DeleteEvidenceError(
        'Error interno al eliminar evidencia',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: DeleteEvidenceDto): void {
    try {
      dto.evidenceId = ObjectIdValidator.validate(dto.evidenceId, 'ID de la evidencia');
      dto.deletedBy = ObjectIdValidator.validate(dto.deletedBy, 'ID del usuario');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new DeleteEvidenceError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }

    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new DeleteEvidenceError(
        'Debe proporcionar una raz�n para eliminar',
        'MISSING_REASON',
        400
      );
    }
  }
}
