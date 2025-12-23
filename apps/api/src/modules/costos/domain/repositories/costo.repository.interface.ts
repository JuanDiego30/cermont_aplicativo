/**
 * @interface ICostoRepository
 * 
 * Interfaz del repositorio de costos.
 * Define el contrato que debe implementar cualquier persistencia.
 */

import { Costo } from '../entities/costo.entity';
import { Money } from '../value-objects/money.vo';
import { CostoType } from '../value-objects/costo-type.vo';
import { CostoCategory } from '../value-objects/costo-category.vo';

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
export interface CostoFilters {
  ordenId?: string;
  type?: string;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  registeredBy?: string;
}

/**
 * Query de paginación
 */
export interface PaginationQuery {
  page: number;
  limit: number;
}

/**
 * Interfaz del repositorio de costos
 */
export interface ICostoRepository {
  /**
   * Guarda un costo (create o update)
   */
  save(costo: Costo): Promise<Costo>;

  /**
   * Encuentra por ID
   */
  findById(id: string): Promise<Costo | null>;

  /**
   * Lista costos con filtros y paginación
   */
  list(filters: CostoFilters, pagination: PaginationQuery): Promise<PaginatedResult<Costo>>;

  /**
   * Encuentra costos por orden
   */
  findByOrdenId(ordenId: string): Promise<Costo[]>;

  /**
   * Calcula total de costos por orden
   */
  calculateTotalByOrden(ordenId: string): Promise<Money>;

  /**
   * Obtiene total por tipo de costo
   */
  getTotalByType(ordenId: string, type: CostoType): Promise<Money>;

  /**
   * Obtiene total por categoría
   */
  getTotalByCategory(ordenId: string, category: CostoCategory): Promise<Money>;

  /**
   * Elimina un costo (soft delete)
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si existe
   */
  exists(id: string): Promise<boolean>;
}

/**
 * Token para inyección de dependencias
 */
export const COSTO_REPOSITORY = Symbol('ICostoRepository');

