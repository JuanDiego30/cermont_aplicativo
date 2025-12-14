/**
 * @useCase ListLineasVidaUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { LINEA_VIDA_REPOSITORY, ILineaVidaRepository, LineaVidaResponse } from '../dto';

@Injectable()
export class ListLineasVidaUseCase {
  constructor(
    @Inject(LINEA_VIDA_REPOSITORY)
    private readonly repo: ILineaVidaRepository,
  ) {}

  async execute(): Promise<LineaVidaResponse[]> {
    const lineas = await this.repo.findAll();
    return lineas.map((l) => ({
      id: l.id,
      ubicacion: l.ubicacion,
      tipo: l.tipo,
      longitud: l.longitud,
      capacidadUsuarios: l.capacidadUsuarios,
      fechaInstalacion: l.fechaInstalacion?.toISOString?.() || l.fechaInstalacion,
      fechaProximaInspeccion: l.fechaProximaInspeccion?.toISOString?.() || l.fechaProximaInspeccion,
      estado: l.estado || 'activo',
      observaciones: l.observaciones,
    }));
  }
}
