/**
 * Use Case: Listar órdenes
 * 
 * Lista órdenes con paginación, filtros, ordenamiento y búsqueda.
 * 
 * Características:
 * - Paginación configurable (1-100 items por página)
 * - Filtros por estado, responsable, archivado
 * - Búsqueda por número de orden, nombre de cliente, ubicación
 * - Ordenamiento por múltiples campos
 * - Metadata de paginación completa
 * 
 * @file backend/src/app/orders/use-cases/ListOrders.ts
 */

import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import { OrderState } from '../../../domain/entities/Order.js';
import { logger } from '../../../shared/utils/logger.js';

const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

const DEFAULT_SORT = {
  FIELD: 'createdAt' as const,
  ORDER: 'desc' as const,
} as const;

const VALID_SORT_FIELDS = [
  'orderNumber',
  'clientName',
  'location',
  'state',
  'createdAt',
  'updatedAt',
  'dueDate',
] as const;

type SortField = (typeof VALID_SORT_FIELDS)[number];

const ERROR_MESSAGES = {
  INVALID_PAGE: 'El número de página debe ser mayor a 0',
  INVALID_LIMIT: `El límite debe estar entre 1 y ${PAGINATION_CONFIG.MAX_LIMIT}`,
  INVALID_STATE: (validStates: string[]) =>
    `Estado inválido. Valores permitidos: ${validStates.join(', ')}`,
  INVALID_SORT_FIELD: (validFields: string[]) =>
    `Campo de ordenamiento inválido. Valores permitidos: ${validFields.join(', ')}`,
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[ListOrdersUseCase]',
} as const;

interface ListOrdersInput {
  page?: number;
  limit?: number;
  state?: OrderState;
  responsibleId?: string;
  archived?: boolean;
  search?: string; // Buscar en orderNumber, clientName, location
  sortBy?: SortField;
  sortOrder?: 'asc' | 'desc';
}

interface OrderFilters {
  state?: OrderState;
  responsibleId?: string;
  archived?: boolean;
  search?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

interface SortingParams {
  field: SortField;
  order: 'asc' | 'desc';
}

interface ListOrdersOutput {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(input: ListOrdersInput = {}): Promise<ListOrdersOutput> {
    this.validateInput(input);

    const filters = this.buildFilters(input);
    const pagination = this.buildPagination(input);
    const sorting = this.buildSorting(input);

    const [orders, total] = await Promise.all([
      this.orderRepository.findAll(filters, pagination, sorting),
      this.orderRepository.count(filters),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);
    const hasMore = pagination.page < totalPages;
    const hasPrevious = pagination.page > 1;

    return {
      orders,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasMore,
        hasPrevious,
      },
    };
  }

  private validateInput(input: ListOrdersInput): void {
    if (input.page !== undefined && input.page < 1) {
      throw new Error(ERROR_MESSAGES.INVALID_PAGE);
    }

    if (input.limit !== undefined) {
      if (input.limit < 1 || input.limit > PAGINATION_CONFIG.MAX_LIMIT) {
        throw new Error(ERROR_MESSAGES.INVALID_LIMIT);
      }
    }

    if (input.state !== undefined) {
      this.validateOrderState(input.state);
    }

    if (input.sortBy !== undefined) {
      this.validateSortField(input.sortBy);
    }
  }

  private validateOrderState(state: string): void {
    const validStates = Object.values(OrderState);
    if (!validStates.includes(state as OrderState)) {
      throw new Error(ERROR_MESSAGES.INVALID_STATE(validStates));
    }
  }

  private validateSortField(sortBy: string): void {
    if (!VALID_SORT_FIELDS.includes(sortBy as SortField)) {
      throw new Error(ERROR_MESSAGES.INVALID_SORT_FIELD([...VALID_SORT_FIELDS]));
    }
  }

  private buildFilters(input: ListOrdersInput): OrderFilters {
    return {
      state: input.state,
      responsibleId: input.responsibleId,
      archived: input.archived,
      search: input.search?.trim(),
    };
  }

  private buildPagination(input: ListOrdersInput): PaginationParams {
    const page = input.page || PAGINATION_CONFIG.DEFAULT_PAGE;
    const limit = Math.min(
      input.limit || PAGINATION_CONFIG.DEFAULT_LIMIT,
      PAGINATION_CONFIG.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  private buildSorting(input: ListOrdersInput): SortingParams {
    return {
      field: input.sortBy || DEFAULT_SORT.FIELD,
      order: input.sortOrder || DEFAULT_SORT.ORDER,
    };
  }
}




