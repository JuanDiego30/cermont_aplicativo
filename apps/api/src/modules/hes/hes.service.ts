/**
 * @service HesService
 * @description Servicio para gestión de Higiene, Seguridad y Medio Ambiente
 * 
 * Maneja equipos de seguridad e inspecciones HES
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados
 * - Clean Code: Código legible y bien formateado
 * - SRP: Solo maneja lógica de HES
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ============================================================================
// Interfaces y DTOs
// ============================================================================

type EstadoInspeccion = 'OK' | 'REQUIERE_ATENCION' | 'FUERA_SERVICIO';

interface CreateInspeccionDto {
  equipoId: string;
  ordenId?: string;
  estado?: EstadoInspeccion;
  observaciones?: string;
  fotos?: string[];
}

export interface HesResponse<T> {
  message?: string;
  data: T;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class HesService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Obtiene todos los equipos HES ordenados por número
   */
  async findAllEquipos(): Promise<HesResponse<unknown[]>> {
    const equipos = await this.prisma.equipoHES.findMany({
      orderBy: { numero: 'asc' },
    });

    return { data: equipos };
  }

  /**
   * Obtiene un equipo HES por ID con sus inspecciones
   */
  async findEquipo(id: string) {
    const equipo = await this.prisma.equipoHES.findUnique({
      where: { id },
      include: { inspecciones: true },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo HES con ID ${id} no encontrado`);
    }

    return equipo;
  }

  /**
   * Crea una nueva inspección HES y actualiza fecha de última inspección
   */
  async createInspeccion(
    dto: CreateInspeccionDto,
    inspectorId: string,
  ): Promise<HesResponse<unknown>> {
    const inspeccion = await this.prisma.inspeccionHES.create({
      data: {
        equipoId: dto.equipoId,
        inspectorId,
        estado: dto.estado ?? 'OK',
        observaciones: dto.observaciones,
        fotosEvidencia: dto.fotos ?? [],
        ordenId: dto.ordenId,
      },
    });

    // Actualizar fecha de última inspección en el equipo
    await this.prisma.equipoHES.update({
      where: { id: dto.equipoId },
      data: { ultimaInspeccion: new Date() },
    });

    return {
      message: 'Inspección creada exitosamente',
      data: inspeccion,
    };
  }

  /**
   * Obtiene inspecciones de un equipo ordenadas por fecha
   */
  async findInspeccionesByEquipo(equipoId: string): Promise<HesResponse<unknown[]>> {
    const inspecciones = await this.prisma.inspeccionHES.findMany({
      where: { equipoId },
      orderBy: { fechaInspeccion: 'desc' },
    });

    return { data: inspecciones };
  }
}
