/**
 * @useCase ListArchivadasUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import {
  ARCHIVADO_REPOSITORY,
  IArchivadoRepository,
  ArchivadoQueryDto,
  OrdenArchivadaResponse,
} from '../dto';

@Injectable()
export class ListArchivadasUseCase {
  constructor(
    @Inject(ARCHIVADO_REPOSITORY)
    private readonly repo: IArchivadoRepository,
  ) {}

  async execute(
    filters: ArchivadoQueryDto,
  ): Promise<{ data: OrdenArchivadaResponse[]; total: number; page: number; limit: number }> {
    const result = await this.repo.findAll(filters);

    return {
      data: result.data.map((a) => ({
        id: a.id,
        ordenId: a.ordenId,
        numero: a.orden.numero,
        titulo: a.orden.titulo,
        fechaArchivado: a.fechaArchivado.toISOString(),
        archivadoPor: a.archivadoPor?.nombre || 'Sistema',
        motivo: a.motivo,
      })),
      total: result.total,
      page: filters.page,
      limit: filters.limit,
    };
  }
}
