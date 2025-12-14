/**
 * @service EvidenciasService
 * @description Servicio de gestión de evidencias de ejecución
 * 
 * Principios aplicados:
 * - SRP: Cada método tiene una responsabilidad clara
 * - Type Safety: DTOs tipados, sin uso de 'any'
 * - Clean Code: Métodos legibles y documentados
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tipo de evidencia
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
 * Resultado de listado de evidencias
 */
export interface EvidenciasResult {
  data: unknown[];
}

@Injectable()
export class EvidenciasService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Obtiene evidencias de una orden
   */
  async findByOrden(ordenId: string): Promise<EvidenciasResult> {
    const evidencias = await this.prisma.evidenciaEjecucion.findMany({
      where: { ordenId },
      orderBy: { createdAt: 'desc' },
    });

    return { data: evidencias };
  }

  /**
   * Obtiene evidencias de una ejecución específica
   */
  async findByEjecucion(ejecucionId: string): Promise<EvidenciasResult> {
    const evidencias = await this.prisma.evidenciaEjecucion.findMany({
      where: { ejecucionId },
      orderBy: { createdAt: 'desc' },
    });

    return { data: evidencias };
  }

  /**
   * Sube una nueva evidencia
   */
  async upload(file: UploadedFile, dto: UploadEvidenciaDto, userId: string) {
    const tags = this.parseTags(dto.tags);

    // Construir datos base
    const createData = {
      ordenId: dto.ordenId,
      tipo: dto.tipo ?? 'FOTO',
      nombreArchivo: file.originalname,
      rutaArchivo: file.path,
      tamano: file.size,
      mimeType: file.mimetype,
      descripcion: dto.descripcion ?? '',
      subidoPor: userId,
      tags,
      // Fallback a string vacío si es undefined para satisfacer Prisma si es requerido
      ejecucionId: dto.ejecucionId ?? '',
    };

    const evidencia = await this.prisma.evidenciaEjecucion.create({
      data: createData,
    });

    return {
      message: 'Evidencia subida',
      data: evidencia,
    };
  }

  /**
   * Elimina una evidencia y su archivo físico
   */
  async remove(id: string) {
    const evidencia = await this.prisma.evidenciaEjecucion.findUnique({
      where: { id },
    });

    if (!evidencia) {
      throw new NotFoundException('Evidencia no encontrada');
    }

    // Eliminar archivo físico si existe
    await this.deleteFileIfExists(evidencia.rutaArchivo);

    // Eliminar registro de BD
    await this.prisma.evidenciaEjecucion.delete({ where: { id } });

    return { message: 'Evidencia eliminada' };
  }

  // =====================================================
  // MÉTODOS PRIVADOS - Helpers
  // =====================================================

  /**
   * Parsea string de tags separados por coma
   */
  private parseTags(tagsString?: string): string[] {
    if (!tagsString) return [];
    return tagsString.split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  /**
   * Elimina archivo del sistema de archivos si existe
   */
  private async deleteFileIfExists(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      // Log error but don't fail the operation
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
}
