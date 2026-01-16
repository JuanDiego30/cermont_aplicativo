/**
 * List Orders Query
 * Query to retrieve a paginated list of orders with filters
 */
import type { IQuery } from './query.interface';
import type { PaginatedOrders } from '@cermont/shared-types';
import { OrderPriority, OrderStatus, OrderType } from '@cermont/shared-types';

export interface ListOrdersQueryFilters {
  estado?: OrderStatus;
  prioridad?: OrderPriority;
  tipoOrden?: OrderType;
  clienteId?: string;
  tecnicoId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
}

export interface ListOrdersQueryPagination {
  page: number;
  limit: number;
}

export class ListOrdersQuery implements IQuery<PaginatedOrders> {
  constructor(
    public readonly filters: ListOrdersQueryFilters = {},
    public readonly pagination: ListOrdersQueryPagination = { page: 1, limit: 20 },
  ) {}
}
