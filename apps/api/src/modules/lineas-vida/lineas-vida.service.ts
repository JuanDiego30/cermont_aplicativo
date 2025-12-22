/**
 * @service LineasVidaService
 * @description Servicio para gestión de inspecciones de líneas de vida
 * 
 * REFACTORIZADO: Ahora usa repositorio en lugar de Prisma directamente
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados
 * - Clean Code: Código legible y bien formateado
 * - Dependency Inversion: Usa repositorio en lugar de Prisma
 */
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { LINEA_VIDA_REPOSITORY, ILineaVidaRepository, InspeccionLineaVidaDto } from './application/dto';

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
  constructor(
    @Inject(LINEA_VIDA_REPOSITORY)
    private readonly repository: ILineaVidaRepository,
  ) { }

  /**
   * Lista todas las inspecciones de líneas de vida
   * REFACTORIZADO: Usa repositorio
   */
  async findAll(): Promise<InspeccionResponse<unknown[]>> {
    const lineas = await this.repository.findAll();
    return { data: lineas };
  }

  /**
   * Obtiene una inspección por ID con sus componentes y condiciones
   * REFACTORIZADO: Usa repositorio
   */
  async findOne(id: string) {
    const inspeccion = await this.repository.findById(id);

    if (!inspeccion) {
      throw new NotFoundException(`Inspección con ID ${id} no encontrada`);
    }

    return inspeccion;
  }

  /**
   * Crea una nueva inspección de línea de vida
   * REFACTORIZADO: Usa repositorio
   */
  async create(
    dto: CreateInspeccionLineaVidaDto,
    inspectorId: string,
  ): Promise<InspeccionResponse<unknown>> {
    // Convertir DTO del servicio al DTO del repositorio
    const inspeccionDto: InspeccionLineaVidaDto = {
      lineaVidaId: dto.numeroLinea,
      tipo: 'visual', // Valor por defecto, debería venir en el DTO
      resultados: {},
      aprobado: dto.estado === 'APROBADA',
      observaciones: dto.observaciones,
    };

    const inspeccion = await this.repository.createInspeccion(inspeccionDto, inspectorId);

    return {
      message: 'Inspección creada exitosamente',
      data: inspeccion,
    };
  }
}
