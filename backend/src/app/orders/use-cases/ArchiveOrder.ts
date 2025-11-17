/**
 * Use Case: Archivar orden
 * Resuelve: Archivado de órdenes completadas con validaciones
 * 
 * @file backend/src/app/orders/use-cases/ArchiveOrder.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import { OrderState } from '../../../domain/entities/Order';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para archivar orden
 */
export interface ArchiveOrderDto {
  orderId: string;
  archivedBy: string;
  reason?: string;
}

/**
 * Error de archivado
 */
export class ArchiveOrderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'ArchiveOrderError';
  }
}

/**
 * Use Case: Archivar Orden
 * @class ArchiveOrder
 */
export class ArchiveOrder {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: ArchiveOrderDto): Promise<void> {
    try {
      this.validateDto(dto);

      // 1. Verificar que la orden existe
      const order = await this.orderRepository.findById(dto.orderId);

      if (!order) {
        throw new ArchiveOrderError(
          `Orden ${dto.orderId} no encontrada`,
          'ORDER_NOT_FOUND',
          404
        );
      }

      // 2. Verificar que ya no esté archivada
      if (order.archived) {
        throw new ArchiveOrderError(
          'La orden ya está archivada',
          'ALREADY_ARCHIVED',
          400
        );
      }

      // 3. Verificar que esté en estado terminal (COMPLETADA o CANCELADA)
      const terminalStates = [OrderState.PAGO];
      
      if (!terminalStates.includes(order.state)) {
        throw new ArchiveOrderError(
          `Solo se pueden archivar órdenes completadas o canceladas. Estado actual: ${order.state}`,
          'INVALID_STATE',
          400
        );
      }

      // 4. Archivar la orden
      await this.orderRepository.update(dto.orderId, {
        archived: true,
        archivedAt: new Date(),
        archivedBy: dto.archivedBy,
      });

      // 5. Registrar en auditoría
      await this.auditService.log({
        entityType: 'Order',
        entityId: dto.orderId,
        action: AuditAction.UPDATE,
        userId: dto.archivedBy,
        before: { archived: false },
        after: { archived: true, archivedAt: new Date() },
        reason: dto.reason || 'Order archived',
      });

      logger.info('[ArchiveOrder] Orden archivada', {
        orderId: dto.orderId,
        archivedBy: dto.archivedBy,
      });
    } catch (error) {
      if (error instanceof ArchiveOrderError) {
        throw error;
      }

      logger.error('[ArchiveOrder] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new ArchiveOrderError(
        'Error interno al archivar orden',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: ArchiveOrderDto): void {
    try {
      dto.orderId = ObjectIdValidator.validate(dto.orderId, 'ID de la orden');
      dto.archivedBy = ObjectIdValidator.validate(dto.archivedBy, 'ID del usuario');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new ArchiveOrderError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }
  }
}
