import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { WorkPlan, Material, Tool } from '../../../domain/entities/WorkPlan.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const ERROR_MESSAGES = {
  PLAN_NOT_FOUND: (id: string) => `Plan de trabajo ${id} no encontrado`,
  INVALID_STATUS: (status: string) => `No se puede actualizar un plan en estado ${status}`,
  NO_DATA: 'Debe proporcionar al menos un campo para actualizar',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[UpdateWorkPlanUseCase]',
} as const;

export interface UpdateWorkPlanData {
  materials?: Material[];
  tools?: Tool[];
  estimatedBudget?: number;
  notes?: string;
}

export interface UpdateWorkPlanInput {
  workPlanId: string;
  data: UpdateWorkPlanData;
  updatedBy: string;
  ip?: string;
  userAgent?: string;
}

export class UpdateWorkPlanUseCase {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: UpdateWorkPlanInput): Promise<WorkPlan> {
    this.validateInput(input);

    const workPlan = await this.workPlanRepository.findById(input.workPlanId);
    if (!workPlan) {
      throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND(input.workPlanId));
    }

    if (workPlan.status !== WorkPlanStatus.DRAFT) {
      throw new Error(ERROR_MESSAGES.INVALID_STATUS(workPlan.status));
    }

    // Clonar estado anterior para auditoría (solo campos relevantes o ID)
    // Aquí guardamos una copia superficial para comparar
    const beforeState = { ...workPlan };

    const updatedWorkPlan = await this.workPlanRepository.update(input.workPlanId, input.data);

    await this.logAudit(beforeState, updatedWorkPlan, input);

    logger.info(`${LOG_CONTEXT.USE_CASE} Plan actualizado`, {
      workPlanId: input.workPlanId,
      updatedBy: input.updatedBy,
      updatedFields: Object.keys(input.data),
    });

    return updatedWorkPlan;
  }

  private validateInput(input: UpdateWorkPlanInput): void {
    if (!input.workPlanId?.trim()) throw new Error('ID del plan requerido');
    if (!input.updatedBy?.trim()) throw new Error('ID del usuario requerido');

    if (!input.data || Object.keys(input.data).length === 0) {
      throw new Error(ERROR_MESSAGES.NO_DATA);
    }
  }

  private async logAudit(
    before: WorkPlan,
    after: WorkPlan,
    input: UpdateWorkPlanInput
  ): Promise<void> {
    // Calcular diff simple para no guardar todo el objeto si es muy grande
    const changes = Object.keys(input.data).reduce((acc, key) => {
      acc[key] = {
        from: (before as any)[key],
        to: (after as any)[key],
      };
      return acc;
    }, {} as Record<string, any>);

    await this.auditService.log({
      entityType: 'WorkPlan',
      entityId: input.workPlanId,
      action: AuditAction.UPDATE,
      userId: input.updatedBy,
      before: before as unknown as Record<string, unknown>,
      after: after as unknown as Record<string, unknown>,
      reason: `WorkPlan updated. Fields: ${Object.keys(input.data).join(', ')}`,
      ip: input.ip || 'unknown',
      userAgent: input.userAgent,
    });
  }
}

