/**
 * @useCase CreateOrderUseCase
 * @description Caso de uso para crear una Order
 * @layer Application
 */
import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Order_REPOSITORY, IOrderRepository } from "../../domain/repositories";
import { OrderEntity } from "../../domain/entities";
import { CreateOrderDto, OrderResponseZod } from "../dto";

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(Order_REPOSITORY)
    private readonly OrderRepository: IOrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    dto: CreateOrderDto,
    creadorId: string,
  ): Promise<{ message: string; data: OrderResponseZod }> {
    // Obtener siguiente secuencia
    const sequence = await this.OrderRepository.getNextSequence();

    // Crear entidad de dominio
    const Order = OrderEntity.create(
      {
        descripcion: dto.descripcion,
        cliente: dto.cliente,
        prioridad: dto.prioridad || "media",
        fechaFinEstimada: dto.fechaFinEstimada
          ? new Date(dto.fechaFinEstimada)
          : undefined,
        presupuestoEstimado: dto.presupuestoEstimado,
        creadorId,
        asignadoId: dto.asignadoId,
      },
      sequence,
    );

    // Persistir
    const saved = await this.OrderRepository.create(Order);

    // Emitir evento
    this.eventEmitter.emit("Order.created", {
      OrderId: saved.id,
      numero: saved.numero.value,
      cliente: saved.cliente,
      creadorId,
    });

    return {
      message: "Order creada exitosamente",
      data: {
        id: saved.id,
        numero: saved.numero.value,
        descripcion: saved.descripcion,
        cliente: saved.cliente,
        estado: saved.estado.value,
        prioridad: saved.prioridad.value,
        fechaFinEstimada: saved.fechaFinEstimada?.toISOString(),
        presupuestoEstimado: saved.presupuestoEstimado,
        creador: saved.creador,
        asignado: saved.asignado,
        createdAt: saved.createdAt.toISOString(),
        updatedAt: saved.updatedAt.toISOString(),
      },
    };
  }
}
