import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { INotificationService } from '../../../domain/services/INotificationService.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const ERROR_MESSAGES = {
  PLAN_NOT_FOUND: (id: string) => `Plan de trabajo ${id} no encontrado`,
  INVALID_STATUS: (status: string) => `El plan ya está en estado ${status}`,
  ORDER_NOT_FOUND: 'No se encontró la orden asociada al plan de trabajo',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[ApproveWorkPlanUseCase]',
} as const;

export interface ApproveWorkPlanInput {
  workPlanId: string;
  approvedBy: string;
  comments?: string;
  ip?: string;
  userAgent?: string;
}

export class ApproveWorkPlanUseCase {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: INotificationService
  ) {}

  async execute(input: ApproveWorkPlanInput): Promise<void> {
    this.validateInput(input);

    const workPlan = await this.workPlanRepository.findById(input.workPlanId);
    if (!workPlan) {
      throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND(input.workPlanId));
    }

    if (workPlan.status !== WorkPlanStatus.DRAFT) {
      throw new Error(ERROR_MESSAGES.INVALID_STATUS(workPlan.status));
    }

    await this.workPlanRepository.update(input.workPlanId, {
      status: WorkPlanStatus.APPROVED,
      approval: {
        by: input.approvedBy,
        at: new Date(),
        comments: input.comments,
      },
    });

    await this.logAudit(input);

    await this.notifyTechnician(workPlan.orderId, input.workPlanId);

    logger.info(`${LOG_CONTEXT.USE_CASE} Plan aprobado exitosamente`, {
      workPlanId: input.workPlanId,
      approvedBy: input.approvedBy,
    });
  }

  private validateInput(input: ApproveWorkPlanInput): void {
    if (!input.workPlanId?.trim()) throw new Error('ID del plan requerido');
    if (!input.approvedBy?.trim()) throw new Error('ID del aprobador requerido');
  }

  private async logAudit(input: ApproveWorkPlanInput): Promise<void> {
    await this.auditService.log({
      entityType: 'WorkPlan',
      entityId: input.workPlanId,
      action: AuditAction.APPROVE_WORKPLAN, // Asegurar que exista en enum
      userId: input.approvedBy,
      before: { status: WorkPlanStatus.DRAFT },
      after: {
        status: WorkPlanStatus.APPROVED,
        approval: {
          by: input.approvedBy,
          at: new Date(),
        },
      },
      reason: input.comments || 'WorkPlan approved',
      ip: input.ip || 'unknown',
      userAgent: input.userAgent,
    });
  }

  private async notifyTechnician(orderId: string, workPlanId: string): Promise<void> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (order?.responsibleId) {
        await this.notificationService.notify({
          recipientId: order.responsibleId,
          type: 'WORKPLAN_APPROVED',
          title: 'Plan de trabajo aprobado',
          message: `El plan de trabajo para la orden ${order.orderNumber} ha sido aprobado.`,
          context: { orderId: order.id, workPlanId },
        });
      }
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error notificando al técnico (no crítico)`, {
        workPlanId,
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

