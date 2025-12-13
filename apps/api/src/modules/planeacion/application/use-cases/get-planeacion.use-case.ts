/**
 * @useCase GetPlaneacionUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { PLANEACION_REPOSITORY, IPlaneacionRepository } from '../../domain/repositories';
import { PlaneacionResponse } from '../dto';

@Injectable()
export class GetPlaneacionUseCase {
  constructor(
    @Inject(PLANEACION_REPOSITORY)
    private readonly planeacionRepository: IPlaneacionRepository,
  ) {}

  async execute(ordenId: string): Promise<PlaneacionResponse | null> {
    const planeacion = await this.planeacionRepository.findByOrdenId(ordenId);
    if (!planeacion) return null;

    return {
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
    };
  }
}
