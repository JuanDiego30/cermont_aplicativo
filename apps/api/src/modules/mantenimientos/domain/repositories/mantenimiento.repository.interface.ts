/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MANTENIMIENTO REPOSITORY INTERFACE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Define el contrato para la persistencia de mantenimientos.
 * Implementado por la capa de infraestructura.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
  Mantenimiento,
  TipoMantenimiento,
  EstadoMantenimiento,
  PrioridadMantenimiento,
} from "@prisma/client";

export const MANTENIMIENTO_REPOSITORY = Symbol("MANTENIMIENTO_REPOSITORY");

export interface QueryMantenimientosOptions {
  activoId?: string;
  tipo?: TipoMantenimiento;
  estado?: EstadoMantenimiento;
  prioridad?: PrioridadMantenimiento;
  tecnicoId?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateMantenimientoData {
  titulo: string;
  descripcion?: string;
  tipo: TipoMantenimiento;
  prioridad?: PrioridadMantenimiento;
  fechaProgramada: Date;
  duracionEstimada?: number;
  activoId: string;
  activoTipo?: string;
  tecnicoId?: string;
  tareas?: string[];
  materiales?: string[];
  creadoPorId?: string;
}

export interface UpdateMantenimientoData {
  titulo?: string;
  descripcion?: string;
  tipo?: TipoMantenimiento;
  estado?: EstadoMantenimiento;
  prioridad?: PrioridadMantenimiento;
  fechaProgramada?: Date;
  duracionEstimada?: number;
  tecnicoId?: string;
  tareas?: string[];
  materiales?: string[];
  observaciones?: string;
}

export interface EjecutarMantenimientoData {
  fechaInicio?: Date;
  fechaFin?: Date;
  trabajoRealizado?: string;
  tareasCompletadas?: string[];
  problemasEncontrados?: string[];
  repuestosUtilizados?: string[];
  observaciones?: string;
  costoTotal?: number;
  calificacionFinal?: number;
  requiereSeguimiento?: boolean;
  recomendaciones?: string;
  evidenciaIds?: string[];
}

export interface IMantenimientoRepository {
  /**
   * Encuentra un mantenimiento por ID
   */
  findById(id: string): Promise<Mantenimiento | null>;

  /**
   * Lista mantenimientos con filtros y paginación
   */
  findMany(
    options: QueryMantenimientosOptions,
  ): Promise<PaginatedResult<Mantenimiento>>;

  /**
   * Obtiene mantenimientos próximos a vencer
   */
  findProximos(dias: number): Promise<Mantenimiento[]>;

  /**
   * Obtiene mantenimientos vencidos
   */
  findVencidos(): Promise<Mantenimiento[]>;

  /**
   * Crea un nuevo mantenimiento
   */
  create(data: CreateMantenimientoData): Promise<Mantenimiento>;

  /**
   * Actualiza un mantenimiento
   */
  update(id: string, data: UpdateMantenimientoData): Promise<Mantenimiento>;

  /**
   * Ejecuta un mantenimiento (marca como completado)
   */
  ejecutar(id: string, data: EjecutarMantenimientoData): Promise<Mantenimiento>;

  /**
   * Reprograma un mantenimiento
   */
  programar(
    id: string,
    fechaProgramada: Date,
    tecnicoId?: string,
    observaciones?: string,
  ): Promise<Mantenimiento>;

  /**
   * Elimina un mantenimiento
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si existe un mantenimiento
   */
  exists(id: string): Promise<boolean>;
}
