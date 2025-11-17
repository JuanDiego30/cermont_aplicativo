/**
 * Use Case: Aprobar plan de trabajo
 * Resuelve: Aprobación de planes con notificación al técnico
 * 
 * @file backend/src/app/workplans/use-cases/ApproveWorkPlan.ts
 */

import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para aprobar plan
 */
export interface ApproveWorkPlanDto {
  workPlanId: string;
  approvedBy: string;
  comments?: string;
}

/**
 * Error de aprobación
 */
export class ApproveWorkPlanError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'ApproveWorkPlanError';
  }
}

/**
 * Use Case: Aprobar Plan de Trabajo
 * @class ApproveWorkPlan
 */
export class ApproveWorkPlan {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: ApproveWorkPlanDto): Promise<void> {
    try {
      this.validateDto(dto);

      // 1. Verificar que el plan existe
      const workPlan = await this.workPlanRepository.findById(dto.workPlanId);

      if (!workPlan) {
        throw new ApproveWorkPlanError(
          `Plan de trabajo ${dto.workPlanId} no encontrado`,
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      // 2. Verificar que esté en estado DRAFT
      if (workPlan.status !== WorkPlanStatus.DRAFT) {
        throw new ApproveWorkPlanError(
          `El plan ya está ${workPlan.status}`,
          'INVALID_STATUS',
          400
        );
      }

      // 3. Aprobar el plan
      await this.workPlanRepository.update(dto.workPlanId, {
        status: WorkPlanStatus.APPROVED,
        approvedBy: dto.approvedBy,
        approvedAt: new Date(),
        approvalComments: dto.comments,
      });

      // 4. Registrar en auditoría
      await this.auditService.log({
        entityType: 'WorkPlan',
        entityId: dto.workPlanId,
        action: AuditAction.UPDATE,
        userId: dto.approvedBy,
        before: { status: WorkPlanStatus.DRAFT },
        after: { status: WorkPlanStatus.APPROVED, approvedBy: dto.approvedBy },
        reason: dto.comments || 'WorkPlan approved',
      });

      // 5. Enviar notificación al técnico
      const order = await this.orderRepository.findById(workPlan.orderId);
      
      if (order && order.responsibleId) {
        // Aquí enviarías el email al técnico
        // await emailService.notifyWorkPlanApproved(...)
      }

      logger.info('[ApproveWorkPlan] Plan aprobado', {
        workPlanId: dto.workPlanId,
        approvedBy: dto.approvedBy,
      });
    } catch (error) {
      if (error instanceof ApproveWorkPlanError) {
        throw error;
      }

      logger.error('[ApproveWorkPlan] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new ApproveWorkPlanError(
        'Error interno al aprobar plan',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: ApproveWorkPlanDto): void {
    try {
      dto.workPlanId = ObjectIdValidator.validate(dto.workPlanId, 'ID del plan');
      dto.approvedBy = ObjectIdValidator.validate(dto.approvedBy, 'ID del aprobador');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new ApproveWorkPlanError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }
  }
}
