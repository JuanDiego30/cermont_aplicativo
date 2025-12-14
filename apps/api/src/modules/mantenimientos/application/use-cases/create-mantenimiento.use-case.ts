/**
 * @useCase CreateMantenimientoUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MANTENIMIENTO_REPOSITORY, IMantenimientoRepository, CreateMantenimientoDto, MantenimientoResponse } from '../dto';

@Injectable()
export class CreateMantenimientoUseCase {
  constructor(
    @Inject(MANTENIMIENTO_REPOSITORY)
    private readonly repo: IMantenimientoRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateMantenimientoDto): Promise<{ message: string; data: MantenimientoResponse }> {
    const mantenimiento = await this.repo.create(dto);

    this.eventEmitter.emit('mantenimiento.programado', {
      mantenimientoId: mantenimiento.id,
      equipoId: dto.equipoId,
      fechaProgramada: dto.fechaProgramada,
      prioridad: dto.prioridad,
    });

    return {
      message: 'Mantenimiento programado',
      data: {
        id: mantenimiento.id,
        equipoId: mantenimiento.equipoId,
        tipo: mantenimiento.tipo,
        descripcion: mantenimiento.descripcion,
        fechaProgramada: mantenimiento.fechaProgramada?.toISOString?.() || mantenimiento.fechaProgramada,
        estado: mantenimiento.estado,
        prioridad: mantenimiento.prioridad,
        duracionEstimada: mantenimiento.duracionEstimada,
        tecnicoAsignadoId: mantenimiento.tecnicoAsignadoId,
        createdAt: mantenimiento.createdAt.toISOString(),
      },
    };
  }
}
