/**
 * @useCase GetOrderByIdUseCase
 * @description Caso de uso para obtener una Order por ID
 * @layer Application
 */
import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { Order_REPOSITORY, IOrderRepository } from "../../domain/repositories";
import { OrderDetailResponseZod } from "../dto";

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    @Inject(Order_REPOSITORY)
    private readonly OrderRepository: IOrderRepository,
  ) {}

  async execute(id: string): Promise<OrderDetailResponseZod> {
    const Order = await this.OrderRepository.findById(id);

    if (!Order) {
      throw new NotFoundException("Order no encontrada");
    }

    return {
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
    };
  }
}
