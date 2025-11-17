/**
 * Use Case: Agregar material al plan
 * Resuelve: Adición de materiales con actualización de presupuesto
 * 
 * @file backend/src/app/workplans/use-cases/AddMaterialToWorkPlan.ts
 */

import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository';
import type { WorkPlanMaterial } from '../../../domain/entities/WorkPlan';
import { WorkPlanStatus } from '../../../domain/entities/WorkPlan';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para agregar material
 */
export interface AddMaterialDto {
  workPlanId: string;
  material: WorkPlanMaterial;
  addedBy: string;
}

/**
 * Error de adición
 */
export class AddMaterialError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'AddMaterialError';
  }
}

/**
 * Use Case: Agregar Material al Plan
 * @class AddMaterialToWorkPlan
 */
export class AddMaterialToWorkPlan {
  constructor(
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: AddMaterialDto): Promise<void> {
    try {
      this.validateDto(dto);

      // 1. Verificar que el plan existe
      const workPlan = await this.workPlanRepository.findById(dto.workPlanId);

      if (!workPlan) {
        throw new AddMaterialError(
          `Plan de trabajo ${dto.workPlanId} no encontrado`,
          'WORKPLAN_NOT_FOUND',
          404
        );
      }

      // 2. Verificar que esté en estado DRAFT
      if (workPlan.status !== WorkPlanStatus.DRAFT) {
        throw new AddMaterialError(
          'Solo se pueden agregar materiales a planes en borrador',
          'INVALID_STATUS',
          400
        );
      }

      // 3. Agregar material
      const updatedMaterials = [...workPlan.materials, dto.material];

      // 4. Calcular nuevo presupuesto
      const materialCost = dto.material.quantity * dto.material.unitCost;
      const newBudget = workPlan.estimatedBudget + materialCost;

      // 5. Actualizar plan
      await this.workPlanRepository.update(dto.workPlanId, {
        materials: updatedMaterials,
        estimatedBudget: newBudget,
      });

      // 6. Registrar en auditoría
      await this.auditService.log({
        entityType: 'WorkPlan',
        entityId: dto.workPlanId,
        action: AuditAction.UPDATE,
        userId: dto.addedBy,
        before: { materialsCount: workPlan.materials.length },
        after: { materialsCount: updatedMaterials.length, materialAdded: dto.material.name },
        reason: `Material added: ${dto.material.name}`,
      });

      logger.info('[AddMaterialToWorkPlan] Material agregado', {
        workPlanId: dto.workPlanId,
        material: dto.material.name,
        cost: materialCost,
      });
    } catch (error) {
      if (error instanceof AddMaterialError) {
        throw error;
      }

      logger.error('[AddMaterialToWorkPlan] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new AddMaterialError(
        'Error interno al agregar material',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: AddMaterialDto): void {
    try {
      dto.workPlanId = ObjectIdValidator.validate(dto.workPlanId, 'ID del plan');
      dto.addedBy = ObjectIdValidator.validate(dto.addedBy, 'ID del usuario');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new AddMaterialError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }

    if (!dto.material.name || dto.material.name.trim().length === 0) {
      throw new AddMaterialError('El nombre del material es requerido', 'MISSING_NAME', 400);
    }

    if (dto.material.quantity <= 0) {
      throw new AddMaterialError('La cantidad debe ser mayor a 0', 'INVALID_QUANTITY', 400);
    }

    if (dto.material.unitCost < 0) {
      throw new AddMaterialError(
        'El costo unitario no puede ser negativo',
        'INVALID_COST',
        400
      );
    }
  }
}
