/**
 * @service EjecucionService
 * @description Servicio para gestión de ejecución de órdenes de trabajo
 * 
 * REFACTORIZADO: Ahora usa repositorio en lugar de Prisma directamente
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados, sin 'any'
 * - Clean Code: Código legible con responsabilidades claras
 * - SRP: Maneja solo lógica de ejecución
 * - Dependency Inversion: Usa repositorio en lugar de Prisma
 */
import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { EJECUCION_REPOSITORY, IEjecucionRepository } from './domain/repositories';

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
const ESTADO_EN_PROGRESO = 'en_progreso';
const ESTADO_COMPLETADA = 'completada';
const AVANCE_COMPLETO = 100;

// ============================================================================
// Service
// ============================================================================

@Injectable()
export class EjecucionService {
  constructor(
    @Inject(EJECUCION_REPOSITORY)
    private readonly repository: IEjecucionRepository,
  ) { }

  /**
   * Busca ejecución por orden con todas sus relaciones
   * REFACTORIZADO: Usa repositorio
   */
  async findByOrden(ordenId: string) {
    return this.repository.findByOrdenId(ordenId);
  }

  /**
   * Busca ejecuciones asignadas a un usuario (via orden)
   * NOTA: Este método requiere lógica adicional en el repositorio
   * Por ahora mantiene uso directo de Prisma, pero debería moverse al repositorio
   */
  async findForUser(userId: string) {
    // TODO: Mover esta lógica al repositorio
    // Por ahora se mantiene para compatibilidad
    throw new Error('Método findForUser() debe implementarse en el repositorio');
  }

  /**
   * Inicia la ejecución de una orden
   * REFACTORIZADO: Usa repositorio (el repositorio ya valida planeación)
   * NOTA: Este método requiere tecnicoId, pero el DTO no lo incluye
   * Se mantiene para compatibilidad, pero debería actualizarse
   */
  async iniciar(
    ordenId: string,
    dto: IniciarEjecucionDto,
    tecnicoId?: string,
  ): Promise<EjecucionResponse<unknown>> {
    if (!tecnicoId) {
      throw new BadRequestException('Se requiere ID del técnico para iniciar ejecución');
    }

    // El repositorio ya maneja la validación de planeación y actualización de orden
    const ejecucion = await this.repository.iniciar(
      ordenId,
      tecnicoId,
      dto.observaciones,
    );

    return {
      message: 'Ejecución iniciada exitosamente',
      data: ejecucion,
    };
  }

  /**
   * Actualiza el avance de una ejecución
   * REFACTORIZADO: Usa repositorio
   */
  async updateAvance(
    id: string,
    dto: UpdateAvanceDto,
  ): Promise<EjecucionResponse<unknown>> {
    const ejecucion = await this.repository.updateAvance(
      id,
      dto.avance,
      dto.observaciones,
    );

    return {
      message: 'Avance actualizado',
      data: ejecucion,
    };
  }

  /**
   * Completa una ejecución y actualiza la orden
   * REFACTORIZADO: Usa repositorio (el repositorio ya actualiza la orden)
   */
  async completar(
    id: string,
    dto: CompletarEjecucionDto,
  ): Promise<EjecucionResponse<unknown>> {
    const ejecucion = await this.repository.completar(id, {
      observacionesFinales: dto.observaciones,
    });

    return {
      message: 'Ejecución completada exitosamente',
      data: ejecucion,
    };
  }
}
