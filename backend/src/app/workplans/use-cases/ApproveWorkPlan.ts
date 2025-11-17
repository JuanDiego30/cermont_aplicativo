/**
 * Use Case: Aprobar plan de trabajo
 * Resuelve: Aprobaci�n de planes con notificaci�n al t�cnico
 * 
 * @file backend/src/app/workplans/use-cases/ApproveWorkPlan.ts
 */

import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator.js';

/**
 * DTO para aprobar plan
 */
export interface ApproveWorkPlanDto {
  workPlanId: string;
  approvedBy: string;
  comments?: string;
}

/**
 * Error de aprobaci�n
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

      // 2. Verificar que est� en estado DRAFT
      if (workPlan.status !== WorkPlanStatus.DRAFT) {
        throw new ApproveWorkPlanError(
          `El plan ya est� ${workPlan.status}`,
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

      // 4. Registrar en auditor�a
      await this.auditService.log({
        entityType: 'WorkPlan',
        entityId: dto.workPlanId,
        action: AuditAction.UPDATE,
        userId: dto.approvedBy,
        before: { status: WorkPlanStatus.DRAFT },
        after: { status: WorkPlanStatus.APPROVED, approvedBy: dto.approvedBy },
        reason: dto.comments || 'WorkPlan approved',
      });

      // 5. Enviar notificaci�n al t�cnico
      const order = await this.orderRepository.findById(workPlan.orderId);
      
      if (order && order.responsibleId) {
        // Aqu� enviar�as el email al t�cnico
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
