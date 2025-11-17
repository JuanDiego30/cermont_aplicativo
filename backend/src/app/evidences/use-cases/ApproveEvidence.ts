import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository';
import { Evidence, EvidenceStatus } from '../../../domain/entities/Evidence';

/**
 * Error personalizado para operaciones de aprobación de evidencia
 * Incluye código de error y status HTTP para manejo consistente
 * @class EvidenceApprovalError
 * @extends {Error}
 */
export class EvidenceApprovalError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'EvidenceApprovalError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Parámetros para aprobar una evidencia
 * @interface ApproveEvidenceParams
 */
interface ApproveEvidenceParams {
  /** ID único de la evidencia a aprobar */
  evidenceId: string;
  /** ID del usuario que realiza la aprobación */
  approvedBy: string;
  /** Comentarios opcionales sobre la aprobación (máx. 1000 caracteres) */
  comments?: string;
}

/**
 * Caso de uso: Aprobar una evidencia pendiente
 * Valida el estado de la evidencia y actualiza su status a APPROVED
 * @class ApproveEvidence
 * @since 1.0.0
 */
export class ApproveEvidence {
  private static readonly MAX_COMMENT_LENGTH = 1000;
  private static readonly APPROVABLE_STATUS = EvidenceStatus.PENDING;

  constructor(private readonly evidenceRepository: IEvidenceRepository) {}

  /**
   * Ejecuta la aprobación de una evidencia
   * @param {ApproveEvidenceParams} params - Parámetros de aprobación
   * @returns {Promise<Evidence>} Evidencia aprobada con datos actualizados
   * @throws {EvidenceApprovalError} Si la evidencia no existe, no está pendiente, o hay error en la actualización
   */
  async execute(params: ApproveEvidenceParams): Promise<Evidence> {
    try {
      this.validateParams(params);

      const evidence = await this.fetchEvidence(params.evidenceId);
      this.validateEvidenceState(evidence);

      const updatedEvidence = await this.approveEvidence(evidence.id, params);

      console.info(`[ApproveEvidence] ✅ Evidencia ${evidence.id} aprobada por ${params.approvedBy}`);

      return updatedEvidence;
    } catch (error) {
      if (error instanceof EvidenceApprovalError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[ApproveEvidence] Error inesperado:', errorMessage);

      throw new EvidenceApprovalError(
        `Error interno al aprobar la evidencia: ${errorMessage}`,
        'INTERNAL_ERROR',
        500
      );
    }
  }

  /**
   * Obtiene la evidencia del repositorio
   * @private
   * @param {string} evidenceId - ID de la evidencia
   * @returns {Promise<Evidence>} Evidencia encontrada
   * @throws {EvidenceApprovalError} Si la evidencia no existe
   */
  private async fetchEvidence(evidenceId: string): Promise<Evidence> {
    const evidence = await this.evidenceRepository.findById(evidenceId);

    if (!evidence) {
      throw new EvidenceApprovalError(
        `Evidencia con ID ${evidenceId} no encontrada`,
        'EVIDENCE_NOT_FOUND',
        404
      );
    }

    return evidence;
  }

  /**
   * Valida que la evidencia esté en estado aprobable
   * @private
   * @param {Evidence} evidence - Evidencia a validar
   * @throws {EvidenceApprovalError} Si el estado no permite aprobación
   */
  private validateEvidenceState(evidence: Evidence): void {
    if (evidence.status !== ApproveEvidence.APPROVABLE_STATUS) {
      throw new EvidenceApprovalError(
        `Solo se pueden aprobar evidencias pendientes. Estado actual: ${evidence.status}`,
        'INVALID_STATUS',
        400
      );
    }

    if (evidence.approvedAt) {
      throw new EvidenceApprovalError(
        `La evidencia ya fue aprobada el ${evidence.approvedAt.toISOString()}`,
        'ALREADY_APPROVED',
        409
      );
    }
  }

  /**
   * Actualiza la evidencia con datos de aprobación
   * @private
   * @param {string} evidenceId - ID de la evidencia
   * @param {ApproveEvidenceParams} params - Parámetros de aprobación
   * @returns {Promise<Evidence>} Evidencia actualizada
   */
  private async approveEvidence(
    evidenceId: string,
    params: ApproveEvidenceParams
  ): Promise<Evidence> {
    return this.evidenceRepository.update(evidenceId, {
      status: EvidenceStatus.APPROVED,
      approvedBy: params.approvedBy,
      approvalComments: params.comments?.trim() || undefined,
      approvedAt: new Date(),
    });
  }

  /**
   * Valida los parámetros de entrada
   * @private
   * @param {ApproveEvidenceParams} params - Parámetros a validar
   * @throws {EvidenceApprovalError} Si algún parámetro es inválido
   */
  private validateParams(params: ApproveEvidenceParams): void {
    this.validateStringParam(params.evidenceId, 'evidenceId', 'El ID de la evidencia');
    this.validateStringParam(params.approvedBy, 'approvedBy', 'El ID del usuario aprobador');

    if (params.comments !== undefined) {
      this.validateComments(params.comments);
    }
  }

  /**
   * Valida un parámetro de tipo string
   * @private
   * @param {unknown} value - Valor a validar
   * @param {string} paramName - Nombre del parámetro (para error code)
   * @param {string} displayName - Nombre para mostrar al usuario
   * @throws {EvidenceApprovalError} Si el parámetro es inválido
   */
  private validateStringParam(value: unknown, paramName: string, displayName: string): void {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new EvidenceApprovalError(
        `${displayName} es requerido y debe ser una cadena válida`,
        `INVALID_${paramName.toUpperCase()}`,
        400
      );
    }
  }

  /**
   * Valida los comentarios de aprobación
   * @private
   * @param {unknown} comments - Comentarios a validar
   * @throws {EvidenceApprovalError} Si los comentarios son inválidos
   */
  private validateComments(comments: unknown): void {
    if (typeof comments !== 'string') {
      throw new EvidenceApprovalError(
        'Los comentarios deben ser una cadena de texto',
        'INVALID_COMMENTS',
        400
      );
    }

    if (comments.length > ApproveEvidence.MAX_COMMENT_LENGTH) {
      throw new EvidenceApprovalError(
        `Los comentarios no pueden exceder ${ApproveEvidence.MAX_COMMENT_LENGTH} caracteres`,
        'COMMENTS_TOO_LONG',
        400
      );
    }
  }
}




