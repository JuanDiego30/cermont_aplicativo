/**
 * @useCase ChangeOrdenEstadoUseCase
 * @description Caso de uso para cambiar el estado de una orden
 * @layer Application
 */
import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORDEN_REPOSITORY, IOrdenRepository } from '../../domain/repositories';
import { OrdenEntity } from '../../domain/entities';
import { ChangeEstadoOrdenDto } from '../dto/change-estado-orden.dto';
import { OrdenResponseDto, OrdenEstado, OrdenPrioridad } from '../dto/orden-response.dto';
import { OrdenEstadoChangedEvent } from '../../domain/events/orden-estado-changed.event';

@Injectable()
export class ChangeOrdenEstadoUseCase {
  private readonly logger = new Logger(ChangeOrdenEstadoUseCase.name);

  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

      // Validar transición
      if (!orden.estado.canTransitionTo(dto.nuevoEstado)) {
        throw new BadRequestException(
          `No se puede cambiar de ${orden.estado.value} a ${dto.nuevoEstado}`,
        );
      }

      const estadoAnterior = orden.estado.value;

      // Cambiar estado
      orden.changeEstado(dto.nuevoEstado);

      // Persistir
      const updated = await this.ordenRepository.update(orden);

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
      this.logger.error('Error cambiando estado de orden', error);
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
      fechaInicio: orden.fechaInicio,
      fechaFin: orden.fechaFin,
      fechaFinEstimada: orden.fechaFinEstimada,
      presupuestoEstimado: orden.presupuestoEstimado,
      observaciones: undefined,
      createdAt: orden.createdAt,
      updatedAt: orden.updatedAt,
      creador: orden.creador,
      asignado: orden.asignado,
    };
  }
}
