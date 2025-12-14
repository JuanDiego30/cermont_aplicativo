/**
 * @useCase CreateLineaVidaUseCase
 * Crea una nueva línea de vida en el sistema
 */
import { Injectable, Inject } from '@nestjs/common';
import { LINEA_VIDA_REPOSITORY, ILineaVidaRepository, CreateLineaVidaDto, LineaVidaResponse } from '../dto';

@Injectable()
export class CreateLineaVidaUseCase {
  constructor(
    @Inject(LINEA_VIDA_REPOSITORY)
    private readonly repo: ILineaVidaRepository,
  ) {}

  async execute(dto: CreateLineaVidaDto, creadorId: string): Promise<{ message: string; data: LineaVidaResponse }> {
    const linea = await this.repo.create(dto, creadorId);
    return {
      message: 'Línea de vida registrada',
      data: {
        id: linea.id,
        ubicacion: linea.ubicacion,
        tipo: linea.tipo,
        longitud: linea.longitud,
        capacidadUsuarios: linea.capacidadUsuarios,
        fechaInstalacion: linea.fechaInstalacion?.toISOString?.() || linea.fechaInstalacion,
        fechaProximaInspeccion: linea.fechaProximaInspeccion?.toISOString?.() || linea.fechaProximaInspeccion,
        estado: linea.estado || 'activo',
        observaciones: linea.observaciones,
      },
    };
  }
}
