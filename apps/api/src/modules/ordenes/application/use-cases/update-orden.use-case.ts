/**
 * @useCase UpdateOrdenUseCase
 * @description Caso de uso para actualizar una orden
 * @layer Application
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORDEN_REPOSITORY, IOrdenRepository } from '../../domain/repositories';
import { UpdateOrdenDto, OrdenResponseZod } from '../dto';

@Injectable()
export class UpdateOrdenUseCase {
  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    dto: UpdateOrdenDto,
  ): Promise<{ message: string; data: OrdenResponseZod }> {
    // Buscar orden existente
    const orden = await this.ordenRepository.findById(id);

    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Actualizar detalles
    orden.updateDetails({
      descripcion: dto.descripcion,
      cliente: dto.cliente,
      prioridad: dto.prioridad,
      fechaFinEstimada: dto.fechaFinEstimada ? new Date(dto.fechaFinEstimada) : undefined,
      presupuestoEstimado: dto.presupuestoEstimado,
      asignadoId: dto.asignadoId ?? undefined,
    });

    // Persistir
    const updated = await this.ordenRepository.update(orden);

    // Emitir evento
    this.eventEmitter.emit('orden.updated', {
      ordenId: updated.id,
      changes: Object.keys(dto),
    });

    return {
      message: 'Orden actualizada exitosamente',
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
