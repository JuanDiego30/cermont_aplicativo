/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EVIDENCIAS SERVICE - CERMONT APLICATIVO (REFACTORIZADO)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { existsSync } from 'fs';

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
export class EvidenciasService {
  private readonly logger = new Logger(EvidenciasService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * ✅ OBTENER EVIDENCIAS POR ORDEN
   */
  async findByOrden(ordenId: string): Promise<EvidenciasResult> {
    const context = { action: 'FIND_BY_ORDEN', ordenId };
    this.logger.log('Obteniendo evidencias por orden', context);

    try {
      const evidencias = await this.prisma.evidenciaEjecucion.findMany({
        where: { ordenId },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log('Evidencias obtenidas exitosamente', {
        ...context,
        count: evidencias.length,
      });

      return { data: evidencias };
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
      const evidencias = await this.prisma.evidenciaEjecucion.findMany({
        where: { ejecucionId },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log('Evidencias obtenidas exitosamente', {
        ...context,
        count: evidencias.length,
      });

      return { data: evidencias };
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
      filename: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };

    this.logger.log('Iniciando upload de evidencia', context);

    try {
      // 1. Validar tipo
      const tipo = dto.tipo ?? 'FOTO';

      // 2. Validaciones de seguridad
      this.validateFileExtension(file.originalname, tipo);
      this.validateMimeType(file.mimetype);
      this.validateFileSize(file.size, tipo);

      // 3. Sanitizar nombre
      const safeFilename = this.sanitizeFilename(file.originalname);

      // 4. Parsear tags
      const tags = this.parseTags(dto.tags);

      // 5. Validar relaciones
      await this.validateRelaciones(dto.ordenId, dto.ejecucionId);

      // 6. Crear datos para Prisma
      // ✅ Según schema: ejecucionId es String (no opcional), pero puede omitirse en create
      const createData: {
        ordenId: string;
        tipo: string;
        nombreArchivo: string;
        rutaArchivo: string;
        tamano: number;
        mimeType: string;
        descripcion: string;
        subidoPor: string;
        tags: string[];
        ejecucionId: string; // ✅ Requerido según schema
      } = {
        ordenId: dto.ordenId,
        ejecucionId: dto.ejecucionId || '', // ✅ Fallback a string vacío como en original
        tipo: tipo as string,
        nombreArchivo: safeFilename,
        rutaArchivo: file.path,
        tamano: file.size,
        mimeType: file.mimetype,
        descripcion: dto.descripcion ?? '',
        subidoPor: userId,
        tags,
      };

      const evidencia = await this.prisma.evidenciaEjecucion.create({
        data: createData,
      });

      this.logger.log('Evidencia subida exitosamente', {
        ...context,
        evidenciaId: evidencia.id,
      });

      return {
        message: 'Evidencia subida',
        data: evidencia,
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

      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      ) {
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
      const evidencia = await this.prisma.evidenciaEjecucion.findUnique({
        where: { id },
      });

      if (!evidencia) {
        throw new NotFoundException('Evidencia no encontrada');
      }

      // Eliminar de BD primero
      await this.prisma.evidenciaEjecucion.delete({ where: { id } });

      // Eliminar archivo físico
      await this.deleteFileIfExists(evidencia.rutaArchivo);

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
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════════════════════════

  private validateFileExtension(filename: string, tipo: TipoEvidencia): void {
    const ext = path.extname(filename).toLowerCase();
    const allowedExts =
      UPLOAD_SECURITY_CONFIG.allowedExtensions[
        tipo as keyof typeof UPLOAD_SECURITY_CONFIG.allowedExtensions
      ];

    if (!allowedExts.includes(ext)) {
      throw new BadRequestException(
        `Extensión no permitida para ${tipo}: ${allowedExts.join(', ')}`,
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
      UPLOAD_SECURITY_CONFIG.maxFileSizes[
        tipo as keyof typeof UPLOAD_SECURITY_CONFIG.maxFileSizes
      ];

    if (size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `Archivo muy grande. Máximo para ${tipo}: ${maxSizeMB} MB`,
      );
    }
  }

  private sanitizeFilename(filename: string): string {
    let sanitized = filename.replace(/\.\.[\/\\]/g, '');
    sanitized = sanitized.replace(/[<>:"|?*]/g, '');

    if (sanitized.length > 255) {
      const ext = path.extname(sanitized);
      const base = path.basename(sanitized, ext).substring(0, 250);
      sanitized = base + ext;
    }

    return sanitized;
  }

  private parseTags(tagsString?: string): string[] {
    if (!tagsString || tagsString.trim() === '') {
      return [];
    }

    return tagsString
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && tag.length <= 50)
      .slice(0, 10);
  }

  private async validateRelaciones(
    ordenId: string,
    ejecucionId?: string,
  ): Promise<void> {
    // ✅ Según schema: tabla se llama "orders" (@@map)
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId },
    });

    if (!orden) {
      throw new NotFoundException(`Orden ${ordenId} no encontrada`);
    }

    if (ejecucionId) {
      // ✅ Según schema: tabla se llama "ejecuciones"
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
}



