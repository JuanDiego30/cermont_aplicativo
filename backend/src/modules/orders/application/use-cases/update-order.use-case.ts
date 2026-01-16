/**
 * @useCase UpdateOrderUseCase
 * @description Caso de uso para actualizar una Order
 * @layer Application
 */
import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order_REPOSITORY, IOrderRepository } from '../../domain/repositories';
import { UpdateOrderDto, OrderResponseZod } from '../dto';

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    @Inject(Order_REPOSITORY)
    private readonly OrderRepository: IOrderRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(
    id: string,
    dto: UpdateOrderDto
  ): Promise<{ message: string; data: OrderResponseZod }> {
    // Buscar Order existente
    const Order = await this.OrderRepository.findById(id);

    if (!Order) {
      throw new NotFoundException('Order no encontrada');
    }

    // Regla 14: No permitir edición una vez que la Order está en ejecución o ya es final.
    // En el contexto de órdenes de trabajo, consideramos editable solo: pendiente/planeacion.
    const estadoActual = Order.estado.value;
    const editableStates = new Set(['pendiente', 'planeacion']);
    if (!editableStates.has(String(estadoActual))) {
      throw new ForbiddenException(
        `No se puede editar una Order en estado: ${String(estadoActual)}`
      );
    }

    // Actualizar detalles
    Order.updateDetails({
      descripcion: dto.descripcion,
      cliente: dto.cliente,
      prioridad: dto.prioridad,
      fechaFinEstimada: dto.fechaFinEstimada ? new Date(dto.fechaFinEstimada) : undefined,
      presupuestoEstimado: dto.presupuestoEstimado,
      asignadoId: dto.asignadoId ?? undefined,
    });

    // Persistir
    const updated = await this.OrderRepository.update(Order);

    // Emitir evento
    this.eventEmitter.emit('Order.updated', {
      orderId: updated.id,
      changes: Object.keys(dto),
    });

    return {
      message: 'Order actualizada exitosamente',
      data: {
        id: updated.id,
        numero: updated.numero.value,
        descripcion: updated.descripcion,
        cliente: updated.cliente,
        estado: updated.estado.value,
        prioridad: updated.prioridad.value,
        fechaInicio: updated.fechaInicio?.toISOString(),
        fechaFin: updated.fechaFin?.toISOString(),
        fechaFinEstimada: updated.fechaFinEstimada?.toISOString(),
        presupuestoEstimado: updated.presupuestoEstimado,
        creador: updated.creador,
        asignado: updated.asignado,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    };
  }
}
