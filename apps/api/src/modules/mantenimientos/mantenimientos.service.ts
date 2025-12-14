/**
 * @service MantenimientosService
 * @description Servicio para gestión de mantenimientos programados
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados
 * - Clean Code: Código legible y bien formateado
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '.prisma/client';

// ============================================================================
// Interfaces y DTOs
// ============================================================================

type PrioridadMantenimiento = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
type TipoMantenimiento = 'PREVENTIVO' | 'CORRECTIVO' | 'PREDICTIVO';
type EstadoMantenimiento = 'PROGRAMADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO';

interface CreateMantenimientoDto {
  equipoId: string;
  tipo: TipoMantenimiento;
  titulo: string;
  descripcion?: string;
  fechaProgramada: string | Date;
  prioridad?: PrioridadMantenimiento;
  tecnicoId?: string;
}

interface UpdateMantenimientoDto {
  titulo?: string;
  descripcion?: string;
  fechaProgramada?: string | Date;
  prioridad?: PrioridadMantenimiento;
  estado?: EstadoMantenimiento;
  tecnicoAsignadoId?: string;
}

export interface MantenimientoResponse<T> {
  message?: string;
  data: T;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class MantenimientosService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Lista mantenimientos con filtro opcional por estado
   */
  async findAll(estado?: string): Promise<MantenimientoResponse<unknown[]>> {
    const where: Prisma.MantenimientoWhereInput = estado
      ? { estado: estado as EstadoMantenimiento }
      : {};

    try {
      const mantenimientos = await this.prisma.mantenimiento.findMany({
        where,
        include: {
          equipo: true,
          tecnicoAsignado: {
            select: { id: true, name: true },
          },
        },
        orderBy: { fechaProgramada: 'asc' },
      });
      return { data: mantenimientos };
    } catch (error) {
      console.error('Error in MantenimientosService.findAll:', error);
      throw error;
    }
  }

  /**
   * Obtiene un mantenimiento por ID
   */
  async findOne(id: string) {
    const mantenimiento = await this.prisma.mantenimiento.findUnique({
      where: { id },
      include: {
        equipo: true,
        tecnicoAsignado: true,
        creadoPor: true,
      },
    });

    if (!mantenimiento) {
      throw new NotFoundException('Mantenimiento no encontrado');
    }

    return mantenimiento;
  }

  /**
   * Crea un nuevo mantenimiento
   */
  async create(
    dto: CreateMantenimientoDto,
    userId: string,
  ): Promise<MantenimientoResponse<unknown>> {
    const mantenimiento = await this.prisma.mantenimiento.create({
      data: {
        equipoId: dto.equipoId,
        tipo: dto.tipo,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaProgramada: new Date(dto.fechaProgramada),
        prioridad: dto.prioridad ?? 'MEDIA',
        tecnicoAsignadoId: dto.tecnicoId,
        creadoPorId: userId,
      },
    });

    return {
      message: 'Mantenimiento creado exitosamente',
      data: mantenimiento,
    };
  }

  /**
   * Actualiza un mantenimiento existente
   */
  async update(
    id: string,
    dto: UpdateMantenimientoDto,
  ): Promise<MantenimientoResponse<unknown>> {
    await this.findOne(id); // Verifica que exista

    const mantenimiento = await this.prisma.mantenimiento.update({
      where: { id },
      data: dto,
    });

    return {
      message: 'Mantenimiento actualizado',
      data: mantenimiento,
    };
  }
}
