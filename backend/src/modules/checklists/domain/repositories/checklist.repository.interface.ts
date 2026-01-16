/**
 * @interface IChecklistRepository
 *
 * Interfaz del repositorio de checklists.
 * Define el contrato que debe implementar cualquier persistencia.
 */

import { Checklist } from '../entities/checklist.entity';

/**
 * Resultado paginado
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

/**
 * Filtros para búsqueda
 */
export interface ChecklistFilters {
  tipo?: string;
  categoria?: string;
  status?: string;
  activo?: boolean;
  ordenId?: string;
  ejecucionId?: string;
  search?: string;
}

/**
 * Query de paginación
 */
export interface PaginationQuery {
  page: number;
  limit: number;
}

/**
 * Interfaz del repositorio de checklists
 */
export interface IChecklistRepository {
  /**
   * Guarda un checklist (create o update)
   */
  save(checklist: Checklist): Promise<Checklist>;

  /**
   * Encuentra por ID
   */
  findById(id: string): Promise<Checklist | null>;

  /**
   * Encuentra plantilla por ID
   */
  findTemplateById(id: string): Promise<Checklist | null>;

  /**
   * Encuentra instancia por ID (asignada a orden/ejecución)
   */
  findInstanceById(id: string): Promise<Checklist | null>;

  /**
   * Lista checklists con filtros y paginación
   */
  list(filters: ChecklistFilters, pagination: PaginationQuery): Promise<PaginatedResult<Checklist>>;

  /**
   * Encuentra todas las plantillas
   */
  findAllTemplates(filters?: ChecklistFilters): Promise<Checklist[]>;

  /**
   * Encuentra por tipo
   */
  findByTipo(tipo: string): Promise<Checklist[]>;

  /**
   * Encuentra checklists asignados a una orden
   */
  findByOrden(ordenId: string): Promise<Checklist[]>;

  /**
   * Encuentra checklists asignados a una ejecución
   */
  findByEjecucion(ejecucionId: string): Promise<Checklist[]>;

  /**
   * Verifica si existe checklist asignado a orden/ejecución
   */
  existsAssigned(templateId: string, ordenId?: string, ejecucionId?: string): Promise<boolean>;

  /**
   * Elimina un checklist
   */
  delete(id: string): Promise<void>;
}

/**
 * Token para inyección de dependencias
 */
export const CHECKLIST_REPOSITORY = Symbol('IChecklistRepository');
