/**
 * @useCase ListMantenimientosUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { MANTENIMIENTO_REPOSITORY, IMantenimientoRepository, MantenimientoQueryDto, MantenimientoResponse } from '../dto';

@Injectable()
export class ListMantenimientosUseCase {
  constructor(
    @Inject(MANTENIMIENTO_REPOSITORY)
    private readonly repo: IMantenimientoRepository,
  ) {}

  async execute(filters: MantenimientoQueryDto): Promise<MantenimientoResponse[]> {
    const mantenimientos = await this.repo.findAll(filters);
    return mantenimientos.map((m) => ({
      id: m.id,
      equipoId: m.equipoId,
      tipo: m.tipo,
      descripcion: m.descripcion,
      fechaProgramada: m.fechaProgramada?.toISOString?.() || m.fechaProgramada,
      estado: m.estado,
      prioridad: m.prioridad,
      duracionEstimada: m.duracionEstimada,
      horasReales: m.horasReales,
      tecnicoAsignadoId: m.tecnicoAsignadoId,
      createdAt: m.createdAt.toISOString(),
    }));
  }
}
