/**
 * @useCase AsignarTecnicoOrderUseCase
 * @description Caso de uso para asignar un técnico a una Order
 * @layer Application
 */
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderAsignadaEvent } from '../../domain/events/order-asignada.event';
import { OrderEstadoChangedEvent } from '../../domain/events/order-estado-changed.event';
import {
  IOrderRepository,
  Order_REPOSITORY,
} from '../../domain/repositories/order.repository.interface';
import { EstadoOrder } from '../../domain/value-objects';
import { AsignarTecnicoOrderDto } from '../dto/asignar-tecnico-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { toOrderResponseDto } from '../mappers/order-response.mapper';

@Injectable()
export class AsignarTecnicoOrderUseCase {
  private readonly logger = new Logger(AsignarTecnicoOrderUseCase.name);

  constructor(
    @Inject(Order_REPOSITORY)
    private readonly repository: IOrderRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(orderId: string, dto: AsignarTecnicoOrderDto): Promise<OrderResponseDto> {
    try {
      this.logger.log(`Asignando técnico ${dto.tecnicoId} a Order ${orderId}`);

      const Order = await this.repository.findById(orderId);
      if (!Order) {
        throw new NotFoundException(`Order no encontrada: ${orderId}`);
      }

      // Validar que la Order puede ser asignada
      const estadoActual = Order.estado.value;
      if (estadoActual === 'completada' || estadoActual === 'cancelada') {
        throw new BadRequestException(
          `No se puede asignar técnico a una Order en estado: ${estadoActual}`
        );
      }

      const estadoAnterior = estadoActual;
      const nuevoEstado: EstadoOrder = 'ejecucion';

      // Actualizar Order - asignar técnico
      Order.asignarTecnico(dto.tecnicoId);

      // Si estaba en planeacion, cambiar a ejecucion (esto establece fechaInicio automáticamente)
      if (estadoAnterior === 'planeacion') {
        Order.changeEstado(nuevoEstado);
      }

      // Persistir cambios
      const updated = await this.repository.update(Order);

      this.logger.log(`Técnico asignado exitosamente a Order ${orderId}`);

      // Emitir eventos
      const eventoAsignacion = new OrderAsignadaEvent(
        orderId,
        Order.numero.value,
        dto.tecnicoId,
        dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        dto.instrucciones,
        dto.motivoAsignacion
      );
      this.eventEmitter.emit('Order.asignada', eventoAsignacion);

      if (estadoAnterior !== nuevoEstado && estadoAnterior === 'planeacion') {
        const eventoCambioEstado = new OrderEstadoChangedEvent(
          orderId,
          Order.numero.value,
          estadoAnterior,
          nuevoEstado,
          dto.motivoAsignacion || 'Técnico asignado a la Order',
          undefined,
          dto.instrucciones
        );
        this.eventEmitter.emit('Order.estado.changed', eventoCambioEstado);
      }

      return toOrderResponseDto(updated);
    } catch (error) {
      this.logger.error('Error asignando técnico a Order', error);
      throw error;
    }
  }
}
