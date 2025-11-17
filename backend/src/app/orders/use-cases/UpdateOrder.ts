/**
 * Use Case: Actualizar orden
 * Resuelve: Actualizaci�n de �rdenes con validaciones
 * 
 * @file backend/src/app/orders/use-cases/UpdateOrder.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator.js';

/**
 * DTO para actualizar orden
 */
export interface UpdateOrderDto {
  orderId: string;
  data: {
    clientName?: string;
    description?: string;
    location?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    notes?: string;
    dueDate?: Date;
    tags?: string[];
  };
  updatedBy: string;
}

/**
 * Error de actualizaci�n
 */
export class UpdateOrderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'UpdateOrderError';
  }
}

/**
 * Use Case: Actualizar Orden
 * @class UpdateOrder
 */
export class UpdateOrder {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: UpdateOrderDto): Promise<Order> {
    try {
      this.validateDto(dto);

      // 1. Verificar que la orden existe
      const order = await this.orderRepository.findById(dto.orderId);

      if (!order) {
        throw new UpdateOrderError(
          `Orden ${dto.orderId} no encontrada`,
          'ORDER_NOT_FOUND',
          404
        );
      }

      // 2. Verificar que no est� archivada
      if (order.archived) {
        throw new UpdateOrderError(
          'No se puede actualizar una orden archivada',
          'ORDER_ARCHIVED',
          400
        );
      }

      // 3. Guardar estado anterior para auditor�a
      const before = { ...order };

      // 4. Actualizar la orden
      const updatedOrder = await this.orderRepository.update(dto.orderId, dto.data);

      // 5. Registrar en auditor�a
      await this.auditService.log({
        entityType: 'Order',
        entityId: dto.orderId,
        action: AuditAction.UPDATE,
        userId: dto.updatedBy,
        before,
        after: { ...updatedOrder },
        reason: 'Order updated',
      });

      logger.info('[UpdateOrder] Orden actualizada', {
        orderId: dto.orderId,
        updatedBy: dto.updatedBy,
      });

      return updatedOrder;
    } catch (error) {
      if (error instanceof UpdateOrderError) {
        throw error;
      }

      logger.error('[UpdateOrder] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new UpdateOrderError(
        'Error interno al actualizar orden',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: UpdateOrderDto): void {
    try {
      dto.orderId = ObjectIdValidator.validate(dto.orderId, 'ID de la orden');
      dto.updatedBy = ObjectIdValidator.validate(dto.updatedBy, 'ID del usuario');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new UpdateOrderError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }

    if (Object.keys(dto.data).length === 0) {
      throw new UpdateOrderError(
        'Debe proporcionar al menos un campo para actualizar',
        'NO_DATA',
        400
      );
    }
  }
}
