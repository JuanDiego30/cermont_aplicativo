/**
 * @service EjecucionService
 * @description Servicio para gestión de ejecución de órdenes de trabajo
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados, sin 'any'
 * - Clean Code: Código legible con responsabilidades claras
 * - SRP: Maneja solo lógica de ejecución
 */
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// ============================================================================
// Interfaces y DTOs
// ============================================================================

interface IniciarEjecucionDto {
  horasEstimadas?: number;
  observaciones?: string;
}

interface UpdateAvanceDto {
  avance: number;
  horasActuales?: number;
  observaciones?: string;
}

interface CompletarEjecucionDto {
  horasActuales: number;
  observaciones?: string;
}

export interface EjecucionResponse<T> {
  message: string;
  data: T;
}

// ============================================================================
// Constantes
// ============================================================================

const HORAS_ESTIMADAS_DEFAULT = 8;
const ESTADO_EN_PROGRESO = 'EN_PROGRESO';
const ESTADO_COMPLETADA = 'COMPLETADA';
const AVANCE_COMPLETO = 100;

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class EjecucionService {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Busca ejecución por orden con todas sus relaciones
   */
  async findByOrden(ordenId: string) {
    return this.prisma.ejecucion.findUnique({
      where: { ordenId },
      include: {
        tareas: true,
        checklists: true,
        evidenciasEjecucion: true,
      },
    });
  }

  /**
   * Inicia la ejecución de una orden
   * Requiere que exista planeación aprobada
   */
  async iniciar(
    ordenId: string,
    dto: IniciarEjecucionDto,
  ): Promise<EjecucionResponse<unknown>> {
    const planeacion = await this.validarPlaneacionExiste(ordenId);

    const ejecucion = await this.prisma.ejecucion.create({
      data: {
        ordenId,
        planeacionId: planeacion.id,
        estado: ESTADO_EN_PROGRESO,
        fechaInicio: new Date(),
        horasEstimadas: dto.horasEstimadas ?? HORAS_ESTIMADAS_DEFAULT,
        observacionesInicio: dto.observaciones,
      },
    });

    await this.actualizarEstadoOrden(ordenId, 'ejecucion', {
      fechaInicio: new Date(),
    });

    return {
      message: 'Ejecución iniciada exitosamente',
      data: ejecucion,
    };
  }

  /**
   * Actualiza el avance de una ejecución
   */
  async updateAvance(
    id: string,
    dto: UpdateAvanceDto,
  ): Promise<EjecucionResponse<unknown>> {
    await this.ensureEjecucionExists(id);

    const ejecucion = await this.prisma.ejecucion.update({
      where: { id },
      data: {
        avancePercentaje: dto.avance,
        horasActuales: dto.horasActuales,
        observaciones: dto.observaciones,
      },
    });

    return {
      message: 'Avance actualizado',
      data: ejecucion,
    };
  }

  /**
   * Completa una ejecución y actualiza la orden
   */
  async completar(
    id: string,
    dto: CompletarEjecucionDto,
  ): Promise<EjecucionResponse<unknown>> {
    const ejecucionActual = await this.ensureEjecucionExists(id);

    const ejecucion = await this.prisma.ejecucion.update({
      where: { id },
      data: {
        estado: ESTADO_COMPLETADA,
        avancePercentaje: AVANCE_COMPLETO,
        fechaTermino: new Date(),
        horasActuales: dto.horasActuales,
        observaciones: dto.observaciones,
      },
    });

    await this.actualizarEstadoOrden(ejecucionActual.ordenId, 'completada', {
      fechaFin: new Date(),
    });

    return {
      message: 'Ejecución completada exitosamente',
      data: ejecucion,
    };
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  /**
   * Valida que exista planeación para la orden
   */
  private async validarPlaneacionExiste(ordenId: string) {
    const planeacion = await this.prisma.planeacion.findUnique({
      where: { ordenId },
    });

    if (!planeacion) {
      throw new BadRequestException(
        'Debe existir una planeación aprobada antes de iniciar la ejecución',
      );
    }

    return planeacion;
  }

  /**
   * Verifica que la ejecución exista
   */
  private async ensureEjecucionExists(id: string) {
    const ejecucion = await this.prisma.ejecucion.findUnique({
      where: { id },
    });

    if (!ejecucion) {
      throw new NotFoundException(`Ejecución con ID ${id} no encontrada`);
    }

    return ejecucion;
  }

  /**
   * Actualiza el estado de la orden asociada
   */
  private async actualizarEstadoOrden(
    ordenId: string,
    estado: string,
    fechas: { fechaInicio?: Date; fechaFin?: Date },
  ) {
    await this.prisma.order.update({
      where: { id: ordenId },
      data: { estado: estado as any, ...fechas },
    });
  }

  /**
   * Obtiene estadísticas de ejecuciones
   */
  async getStats() {
    const enProgreso = await this.prisma.ejecucion.count({
      where: { estado: 'EN_PROGRESO' },
    });

    const pausadas = await this.prisma.ejecucion.count({
      where: { estado: 'PAUSADA' },
    });

    // Ejecuciones completadas hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finalizadasHoy = await this.prisma.ejecucion.count({
      where: {
        estado: 'COMPLETADA',
        updatedAt: {
          gte: hoy,
        },
      },
    });

    return {
      enProgreso,
      pausadas,
      finalizadasHoy,
    };
  }
}
