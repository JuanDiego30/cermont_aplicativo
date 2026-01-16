/**
 * @useCase ChangeOrderstadoUseCase
 * @description Caso de uso para cambiar el estado de una Order
 * @layer Application
 */
import { OrderSubState as PrismaOrderSubState } from '@/prisma/client';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OrderEstadoChangedEvent } from '../../domain/events/order-estado-changed.event';
import {
  Orderstado as DomainOrderstado,
  OrderStateMachine,
} from '../../domain/order-state-machine';
import { IOrderRepository, Order_REPOSITORY } from '../../domain/repositories';
import { OrderMapper } from '../../infrastructure/mappers/order.mapper';
import { ChangeEstadoOrderDto } from '../dto/change-estado-order.dto';
import { OrderResponseDto } from '../dto/order-response.dto';
import { toOrderResponseDto } from '../mappers/order-response.mapper';

@Injectable()
export class ChangeOrderstadoUseCase {
  private readonly logger = new Logger(ChangeOrderstadoUseCase.name);

  constructor(
    @Inject(Order_REPOSITORY)
    private readonly OrderRepository: IOrderRepository,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(id: string, dto: ChangeEstadoOrderDto): Promise<OrderResponseDto> {
    try {
      this.logger.log(`Cambiando estado de Order ${id} a ${dto.nuevoEstado}`);

      // Buscar Order
      const Order = await this.OrderRepository.findById(id);

      if (!Order) {
        throw new NotFoundException(`Order no encontrada: ${id}`);
      }

      // Reglas 13/17: Validaciones previas a ciertos cambios de estado.
      // - Cancelar: solo permitido en estados iniciales (pendiente/planeacion).
      // - Pasar a ejecución: requiere técnico asignado y al menos 1 item.
      const estadoActual = String(Order.estado.value);
      const nuevoEstado = String(dto.nuevoEstado);

      if (nuevoEstado === 'cancelada') {
        const cancellableStates = new Set(['pendiente', 'planeacion']);
        if (!cancellableStates.has(estadoActual)) {
          throw new BadRequestException(
            `No se puede cancelar una Order en estado: ${estadoActual}`
          );
        }
      }

      if (nuevoEstado === 'ejecucion') {
        if (!Order.asignadoId) {
          throw new BadRequestException('No se puede iniciar ejecución sin técnico asignado');
        }

        const itemsCount = await this.prisma.orderItem.count({
          where: { orderId: id },
        });
        if (itemsCount <= 0) {
          throw new BadRequestException(
            'No se puede iniciar ejecución sin items registrados en la Order'
          );
        }
      }

      // Validar transición de estado
      OrderStateMachine.validateTransition(
        Order.estado.value as DomainOrderstado,
        dto.nuevoEstado as DomainOrderstado,
        dto.motivo
      );

      const estadoAnterior = Order.estado.value;

      // Cambiar estado
      Order.changeEstado(dto.nuevoEstado);

      // Persistir + auditoría + historial en una transacción
      const updated = await this.prisma.$transaction(async tx => {
        const updateData: Record<string, unknown> = {
          estado: Order.estado.value,
          updatedAt: new Date(),
        };

        if (String(Order.estado.value) === 'ejecucion') {
          updateData.fechaInicio = new Date();
        } else if (String(Order.estado.value) === 'completada') {
          updateData.fechaFin = new Date();
        }

        const updatedOrder = await tx.order.update({
          where: { id: Order.id },
          data: updateData,
          include: {
            creador: { select: { id: true, name: true } },
            asignado: { select: { id: true, name: true } },
          },
        });

        const persisted = OrderMapper.toDomain(updatedOrder);

        // Auditoría
        await tx.auditLog.create({
          data: {
            entityType: 'Order',
            entityId: persisted.id,
            action: 'ORDER_STATUS_CHANGED',
            userId: dto.usuarioId,
            changes: {
              from: estadoAnterior,
              to: dto.nuevoEstado,
              motivo: dto.motivo,
              observaciones: dto.observaciones,
            },
            previousData: { estado: estadoAnterior },
            newData: { estado: dto.nuevoEstado },
          },
        });

        // Historial (OrderStateHistory) - registrar para que /historial lo refleje.
        // Como este endpoint cambia "estado" (main state) y no el flujo de 14 pasos,
        // mapeamos a un sub-estado representativo por estado principal.
        const toSubStateByEstado: Record<string, PrismaOrderSubState> = {
          pendiente: PrismaOrderSubState.solicitud_recibida,
          planeacion: PrismaOrderSubState.planeacion_iniciada,
          ejecucion: PrismaOrderSubState.ejecucion_iniciada,
          pausada: PrismaOrderSubState.ejecucion_iniciada,
          completada: PrismaOrderSubState.pago_recibido,
          cancelada: PrismaOrderSubState.solicitud_recibida,
        };

        const fromSubState = toSubStateByEstado[String(estadoAnterior)];
        const toSubState = toSubStateByEstado[String(dto.nuevoEstado)];

        if (!toSubState) {
          throw new BadRequestException(
            `No se pudo mapear el estado a sub-estado: ${String(dto.nuevoEstado)}`
          );
        }

        await tx.orderStateHistory.create({
          data: {
            ordenId: persisted.id,
            fromState: fromSubState,
            toState: toSubState,
            userId: dto.usuarioId,
            notas: dto.motivo,
            metadata: dto.observaciones ? { observaciones: dto.observaciones } : undefined,
          },
        });

        return persisted;
      });

      // Emitir evento de dominio
      const evento = new OrderEstadoChangedEvent(
        updated.id,
        updated.numero.value,
        estadoAnterior,
        dto.nuevoEstado,
        dto.motivo,
        dto.usuarioId,
        dto.observaciones
      );
      this.eventEmitter.emit('Order.estado.changed', evento);

      // Convertir a DTO de respuesta
      return toOrderResponseDto(updated);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error cambiando estado de Order: ${err?.message ?? String(error)}`,
        err?.stack
      );
      throw error;
    }
  }
}
