import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { INotificationService } from '../../../domain/services/INotificationService.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const ERROR_MESSAGES = {
  PLAN_NOT_FOUND: (id: string) => `Plan de trabajo ${id} no encontrado`,
  INVALID_STATUS: (status: string) => `El plan ya está en estado ${status}, no se puede rechazar`,
  MISSING_REASON: 'Debe proporcionar una razón para rechazar el plan',
  REASON_TOO_SHORT: 'La razón debe tener al menos 10 caracteres',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[RejectWorkPlanUseCase]',
} as const;

export interface RejectWorkPlanInput {
  workPlanId: string;
  rejectedBy: string;
  reason: string;
  ip?: string;
  userAgent?: string;
}

export class RejectWorkPlanUseCase {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly orderRepository: IOrderRepository, // Necesario para notificar
    private readonly auditService: AuditService,
    private readonly notificationService: INotificationService
  ) {}

  async execute(input: RejectWorkPlanInput): Promise<void> {
    this.validateInput(input);

    const workPlan = await this.workPlanRepository.findById(input.workPlanId);
    if (!workPlan) {
      throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND(input.workPlanId));
    }

    if (workPlan.status !== WorkPlanStatus.DRAFT) {
      throw new Error(ERROR_MESSAGES.INVALID_STATUS(workPlan.status));
    }

    await this.workPlanRepository.update(input.workPlanId, {
      status: WorkPlanStatus.REJECTED,
      rejection: {
        by: input.rejectedBy,
        at: new Date(),
        reason: input.reason,
      },
    });

    await this.logAudit(input);
    await this.notifyRejection(workPlan.orderId, input);

    logger.info(`${LOG_CONTEXT.USE_CASE} Plan rechazado exitosamente`, {
      workPlanId: input.workPlanId,
      rejectedBy: input.rejectedBy,
    });
  }

  private validateInput(input: RejectWorkPlanInput): void {
    if (!input.workPlanId?.trim()) throw new Error('ID del plan requerido');
    if (!input.rejectedBy?.trim()) throw new Error('ID del usuario requerido');
    
    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_REASON);
    }
    if (input.reason.trim().length < 10) {
      throw new Error(ERROR_MESSAGES.REASON_TOO_SHORT);
    }
  }

  private async logAudit(input: RejectWorkPlanInput): Promise<void> {
    await this.auditService.log({
      entityType: 'WorkPlan',
      entityId: input.workPlanId,
      action: AuditAction.UPDATE, // Podría ser REJECT_WORKPLAN si se agrega al enum
      userId: input.rejectedBy,
      before: { status: WorkPlanStatus.DRAFT },
      after: {
        status: WorkPlanStatus.REJECTED,
        rejection: {
          by: input.rejectedBy,
          reason: input.reason,
        },
      },
      reason: input.reason,
      ip: input.ip || 'unknown',
      userAgent: input.userAgent,
    });
  }

  private async notifyRejection(orderId: string, input: RejectWorkPlanInput): Promise<void> {
    try {
      const order = await this.orderRepository.findById(orderId);
      // Notificar al responsable de la orden (técnico) o al creador si se tiene esa data
      if (order?.responsibleId) {
        await this.notificationService.notify({
          recipientId: order.responsibleId,
          type: 'WORKPLAN_REJECTED',
          title: 'Plan de trabajo rechazado',
          message: `El plan de trabajo para la orden ${order.orderNumber} ha sido rechazado. Razón: ${input.reason}`,
          context: { orderId: order.id, workPlanId: input.workPlanId },
        });
      }
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error notificando rechazo (no crítico)`, {
        workPlanId: input.workPlanId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

