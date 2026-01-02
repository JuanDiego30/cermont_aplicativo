/**
 * @useCase ChangeOrdenEstadoUseCase
 * @description Caso de uso para cambiar el estado de una orden
 * @layer Application
 */
import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ORDEN_REPOSITORY, IOrdenRepository } from '../../domain/repositories';
import { OrdenEntity } from '../../domain/entities';
import { ChangeEstadoOrdenDto } from '../dto/change-estado-orden.dto';
import { OrdenResponseDto, OrdenEstado, OrdenPrioridad } from '../dto/orden-response.dto';
import { OrdenEstadoChangedEvent } from '../../domain/events/orden-estado-changed.event';
import { OrdenStateMachine, OrdenEstado as DomainOrdenEstado } from '../../domain/orden-state-machine';
import { OrdenMapper } from '../../infrastructure/mappers/orden.mapper';

@Injectable()
export class ChangeOrdenEstadoUseCase {
  private readonly logger = new Logger(ChangeOrdenEstadoUseCase.name);

  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) { }

  async execute(
    id: string,
    dto: ChangeEstadoOrdenDto,
  ): Promise<OrdenResponseDto> {
    try {
      this.logger.log(`Cambiando estado de orden ${id} a ${dto.nuevoEstado}`);

      // Buscar orden
      const orden = await this.ordenRepository.findById(id);

      if (!orden) {
        throw new NotFoundException(`Orden no encontrada: ${id}`);
      }

      // Reglas 13/17: Validaciones previas a ciertos cambios de estado.
      // - Cancelar: solo permitido en estados iniciales (pendiente/planeacion).
      // - Pasar a ejecución: requiere técnico asignado y al menos 1 item.
      const estadoActual = String(orden.estado.value);
      const nuevoEstado = String(dto.nuevoEstado);

      if (nuevoEstado === 'cancelada') {
        const cancellableStates = new Set(['pendiente', 'planeacion']);
        if (!cancellableStates.has(estadoActual)) {
          throw new BadRequestException(
            `No se puede cancelar una orden en estado: ${estadoActual}`,
          );
        }
      }

      if (nuevoEstado === 'ejecucion') {
        if (!orden.asignadoId) {
          throw new BadRequestException(
            'No se puede iniciar ejecución sin técnico asignado',
          );
        }

        const itemsCount = await this.prisma.orderItem.count({
          where: { orderId: id },
        });
        if (itemsCount <= 0) {
          throw new BadRequestException(
            'No se puede iniciar ejecución sin items registrados en la orden',
          );
        }
      }

      // Validar transición de estado
      OrdenStateMachine.validateTransition(
        orden.estado.value as DomainOrdenEstado,
        dto.nuevoEstado as DomainOrdenEstado,
        dto.motivo,
      );

      const estadoAnterior = orden.estado.value;

      // Cambiar estado
      orden.changeEstado(dto.nuevoEstado);

      // Persistir + auditoría + historial en una transacción
      const updated = await this.prisma.$transaction(async (tx) => {
        const updateData: Record<string, unknown> = {
          estado: orden.estado.value,
          updatedAt: new Date(),
        };

        if (String(orden.estado.value) === 'ejecucion') {
          updateData.fechaInicio = new Date();
        } else if (String(orden.estado.value) === 'completada') {
          updateData.fechaFin = new Date();
        }

        const updatedOrder = await tx.order.update({
          where: { id: orden.id },
          data: updateData,
          include: {
            creador: { select: { id: true, name: true } },
            asignado: { select: { id: true, name: true } },
          },
        });

        const persisted = OrdenMapper.toDomain(updatedOrder);

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
        const toSubStateByEstado: Record<string, string> = {
          pendiente: 'solicitud_recibida',
          planeacion: 'planeacion_iniciada',
          ejecucion: 'ejecucion_iniciada',
          pausada: 'ejecucion_iniciada',
          completada: 'pago_recibido',
          cancelada: 'solicitud_recibida',
        };

        const fromSubState = toSubStateByEstado[String(estadoAnterior)];
        const toSubState = toSubStateByEstado[String(dto.nuevoEstado)];

        if (!toSubState) {
          throw new BadRequestException(`No se pudo mapear el estado a sub-estado: ${String(dto.nuevoEstado)}`);
        }

        await tx.orderStateHistory.create({
          data: {
            ordenId: persisted.id,
            fromState: fromSubState as any,
            toState: toSubState as any,
            userId: dto.usuarioId,
            notas: dto.motivo,
            metadata: dto.observaciones ? ({ observaciones: dto.observaciones } as any) : undefined,
          },
        });

        return persisted;
      });

      // Emitir evento de dominio
      const evento = new OrdenEstadoChangedEvent(
        updated.id,
        updated.numero.value,
        estadoAnterior,
        dto.nuevoEstado,
        dto.motivo,
        dto.usuarioId,
        dto.observaciones,
      );
      this.eventEmitter.emit('orden.estado.changed', evento);

      // Convertir a DTO de respuesta
      return this.toResponseDto(updated);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error cambiando estado de orden: ${err?.message ?? String(error)}`,
        err?.stack,
      );
      throw error;
    }
  }

  private toResponseDto(orden: OrdenEntity): OrdenResponseDto {
    return {
      id: orden.id,
      numero: orden.numero.value,
      descripcion: orden.descripcion,
      cliente: orden.cliente,
      estado: orden.estado.value as OrdenEstado,
      prioridad: orden.prioridad.value as OrdenPrioridad,
      creadorId: orden.creadorId,
      asignadoId: orden.asignadoId,
      fechaInicio: orden.fechaInicio?.toISOString(),
      fechaFin: orden.fechaFin?.toISOString(),
      fechaFinEstimada: orden.fechaFinEstimada?.toISOString(),
      presupuestoEstimado: orden.presupuestoEstimado,
      costoReal: orden.costoReal,
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString(),
      creador: orden.creador,
      asignado: orden.asignado,
    };
  }
}
