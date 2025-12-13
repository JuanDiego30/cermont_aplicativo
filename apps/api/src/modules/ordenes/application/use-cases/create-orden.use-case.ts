/**
 * @useCase CreateOrdenUseCase
 * @description Caso de uso para crear una orden
 * @layer Application
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORDEN_REPOSITORY, IOrdenRepository } from '../../domain/repositories';
import { OrdenEntity } from '../../domain/entities';
import { CreateOrdenDto, OrdenResponse } from '../dto';

@Injectable()
export class CreateOrdenUseCase {
  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    dto: CreateOrdenDto,
    creadorId: string,
  ): Promise<{ message: string; data: OrdenResponse }> {
    // Obtener siguiente secuencia
    const sequence = await this.ordenRepository.getNextSequence();

    // Crear entidad de dominio
    const orden = OrdenEntity.create(
      {
        descripcion: dto.descripcion,
        cliente: dto.cliente,
        prioridad: dto.prioridad || 'media',
        fechaFinEstimada: dto.fechaFinEstimada,
        presupuestoEstimado: dto.presupuestoEstimado,
        creadorId,
        asignadoId: dto.asignadoId,
      },
      sequence,
    );

    // Persistir
    const saved = await this.ordenRepository.create(orden);

    // Emitir evento
    this.eventEmitter.emit('orden.created', {
      ordenId: saved.id,
      numero: saved.numero.value,
      cliente: saved.cliente,
      creadorId,
    });

    return {
      message: 'Orden creada exitosamente',
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
