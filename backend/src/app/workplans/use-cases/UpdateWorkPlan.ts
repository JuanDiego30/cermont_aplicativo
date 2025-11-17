/**
 * Use Case: Actualizar plan de trabajo
 * Resuelve: Actualización de planes con validaciones
 * 
 * @file backend/src/app/workplans/use-cases/UpdateWorkPlan.ts
 */

import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository';
import type { WorkPlan, WorkPlanMaterial, WorkPlanTool } from '../../../domain/entities/WorkPlan';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para actualizar plan
 */
export interface UpdateWorkPlanDto {
  workPlanId: string;
  data: {
    materials?: WorkPlanMaterial[];
    tools?: WorkPlanTool[];
    estimatedBudget?: number;
    notes?: string;
  };
  updatedBy: string;
}

/**
 * Error de actualización
 */
export class UpdateWorkPlanError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'UpdateWorkPlanError';
  }
}

/**
 * Use Case: Actualizar Plan de Trabajo
 * @class UpdateWorkPlan
 */
export class UpdateWorkPlan {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: UpdateWorkPlanDto): Promise<WorkPlan> {
    try {
      this.validateDto(dto);

      // 1. Verificar que el plan existe
      const workPlan = await this.workPlanRepository.findById(dto.workPlanId);

      if (!workPlan) {
        throw new UpdateWorkPlanError(
          `Plan de trabajo ${dto.workPlanId} no encontrado`,
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      // 2. Verificar que no esté aprobado o rechazado
      if (workPlan.status !== WorkPlanStatus.DRAFT) {
        throw new UpdateWorkPlanError(
          `No se puede actualizar un plan en estado ${workPlan.status}`,
          'INVALID_STATUS',
          400
        );
      }

      // 3. Guardar estado anterior
      const before = { ...workPlan };

      // 4. Actualizar el plan
      const updatedWorkPlan = await this.workPlanRepository.update(dto.workPlanId, dto.data);

      // 5. Registrar en auditoría
      await this.auditService.log({
        entityType: 'WorkPlan',
        entityId: dto.workPlanId,
        action: AuditAction.UPDATE,
        userId: dto.updatedBy,
        before,
        after: updatedWorkPlan,
        reason: 'WorkPlan updated',
      });

      logger.info('[UpdateWorkPlan] Plan actualizado', {
        workPlanId: dto.workPlanId,
        updatedBy: dto.updatedBy,
      });

      return updatedWorkPlan;
    } catch (error) {
      if (error instanceof UpdateWorkPlanError) {
        throw error;
      }

      logger.error('[UpdateWorkPlan] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new UpdateWorkPlanError(
        'Error interno al actualizar plan',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: UpdateWorkPlanDto): void {
    try {
      dto.workPlanId = ObjectIdValidator.validate(dto.workPlanId, 'ID del plan');
      dto.updatedBy = ObjectIdValidator.validate(dto.updatedBy, 'ID del usuario');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new UpdateWorkPlanError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }

    if (Object.keys(dto.data).length === 0) {
      throw new UpdateWorkPlanError(
        'Debe proporcionar al menos un campo para actualizar',
        'NO_DATA',
        400
      );
    }
  }
}
