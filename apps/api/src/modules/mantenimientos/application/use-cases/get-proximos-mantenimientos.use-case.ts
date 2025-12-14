/**
 * @useCase GetProximosMantenimientosUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { MANTENIMIENTO_REPOSITORY, IMantenimientoRepository, MantenimientoResponse } from '../dto';

const DEFAULT_DIAS = 7;

@Injectable()
export class GetProximosMantenimientosUseCase {
  constructor(
    @Inject(MANTENIMIENTO_REPOSITORY)
    private readonly repo: IMantenimientoRepository,
  ) {}

  async execute(dias?: number): Promise<MantenimientoResponse[]> {
    const mantenimientos = await this.repo.findProximos(dias ?? DEFAULT_DIAS);
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
