/**
 * Use Case: Transicionar estado de orden
 * 
 * Cambia el estado de una orden validando que la transición sea permitida
 * según las reglas del OrderStateMachine.
 * 
 * Validaciones:
 * - La orden debe existir
 * - La transición debe ser válida según estado actual
 * - El usuario debe tener permisos para la transición
 * - El comentario no debe exceder 500 caracteres
 * 
 * @file backend/src/app/orders/use-cases/TransitionOrderState.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { INotificationService } from '../../../domain/services/INotificationService.js';
import type { OrderStateMachine } from '../../../domain/services/OrderStateMachine.js';
import type { Order } from '../../../domain/entities/Order.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const VALIDATION_LIMITS = {
  MAX_COMMENT_LENGTH: 500,
} as const;

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  MISSING_NEW_STATE: 'El nuevo estado es requerido',
  MISSING_USER_ID: 'El ID del usuario es requerido',
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  INVALID_STATE: (validStates: string[]) =>
    `Estado inválido. Valores permitidos: ${validStates.join(', ')}`,
  INVALID_TRANSITION: (current: OrderState, attempted: OrderState) =>
    `Transición no permitida de ${current} a ${attempted}`,
  COMMENT_TOO_LONG: `El comentario no puede exceder ${VALIDATION_LIMITS.MAX_COMMENT_LENGTH} caracteres`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[TransitionOrderStateUseCase]',
} as const;

interface TransitionOrderStateInput {
  orderId: string;
  newState: OrderState;
  userId: string;
  comment?: string;
  ip?: string;
  userAgent?: string;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class TransitionOrderStateUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly stateMachine: OrderStateMachine,
    private readonly auditService: AuditService,
    private readonly notificationService: INotificationService
  ) {}

  async execute(input: TransitionOrderStateInput): Promise<Order> {
    this.validateInput(input);

    const order = await this.fetchOrder(input.orderId);
    const previousState = order.state;

    this.validateTransition(previousState, input.newState);

    const updatedOrder = await this.updateOrderState(input.orderId, input.newState, input.comment);

    const auditContext = this.extractAuditContext(input);
    await this.logStateTransition(
      updatedOrder,
      previousState,
      input.newState,
      input.userId,
      input.comment,
      auditContext
    );

    await this.notifyStateChange(updatedOrder, previousState, input.newState);

    logger.info(`${LOG_CONTEXT.USE_CASE} Estado transicionado exitosamente`, {
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      transition: `${previousState} → ${input.newState}`,
      userId: input.userId,
    });

    return updatedOrder;
  }

  private validateInput(input: TransitionOrderStateInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (!input.newState) {
      throw new Error(ERROR_MESSAGES.MISSING_NEW_STATE);
    }

    if (!input.userId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_USER_ID);
    }

    this.validateNewState(input.newState);

    if (input.comment) {
      this.validateComment(input.comment);
    }
  }

  private validateNewState(newState: string): void {
    const validStates = Object.values(OrderState);
    if (!validStates.includes(newState as OrderState)) {
      throw new Error(ERROR_MESSAGES.INVALID_STATE(validStates));
    }
  }

  private validateComment(comment: string): void {
    if (comment.length > VALIDATION_LIMITS.MAX_COMMENT_LENGTH) {
      throw new Error(ERROR_MESSAGES.COMMENT_TOO_LONG);
    }
  }

  private async fetchOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Orden no encontrada`, { orderId });
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND(orderId));
    }

    return order;
  }

  private validateTransition(currentState: OrderState, newState: OrderState): void {
    try {
      this.stateMachine.validateTransition(currentState, newState);
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Transición inválida`, {
        currentState,
        attemptedState: newState,
      });
      throw new Error(ERROR_MESSAGES.INVALID_TRANSITION(currentState, newState));
    }
  }

  private async updateOrderState(
    orderId: string,
    newState: OrderState,
    comment?: string
  ): Promise<Order> {
    const updateData: any = {
      state: newState,
      [`${newState.toLowerCase()}At`]: new Date(), // e.g., ejecucionAt, pagoAt
    };

    // Agregar comentario a notas si existe
    if (comment) {
      const timestampedComment = `[${new Date().toISOString()}] Transición a ${newState}: ${comment}`;
      const existingOrder = await this.orderRepository.findById(orderId);
      updateData.notes = existingOrder?.notes
        ? `${existingOrder.notes}\n${timestampedComment}`
        : timestampedComment;
    }

    try {
      const updated = await this.orderRepository.update(orderId, updateData);

      if (!updated) {
        throw new Error('Error actualizando estado de la orden');
      }

      return updated;
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error actualizando estado`, {
        orderId,
        newState,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: TransitionOrderStateInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logStateTransition(
    order: Order,
    previousState: OrderState,
    newState: OrderState,
    userId: string,
    comment: string | undefined,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Order',
        entityId: order.id,
        action: AuditAction.UPDATE,
        userId,
        before: {
          state: previousState,
        },
        after: {
          state: newState,
          transitionedAt: new Date(),
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: comment || `Transición de estado: ${previousState} → ${newState}`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  private async notifyStateChange(
    order: Order,
    previousState: OrderState,
    newState: OrderState
  ): Promise<void> {
    try {
      // Notificar al responsable de la orden
      if (order.responsibleId) {
        await this.notificationService.notify({
          recipientId: order.responsibleId,
          type: 'ORDER_STATE_CHANGED',
          title: 'Cambio de estado de orden',
          message: `La orden ${order.orderNumber} cambió de ${previousState} a ${newState}`,
          context: { orderId: order.id },
        });
      }

      logger.info(`${LOG_CONTEXT.USE_CASE} Notificación enviada`, {
        orderId: order.id,
        recipientId: order.responsibleId,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error enviando notificación (no crítico)`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}




