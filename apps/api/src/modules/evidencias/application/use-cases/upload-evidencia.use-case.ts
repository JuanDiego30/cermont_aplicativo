/**
 * @useCase UploadEvidenciaUseCase
 * @description Sube una nueva evidencia
 */
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import {
  IEvidenciaRepository,
  EVIDENCIA_REPOSITORY,
} from '../../domain/repositories/evidencia.repository.interface';
import { UploadEvidenciaDto, EvidenciaResponse } from '../dto/evidencia.dto';
import { EvidenciaEntity } from '../../domain/entities/evidencia.entity';

// Interface para el archivo (abstracción)
export interface FileUpload {
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
}

@Injectable()
export class UploadEvidenciaUseCase {
  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly evidenciaRepository: IEvidenciaRepository,
  ) { }

  async execute(
    dto: UploadEvidenciaDto,
    file: FileUpload,
    userId: string,
  ): Promise<EvidenciaResponse> {
    if (!file) {
      throw new BadRequestException('Archivo no proporcionado');
    }

    const tags = dto.tags ? dto.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

    // Crear Entidad
    // Nota: El archivo ya fue guardado por Multer (Infraestructura) antes de llegar aquí.
    // En Clean Architecture puro, el UseCase debería recibir el stream y guardarlo,
    // pero NestJS con Multer guarda primero. Aceptamos esto como pragmatismo.

    const entity = EvidenciaEntity.create({
      ejecucionId: dto.ejecucionId ?? '',
      ordenId: dto.ordenId,
      tipo: dto.tipo ?? 'FOTO',
      nombreArchivo: file.originalname,
      rutaArchivo: file.path,
      tamano: file.size,
      mimeType: file.mimetype,
      descripcion: dto.descripcion ?? '',
      tags: tags,
      subidoPor: userId,
    });

    const saved = await this.evidenciaRepository.create(entity);

    return this.mapToResponse(saved);
  }

  private mapToResponse(entity: EvidenciaEntity): EvidenciaResponse {
    return {
      id: entity.id,
      ejecucionId: entity.ejecucionId,
      ordenId: entity.ordenId,
      tipo: entity.tipo,
      nombreArchivo: entity.nombreArchivo,
      url: `/uploads/${entity.nombreArchivo}`, // O lógica de URL
      descripcion: entity.descripcion,
      tags: entity.tags,
      subidoPor: entity.subidoPor,
      createdAt: entity.createdAt.toISOString(),
      sincronizado: false, // Default since it was removed from entity props but exists in DTO?
    };
  }
}
