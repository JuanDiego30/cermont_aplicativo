/**
 * Use Case: Eliminar orden
 * Resuelve: Eliminaci�n segura de �rdenes con validaciones
 * 
 * @file backend/src/app/orders/use-cases/DeleteOrder.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository';
import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para eliminar orden
 */
export interface DeleteOrderDto {
  orderId: string;
  deletedBy: string;
  reason: string;
  force?: boolean;
}

/**
 * Error de eliminaci�n
 */
export class DeleteOrderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'DeleteOrderError';
  }
}

/**
 * Use Case: Eliminar Orden
 * @class DeleteOrder
 */
export class DeleteOrder {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: DeleteOrderDto): Promise<void> {
    try {
      this.validateDto(dto);

      // 1. Verificar que la orden existe
      const order = await this.orderRepository.findById(dto.orderId);

      if (!order) {
        throw new DeleteOrderError(
          `Orden ${dto.orderId} no encontrada`,
          'ORDER_NOT_FOUND',
          404
        );
      }

      // 2. Verificar si tiene recursos asociados
      const workPlan = await this.workPlanRepository.findByOrderId(dto.orderId);
      const evidences = await this.evidenceRepository.findByOrderId(dto.orderId);

      if ((workPlan || evidences.length > 0) && !dto.force) {
        throw new DeleteOrderError(
          'La orden tiene recursos asociados (plan de trabajo o evidencias). Use force=true para eliminar',
          'HAS_DEPENDENCIES',
          400
        );
      }

      // 3. Eliminar recursos asociados si force=true
      if (dto.force) {
        if (workPlan) {
          await this.workPlanRepository.delete(workPlan.id);
        }

        for (const evidence of evidences) {
          await this.evidenceRepository.delete(evidence.id);
        }

        logger.info('[DeleteOrder] Recursos asociados eliminados', {
          orderId: dto.orderId,
          workPlanDeleted: !!workPlan,
          evidencesDeleted: evidences.length,
        });
      }

      // 4. Eliminar la orden
      await this.orderRepository.delete(dto.orderId);

      // 5. Registrar en auditor�a
      await this.auditService.log({
        entityType: 'Order',
        entityId: dto.orderId,
        action: AuditAction.DELETE,
        userId: dto.deletedBy,
        before: order,
        after: {} as Record<string, unknown>,
        reason: dto.reason,
      });

      logger.info('[DeleteOrder] Orden eliminada', {
        orderId: dto.orderId,
        deletedBy: dto.deletedBy,
        force: dto.force,
      });
    } catch (error) {
      if (error instanceof DeleteOrderError) {
        throw error;
      }

      logger.error('[DeleteOrder] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new DeleteOrderError(
        'Error interno al eliminar orden',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: DeleteOrderDto): void {
    try {
      dto.orderId = ObjectIdValidator.validate(dto.orderId, 'ID de la orden');
      dto.deletedBy = ObjectIdValidator.validate(dto.deletedBy, 'ID del usuario');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new DeleteOrderError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }

    if (!dto.reason || dto.reason.trim().length === 0) {
      throw new DeleteOrderError(
        'Debe proporcionar una raz�n para eliminar la orden',
        'MISSING_REASON',
        400
      );
    }
  }
}
