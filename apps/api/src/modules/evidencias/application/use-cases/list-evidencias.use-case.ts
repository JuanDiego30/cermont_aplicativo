/**
 * @useCase ListEvidenciasUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EVIDENCIA_REPOSITORY, IEvidenciaRepository } from '../../domain/repositories';
import { ListEvidenciasResponse } from '../dto';

@Injectable()
export class ListEvidenciasUseCase {
  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repo: IEvidenciaRepository,
  ) {}

  async execute(ordenId: string): Promise<ListEvidenciasResponse> {
    const [evidencias, total] = await Promise.all([
      this.repo.findByOrdenId(ordenId),
      this.repo.count(ordenId),
    ]);

    return {
      data: evidencias.map((e) => ({
        id: e.id,
        ordenId: e.ordenId,
        tipo: e.tipo,
        url: e.url,
        descripcion: e.descripcion,
        latitud: e.latitud,
        longitud: e.longitud,
        creadoPorId: e.creadoPorId,
        createdAt: e.createdAt.toISOString(),
      })),
      total,
    };
  }
}
