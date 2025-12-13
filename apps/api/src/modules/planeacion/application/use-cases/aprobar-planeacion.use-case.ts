/**
 * @useCase AprobarPlaneacionUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PLANEACION_REPOSITORY, IPlaneacionRepository } from '../../domain/repositories';
import { PlaneacionResponse } from '../dto';

@Injectable()
export class AprobarPlaneacionUseCase {
  constructor(
    @Inject(PLANEACION_REPOSITORY)
    private readonly planeacionRepository: IPlaneacionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    aprobadorId: string,
  ): Promise<{ message: string; data: PlaneacionResponse }> {
    const planeacion = await this.planeacionRepository.aprobar(id, aprobadorId);

    this.eventEmitter.emit('planeacion.aprobada', {
      planeacionId: id,
      aprobadorId,
    });

    return {
      message: 'Planeación aprobada',
      data: {
        id: planeacion.id,
        ordenId: planeacion.ordenId,
        estado: planeacion.estado,
        cronograma: planeacion.cronograma,
        manoDeObra: planeacion.manoDeObra,
        observaciones: planeacion.observaciones,
        aprobadoPorId: planeacion.aprobadoPorId,
        fechaAprobacion: planeacion.fechaAprobacion?.toISOString(),
        createdAt: planeacion.createdAt.toISOString(),
        updatedAt: planeacion.updatedAt.toISOString(),
      },
    };
  }
}
