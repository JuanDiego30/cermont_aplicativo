/**
 * Get Order By ID Query
 * Query to retrieve a single order by its ID
 */
import type { IQuery } from './query.interface';
import type { OrderDetailResponseDto } from '@cermont/shared-types';

export class GetOrderByIdQuery implements IQuery<OrderDetailResponseDto | null> {
  public readonly filters = {};
  
  constructor(
    public readonly orderId: string,
    public readonly includeHistory: boolean = false,
  ) {}
}
