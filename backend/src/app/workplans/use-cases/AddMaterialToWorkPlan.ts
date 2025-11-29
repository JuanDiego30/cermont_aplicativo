import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { WorkPlan, Material } from '../../../domain/entities/WorkPlan.js';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const ERROR_MESSAGES = {
  PLAN_NOT_FOUND: (id: string) => `Plan de trabajo ${id} no encontrado`,
  INVALID_STATUS: 'Solo se pueden agregar materiales a planes en borrador',
  MISSING_NAME: 'El nombre del material es requerido',
  INVALID_QUANTITY: 'La cantidad debe ser mayor a 0',
  INVALID_COST: 'El costo unitario no puede ser negativo',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[AddMaterialToWorkPlanUseCase]',
} as const;

export interface AddMaterialInput {
  workPlanId: string;
  material: Material;
  addedBy: string;
  ip?: string;
  userAgent?: string;
}

export class AddMaterialToWorkPlanUseCase {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: AddMaterialInput): Promise<void> {
    this.validateInput(input);

    const workPlan = await this.workPlanRepository.findById(input.workPlanId);
    if (!workPlan) {
      throw new Error(ERROR_MESSAGES.PLAN_NOT_FOUND(input.workPlanId));
    }

    if (workPlan.status !== WorkPlanStatus.DRAFT) {
      throw new Error(ERROR_MESSAGES.INVALID_STATUS);
    }

    const updatedWorkPlan = this.calculateUpdatedPlan(workPlan, input.material);

    await this.workPlanRepository.update(input.workPlanId, {
      materials: updatedWorkPlan.materials,
      estimatedBudget: updatedWorkPlan.estimatedBudget,
    });

    await this.logAudit(workPlan, updatedWorkPlan, input);

    logger.info(`${LOG_CONTEXT.USE_CASE} Material agregado exitosamente`, {
      workPlanId: input.workPlanId,
      materialName: input.material.name,
      addedCost: input.material.quantity * input.material.unitCost,
    });
  }

  private validateInput(input: AddMaterialInput): void {
    if (!input.workPlanId?.trim()) throw new Error('ID del plan requerido');
    if (!input.addedBy?.trim()) throw new Error('ID del usuario requerido');

    const { name, quantity, unitCost } = input.material;

    if (!name?.trim()) throw new Error(ERROR_MESSAGES.MISSING_NAME);
    if (quantity <= 0) throw new Error(ERROR_MESSAGES.INVALID_QUANTITY);
    if (unitCost < 0) throw new Error(ERROR_MESSAGES.INVALID_COST);
  }

  private calculateUpdatedPlan(workPlan: WorkPlan, material: Material): WorkPlan {
    const updatedMaterials = [...(workPlan.materials || []), material];
    const materialCost = material.quantity * material.unitCost;
    const newBudget = (workPlan.estimatedBudget || 0) + materialCost;

    return {
      ...workPlan,
      materials: updatedMaterials,
      estimatedBudget: newBudget,
    };
  }

  private async logAudit(
    before: WorkPlan,
    after: WorkPlan,
    input: AddMaterialInput
  ): Promise<void> {
    await this.auditService.log({
      entityType: 'WorkPlan',
      entityId: input.workPlanId,
      action: AuditAction.UPDATE,
      userId: input.addedBy,
      before: { materialsCount: before.materials?.length ?? 0 },
      after: {
        materialsCount: after.materials.length,
        materialAdded: input.material.name,
      },
      ip: input.ip || 'unknown',
      userAgent: input.userAgent,
      reason: `Material added: ${input.material.name}`,
    });
  }
}

