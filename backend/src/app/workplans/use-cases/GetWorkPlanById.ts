import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { WorkPlan } from '../../../domain/entities/WorkPlan.js';
import { logger } from '../../../shared/utils/logger.js';

const LOG_CONTEXT = {
  USE_CASE: '[GetWorkPlanByIdUseCase]',
} as const;

const ERROR_MESSAGES = {
  WORKPLAN_NOT_FOUND: (id: string) => `Plan de trabajo ${id} no encontrado`,
  INVALID_ID: 'ID del plan de trabajo inválido',
} as const;

export class GetWorkPlanByIdUseCase {
  constructor(private readonly workPlanRepository: IWorkPlanRepository) {}

  async execute(workPlanId: string): Promise<WorkPlan> {
    if (!workPlanId?.trim()) {
      throw new Error(ERROR_MESSAGES.INVALID_ID);
    }

    const workPlan = await this.workPlanRepository.findById(workPlanId);

    if (!workPlan) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Plan no encontrado`, { workPlanId });
      throw new Error(ERROR_MESSAGES.WORKPLAN_NOT_FOUND(workPlanId));
    }

    return workPlan;
  }
}

