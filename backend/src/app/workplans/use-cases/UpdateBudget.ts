/**
 * Use Case: Actualizar presupuesto del plan
 * Resuelve: Ajuste de presupuesto con validaciones
 * 
 * @file backend/src/app/workplans/use-cases/UpdateBudget.ts
 */

import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { costCalculatorService } from '../../../infra/services/CostCalculatorService';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para actualizar presupuesto
 */
export interface UpdateBudgetDto {
  workPlanId: string;
  newBudget: number;
  updatedBy: string;
  reason: string;
}

/**
 * Error de actualización
 */
export class UpdateBudgetError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'UpdateBudgetError';
  }
}

/**
 * Use Case: Actualizar Presupuesto
 * @class UpdateBudget
 */
export class UpdateBudget {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: UpdateBudgetDto): Promise<void> {
    try {
      this.validateDto(dto);

      // 1. Verificar que el plan existe
      const workPlan = await this.workPlanRepository.findById(dto.workPlanId);

      if (!workPlan) {
        throw new UpdateBudgetError(
          `Plan de trabajo ${dto.workPlanId} no encontrado`,
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      // 2. Guardar presupuesto anterior
      const previousBudget = workPlan.estimatedBudget;

      // 3. Calcular variación
      const variance = costCalculatorService.calculateVariance(previousBudget, dto.newBudget);

      // 4. Actualizar presupuesto
      await this.workPlanRepository.update(dto.workPlanId, {
        estimatedBudget: dto.newBudget,
      });

      // 5. Registrar en auditoría
      await this.auditService.log({
        entityType: 'WorkPlan',
        entityId: dto.workPlanId,
        action: AuditAction.UPDATE,
        userId: dto.updatedBy,
        before: { estimatedBudget: previousBudget },
        after: { estimatedBudget: dto.newBudget, variance },
        reason: dto.reason,
      });

      logger.info('[UpdateBudget] Presupuesto actualizado', {
        workPlanId: dto.workPlanId,
        previousBudget,
        newBudget: dto.newBudget,
        variance: variance.variance,
        variancePercentage: variance.variancePercentage,
      });
    } catch (error) {
      if (error instanceof UpdateBudgetError) {
        throw error;
      }

      logger.error('[UpdateBudget] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new UpdateBudgetError(
        'Error interno al actualizar presupuesto',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: UpdateBudgetDto): void {
    try {
      dto.workPlanId = ObjectIdValidator.validate(dto.workPlanId, 'ID del plan');
      dto.updatedBy = ObjectIdValidator.validate(dto.updatedBy, 'ID del usuario');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new UpdateBudgetError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }

    if (typeof dto.newBudget !== 'number' || dto.newBudget < 0) {
      throw new UpdateBudgetError(
        'El presupuesto debe ser un número positivo',
        'INVALID_BUDGET',
        400
      );
    }

    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new UpdateBudgetError(
        'Debe proporcionar una razón para cambiar el presupuesto',
        'MISSING_REASON',
        400
      );
    }
  }
}
