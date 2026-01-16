import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { IOrderRepository, Order_REPOSITORY } from '../../domain/repositories';
import { ListOrdersUseCase } from '../use-cases/list-orders.use-case';

export class GetOrdersQuery {
  constructor(
    public readonly estado?: string,
    public readonly cliente?: string,
    public readonly prioridad?: string,
    public readonly asignadoId?: string,
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}

@Injectable()
@QueryHandler(GetOrdersQuery)
export class GetOrdersHandler implements IQueryHandler<GetOrdersQuery> {
  constructor(
    @Inject(Order_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    private readonly listOrdersUseCase: ListOrdersUseCase
  ) {}

  async execute(query: GetOrdersQuery) {
    const dto: any = {
      estado: query.estado,
      cliente: query.cliente,
      prioridad: query.prioridad,
      asignadoId: query.asignadoId,
      page: query.page,
      limit: query.limit,
    };

    return this.listOrdersUseCase.execute(dto);
  }
}
