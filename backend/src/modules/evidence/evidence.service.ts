/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVIDENCIAS SERVICE - CERMONT APLICATIVO (LEGACY WRAPPER)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * @deprecated This service is maintained for backward compatibility.
 * Use the new Use Cases (UploadEvidenciaUseCase, etc.) for new code.
 */

import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import sanitize from 'sanitize-filename';
import { PrismaService } from '../../prisma/prisma.service';
import { Evidencia } from './domain/entities';
import { EVIDENCIA_REPOSITORY, IEvidenciaRepository } from './domain/repositories';

/**
 * Tipos de evidencia permitidos
 */
type TipoEvidencia = 'FOTO' | 'VIDEO' | 'DOCUMENTO' | 'AUDIO';

/**
 * DTO para subir evidencia
 */
interface UploadEvidenciaDto {
  ejecucionId?: string;
  ordenId: string;
  tipo?: TipoEvidencia;
  descripcion?: string;
  tags?: string;
}

/**
 * Información del archivo subido
 */
interface UploadedFile {
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
}

/**
 * Resultado de listado
 */
export interface EvidenciasResult {
  data: unknown[];
}

/**
 * Configuración de seguridad
 */
const UPLOAD_SECURITY_CONFIG = {
  allowedExtensions: {
    FOTO: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
    VIDEO: ['.mp4', '.mov', '.avi', '.webm'],
    DOCUMENTO: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    AUDIO: ['.mp3', '.wav', '.m4a', '.aac'],
  },
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/aac',
  ] as string[],
  maxFileSizes: {
    FOTO: 10 * 1024 * 1024,
    VIDEO: 100 * 1024 * 1024,
    DOCUMENTO: 20 * 1024 * 1024,
    AUDIO: 20 * 1024 * 1024,
  },
} as const;

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repository: IEvidenciaRepository,
    private readonly prisma: PrismaService
  ) {}

  /**
   * ✅ OBTENER EVIDENCIAS POR ORDEN
   */
  async findByOrden(ordenId: string): Promise<EvidenciasResult> {
    const context = { action: 'FIND_BY_ORDEN', ordenId };
    this.logger.log('Obteniendo evidencias por orden', context);

    try {
      const evidencias = await this.repository.findMany({ ordenId });
      const data = evidencias.map(e => this.mapEvidenciaToResponse(e));

      this.logger.log('Evidencias obtenidas exitosamente', {
        ...context,
        count: evidencias.length,
      });

      return { data };
    } catch (error) {
      const err = error as Error;
      this.logger.error('Error obteniendo evidencias por orden', {
        ...context,
        error: err.message,
        stack: err.stack,
      });
      throw new InternalServerErrorException('Error obteniendo evidencias');
    }
  }

  /**
   * ✅ OBTENER EVIDENCIAS POR EJECUCIÓN
   */
  async findByEjecucion(ejecucionId: string): Promise<EvidenciasResult> {
    const context = { action: 'FIND_BY_EJECUCION', ejecucionId };
    this.logger.log('Obteniendo evidencias por ejecución', context);

    try {
      const evidencias = await this.repository.findMany({ ejecucionId });
      const data = evidencias.map(e => this.mapEvidenciaToResponse(e));

      this.logger.log('Evidencias obtenidas exitosamente', {
        ...context,
        count: evidencias.length,
      });

      return { data };
    } catch (error) {
      const err = error as Error;
      this.logger.error('Error obteniendo evidencias por ejecución', {
        ...context,
        error: err.message,
        stack: err.stack,
      });
      throw new InternalServerErrorException('Error obteniendo evidencias');
    }
  }

  /**
   * ✅ SUBIR NUEVA EVIDENCIA (CON VALIDACIÓN DE SEGURIDAD)
   */
  async upload(file: UploadedFile, dto: UploadEvidenciaDto, userId: string) {
    const context = {
      action: 'UPLOAD_EVIDENCIA',
      ordenId: dto.ordenId,
      ejecucionId: dto.ejecucionId,
      userId,
      size: file.size,
      mimeType: file.mimetype,
    };

    this.logger.log('Iniciando upload de evidencia', context);

    try {
      // 1. Validar tipo
      const tipo = dto.tipo ?? 'FOTO';

      // 2. Validaciones de seguridad básicas
      this.validateFileExtension(file.originalname, tipo);
      this.validateMimeType(file.mimetype);
      this.validateFileSize(file.size, tipo);

      // 3. Validación profunda del contenido real del archivo
      await this.validateRealFileType(file.path, file.mimetype);

      // 4. Sanitizar nombre usando sanitize-filename
      const safeFilename = sanitize(file.originalname) || `file-${Date.now()}`;

      // 5. Parsear tags
      const tags = this.parseTags(dto.tags);

      // 6. Validar relaciones
      await this.validateRelaciones(dto.ordenId, dto.ejecucionId);

      // 7. Create domain entity using new Evidencia aggregate
      const evidencia = Evidencia.create({
        ejecucionId: dto.ejecucionId || '',
        ordenId: dto.ordenId,
        mimeType: file.mimetype,
        originalFilename: safeFilename,
        fileBytes: file.size,
        descripcion: dto.descripcion,
        tags,
        uploadedBy: userId,
      });

      // 8. Save using repository
      const saved = await this.repository.save(evidencia);

      this.logger.log('Evidencia subida exitosamente', {
        ...context,
        evidenciaId: saved.id.getValue(),
      });

      return {
        message: 'Evidencia subida',
        data: this.mapEvidenciaToResponse(saved),
      };
    } catch (error) {
      const err = error as Error;

      // Rollback: eliminar archivo físico
      await this.deleteFileIfExists(file.path);

      this.logger.error('Error subiendo evidencia', {
        ...context,
        error: err.message,
        stack: err.stack,
      });

      if (err instanceof BadRequestException || err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Error subiendo evidencia');
    }
  }

  /**
   * ✅ ELIMINAR EVIDENCIA
   */
  async remove(id: string) {
    const context = { action: 'REMOVE_EVIDENCIA', evidenciaId: id };
    this.logger.log('Eliminando evidencia', context);

    try {
      const evidencia = await this.repository.findById(id);

      if (!evidencia) {
        throw new NotFoundException('Evidencia no encontrada');
      }

      // Eliminar archivo físico primero
      await this.deleteFileIfExists(evidencia.storagePath.getValue());

      // Eliminar de BD (permanent delete for legacy compatibility)
      await this.repository.permanentDelete(id);

      this.logger.log('Evidencia eliminada exitosamente', context);

      return { message: 'Evidencia eliminada' };
    } catch (error) {
      const err = error as Error;
      this.logger.error('Error eliminando evidencia', {
        ...context,
        error: err.message,
        stack: err.stack,
      });

      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Error eliminando evidencia');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PRIVATE HELPER METHODS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Map new Evidencia aggregate to legacy response format
   */
  private mapEvidenciaToResponse(e: Evidencia) {
    return {
      id: e.id.getValue(),
      ejecucionId: e.ejecucionId,
      ordenId: e.ordenId,
      tipo: e.fileType.toSpanish(),
      nombreArchivo: e.originalFilename,
      rutaArchivo: e.storagePath.getValue(),
      tamano: e.fileSize.getBytes(),
      mimeType: e.mimeType.getValue(),
      descripcion: e.descripcion,
      tags: e.tags,
      subidoPor: e.uploadedBy,
      createdAt: e.uploadedAt,
      updatedAt: e.updatedAt,
    };
  }

  private validateFileExtension(filename: string, tipo: TipoEvidencia): void {
    const ext = path.extname(filename).toLowerCase();
    const allowedExts = UPLOAD_SECURITY_CONFIG.allowedExtensions[
      tipo as keyof typeof UPLOAD_SECURITY_CONFIG.allowedExtensions
    ] as readonly string[];

    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(
        `Extensión no permitida para ${tipo}: ${[...allowedExts].join(', ')}`
      );
    }
  }

  private validateMimeType(mimetype: string): void {
    const allowedTypes: string[] = UPLOAD_SECURITY_CONFIG.allowedMimeTypes;

    if (!allowedTypes.includes(mimetype)) {
      throw new BadRequestException(`Tipo de archivo no permitido: ${mimetype}`);
    }
  }

  private validateFileSize(size: number, tipo: TipoEvidencia): void {
    const maxSize =
      UPLOAD_SECURITY_CONFIG.maxFileSizes[tipo as keyof typeof UPLOAD_SECURITY_CONFIG.maxFileSizes];

    if (size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(`Archivo muy grande. Máximo para ${tipo}: ${maxSizeMB} MB`);
    }
  }

  private parseTags(tagsString?: string): string[] {
    if (!tagsString || tagsString.trim() === '') {
      return [];
    }

    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .slice(0, 10);
  }

  private async validateRelaciones(ordenId: string, ejecucionId?: string): Promise<void> {
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
    });

    if (!orden) {
      throw new NotFoundException(`Orden ${ordenId} no encontrada`);
    }

    if (ejecucionId) {
      const ejecucion = await this.prisma.ejecucion.findUnique({
        where: { id: ejecucionId },
      });

      if (!ejecucion) {
        throw new NotFoundException(`Ejecución ${ejecucionId} no encontrada`);
      }
    }
  }

  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      if (existsSync(filePath)) {
        await fs.unlink(filePath);
        this.logger.log('Archivo físico eliminado', { filePath });
      }
    } catch (error) {
      const err = error as Error;
      this.logger.warn('Error eliminando archivo físico', {
        filePath,
        error: err.message,
      });
    }
  }

  private async validateRealFileType(filePath: string, declaredMimeType: string): Promise<void> {
    try {
      const { fileTypeFromFile } = await import('file-type');
      const detectedType = await fileTypeFromFile(filePath);

      if (!detectedType) {
        this.logger.debug('No se pudo detectar tipo de archivo - permitiendo', {
          filePath,
        });
        return;
      }

      const declaredCategory = this.getMimeCategory(declaredMimeType);
      const detectedCategory = this.getMimeCategory(detectedType.mime);

      if (declaredCategory !== detectedCategory) {
        this.logger.warn('Tipo de archivo no coincide con contenido real', {
          filePath,
          declaredMimeType,
          detectedMime: detectedType.mime,
        });
        throw new BadRequestException(
          `El archivo no coincide con su extensión. Declarado: ${declaredMimeType}, Detectado: ${detectedType.mime}`
        );
      }

      this.logger.debug('Validación profunda de archivo exitosa', {
        filePath,
        detectedMime: detectedType.mime,
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const err = error as Error;
      this.logger.warn('Error en validación profunda de archivo', {
        filePath,
        error: err.message,
      });
    }
  }

  private getMimeCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/')) return 'application';
    return 'unknown';
  }
}
