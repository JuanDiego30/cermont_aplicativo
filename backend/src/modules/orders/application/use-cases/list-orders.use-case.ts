/**
 * @useCase ListOrdersUseCase
 * @description Caso de uso para listar órdenes
 * @layer Application
 */
import { Injectable, Inject } from '@nestjs/common';
import { Order_REPOSITORY, IOrderRepository } from '../../domain/repositories';
import { OrderQueryDto, OrderListResponseZod } from '../dto';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(Order_REPOSITORY)
    private readonly OrderRepository: IOrderRepository
  ) {}

  async execute(query: OrderQueryDto): Promise<OrderListResponseZod> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const result = await this.OrderRepository.findAll({
      estado: query.estado,
      cliente: query.cliente,
      prioridad: query.prioridad,
      asignadoId: query.asignadoId,
      page,
      limit,
    });

    return {
      data: result.data.map(Order => ({
        id: Order.id,
        numero: Order.numero.value,
        descripcion: Order.descripcion,
        cliente: Order.cliente,
        estado: Order.estado.value,
        prioridad: Order.prioridad.value,
        fechaInicio: Order.fechaInicio?.toISOString(),
        fechaFin: Order.fechaFin?.toISOString(),
        fechaFinEstimada: Order.fechaFinEstimada?.toISOString(),
        presupuestoEstimado: Order.presupuestoEstimado,
        creador: Order.creador,
        asignado: Order.asignado,
        createdAt: Order.createdAt.toISOString(),
        updatedAt: Order.updatedAt.toISOString(),
      })),
      total: result.total,
      page: result.page ?? page,
      limit: result.limit ?? limit,
      totalPages: result.totalPages,
    };
  }
}
