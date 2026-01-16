/**
 * Get Orders Summary Query
 * Query to retrieve orders statistics for dashboard
 */
import type { IQuery } from './query.interface';
import type { OrdersSummaryDto } from '@cermont/shared-types';

export interface GetOrdersSummaryFilters {
  fechaDesde?: Date;
  fechaHasta?: Date;
  clienteId?: string;
}

export class GetOrdersSummaryQuery implements IQuery<OrdersSummaryDto> {
  constructor(public readonly filters: GetOrdersSummaryFilters = {}) {}
}
