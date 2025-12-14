/**
 * @useCase ListEvidenciasByOrdenUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import {
  IEvidenciaRepository,
  EVIDENCIA_REPOSITORY,
} from '../../domain/repositories/evidencia.repository.interface';
import { EvidenciaResponse } from '../dto/evidencia.dto';
import { EvidenciaEntity } from '../../domain/entities/evidencia.entity';

@Injectable()
export class ListEvidenciasByOrdenUseCase {
  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly evidenciaRepository: IEvidenciaRepository,
  ) { }

  async execute(ordenId: string): Promise<EvidenciaResponse[]> {
    const evidencias = await this.evidenciaRepository.findAll({ ordenId });
    return evidencias.map(this.mapToResponse);
  }

  private mapToResponse(entity: EvidenciaEntity): EvidenciaResponse {
    return {
      id: entity.id,
      ejecucionId: entity.ejecucionId,
      ordenId: entity.ordenId,
      tipo: entity.tipo,
      nombreArchivo: entity.nombreArchivo,
      url: `/uploads/${entity.nombreArchivo}`,
      descripcion: entity.descripcion,
      tags: entity.tags,
      subidoPor: entity.subidoPor,
      createdAt: entity.createdAt.toISOString(),
      sincronizado: false,
    };
  }
}
