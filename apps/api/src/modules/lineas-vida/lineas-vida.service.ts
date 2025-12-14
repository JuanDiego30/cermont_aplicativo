/**
 * @service LineasVidaService
 * @description Servicio para gestión de inspecciones de líneas de vida
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados
 * - Clean Code: Código legible y bien formateado
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ============================================================================
// Interfaces y DTOs
// ============================================================================

type EstadoInspeccion = 'PENDIENTE' | 'EN_PROCESO' | 'APROBADA' | 'RECHAZADA';

interface CreateInspeccionLineaVidaDto {
  numeroLinea: string;
  fabricante?: string;
  ubicacion: string;
  estado?: EstadoInspeccion;
  observaciones?: string;
}

export interface InspeccionResponse<T> {
  message?: string;
  data: T;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class LineasVidaService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Lista todas las inspecciones de líneas de vida
   */
  async findAll(): Promise<InspeccionResponse<unknown[]>> {
    const lineas = await this.prisma.inspeccionLineaVida.findMany({
      include: { componentes: true },
      orderBy: { fechaInspeccion: 'desc' },
    });

    return { data: lineas };
  }

  /**
   * Obtiene una inspección por ID con sus componentes y condiciones
   */
  async findOne(id: string) {
    const inspeccion = await this.prisma.inspeccionLineaVida.findUnique({
      where: { id },
      include: {
        componentes: {
          include: { condiciones: true },
        },
      },
    });

    if (!inspeccion) {
      throw new NotFoundException(`Inspección con ID ${id} no encontrada`);
    }

    return inspeccion;
  }

  /**
   * Crea una nueva inspección de línea de vida
   */
  async create(
    dto: CreateInspeccionLineaVidaDto,
    inspectorId: string,
  ): Promise<InspeccionResponse<unknown>> {
    const inspeccion = await this.prisma.inspeccionLineaVida.create({
      data: {
        numeroLinea: dto.numeroLinea,
        fabricante: dto.fabricante || 'Desconocido',
        ubicacion: dto.ubicacion,
        inspectorId,
        estado: (dto.estado ?? 'PENDIENTE') as any,
        observaciones: dto.observaciones,
      },
    });

    return {
      message: 'Inspección creada exitosamente',
      data: inspeccion,
    };
  }
}
