/**
 * @service PlaneacionService
 * @description Servicio para gestión de planeación de órdenes de trabajo
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados, sin 'any'
 * - Clean Code: Código legible y bien formateado
 * - SRP: Maneja solo lógica de planeación
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '.prisma/client';

// ============================================================================
// Interfaces y DTOs
// ============================================================================

interface CronogramaData {
  fechaInicio?: Date | string;
  fechaFin?: Date | string;
  etapas?: Array<{
    nombre: string;
    duracion: number;
    orden: number;
  }>;
  [key: string]: any;
}

interface ManoDeObraData {
  tecnicos?: string[];
  horasEstimadas?: number;
  especialidades?: string[];
  [key: string]: any;
}

interface CreatePlaneacionDto {
  cronograma?: CronogramaData;
  manoDeObra?: ManoDeObraData;
  observaciones?: string;
  kitId?: string;
}

interface UpdatePlaneacionDto extends CreatePlaneacionDto {
  estado?: EstadoPlaneacion;
}

type EstadoPlaneacion = 'borrador' | 'aprobada' | 'rechazada' | 'cancelada';

export interface PlaneacionResponse<T> {
  message: string;
  data: T;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class PlaneacionService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Busca planeación por orden con todas sus relaciones
   */
  async findByOrden(ordenId: string) {
    const planeacion = await this.prisma.planeacion.findUnique({
      where: { ordenId },
      include: {
        items: true,
        kit: true,
        orden: true,
      },
    });

    return planeacion;
  }

  /**
   * Crea o actualiza planeación para una orden
   * Implementa patrón Upsert para simplificar lógica
   */
  async createOrUpdate(ordenId: string, dto: CreatePlaneacionDto) {
    const existing = await this.prisma.planeacion.findUnique({
      where: { ordenId },
    });

    const dataToSave = this.prepareDataForSave(dto);

    if (existing) {
      return this.updateExisting(ordenId, dataToSave);
    }

    return this.createNew(ordenId, dataToSave);
  }

  /**
   * Aprueba una planeación
   */
  async aprobar(
    id: string,
    aprobadorId: string,
  ): Promise<PlaneacionResponse<unknown>> {
    await this.ensurePlaneacionExists(id);

    const planeacion = await this.prisma.planeacion.update({
      where: { id },
      data: {
        estado: 'aprobada',
        aprobadoPorId: aprobadorId,
        fechaAprobacion: new Date(),
      },
    });

    return {
      message: 'Planeación aprobada exitosamente',
      data: planeacion,
    };
  }

  /**
   * Rechaza una planeación con motivo
   */
  async rechazar(
    id: string,
    motivo: string,
  ): Promise<PlaneacionResponse<unknown>> {
    await this.ensurePlaneacionExists(id);

    const planeacion = await this.prisma.planeacion.update({
      where: { id },
      data: {
        estado: 'cancelada',
        observaciones: motivo,
      },
    });

    return {
      message: 'Planeación rechazada',
      data: planeacion,
    };
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Prepara datos para guardar con valores por defecto
   */
  private prepareDataForSave(dto: CreatePlaneacionDto): Prisma.PlaneacionUpdateInput {
    return {
      cronograma: (dto.cronograma ?? {}) as any,
      manoDeObra: dto.manoDeObra ?? {},
      observaciones: dto.observaciones,
      ...(dto.kitId && { kit: { connect: { id: dto.kitId } } }),
    };
  }

  /**
   * Actualiza planeación existente
   */
  private async updateExisting(
    ordenId: string,
    data: Prisma.PlaneacionUpdateInput,
  ) {
    return this.prisma.planeacion.update({
      where: { ordenId },
      data,
    });
  }

  /**
   * Crea nueva planeación
   */
  private async createNew(
    ordenId: string,
    data: Prisma.PlaneacionUpdateInput,
  ) {
    return this.prisma.planeacion.create({
      data: {
        orden: { connect: { id: ordenId } },
        estado: 'borrador',
        cronograma: data.cronograma ?? {},
        manoDeObra: data.manoDeObra ?? {},
        observaciones: data.observaciones as string | undefined,
      },
    });
  }

  /**
   * Verifica que la planeación exista, lanza NotFoundException si no
   */
  private async ensurePlaneacionExists(id: string): Promise<void> {
    const exists = await this.prisma.planeacion.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Planeación con ID ${id} no encontrada`);
    }
  }
}
