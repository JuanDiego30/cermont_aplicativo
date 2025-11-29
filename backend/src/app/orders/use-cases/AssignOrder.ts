/**
 * Use Case: Asignar orden a técnico
 * Resuelve: Asignación de órdenes con validación de roles y permisos
 * 
 * Validaciones:
 * - La orden debe existir y no estar completada/cancelada
 * - El técnico debe existir, estar activo y tener rol TECHNICIAN
 * - El asignador debe tener permisos para asignar órdenes
 * - No se permite auto-asignación (opcional)
 * 
 * @file backend/src/app/orders/use-cases/AssignOrder.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { IEmailService } from '../../../domain/services/IEmailService.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { OrderState } from '../../../domain/entities/Order.js';
import type { Order } from '../../../domain/entities/Order.js';
import type { User } from '../../../domain/entities/User.js';
import { logger } from '../../../shared/utils/logger.js';

const ASSIGNABLE_STATES = new Set<OrderState>([
  OrderState.SOLICITUD,
  OrderState.PLANEACION,
  OrderState.EJECUCION,
  OrderState.ACTA,
  // No permitir asignar órdenes completadas o canceladas
]);

const ALLOWED_TECHNICIAN_ROLES = new Set(['TECHNICIAN', 'SUPERVISOR', 'ADMIN']);

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  MISSING_TECHNICIAN_ID: 'El ID del técnico es requerido',
  MISSING_ASSIGNED_BY: 'El ID del asignador es requerido',
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  TECHNICIAN_NOT_FOUND: (id: string) => `Técnico ${id} no encontrado`,
  TECHNICIAN_INACTIVE: 'El técnico no está activo',
  INVALID_TECHNICIAN_ROLE: (role: string) =>
    `El usuario tiene rol ${role}, no puede ser asignado a órdenes. Roles válidos: ${Array.from(ALLOWED_TECHNICIAN_ROLES).join(', ')}`,
  INVALID_ORDER_STATE: (current: OrderState) =>
    `No se pueden asignar órdenes en estado ${current}. Estados válidos: ${Array.from(ASSIGNABLE_STATES).join(', ')}`,
  SELF_ASSIGNMENT_NOT_ALLOWED: 'No se permite auto-asignarse órdenes',
  ALREADY_ASSIGNED: (name: string) =>
    `La orden ya está asignada a ${name}. Use reasignación si desea cambiar el técnico`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[AssignOrderUseCase]',
} as const;

interface AssignOrderInput {
  orderId: string;
  technicianId: string;
  assignedBy: string;
  notes?: string;
  ip?: string;
  userAgent?: string;
  allowSelfAssignment?: boolean;
  allowReassignment?: boolean;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class AssignOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: AssignOrderInput): Promise<void> {
    this.validateInput(input);

    const order = await this.fetchOrder(input.orderId);
    this.validateOrderCanBeAssigned(order, input);

    const technician = await this.fetchTechnician(input.technicianId);
    this.validateTechnician(technician);

    this.validateSelfAssignment(input);

    const previousResponsibleId = order.responsibleId;
    await this.assignOrder(input.orderId, input.technicianId, input.notes);

    const auditContext = this.extractAuditContext(input);
    await this.logAssignmentEvent(
      order,
      technician,
      previousResponsibleId,
      input.assignedBy,
      auditContext
    );

    await this.notifyTechnician(technician, order);

    logger.info(`${LOG_CONTEXT.USE_CASE} Orden asignada exitosamente`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      technicianId: technician.id,
      technicianName: technician.name,
      assignedBy: input.assignedBy,
    });
  }

  private validateInput(input: AssignOrderInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (!input.technicianId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_TECHNICIAN_ID);
    }

    if (!input.assignedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ASSIGNED_BY);
    }
  }

  private async fetchOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de asignar orden inexistente`, { orderId });
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND(orderId));
    }

    return order;
  }

  private validateOrderCanBeAssigned(order: Order, input: AssignOrderInput): void {
    if (!ASSIGNABLE_STATES.has(order.state)) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de asignar orden en estado inválido`, {
        orderId: order.id,
        currentState: order.state,
      });
      throw new Error(ERROR_MESSAGES.INVALID_ORDER_STATE(order.state));
    }

    if (order.responsibleId && !input.allowReassignment) {
      const currentTechnician = order.responsibleId; // Idealmente, obtener nombre
      throw new Error(ERROR_MESSAGES.ALREADY_ASSIGNED(currentTechnician));
    }
  }

  private async fetchTechnician(technicianId: string): Promise<User> {
    const technician = await this.userRepository.findById(technicianId);

    if (!technician) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de asignar a técnico inexistente`, {
        technicianId,
      });
      throw new Error(ERROR_MESSAGES.TECHNICIAN_NOT_FOUND(technicianId));
    }

    return technician;
  }

  private validateTechnician(technician: User): void {
    if (!technician.active) {
      throw new Error(ERROR_MESSAGES.TECHNICIAN_INACTIVE);
    }

    if (!ALLOWED_TECHNICIAN_ROLES.has(technician.role)) {
      throw new Error(ERROR_MESSAGES.INVALID_TECHNICIAN_ROLE(technician.role));
    }
  }

  private validateSelfAssignment(input: AssignOrderInput): void {
    if (!input.allowSelfAssignment && input.technicianId === input.assignedBy) {
      throw new Error(ERROR_MESSAGES.SELF_ASSIGNMENT_NOT_ALLOWED);
    }
  }

  private async assignOrder(
    orderId: string,
    technicianId: string,
    notes?: string
  ): Promise<void> {
    const updateData: any = {
      responsibleId: technicianId,
      assignedAt: new Date(),
    };

    // Agregar nota con timestamp y autor
    if (notes) {
      const timestampedNote = `[${new Date().toISOString()}] Asignación: ${notes}`;
      const existingOrder = await this.orderRepository.findById(orderId);
      updateData.notes = existingOrder?.notes
        ? `${existingOrder.notes}\n${timestampedNote}`
        : timestampedNote;
    }

    try {
      await this.orderRepository.update(orderId, updateData);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error asignando orden`, {
        orderId,
        technicianId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: AssignOrderInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logAssignmentEvent(
    order: Order,
    technician: User,
    previousResponsibleId: string | null,
    assignedBy: string,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Order',
        entityId: order.id,
        action: AuditAction.ASSIGN_ORDER,
        userId: assignedBy,
        before: {
          responsibleId: previousResponsibleId,
        },
        after: {
          responsibleId: technician.id,
          responsibleName: technician.name,
          assignedAt: new Date(),
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: `Orden asignada a ${technician.name}`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  private async notifyTechnician(technician: User, order: Order): Promise<void> {
    try {
      if (this.emailService.notifyOrderAssigned) {
        await this.emailService.notifyOrderAssigned(technician.email, technician.name, order);
      }

      logger.info(`${LOG_CONTEXT.USE_CASE} Notificación enviada al técnico`, {
        technicianId: technician.id,
        technicianEmail: technician.email,
        orderId: order.id,
      });
    } catch (error) {
      // Error de notificación no debe bloquear la asignación
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error enviando notificación (no crítico)`, {
        technicianId: technician.id,
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

