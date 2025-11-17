import type { IOrderRepository } from '../../../domain/repositories/IOrderRepository.js';
import type { Order } from '../../../domain/entities/Order.js';
import { OrderState } from '../../../domain/entities/Order.js';
import {
  ObjectIdValidationError,
  ObjectIdValidator,
} from '../../../shared/validators/ObjectIdValidator.js';

/**
 * Error personalizado para operaciones de listado
 * Incluye código de error y status HTTP para manejo consistente
 * @class OrderListError
 * @extends {Error}
 */
export class OrderListError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'OrderListError';

    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Filtros para buscar órdenes
 * @interface OrderFilters
 */
export interface OrderFilters {
  /** Filtrar por estado de la orden */
  state?: OrderState;
  /** Filtrar por ID del responsable */
  responsibleId?: string;
  /** Filtrar por órdenes archivadas/activas */
  archived?: boolean;
}

/**
 * DTO para listar órdenes con paginación
 * @interface ListOrdersDto
 */
export interface ListOrdersDto {
  /** Número de página (mínimo 1, default: 1) */
  page?: number;
  /** Cantidad de resultados por página (1-100, default: 20) */
  limit?: number;
  /** Estado de la orden para filtrar (opcional) */
  state?: OrderState;
  /** ID del responsable para filtrar (opcional) */
  responsibleId?: string;
  /** Filtrar órdenes archivadas (opcional) */
  archived?: boolean;
}

/**
 * Resultado paginado de órdenes con metadata completa
 * @interface PaginatedOrders
 */
export interface PaginatedOrders {
  /** Lista de órdenes de la página actual */
  orders: Order[];
  /** Total de órdenes que coinciden con los filtros */
  total: number;
  /** Página actual */
  page: number;
  /** Total de páginas disponibles */
  totalPages: number;
  /** Límite de resultados por página */
  limit: number;
  /** Indica si hay página anterior */
  hasPreviousPage: boolean;
  /** Indica si hay página siguiente */
  hasNextPage: boolean;
}

/**
 * Caso de uso: Listar órdenes con paginación y filtros
 * Implementa paginación offset-based con validación completa
 * @class ListOrders
 * @since 1.0.0
 */
export class ListOrders {
  private static readonly PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MIN_LIMIT: 1,
    MAX_LIMIT: 100,
    MIN_PAGE: 1,
  } as const;

  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: ListOrdersDto = {}): Promise<PaginatedOrders> {
    try {
      const page = this.validatePage(dto.page);
      const limit = this.validateLimit(dto.limit);
      const filters = this.buildFilters(dto);

      const offset = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        this.orderRepository.find({ ...filters, limit, skip: offset }),
        this.orderRepository.count(filters),
      ]);

      const paginationMetadata = this.buildPaginationMetadata(page, limit, total);

      console.info(
        `[ListOrders] 📋 Listado de órdenes: página ${page}/${paginationMetadata.totalPages}, ${orders.length} resultados (total: ${total})`
      );

      return {
        orders,
        total,
        page,
        limit,
        ...paginationMetadata,
      };
    } catch (error) {
      if (error instanceof OrderListError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[ListOrders] Error inesperado:', errorMessage);

      throw new OrderListError(
        `Error interno al listar órdenes: ${errorMessage}`,
        'INTERNAL_ERROR',
        500
      );
    }
  }

  private buildPaginationMetadata(page: number, limit: number, total: number) {
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
      hasNextPage: page < totalPages,
    };
  }

  private validatePage(page?: number): number {
    if (page === undefined || page === null) {
      return ListOrders.PAGINATION.DEFAULT_PAGE;
    }

    this.validateIntegerParam(page, 'página', 'PAGE');

    if (page < ListOrders.PAGINATION.MIN_PAGE) {
      throw new OrderListError(
        `El número de página debe ser al menos ${ListOrders.PAGINATION.MIN_PAGE}`,
        'PAGE_TOO_SMALL',
        400
      );
    }

    return page;
  }

  private validateLimit(limit?: number): number {
    if (limit === undefined || limit === null) {
      return ListOrders.PAGINATION.DEFAULT_LIMIT;
    }

    this.validateIntegerParam(limit, 'límite', 'LIMIT');

    if (limit < ListOrders.PAGINATION.MIN_LIMIT) {
      throw new OrderListError(
        `El límite debe ser al menos ${ListOrders.PAGINATION.MIN_LIMIT}`,
        'LIMIT_TOO_SMALL',
        400
      );
    }

    if (limit > ListOrders.PAGINATION.MAX_LIMIT) {
      throw new OrderListError(
        `El límite no puede exceder ${ListOrders.PAGINATION.MAX_LIMIT}`,
        'LIMIT_TOO_LARGE',
        400
      );
    }

    return limit;
  }

  private validateIntegerParam(value: number, displayName: string, errorPrefix: string): void {
    if (typeof value !== 'number') {
      throw new OrderListError(
        `El ${displayName} debe ser un número`,
        `INVALID_${errorPrefix}_TYPE`,
        400
      );
    }

    if (!Number.isInteger(value)) {
      throw new OrderListError(
        `El ${displayName} debe ser un entero`,
        `INVALID_${errorPrefix}_INTEGER`,
        400
      );
    }
  }

  private buildFilters(dto: ListOrdersDto): OrderFilters {
    const filters: OrderFilters = {};

    if (dto.state !== undefined) {
      this.validateOrderState(dto.state);
      filters.state = dto.state;
    }

    if (dto.responsibleId !== undefined) {
      const normalized = this.validateObjectId(
        dto.responsibleId,
        'RESPONSIBLE_ID',
        'ID del responsable'
      );

      filters.responsibleId = normalized;
    }

    if (dto.archived !== undefined) {
      this.validateBoolean(dto.archived, 'archived', 'flag "archived"');
      filters.archived = dto.archived;
    }

    return filters;
  }

  private validateOrderState(state: OrderState): void {
    const validStates = Object.values(OrderState);

    if (!validStates.includes(state)) {
      throw new OrderListError(
        `Estado inválido. Valores permitidos: ${validStates.join(', ')}`,
        'INVALID_ORDER_STATE',
        400
      );
    }
  }

  private validateObjectId(value: string, fieldCode: string, displayName: string): string {
    try {
      return ObjectIdValidator.validate(value, displayName);
    } catch (error) {
      if (error instanceof ObjectIdValidationError) {
        throw new OrderListError(
          error.message,
          this.buildObjectIdErrorCode(error.code, fieldCode),
          400
        );
      }

      throw error;
    }
  }

  private buildObjectIdErrorCode(errorCode: string, fieldCode: string): string {
    const normalizedField = fieldCode.toUpperCase();

    switch (errorCode) {
      case 'INVALID_TYPE':
        return `INVALID_${normalizedField}_TYPE`;
      case 'EMPTY':
        return `EMPTY_${normalizedField}`;
      case 'INVALID_LENGTH':
        return `INVALID_${normalizedField}_LENGTH`;
      case 'INVALID_FORMAT':
        return `INVALID_${normalizedField}_FORMAT`;
      case 'REQUIRED':
      default:
        return `INVALID_${normalizedField}`;
    }
  }

  private validateBoolean(value: boolean, fieldCode: string, displayName: string): void {
    if (typeof value !== 'boolean') {
      throw new OrderListError(
        `El ${displayName} debe ser un booleano`,
        `INVALID_${fieldCode.toUpperCase()}_TYPE`,
        400
      );
    }
  }
}



