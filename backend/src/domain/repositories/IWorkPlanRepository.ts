import type { WorkPlan, WorkPlanStatus } from '../entities/WorkPlan.js';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortingParams {
  field: keyof WorkPlan;
  order: 'asc' | 'desc';
}

export interface WorkPlanFilters {
  orderId?: string;
  status?: WorkPlanStatus;
  createdBy?: string;
  // reviewedBy?: string; // Se puede inferir de status + approvedBy/rejectedBy si se estructura bien
}

/**
 * Repositorio: Planes de Trabajo
 * Persistencia de la estrategia operativa.
 */
export interface IWorkPlanRepository {
  create(workPlan: Omit<WorkPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkPlan>;

  /**
   * Actualización genérica.
   * Los métodos de negocio (approve, reject, addMaterial) deben resolverse en el UseCase
   * y luego llamar a este método con el objeto modificado.
   */
  update(id: string, workPlan: Partial<WorkPlan>): Promise<WorkPlan>;

  findById(id: string): Promise<WorkPlan | null>;

  /**
   * Busca el plan asociado a una orden.
   * Relación 1:1.
   */
  findByOrderId(orderId: string): Promise<WorkPlan | null>;

  /**
   * Búsqueda unificada.
   * Reemplaza a findByStatus, findPending, findApproved, findRejected, findByCreator.
   */
  findAll(
    filters: WorkPlanFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<WorkPlan[]>;

  count(filters: WorkPlanFilters): Promise<number>;

  delete(id: string): Promise<void>;

  // --- Helpers específicos de integridad ---

  /**
   * Busca planes que contengan un Kit específico en sus recursos.
   * Útil para análisis de impacto antes de borrar/modificar un Kit.
   */
  findUsingKit(kitId: string): Promise<WorkPlan[]>;

  /**
   * Alias de findUsingKit para compatibilidad.
   */
  findWorkPlansUsingKit(kitId: string): Promise<WorkPlan[]>;

  /**
   * Cuenta total de planes asociados a una orden.
   */
  countByOrderId(orderId: string): Promise<number>;

  /**
   * Cuenta planes pendientes asociados a una orden.
   * Útil para validaciones de cierre de orden.
   */
  countPendingByOrderId(orderId: string): Promise<number>;

  /**
   * Desvincula planes de una orden eliminada.
   */
  markAsOrphaned(orderId: string): Promise<void>;
}


