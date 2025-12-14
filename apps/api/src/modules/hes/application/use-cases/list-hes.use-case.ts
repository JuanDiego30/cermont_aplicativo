/**
 * @useCase ListHESUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { HES_REPOSITORY, IHESRepository, HESQueryDto, HESResponse } from '../dto';

@Injectable()
export class ListHESUseCase {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repo: IHESRepository,
  ) {}

  async execute(filters: HESQueryDto): Promise<HESResponse[]> {
    const inspecciones = filters.equipoId
      ? await this.repo.findByEquipo(filters.equipoId)
      : await this.repo.findAll(filters);

    return inspecciones.map((h) => ({
      id: h.id,
      equipoId: h.equipoId,
      ordenId: h.ordenId,
      tipo: h.tipo,
      resultados: h.resultados,
      observaciones: h.observaciones,
      aprobado: h.aprobado,
      inspectorId: h.inspectorId,
      createdAt: h.createdAt.toISOString(),
    }));
  }
}
