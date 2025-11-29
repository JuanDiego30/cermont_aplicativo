/**
 * Use Case: Obtener historial de orden
 * 
 * Obtiene el historial completo de cambios de una orden con paginación
 * y filtros opcionales.
 * 
 * Características:
 * - Paginación para evitar sobrecarga de memoria
 * - Filtros por acción, usuario, rango de fechas
 * - Ordenamiento configurable (más reciente/antiguo primero)
 * - Metadata de cambios (campos modificados, valores antes/después)
 * 
 * @file backend/src/app/orders/use-cases/GetOrderHistory.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import type { AuditLog, AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

const DEFAULT_SORT = {
  ORDER: 'desc' as const, // Más recientes primero
} as const;

const ERROR_MESSAGES = {
  MISSING_ORDER_ID: 'El ID de la orden es requerido',
  ORDER_NOT_FOUND: (id: string) => `Orden ${id} no encontrada`,
  INVALID_PAGE: 'El número de página debe ser mayor a 0',
  INVALID_LIMIT: `El límite debe estar entre 1 y ${PAGINATION_CONFIG.MAX_LIMIT}`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[GetOrderHistoryUseCase]',
} as const;

interface GetOrderHistoryInput {
  orderId: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  action?: AuditAction; // Filtrar por tipo de acción
  userId?: string; // Filtrar por usuario que realizó el cambio
  dateFrom?: Date; // Filtrar desde fecha
  dateTo?: Date; // Filtrar hasta fecha
}

interface ChangeMetadata {
  field: string;
  before: any;
  after: any;
}

interface AuditLogWithChanges extends AuditLog {
  changes?: ChangeMetadata[]; // Campos que cambiaron
}

interface GetOrderHistoryOutput {
  order: Order;
  auditLogs: AuditLogWithChanges[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  summary: {
    totalChanges: number;
    changesByAction: Record<string, number>;
    changesByUser: Record<string, number>;
    firstChange?: Date;
    lastChange?: Date;
  };
}

interface AuditFilters {
  entityType: 'Order';
  entityId: string;
  action?: AuditAction;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

interface SortingParams {
  field: string;
  order: 'asc' | 'desc';
}

export class GetOrderHistoryUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(input: GetOrderHistoryInput): Promise<GetOrderHistoryOutput> {
    this.validateInput(input);

    const order = await this.fetchOrder(input.orderId);

    const filters = this.buildFilters(input);
    const pagination = this.buildPagination(input);
    const sorting = this.buildSorting(input);

    const [auditLogs, total] = await Promise.all([
      this.auditLogRepository.findByFilters(filters, pagination, sorting),
      this.auditLogRepository.countByFilters(filters),
    ]);

    // Enriquecer audit logs con metadata de cambios
    const enrichedLogs = this.enrichAuditLogs(auditLogs);

    const totalPages = Math.ceil(total / pagination.limit);
    const hasMore = pagination.page < totalPages;

    const summary = await this.generateSummary(input.orderId);

    return {
      order,
      auditLogs: enrichedLogs,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasMore,
      },
      summary,
    };
  }

  private validateInput(input: GetOrderHistoryInput): void {
    if (!input.orderId?.trim()) {
      throw new Error(ERROR_MESSAGES.MISSING_ORDER_ID);
    }

    if (input.page !== undefined && input.page < 1) {
      throw new Error(ERROR_MESSAGES.INVALID_PAGE);
    }

    if (input.limit !== undefined) {
      if (input.limit < 1 || input.limit > PAGINATION_CONFIG.MAX_LIMIT) {
        throw new Error(ERROR_MESSAGES.INVALID_LIMIT);
      }
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

  private buildFilters(input: GetOrderHistoryInput): AuditFilters {
    return {
      entityType: 'Order',
      entityId: input.orderId,
      action: input.action,
      userId: input.userId,
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
    };
  }

  private buildPagination(input: GetOrderHistoryInput): PaginationParams {
    const page = input.page || PAGINATION_CONFIG.DEFAULT_PAGE;
    const limit = Math.min(
      input.limit || PAGINATION_CONFIG.DEFAULT_LIMIT,
      PAGINATION_CONFIG.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private buildSorting(input: GetOrderHistoryInput): SortingParams {
    return {
      field: 'timestamp',
      order: input.sortOrder || DEFAULT_SORT.ORDER,
    };
  }

  private enrichAuditLogs(auditLogs: AuditLog[]): AuditLogWithChanges[] {
    return auditLogs.map((log) => {
      const changes = this.extractChanges(log.before ?? null, log.after ?? null);
      return {
        ...log,
        changes: changes.length > 0 ? changes : undefined,
      };
    });
  }

  private extractChanges(
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null
  ): ChangeMetadata[] {
    const changes: ChangeMetadata[] = [];

    if (!before || !after) {
      return changes;
    }

    // Comparar todos los campos en "after"
    for (const [field, afterValue] of Object.entries(after)) {
      const beforeValue = before[field];

      // Comparación profunda para detectar cambios
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        changes.push({
          field,
          before: beforeValue,
          after: afterValue,
        });
      }
    }

    return changes;
  }

  private async generateSummary(orderId: string): Promise<GetOrderHistoryOutput['summary']> {
    try {
      const allLogs = await this.auditLogRepository.findByEntity('Order', orderId);

      const changesByAction: Record<string, number> = {};
      const changesByUser: Record<string, number> = {};

      for (const log of allLogs) {
        // Contar por acción
        changesByAction[log.action] = (changesByAction[log.action] || 0) + 1;

        // Contar por usuario
        changesByUser[log.userId] = (changesByUser[log.userId] || 0) + 1;
      }

      const timestamps = allLogs.map((log) => log.timestamp.getTime());
      const firstChange = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : undefined;
      const lastChange = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : undefined;

      return {
        totalChanges: allLogs.length,
        changesByAction,
        changesByUser,
        firstChange,
        lastChange,
      };
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error generando resumen (no crítico)`, {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown',
      });

      return {
        totalChanges: 0,
        changesByAction: {},
        changesByUser: {},
      };
    }
  }
}

