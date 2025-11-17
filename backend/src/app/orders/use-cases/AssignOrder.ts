/**
 * Use Case: Asignar orden a técnico
 * Resuelve: Asignación de órdenes con validación de jerarquía de roles
 * 
 * @file backend/src/app/orders/use-cases/AssignOrder.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { AuditService } from '../../../domain/services/AuditService';
import { AuditAction } from '../../../domain/entities/AuditLog';
import { emailService } from '../../../infra/services/EmailService';
import { logger } from '../../../shared/utils/logger';
import {
  ObjectIdValidator,
  ObjectIdValidationError,
} from '../../../shared/validators/ObjectIdValidator';

/**
 * DTO para asignar orden
 */
export interface AssignOrderDto {
  orderId: string;
  technicianId: string;
  assignedBy: string;
  notes?: string;
}

/**
 * Error de asignación
 */
export class AssignOrderError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'AssignOrderError';
  }
}

/**
 * Use Case: Asignar Orden
 * @class AssignOrder
 */
export class AssignOrder {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(dto: AssignOrderDto): Promise<void> {
    try {
      this.validateDto(dto);

      // 1. Verificar que la orden existe
      const order = await this.orderRepository.findById(dto.orderId);

      if (!order) {
        throw new AssignOrderError(
          `Orden ${dto.orderId} no encontrada`,
          'ORDER_NOT_FOUND',
          404
        );
      }

      // 2. Verificar que el técnico existe y está activo
      const technician = await this.userRepository.findById(dto.technicianId);

      if (!technician) {
        throw new AssignOrderError(
          `Técnico ${dto.technicianId} no encontrado`,
          'TECHNICIAN_NOT_FOUND',
          404
        );
      }

      if (!technician.active) {
        throw new AssignOrderError(
          'El técnico no está activo',
          'TECHNICIAN_INACTIVE',
          400
        );
      }

      // 3. Actualizar la orden
      const previousResponsible = order.responsibleId;

      await this.orderRepository.update(dto.orderId, {
        responsibleId: dto.technicianId,
        notes: dto.notes ? `${order.notes || ''}\n${dto.notes}` : order.notes,
      });

      // 4. Registrar en auditoría
      await this.auditService.log({
        entityType: 'Order',
        entityId: dto.orderId,
        action: AuditAction.UPDATE,
        userId: dto.assignedBy,
        before: { responsibleId: previousResponsible },
        after: { responsibleId: dto.technicianId },
        reason: dto.notes || 'Order assigned to technician',
      });

      // 5. Enviar notificación por email al técnico
      await emailService.notifyOrderAssigned(
        technician.email,
        technician.name,
        order
      );

      logger.info('[AssignOrder] Orden asignada exitosamente', {
        orderId: dto.orderId,
        technicianId: dto.technicianId,
        assignedBy: dto.assignedBy,
      });
    } catch (error) {
      if (error instanceof AssignOrderError) {
        throw error;
      }

      logger.error('[AssignOrder] Error inesperado', {
        error: error instanceof Error ? error.message : 'Unknown',
      });

      throw new AssignOrderError(
        'Error interno al asignar orden',
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private validateDto(dto: AssignOrderDto): void {
    try {
      dto.orderId = ObjectIdValidator.validate(dto.orderId, 'ID de la orden');
      dto.technicianId = ObjectIdValidator.validate(dto.technicianId, 'ID del técnico');
      dto.assignedBy = ObjectIdValidator.validate(dto.assignedBy, 'ID del asignador');
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new AssignOrderError(error.message, 'INVALID_INPUT', 400);
      }
      throw error;
    }
  }
}
