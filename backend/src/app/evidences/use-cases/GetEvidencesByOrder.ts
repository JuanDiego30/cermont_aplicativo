/**
 * Use Case: Obtener evidencias por orden
 * Resuelve: Listado de evidencias filtradas por orden
 * 
 * @file backend/src/app/evidences/use-cases/GetEvidencesByOrder.ts
 */

import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import type { Evidence } from '../../../domain/entities/Evidence.js';
import { logger } from '../../../shared/utils/logger.js';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator.js';

/**
 * Filtros para evidencias
 */
export interface GetEvidencesFilters {
  orderId: string;
  stage?: string;
  status?: string;
}

/**
 * Error de obtenci�n
 */
export class GetEvidencesByOrderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'GetEvidencesByOrderError';
  }
}

/**
 * Use Case: Obtener Evidencias por Orden
 * @class GetEvidencesByOrder
 */
export class GetEvidencesByOrder {
  constructor(private readonly evidenceRepository: IEvidenceRepository) {}

  async execute(filters: GetEvidencesFilters): Promise<Evidence[]> {
    try {
      // Validar orderId
      const validatedOrderId = ObjectIdValidator.validate(filters.orderId, 'ID de la orden');

      logger.info('[GetEvidencesByOrder] Obteniendo evidencias', {
        orderId: validatedOrderId,
        filters,
      });

      // Obtener evidencias
      let evidences: Evidence[];

      if (filters.stage) {
        evidences = await this.evidenceRepository.findByOrderIdAndStage(
          validatedOrderId,
          filters.stage
        );
      } else {
        evidences = await this.evidenceRepository.findByOrderId(validatedOrderId);
      }

      // Filtrar por estado si se especifica
      if (filters.status) {
        evidences = evidences.filter((e) => e.status === filters.status);
      }

      logger.info('[GetEvidencesByOrder] Evidencias obtenidas', {
        orderId: validatedOrderId,
        count: evidences.length,
      });

      return evidences;
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new GetEvidencesByOrderError(error.message, 'INVALID_INPUT', 400);
      }

      logger.error('[GetEvidencesByOrder] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new GetEvidencesByOrderError(
        'Error interno al obtener evidencias',
        'INTERNAL_ERROR',
        500
      );
    }
  }
}
