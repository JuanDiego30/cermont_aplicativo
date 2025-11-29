import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { ICostCalculatorService } from '../../../domain/services/ICostCalculatorService.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const CONFIG = {
  BUDGET_MAX: 1_000_000_000, // Límite razonable
} as const;

const ERROR_MESSAGES = {
  PLAN_NOT_FOUND: (id: string) => `Plan de trabajo ${id} no encontrado`,
  INVALID_BUDGET: `El presupuesto debe ser un número positivo menor a ${CONFIG.BUDGET_MAX}`,
  MISSING_REASON: 'Debe proporcionar una razón para cambiar el presupuesto',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[UpdateBudgetUseCase]',
} as const;

export interface UpdateBudgetInput {
  workPlanId: string;
  newBudget: number;
  updatedBy: string;
  reason: string;
  ip?: string;
  userAgent?: string;
}

export class UpdateBudgetUseCase {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly auditService: AuditService,
    private readonly costCalculatorService: ICostCalculatorService // Inyección
  ) {}

  async execute(input: UpdateBudgetInput): Promise<void> {
    this.validateInput(input);

    const workPlan = await this.workPlanRepository.findById(input.workPlanId);
    if (!workPlan) {
      throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND(input.workPlanId));
    }

    const previousBudget = workPlan.estimatedBudget || 0;
    const variance = this.costCalculatorService.calculateVariance(previousBudget, input.newBudget);

    await this.workPlanRepository.update(input.workPlanId, {
      estimatedBudget: input.newBudget,
    });

    await this.logAudit(workPlan.id, previousBudget, input, variance);

    logger.info(`${LOG_CONTEXT.USE_CASE} Presupuesto actualizado`, {
      workPlanId: input.workPlanId,
      previousBudget,
      newBudget: input.newBudget,
      variance,
    });
  }

  private validateInput(input: UpdateBudgetInput): void {
    if (!input.workPlanId?.trim()) throw new Error('ID del plan requerido');
    if (!input.updatedBy?.trim()) throw new Error('ID del usuario requerido');

    if (
      typeof input.newBudget !== 'number' ||
      input.newBudget < 0 ||
      input.newBudget > CONFIG.BUDGET_MAX
    ) {
      throw new Error(ERROR_MESSAGES.INVALID_BUDGET);
    }

    if (!input.reason || input.reason.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_REASON);
    }
  }

  private async logAudit(
    workPlanId: string,
    previousBudget: number,
    input: UpdateBudgetInput,
    variance: any
  ): Promise<void> {
    await this.auditService.log({
      entityType: 'WorkPlan',
      entityId: workPlanId,
      action: AuditAction.UPDATE,
      userId: input.updatedBy,
      before: { estimatedBudget: previousBudget },
      after: { estimatedBudget: input.newBudget, variance },
      reason: input.reason,
      ip: input.ip || 'unknown',
      userAgent: input.userAgent,
    });
  }
}

