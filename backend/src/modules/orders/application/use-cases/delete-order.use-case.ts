/**
 * @useCase DeleteOrderUseCase
 * @description Caso de uso para eliminar una Order
 * @layer Application
 */
import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Order_REPOSITORY, IOrderRepository } from "../../domain/repositories";

@Injectable()
export class DeleteOrderUseCase {
  constructor(
    @Inject(Order_REPOSITORY)
    private readonly OrderRepository: IOrderRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    // Verificar existencia
    const Order = await this.OrderRepository.findById(id);

    if (!Order) {
      throw new NotFoundException("Order no encontrada");
    }

    // Eliminar
    await this.OrderRepository.delete(id);

    // Emitir evento
    this.eventEmitter.emit("Order.deleted", {
      OrderId: id,
      numero: Order.numero.value,
    });

    return { message: "Order eliminada exitosamente" };
  }
}
