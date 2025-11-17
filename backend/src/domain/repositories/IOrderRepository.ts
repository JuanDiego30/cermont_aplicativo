import type { Order, OrderState } from '../entities/Order';

/**
 * Filtros para buscar órdenes
 * @interface OrderFilters
 */
export interface OrderFilters {
  /** Filtrar por estado de la orden */
  state?: OrderState;
  /** Filtrar por responsable asignado */
  responsibleId?: string;
  /** Filtrar por usuario creador */
  createdBy?: string;
  /** Filtrar por archivadas o activas */
  archived?: boolean;
  /** Búsqueda de texto en clientName, description o location */
  search?: string;
  /** Página para paginación offset-based */
  page?: number;
  /** Límite de resultados por página */
  limit?: number;
  /** Saltar N registros (alternativa a page) */
  skip?: number;
}

/**
 * Estadísticas agregadas de órdenes
 * @interface OrderStats
 */
export interface OrderStats {
  /** Total de órdenes en el sistema */
  total: number;
  /** Total de órdenes activas (no archivadas) */
  active: number;
  /** Total de órdenes archivadas */
  archived: number;
  /** Distribución de órdenes por estado */
  byState: Record<OrderState, number>;
}

/**
 * Repositorio: Órdenes de trabajo
 * Contrato para persistencia y consulta de órdenes
 * @interface IOrderRepository
 * @since 1.0.0
 */
export interface IOrderRepository {
  /**
   * Crea una nueva orden
   * @param {Omit<Order, 'id' | 'createdAt' | 'updatedAt'>} order - Datos de la orden (timestamps generados automáticamente)
   * @returns {Promise<Order>} Orden creada con ID y timestamps
   * @throws {Error} Si falla la persistencia
   */
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;

  /**
   * Busca una orden por ID
   * @param {string} id - ID de la orden
   * @returns {Promise<Order | null>} Orden o null si no existe
   */
  findById(id: string): Promise<Order | null>;

  /**
   * Lista órdenes en un estado específico
   * @param {OrderState} state - Estado a filtrar
   * @returns {Promise<Order[]>} Órdenes en el estado ordenadas por updatedAt DESC
   */
  findByState(state: OrderState): Promise<Order[]>;

  /**
   * Órdenes asignadas a un responsable
   * @param {string} responsibleId - ID del responsable
   * @returns {Promise<Order[]>} Órdenes asignadas
   */
  findByResponsible(responsibleId: string): Promise<Order[]>;

  /**
   * Órdenes activas (sin archivar)
   * @param {Partial<OrderFilters>} [filters] - Filtros opcionales adicionales
   * @returns {Promise<Order[]>} Órdenes activas
   */
  findActive(filters?: Partial<OrderFilters>): Promise<Order[]>;

  /**
   * Órdenes archivadas
   * @param {Partial<OrderFilters>} [filters] - Filtros opcionales adicionales
   * @returns {Promise<Order[]>} Órdenes archivadas
   */
  findArchived(filters?: Partial<OrderFilters>): Promise<Order[]>;

  /**
   * Busca órdenes con filtros y paginación
   * @param {OrderFilters} filters - Filtros de búsqueda
   * @returns {Promise<Order[]>} Lista filtrada
   */
  find(filters: OrderFilters): Promise<Order[]>;

  /**
   * Busca todas las órdenes con filtros y paginación (retorna también el total)
   * @param {OrderFilters} filters - Filtros de búsqueda
   * @returns {Promise<{ orders: Order[]; total: number }>} Órdenes y total
   */
  findAll(filters: OrderFilters): Promise<{ orders: Order[]; total: number }>;

  /**
   * Cuenta órdenes que coinciden con filtros (sin paginación)
   * @param {Omit<OrderFilters, 'page' | 'limit' | 'skip'>} filters - Filtros sin paginación
   * @returns {Promise<number>} Total de órdenes
   */
  count(filters: Omit<OrderFilters, 'page' | 'limit' | 'skip'>): Promise<number>;

  /**
   * Obtiene estadísticas agregadas de órdenes
   * @returns {Promise<OrderStats>} Estadísticas útiles para dashboards
   */
  getStats(): Promise<OrderStats>;

  /**
   * Actualiza una orden parcialmente
   * @param {string} id - ID de la orden
   * @param {Partial<Order>} order - Campos a actualizar
   * @returns {Promise<Order>} Orden actualizada con updatedAt actualizado automáticamente
   * @throws {Error} Si no existe la orden
   */
  update(id: string, order: Partial<Order>): Promise<Order>;

  /**
   * Archiva una orden (soft delete)
   * @param {string} id - ID de la orden
   * @param {string} userId - ID del usuario que archiva
   * @returns {Promise<Order>} Orden archivada
   * @throws {Error} Si ya estaba archivada o no existe
   */
  archive(id: string, userId: string): Promise<Order>;

  /**
   * Restaura una orden archivada
   * @param {string} id - ID de la orden
   * @returns {Promise<Order>} Orden restaurada
   * @throws {Error} Si la orden no existe o no está archivada
   */
  unarchive(id: string): Promise<Order>;

  /**
   * Elimina una orden permanentemente (hard delete)
   * @param {string} id - ID de la orden
   * @returns {Promise<boolean>} True si se eliminó, false si no existía
   */
  delete(id: string): Promise<boolean>;
}

