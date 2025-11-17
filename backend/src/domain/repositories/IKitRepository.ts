import type { Kit, KitCategory } from '../entities/Kit.js';

/**
 * Filtros para b�squeda de kits
 */
export interface KitFilters {
  category?: KitCategory;
  active?: boolean;
  search?: string;
  createdBy?: string;
}

/**
 * Opciones de paginaci�n
 */
export interface KitPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interface del repositorio de Kits
 * Define los m�todos de acceso a datos para kits t�picos
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
   * Buscar kits con filtros y paginaci�n (m�todo alternativo)
   */
  findAll(filters?: {
    active?: boolean;
    category?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ kits: Kit[]; total: number }>;

  /**
   * Buscar kits por categor�a
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
   * Contar kits por categor�a
   */
  countByCategory(category: string): Promise<number>;

  /**
   * Obtener estad�sticas de kits
   */
  getStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
  }>;
}
