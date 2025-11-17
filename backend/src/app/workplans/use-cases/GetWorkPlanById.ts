/**
 * Use Case: Obtener plan de trabajo por ID
 * Resuelve: Recuperaci�n de plan con validaciones
 * 
 * @file backend/src/app/workplans/use-cases/GetWorkPlanById.ts
 */

import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { WorkPlan } from '../../../domain/entities/WorkPlan.js';
import { logger } from '../../../shared/utils/logger.js';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator.js';

/**
 * Error de obtenci�n
 */
export class GetWorkPlanByIdError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'GetWorkPlanByIdError';
  }
}

/**
 * Use Case: Obtener Plan de Trabajo por ID
 * @class GetWorkPlanById
 */
export class GetWorkPlanById {
  constructor(private readonly workPlanRepository: IWorkPlanRepository) {}

  async execute(workPlanId: string): Promise<WorkPlan> {
    try {
      // Validar ID
      const validatedId = ObjectIdValidator.validate(workPlanId, 'ID del plan de trabajo');

      logger.info('[GetWorkPlanById] Obteniendo plan', { workPlanId: validatedId });

      // Buscar plan
      const workPlan = await this.workPlanRepository.findById(validatedId);

      if (!workPlan) {
        throw new GetWorkPlanByIdError(
          `Plan de trabajo ${validatedId} no encontrado`,
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      logger.info('[GetWorkPlanById] Plan obtenido', { workPlanId: validatedId });

      return workPlan;
    } catch (error) {
      if (error instanceof GetWorkPlanByIdError || error instanceof ObjectIdValidationError) {
        throw error;
      }

      logger.error('[GetWorkPlanById] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new GetWorkPlanByIdError(
        'Error interno al obtener plan',
        'INTERNAL_ERROR',
        500
      );
    }
  }
}
