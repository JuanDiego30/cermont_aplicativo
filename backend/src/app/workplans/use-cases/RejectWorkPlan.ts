/**
 * Use Case: Rechazar plan de trabajo
 * Resuelve: Rechazo de planes con razón y notificación
 * 
 * @file backend/src/app/workplans/use-cases/RejectWorkPlan.ts
 */

import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para rechazar plan
 */
export interface RejectWorkPlanDto {
  workPlanId: string;
  rejectedBy: string;
  reason: string;
}

/**
 * Error de rechazo
 */
export class RejectWorkPlanError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'RejectWorkPlanError';
  }
}

/**
 * Use Case: Rechazar Plan de Trabajo
 * @class RejectWorkPlan
 */
export class RejectWorkPlan {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: RejectWorkPlanDto): Promise<void> {
    try {
      this.validateDto(dto);

      // 1. Verificar que el plan existe
      const workPlan = await this.workPlanRepository.findById(dto.workPlanId);

      if (!workPlan) {
        throw new RejectWorkPlanError(
          `Plan de trabajo ${dto.workPlanId} no encontrado`,
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      // 2. Verificar que esté en estado DRAFT
      if (workPlan.status !== WorkPlanStatus.DRAFT) {
        throw new RejectWorkPlanError(
          `El plan ya está ${workPlan.status}`,
          'INVALID_STATUS',
          400
        );
      }

      // 3. Rechazar el plan
      await this.workPlanRepository.update(dto.workPlanId, {
        status: WorkPlanStatus.REJECTED,
        rejectedBy: dto.rejectedBy,
        rejectedAt: new Date(),
        rejectionReason: dto.reason,
      });

      // 4. Registrar en auditoría
      await this.auditService.log({
        entityType: 'WorkPlan',
        entityId: dto.workPlanId,
        action: AuditAction.UPDATE,
        userId: dto.rejectedBy,
        before: { status: WorkPlanStatus.DRAFT },
        after: { status: WorkPlanStatus.REJECTED, rejectedBy: dto.rejectedBy },
        reason: dto.reason,
      });

      logger.info('[RejectWorkPlan] Plan rechazado', {
        workPlanId: dto.workPlanId,
        rejectedBy: dto.rejectedBy,
      });
    } catch (error) {
      if (error instanceof RejectWorkPlanError) {
        throw error;
      }

      logger.error('[RejectWorkPlan] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new RejectWorkPlanError(
        'Error interno al rechazar plan',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: RejectWorkPlanDto): void {
    try {
      dto.workPlanId = ObjectIdValidator.validate(dto.workPlanId, 'ID del plan');
      dto.rejectedBy = ObjectIdValidator.validate(dto.rejectedBy, 'ID del rechazador');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new RejectWorkPlanError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }

    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new RejectWorkPlanError(
        'Debe proporcionar una razón para rechazar el plan',
        'MISSING_REASON',
        400
      );
    }

    if (dto.reason.length < 10) {
      throw new RejectWorkPlanError(
        'La razón debe tener al menos 10 caracteres',
        'REASON_TOO_SHORT',
        400
      );
    }
  }
}
