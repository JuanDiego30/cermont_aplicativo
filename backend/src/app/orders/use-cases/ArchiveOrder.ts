/**
 * Use Case: Archivar orden
 * Resuelve: Archivado seguro de órdenes completadas con validaciones
 * 
 * Permite mover órdenes completadas a un estado archivado para mantener
 * la BD limpia sin perder historial.
 * 
 * Estados archivables:
 * - PAGO: Orden completada y pagada
 * - CANCELADO: Orden cancelada (si existe este estado)
 * 
 * Validaciones:
 * - La orden debe existir
 * - La orden no debe estar ya archivada
 * - La orden debe estar en estado terminal
 * - No debe tener work plans o evidencias pendientes (opcional)
 * 
 * @file backend/src/app/orders/use-cases/ArchiveOrder.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import { OrderState } from '../../../domain/entities/Order.js';
import type { Order } from '../../../domain/entities/Order.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const TERMINAL_STATES = new Set<OrderState>([
  OrderState.PAGO,
  // OrderState.CANCELADO, // Descomentar si existe
]);

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  MISSING_ARCHIVED_BY: 'El ID del usuario es requerido',
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  ALREADY_ARCHIVED: 'La orden ya está archivada',
  INVALID_STATE: (current: OrderState, allowed: string[]) =>
    `Solo se pueden archivar órdenes en estados terminales (${allowed.join(', ')}). Estado actual: ${current}`,
  HAS_PENDING_WORKPLANS: (count: number) =>
    `No se puede archivar la orden porque tiene ${count} plan(es) de trabajo pendiente(s)`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[ArchiveOrderUseCase]',
} as const;

interface ArchiveOrderInput {
  orderId: string;
  archivedBy: string;
  reason?: string;
  ip?: string;
  userAgent?: string;
  skipDependencyCheck?: boolean; // Permitir archivar aunque tenga dependencias
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class ArchiveOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: ArchiveOrderInput): Promise<void> {
    this.validateInput(input);

    const order = await this.fetchOrder(input.orderId);
    this.validateOrderCanBeArchived(order);

    if (!input.skipDependencyCheck) {
      await this.checkDependencies(order.id);
    }

    await this.archiveOrder(order.id, input.archivedBy);

    const auditContext = this.extractAuditContext(input);
    await this.logArchiveEvent(order, input.archivedBy, input.reason, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Orden archivada exitosamente`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      archivedBy: input.archivedBy,
    });
  }

  private validateInput(input: ArchiveOrderInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (!input.archivedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ARCHIVED_BY);
    }
  }

  private async fetchOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de archivar orden inexistente`, { orderId });
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND(orderId));
    }

    return order;
  }

  private validateOrderCanBeArchived(order: Order): void {
    if (order.archived) {
      throw new Error(ERROR_MESSAGES.ALREADY_ARCHIVED);
    }

    if (!TERMINAL_STATES.has(order.state)) {
      const allowedStates = Array.from(TERMINAL_STATES);
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de archivar orden en estado inválido`, {
        orderId: order.id,
        currentState: order.state,
        allowedStates,
      });
      throw new Error(ERROR_MESSAGES.INVALID_STATE(order.state, allowedStates));
    }
  }

  private async checkDependencies(orderId: string): Promise<void> {
    const pendingWorkPlans = await this.getPendingWorkPlans(orderId);

    if (pendingWorkPlans > 0) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Orden con work plans pendientes`, {
        orderId,
        pendingWorkPlans,
      });
      throw new Error(ERROR_MESSAGES.HAS_PENDING_WORKPLANS(pendingWorkPlans));
    }
  }

  private async getPendingWorkPlans(orderId: string): Promise<number> {
    try {
      return await this.workPlanRepository.countPendingByOrderId(orderId);
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error verificando work plans`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      return 0; // No bloquear si falla la verificación
    }
  }

  private async archiveOrder(orderId: string, archivedBy: string): Promise<void> {
    try {
      await this.orderRepository.update(orderId, {
        archived: true,
        archivedAt: new Date(),
        archivedBy,
      });
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error archivando orden`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private extractAuditContext(input: ArchiveOrderInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logArchiveEvent(
    order: Order,
    archivedBy: string,
    reason: string | undefined,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Order',
        entityId: order.id,
        action: AuditAction.ARCHIVE_ORDER,
        userId: archivedBy,
        before: {
          archived: false,
          state: order.state,
          orderNumber: order.orderNumber,
        },
        after: {
          archived: true,
          archivedAt: new Date(),
          archivedBy,
        },
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: reason || 'Orden archivada (completada)',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

