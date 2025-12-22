/**
 * @service HesService
 * @description Servicio para gestión de Higiene, Seguridad y Medio Ambiente
 * 
 * REFACTORIZADO: Ahora usa repositorio en lugar de Prisma directamente
 * 
 * Maneja equipos de seguridad e inspecciones HES
 * 
 * Principios aplicados:
 * - Type Safety: DTOs tipados
 * - Clean Code: Código legible y bien formateado
 * - SRP: Solo maneja lógica de HES
 * - Dependency Inversion: Usa repositorio en lugar de Prisma
 */
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { HES_REPOSITORY, IHESRepository, CreateHESDto } from './application/dto';

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
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository,
  ) { }

  /**
   * Obtiene todos los equipos HES ordenados por número
   * REFACTORIZADO: Usa repositorio
   */
  async findAllEquipos(): Promise<HesResponse<unknown[]>> {
    const equipos = await this.repository.findAllEquipos();
    return { data: equipos };
  }

  /**
   * Obtiene un equipo HES por ID con sus inspecciones
   * REFACTORIZADO: Usa repositorio
   */
  async findEquipo(id: string) {
    const equipo = await this.repository.findEquipoById(id);

    if (!equipo) {
      throw new NotFoundException(`Equipo HES con ID ${id} no encontrado`);
    }

    return equipo;
  }


  /**
   * Obtiene inspecciones de un equipo ordenadas por fecha
   * REFACTORIZADO: Usa repositorio
   */
  async findInspeccionesByEquipo(equipoId: string): Promise<HesResponse<unknown[]>> {
    const inspecciones = await this.repository.findByEquipo(equipoId);
    return { data: inspecciones };
  }

  /**
   * Crea una nueva inspección HES
   * REFACTORIZADO: Usa repositorio y actualiza equipo
   */
  async createInspeccion(
    dto: CreateInspeccionDto,
    inspectorId: string,
  ): Promise<HesResponse<unknown>> {
    // Convertir DTO del servicio al DTO del repositorio
    const createHESDto: CreateHESDto = {
      equipoId: dto.equipoId,
      ordenId: dto.ordenId,
      tipo: 'pre_uso', // Valor por defecto, debería venir en el DTO
      resultados: {},
      observaciones: dto.observaciones,
      aprobado: dto.estado === 'OK',
    };

    const inspeccion = await this.repository.create(createHESDto, inspectorId);

    // Actualizar fecha de última inspección en el equipo
    await this.repository.updateEquipoUltimaInspeccion(dto.equipoId, new Date());

    return {
      message: 'Inspección creada exitosamente',
      data: inspeccion,
    };
  }
}
