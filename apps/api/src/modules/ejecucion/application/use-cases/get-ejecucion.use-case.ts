/**
 * @useCase GetEjecucionUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EJECUCION_REPOSITORY, IEjecucionRepository } from '../../domain/repositories';
import { EjecucionResponse } from '../dto';

@Injectable()
export class GetEjecucionUseCase {
  constructor(
    @Inject(EJECUCION_REPOSITORY)
    private readonly repo: IEjecucionRepository,
  ) {}

  async execute(ordenId: string): Promise<EjecucionResponse | null> {
    const ejecucion = await this.repo.findByOrdenId(ordenId);
    if (!ejecucion) return null;

    return {
      id: ejecucion.id,
      ordenId: ejecucion.ordenId,
      tecnicoId: ejecucion.tecnicoId,
      estado: ejecucion.estado,
      avance: ejecucion.avance,
      horasReales: ejecucion.horasReales,
      fechaInicio: ejecucion.fechaInicio.toISOString(),
      fechaFin: ejecucion.fechaFin?.toISOString(),
      observaciones: ejecucion.observaciones,
      createdAt: ejecucion.createdAt.toISOString(),
      updatedAt: ejecucion.updatedAt.toISOString(),
    };
  }
}
