/**
 * @useCase ChangeOrdenEstadoUseCase
 * @description Caso de uso para cambiar el estado de una orden
 * @layer Application
 */
import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORDEN_REPOSITORY, IOrdenRepository } from '../../domain/repositories';
import { ChangeEstadoDto, OrdenResponse } from '../dto';

@Injectable()
export class ChangeOrdenEstadoUseCase {
  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    dto: ChangeEstadoDto,
  ): Promise<{ message: string; data: OrdenResponse }> {
    // Buscar orden
    const orden = await this.ordenRepository.findById(id);

    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Validar transición
    if (!orden.estado.canTransitionTo(dto.estado)) {
      throw new BadRequestException(
        `No se puede cambiar de ${orden.estado.value} a ${dto.estado}`,
      );
    }

    const estadoAnterior = orden.estado.value;

    // Cambiar estado
    orden.changeEstado(dto.estado);

    // Persistir
    const updated = await this.ordenRepository.update(orden);

    // Emitir evento
    this.eventEmitter.emit('orden.estado.changed', {
      ordenId: updated.id,
      numero: updated.numero.value,
      estadoAnterior,
      estadoNuevo: dto.estado,
    });

    return {
      message: 'Estado actualizado',
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
