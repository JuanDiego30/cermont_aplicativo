/**
 * @service PlaneacionService
 * @description Servicio para gestión de planeación de órdenes de trabajo
 *
 * REFACTORIZADO: Ahora usa repositorio en lugar de Prisma directamente
 *
 * Principios aplicados:
 * - Type Safety: DTOs tipados, sin 'any'
 * - Clean Code: Código legible y bien formateado
 * - SRP: Maneja solo lógica de planeación
 * - Dependency Inversion: Usa repositorio en lugar de Prisma
 */
import { Inject, Injectable } from '@nestjs/common';
import { CreatePlaneacionDto } from './application/dto';
import { IPlaneacionRepository, PLANEACION_REPOSITORY } from './domain/repositories';

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

type EstadoPlaneacion = 'borrador' | 'aprobada' | 'rechazada' | 'cancelada';

export interface PlaneacionResponse<T> {
  message: string;
  data: T;
}

// ============================================================================
// Service
// ============================================================================

@Injectable()
@Injectable()
export class PlanningService {
  constructor(
    @Inject(PLANEACION_REPOSITORY)
    private readonly repository: IPlaneacionRepository
  ) {}

  /**
   * Busca planeación por orden con todas sus relaciones
   * REFACTORIZADO: Usa repositorio
   */
  async findByOrden(ordenId: string) {
    return this.repository.findByOrdenId(ordenId);
  }

  /**
   * Obtiene todas las planeaciones
   * NOTA: Si se necesita, crear método en repositorio
   */
  async findAll() {
    // Si se necesita este método, agregarlo al repositorio
    throw new Error('Método findAll() no implementado. Usar use-case GetPlaneacionUseCase');
  }

  /**
   * Crea o actualiza planeación para una orden
   * REFACTORIZADO: Usa repositorio
   */
  async createOrUpdate(ordenId: string, dto: CreatePlaneacionDto) {
    return this.repository.createOrUpdate(ordenId, dto);
  }

  /**
   * Aprueba una planeación
   * REFACTORIZADO: Usa repositorio
   */
  async aprobar(id: string, aprobadorId: string): Promise<PlaneacionResponse<unknown>> {
    const planeacion = await this.repository.aprobar(id, aprobadorId);

    return {
      message: 'Planeación aprobada exitosamente',
      data: planeacion,
    };
  }

  /**
   * Rechaza una planeación con motivo
   * REFACTORIZADO: Usa repositorio
   */
  async rechazar(id: string, motivo: string): Promise<PlaneacionResponse<unknown>> {
    const planeacion = await this.repository.rechazar(id, motivo);

    return {
      message: 'Planeación rechazada',
      data: planeacion,
    };
  }
}
