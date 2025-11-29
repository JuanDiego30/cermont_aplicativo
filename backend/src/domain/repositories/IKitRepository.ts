import type { Kit, KitCategory } from '../entities/Kit.js';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortingParams {
  field: keyof Kit;
  order: 'asc' | 'desc';
}

export interface KitFilters {
  category?: KitCategory;
  active?: boolean;
  search?: string; // Búsqueda por nombre/descripción
  createdBy?: string;
}

/**
 * Repositorio: Kits Típicos
 * Gestión de plantillas de recursos reutilizables.
 */
export interface IKitRepository {
  create(kit: Omit<Kit, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Kit>;

  update(id: string, updates: Partial<Kit>): Promise<Kit>;

  findById(id: string): Promise<Kit | null>;

  /**
   * Búsqueda unificada con filtros, paginación y ordenamiento.
   * Reemplaza a find, findAll, findByCategory, findAllWithFilters.
   */
  findAll(
    filters: KitFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<Kit[]>;

  /**
   * Cuenta total de registros según filtros.
   * Esencial para paginación.
   */
  count(filters: KitFilters): Promise<number>;

  /**
   * Alias de findAll para compatibilidad.
   * @deprecated Usar findAll directamente.
   */
  findAllWithFilters(
    filters: KitFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<Kit[]>;

  /**
   * Soft delete: Marca deletedAt con fecha actual.
   */
  delete(id: string): Promise<void>;

  /**
   * Busca unicidad para evitar duplicados lógicos.
   * Útil en validaciones de creación.
   */
  findByNameAndCategory(name: string, category: KitCategory): Promise<Kit | null>;

  /**
   * Obtiene estadísticas agregadas para dashboards.
   * @deprecated Considerar mover a un servicio de reportes si crece la complejidad.
   */
  getStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
  }>;
}

