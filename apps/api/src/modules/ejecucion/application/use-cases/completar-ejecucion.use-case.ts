/**
 * @useCase CompletarEjecucionUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EJECUCION_REPOSITORY, IEjecucionRepository } from '../../domain/repositories';
import { EjecucionResponse, CompletarEjecucionDto } from '../dto';

@Injectable()
export class CompletarEjecucionUseCase {
  constructor(
    @Inject(EJECUCION_REPOSITORY)
    private readonly repo: IEjecucionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    dto: CompletarEjecucionDto,
  ): Promise<{ message: string; data: EjecucionResponse }> {
    const ejecucion = await this.repo.completar(id, {
      observacionesFinales: dto.observacionesFinales,
      firmaDigital: dto.firmaDigital,
    });

    this.eventEmitter.emit('ejecucion.completada', { ejecucionId: id });

    return {
      message: 'Ejecución completada',
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
