/**
 * @service HesService
 * @description Servicio LEGACY para gestión de Higiene, Seguridad y Medio Ambiente
 * 
 * LEGACY SERVICE: Uses Prisma directly for backward compatibility.
 * For new features, use the Use Cases in application/use-cases/
 * 
 * NOTE: This service handles "equipos" (equipment) related functionality
 * which is separate from the DDD HES (Hoja de Entrada de Servicio) domain.
 */
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(HesService.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('ℹ️  HesService: Legacy service. Consider migrating to Use Cases.');
  }

  /**
   * Obtiene todos los equipos HES ordenados por número
   * @deprecated Use DDD use cases for new features
   */
  async findAllEquipos(): Promise<HesResponse<unknown[]>> {
    try {
      const equipos = await this.prisma.equipoHES.findMany({
        orderBy: { numero: 'asc' },
        include: {
          inspecciones: {
            take: 1,
            orderBy: { fechaInspeccion: 'desc' },
          },
        },
      });
      return { data: equipos };
    } catch (error) {
      this.logger.error('Error fetching equipos HES', error);
      // If table doesn't exist, return empty array
      return { data: [] };
    }
  }

  /**
   * Obtiene un equipo HES por ID con sus inspecciones
   * @deprecated Use DDD use cases for new features
   */
  async findEquipo(id: string) {
    try {
      const equipo = await this.prisma.equipoHES.findUnique({
        where: { id },
        include: {
          inspecciones: {
            orderBy: { fechaInspeccion: 'desc' },
          },
        },
      });

      if (!equipo) {
        throw new NotFoundException(`Equipo HES con ID ${id} no encontrado`);
      }

      return equipo;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error fetching equipo HES', error);
      throw new NotFoundException(`Equipo HES con ID ${id} no encontrado`);
    }
  }

  /**
   * Obtiene inspecciones de un equipo ordenadas por fecha
   * @deprecated Use DDD use cases for new features
   */
  async findInspeccionesByEquipo(equipoId: string): Promise<HesResponse<unknown[]>> {
    try {
      const inspecciones = await this.prisma.inspeccionHES.findMany({
        where: { equipoId },
        orderBy: { fechaInspeccion: 'desc' },
      });
      return { data: inspecciones };
    } catch (error) {
      this.logger.error('Error fetching inspecciones', error);
      return { data: [] };
    }
  }

  /**
   * Crea una nueva inspección HES
   * @deprecated Use DDD use cases for new features
   */
  async createInspeccion(
    dto: CreateInspeccionDto,
    inspectorId: string,
  ): Promise<HesResponse<unknown>> {
    try {
      const inspeccion = await this.prisma.inspeccionHES.create({
        data: {
          equipoId: dto.equipoId,
          ordenId: dto.ordenId,
          estado: dto.estado || 'OK',
          observaciones: dto.observaciones,
          aprobada: dto.estado === 'OK',
          inspectorId,
          fechaInspeccion: new Date(),
          fotosEvidencia: dto.fotos ?? [],
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
    } catch (error) {
      this.logger.error('Error creating inspeccion', error);
      throw error;
    }
  }
}
