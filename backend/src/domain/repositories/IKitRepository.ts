import type { Kit, KitCategory } from '../entities/Kit';

/**
 * Filtros para búsqueda de kits
 */
export interface KitFilters {
  category?: KitCategory;
  active?: boolean;
  search?: string;
  createdBy?: string;
}

/**
 * Opciones de paginación
 */
export interface KitPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface del repositorio de Kits
 * Define los métodos de acceso a datos para kits típicos
 */
export interface IKitRepository {
  /**
   * Crear un nuevo kit
   */
  create(kit: Omit<Kit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Kit>;

  /**
   * Buscar kit por ID
   */
  findById(id: string): Promise<Kit | null>;

  /**
   * Buscar kits con filtros simples
   */
  find(filters: {
    category?: string;
    active?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<Kit[]>;

  /**
   * Buscar kits con filtros y paginación (método alternativo)
   */
  findAll(filters?: {
    active?: boolean;
    category?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ kits: Kit[]; total: number }>;

  /**
   * Buscar kits por categoría
   */
  findByCategory(category: string): Promise<Kit[]>;

  /**
   * Actualizar un kit
   */
  update(id: string, updates: Partial<Kit>): Promise<Kit>;

  /**
   * Eliminar un kit (soft delete - marcar como inactivo)
   */
  delete(id: string): Promise<void>;

  /**
   * Duplicar un kit (crear copia)
   */
  duplicate(id: string, userId: string): Promise<Kit>;

  /**
   * Contar kits por categoría
   */
  countByCategory(category: string): Promise<number>;

  /**
   * Obtener estadísticas de kits
   */
  getStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
  }>;
}
