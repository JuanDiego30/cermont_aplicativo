/**
 * @useCase UpdateAvanceUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EJECUCION_REPOSITORY, IEjecucionRepository } from '../../domain/repositories';
import { EjecucionResponse } from '../dto';

@Injectable()
export class UpdateAvanceUseCase {
  constructor(
    @Inject(EJECUCION_REPOSITORY)
    private readonly repo: IEjecucionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    avance: number,
    observaciones?: string,
  ): Promise<{ message: string; data: EjecucionResponse }> {
    const ejecucion = await this.repo.updateAvance(id, avance, observaciones);

    this.eventEmitter.emit('ejecucion.avance', {
      ejecucionId: id,
      avance,
    });

    return {
      message: `Avance actualizado a ${avance}%`,
      data: this.toResponse(ejecucion),
    };
  }

  private toResponse(e: any): EjecucionResponse {
    return {
      id: e.id,
      ordenId: e.ordenId,
      tecnicoId: e.tecnicoId,
      estado: e.estado,
      avance: e.avance,
      horasReales: e.horasReales,
      fechaInicio: e.fechaInicio.toISOString(),
      fechaFin: e.fechaFin?.toISOString(),
      observaciones: e.observaciones,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    };
  }
}
