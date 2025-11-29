/**
 * Use Case: Eliminar orden (Soft Delete)
 * 
 * Realiza eliminación lógica de órdenes marcándolas como archivadas
 * con estado especial de "eliminada".
 * 
 * IMPORTANTE: Este es un SOFT DELETE - la orden no se elimina físicamente,
 * solo se marca como eliminada y archivada.
 * 
 * Para hard delete (eliminación física), usar el comando administrativo
 * especial disponible solo para administradores del sistema.
 * 
 * Validaciones:
 * - La orden debe existir
 * - La orden no debe estar ya eliminada
 * - Debe proporcionar razón válida (10-500 caracteres)
 * - Work plans y evidencias se mantienen pero se marcan como huérfanas
 * 
 * @file backend/src/app/orders/use-cases/DeleteOrder.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IWorkPlanRepository } from '../../../domain/repositories/IWorkPlanRepository.js';
import type { IEvidenceRepository } from '../../../domain/repositories/IEvidenceRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const VALIDATION_LIMITS = {
  MIN_REASON_LENGTH: 10,
  MAX_REASON_LENGTH: 500,
} as const;

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  MISSING_DELETED_BY: 'El ID del usuario es requerido',
  MISSING_REASON: 'Debe proporcionar una razón para la eliminación',
  REASON_TOO_SHORT: `La razón debe tener al menos ${VALIDATION_LIMITS.MIN_REASON_LENGTH} caracteres`,
  REASON_TOO_LONG: `La razón no puede exceder ${VALIDATION_LIMITS.MAX_REASON_LENGTH} caracteres`,
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  ALREADY_DELETED: 'La orden ya fue eliminada',
  HAS_DEPENDENCIES: (workPlans: number, evidences: number) =>
    `La orden tiene ${workPlans} plan(es) de trabajo y ${evidences} evidencia(s) asociada(s). Estas serán marcadas como huérfanas.`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[DeleteOrderUseCase]',
} as const;

interface DeleteOrderInput {
  orderId: string;
  deletedBy: string;
  reason: string;
  ip?: string;
  userAgent?: string;
}

interface DependencyCheck {
  workPlansCount: number;
  evidencesCount: number;
}

interface AuditContext {
  ip: string;
  userAgent: string;
}

export class DeleteOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly workPlanRepository: IWorkPlanRepository,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: DeleteOrderInput): Promise<void> {
    this.validateInput(input);

    const order = await this.fetchOrder(input.orderId);
    this.validateOrderCanBeDeleted(order);

    const dependencies = await this.checkDependencies(input.orderId);
    this.logDependencies(input.orderId, dependencies);

    await this.markOrderAsDeleted(input.orderId, input.deletedBy, input.reason);
    await this.markDependenciesAsOrphaned(input.orderId, dependencies);

    const auditContext = this.extractAuditContext(input);
    await this.logDeletionEvent(order, input.deletedBy, input.reason, dependencies, auditContext);

    logger.info(`${LOG_CONTEXT.USE_CASE} Orden eliminada (soft delete) exitosamente`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      deletedBy: input.deletedBy,
      hadDependencies: dependencies.workPlansCount > 0 || dependencies.evidencesCount > 0,
    });
  }

  private validateInput(input: DeleteOrderInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (!input.deletedBy?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_DELETED_BY);
    }

    this.validateReason(input.reason);
  }

  private validateReason(reason: unknown): void {
    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.MISSING_REASON);
    }

    const trimmedLength = reason.trim().length;

    if (trimmedLength < VALIDATION_LIMITS.MIN_REASON_LENGTH) {
      throw new Error(ERROR_MESSAGES.REASON_TOO_SHORT);
    }

    if (trimmedLength > VALIDATION_LIMITS.MAX_REASON_LENGTH) {
      throw new Error(ERROR_MESSAGES.REASON_TOO_LONG);
    }
  }

  private async fetchOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Intento de eliminar orden inexistente`, { orderId });
      throw new Error(ERROR_MESSAGES.ORDER_NOT_FOUND(orderId));
    }

    return order;
  }

  private validateOrderCanBeDeleted(order: Order): void {
    // Verificar si ya está eliminada
    if (order.deletedAt) {
      throw new Error(ERROR_MESSAGES.ALREADY_DELETED);
    }
  }

  private async checkDependencies(orderId: string): Promise<DependencyCheck> {
    try {
      const [workPlansCount, evidencesCount] = await Promise.all([
        this.workPlanRepository.countByOrderId(orderId),
        this.evidenceRepository.countByOrderId(orderId),
      ]);

      return {
        workPlansCount,
        evidencesCount,
      };
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error verificando dependencias`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });

      return {
        workPlansCount: 0,
        evidencesCount: 0,
      };
    }
  }

  private logDependencies(orderId: string, dependencies: DependencyCheck): void {
    if (dependencies.workPlansCount > 0 || dependencies.evidencesCount > 0) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Orden con dependencias será eliminada`, {
        orderId,
        workPlansCount: dependencies.workPlansCount,
        evidencesCount: dependencies.evidencesCount,
      });
    }
  }

  private async markOrderAsDeleted(
    orderId: string,
    deletedBy: string,
    reason: string
  ): Promise<void> {
    try {
      await this.orderRepository.update(orderId, {
        archived: true,
        deletedAt: new Date(),
        deletedBy,
        deletionReason: reason.trim(),
      });
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error marcando orden como eliminada`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private async markDependenciesAsOrphaned(
    orderId: string,
    dependencies: DependencyCheck
  ): Promise<void> {
    try {
      // Marcar work plans como huérfanos (opcional)
      if (dependencies.workPlansCount > 0) {
        await this.workPlanRepository.markAsOrphaned(orderId);
      }

      // Marcar evidencias como huérfanas (opcional)
      if (dependencies.evidencesCount > 0) {
        await this.evidenceRepository.markAsOrphaned(orderId);
      }

      logger.info(`${LOG_CONTEXT.USE_CASE} Dependencias marcadas como huérfanas`, {
        orderId,
        workPlansCount: dependencies.workPlansCount,
        evidencesCount: dependencies.evidencesCount,
      });
    } catch (error) {
      // Error no crítico, continuar
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error marcando dependencias (no crítico)`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  private extractAuditContext(input: DeleteOrderInput): AuditContext {
    return {
      ip: input.ip || 'unknown',
      userAgent: input.userAgent || 'unknown',
    };
  }

  private async logDeletionEvent(
    order: Order,
    deletedBy: string,
    reason: string,
    dependencies: DependencyCheck,
    auditContext: AuditContext
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'Order',
        entityId: order.id,
        action: AuditAction.DELETE,
        userId: deletedBy,
        before: {
          orderNumber: order.orderNumber,
          clientName: order.clientName,
          state: order.state,
          archived: order.archived,
          workPlansCount: dependencies.workPlansCount,
          evidencesCount: dependencies.evidencesCount,
        },
        after: null, // No hay estado después de un delete
        ip: auditContext.ip,
        userAgent: auditContext.userAgent,
        reason: `Orden eliminada (soft delete): ${reason}`,
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

