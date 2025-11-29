import type { Order, OrderState } from '../entities/Order.js';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortingParams {
  field: keyof Order;
  order: 'asc' | 'desc';
}

export interface OrderFilters {
  state?: OrderState;
  responsibleId?: string;
  createdBy?: string;
  archived?: boolean;
  search?: string;

  // Filtros temporales para reportes
  dateRange?: {
    field: 'createdAt' | 'updatedAt' | 'dueDate';
    start: Date;
    end: Date;
  };
}

/**
 * Estadísticas avanzadas (Dashboard)
 * Movido a una interfaz separada para no saturar el repositorio base
 * si se implementa CQRS o un servicio de reportes.
 */
export interface OrderDashboardStats {
  total: number;
  active: number;
  archived: number;
  byState: Record<OrderState, number>;
  byResponsible: Array<{ id: string; name: string; count: number }>;
  completionRate: { averageHours: number; medianHours: number };
}

export interface OrderStats {
  total: number;
  active: number;
  archived: number;
  byState: Record<OrderState, number>;
}

/**
 * Repositorio: Órdenes de Trabajo
 * Gestión del ciclo de vida operativo.
 */
export interface IOrderRepository {
  // --- CRUD Básico ---
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>): Promise<Order>;

  update(id: string, order: Partial<Order>): Promise<Order>;

  findById(id: string): Promise<Order | null>;

  /**
   * Búsqueda unificada.
   * Reemplaza a findByState, findByResponsible, findActive, findArchived.
   */
  findAll(
    filters: OrderFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<Order[]>;

  count(filters: OrderFilters): Promise<number>;

  // --- Gestión de Estado y Archivo ---

  /**
   * Soft delete (archivo).
   * Cambia el estado a 'archived' y setea archivedAt/archivedBy.
   */
  archive(id: string, userId: string): Promise<Order>;

  unarchive(id: string): Promise<Order>;

  /**
   * Hard delete (solo admins).
   */
  delete(id: string): Promise<void>;

  // --- Métodos Analíticos (Dashboard) ---

  /**
   * Obtiene estadísticas agregadas.
   * Reemplaza a countByState, countByResponsible, etc.
   */
  getDashboardStats(filters?: OrderFilters): Promise<OrderDashboardStats>;

  /**
   * Genera el siguiente número de orden consecutivo (ej: 2025-0001).
   */
  nextOrderNumber(year: number): Promise<string>;

  // --- Métodos de paginación y estadísticas adicionales ---

  /**
   * Busca órdenes con parámetros de paginación simples.
   */
  find(params: { limit: number; skip: number }): Promise<Order[]>;

  /**
   * Cuenta órdenes totales con filtros opcionales.
   * Alias para count.
   */
  countOrders(filters?: any): Promise<number>;

  /**
   * Cuenta órdenes agrupadas por estado.
   */
  countByState(filters?: any): Promise<Record<string, number>>;

  /**
   * Cuenta órdenes agrupadas por responsable.
   */
  countByResponsible(filters?: any): Promise<Record<string, number>>;

  /**
   * Cuenta órdenes archivadas.
   */
  countArchived(filters?: any): Promise<number>;

  /**
   * Cuenta órdenes completadas este mes.
   */
  countCompletedThisMonth(filters?: any): Promise<number>;

  /**
   * Cuenta órdenes completadas esta semana.
   */
  countCompletedThisWeek(filters?: any): Promise<number>;

  /**
   * Obtiene estadísticas de completación.
   */
  getCompletionStats(filters?: any): Promise<any>;

  // --- Métodos para obtener entidades relacionadas ---

  /**
   * Busca planes de trabajo asociados a una orden.
   */
  findWorkPlansByOrderId(orderId: string): Promise<any[]>;

  /**
   * Busca evidencias asociadas a una orden.
   */
  findEvidencesByOrderId(orderId: string): Promise<any[]>;

  /**
   * Busca logs de auditoría asociados a una orden.
   */
  findAuditLogByOrderId(orderId: string): Promise<any[]>;
}


