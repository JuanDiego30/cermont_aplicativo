/**
 * @useCase UploadEvidenciaUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVIDENCIA_REPOSITORY, IEvidenciaRepository } from '../../domain/repositories';
import { UploadEvidenciaDto, EvidenciaResponse } from '../dto';

@Injectable()
export class UploadEvidenciaUseCase {
  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repo: IEvidenciaRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    ordenId: string,
    userId: string,
    fileUrl: string,
    dto: UploadEvidenciaDto,
  ): Promise<{ message: string; data: EvidenciaResponse }> {
    const evidencia = await this.repo.create({
      ordenId,
      tipo: dto.tipo,
      url: fileUrl,
      descripcion: dto.descripcion,
      latitud: dto.latitud,
      longitud: dto.longitud,
      creadoPorId: userId,
    });

    this.eventEmitter.emit('evidencia.uploaded', {
      ordenId,
      evidenciaId: evidencia.id,
    });

    return {
      message: 'Evidencia subida exitosamente',
      data: {
        id: evidencia.id,
        ordenId: evidencia.ordenId,
        tipo: evidencia.tipo,
        url: evidencia.url,
        descripcion: evidencia.descripcion,
        latitud: evidencia.latitud,
        longitud: evidencia.longitud,
        creadoPorId: evidencia.creadoPorId,
        createdAt: evidencia.createdAt.toISOString(),
      },
    };
  }
}
