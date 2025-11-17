import { WorkPlan, WorkPlanStatus, WorkPlanMaterial as Material } from '../entities/WorkPlan';

/**
 * Filtros para buscar planes de trabajo
 * @interface WorkPlanFilters
 */
export interface WorkPlanFilters {
  /** Filtrar por ID de orden asociada */
  orderId?: string;
  /** Filtrar por estado del plan */
  status?: WorkPlanStatus;
  /** Filtrar por usuario creador */
  createdBy?: string;
  /** Filtrar por usuario revisor (aprobador/rechazador) */
  reviewedBy?: string;
  /** Número de página (para paginación offset-based) */
  page?: number;
  /** Límite de resultados por página */
  limit?: number;
  /** Saltar N registros (alternativa a page) */
  skip?: number;
}

/**
 * Repositorio: Planes de Trabajo
 * Contrato para persistencia de planes de trabajo del sistema
 * @interface IWorkPlanRepository
 * @since 1.0.0
 */
export interface IWorkPlanRepository {
  /**
   * Crea un nuevo plan de trabajo
   * @param {Omit<WorkPlan, 'id' | 'createdAt' | 'updatedAt'>} workPlan - Datos del plan (timestamps generados automáticamente)
   * @returns {Promise<WorkPlan>} Plan de trabajo creado con ID y timestamps asignados
   * @throws {Error} Si ya existe un plan para la orden o falla la persistencia
   */
  create(workPlan: Omit<WorkPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkPlan>;

  /**
   * Busca un plan de trabajo por ID
   * @param {string} id - ID del plan de trabajo
   * @returns {Promise<WorkPlan | null>} Plan encontrado o null si no existe
   */
  findById(id: string): Promise<WorkPlan | null>;

  /**
   * Busca un plan de trabajo por ID de orden
   * Relación 1:1 con Order (cada orden tiene máximo un plan)
   * @param {string} orderId - ID de la orden
   * @returns {Promise<WorkPlan | null>} Plan encontrado o null si no existe
   */
  findByOrderId(orderId: string): Promise<WorkPlan | null>;

  /**
   * Busca planes de trabajo por estado
   * @param {WorkPlanStatus} status - Estado del plan
   * @returns {Promise<WorkPlan[]>} Lista de planes en ese estado
   */
  findByStatus(status: WorkPlanStatus): Promise<WorkPlan[]>;

  /**
   * Busca planes de trabajo por creador
   * @param {string} createdBy - ID del usuario creador
   * @returns {Promise<WorkPlan[]>} Lista de planes creados por el usuario
   */
  findByCreator(createdBy: string): Promise<WorkPlan[]>;

  /**
   * Busca planes de trabajo pendientes de aprobación
   * Útil para supervisores que deben revisar planes
   * @returns {Promise<WorkPlan[]>} Lista de planes pendientes (status=DRAFT)
   */
  findPending(): Promise<WorkPlan[]>;

  /**
   * Busca planes de trabajo aprobados
   * @returns {Promise<WorkPlan[]>} Lista de planes aprobados (status=APPROVED)
   */
  findApproved(): Promise<WorkPlan[]>;

  /**
   * Busca planes de trabajo rechazados
   * @returns {Promise<WorkPlan[]>} Lista de planes rechazados (status=REJECTED)
   */
  findRejected(): Promise<WorkPlan[]>;

  /**
   * Busca planes de trabajo con filtros y paginación
   * @param {WorkPlanFilters} filters - Filtros de búsqueda
   * @returns {Promise<WorkPlan[]>} Lista de planes que coinciden con los filtros
   */
  find(filters: WorkPlanFilters): Promise<WorkPlan[]>;

  /**
   * Cuenta el total de planes de trabajo con filtros
   * @param {Omit<WorkPlanFilters, 'page' | 'limit' | 'skip'>} filters - Filtros (sin paginación)
   * @returns {Promise<number>} Total de planes que coinciden con los filtros
   */
  count(filters: Omit<WorkPlanFilters, 'page' | 'limit' | 'skip'>): Promise<number>;

  /**
   * Actualiza un plan de trabajo parcialmente
   * @param {string} id - ID del plan
   * @param {Partial<WorkPlan>} workPlan - Datos a actualizar (updatedAt se actualiza automáticamente)
   * @returns {Promise<WorkPlan>} Plan actualizado
   * @throws {Error} Si el plan no existe
   */
  update(id: string, workPlan: Partial<WorkPlan>): Promise<WorkPlan>;

  /**
   * Aprueba un plan de trabajo
   * Establece status=APPROVED, reviewedBy, reviewedAt, reviewComments
   * @param {string} id - ID del plan
   * @param {string} userId - ID del usuario que aprueba
   * @param {string} [comments] - Comentarios opcionales de aprobación
   * @returns {Promise<WorkPlan>} Plan aprobado
   * @throws {Error} Si el plan no existe o ya está aprobado/rechazado
   */
  approve(id: string, userId: string, comments?: string): Promise<WorkPlan>;

  /**
   * Rechaza un plan de trabajo
   * Establece status=REJECTED, reviewedBy, reviewedAt, reviewComments
   * @param {string} id - ID del plan
   * @param {string} userId - ID del usuario que rechaza
   * @param {string} reason - Razón obligatoria del rechazo
   * @returns {Promise<WorkPlan>} Plan rechazado
   * @throws {Error} Si el plan no existe o ya está aprobado/rechazado
   */
  reject(id: string, userId: string, reason: string): Promise<WorkPlan>;

  /**
   * Agrega un material a la lista de materiales del plan
   * @param {string} id - ID del plan
   * @param {Material} material - Material a agregar
   * @returns {Promise<WorkPlan>} Plan actualizado con el material agregado
   * @throws {Error} Si el plan no existe
   */
  addMaterial(id: string, material: Material): Promise<WorkPlan>;

  /**
   * Agrega un ítem a la checklist del plan
   * @param {string} id - ID del plan
   * @param {string} item - Texto del ítem a agregar
   * @returns {Promise<WorkPlan>} Plan actualizado con el ítem agregado
   * @throws {Error} Si el plan no existe
   */
  addChecklistItem(id: string, item: string): Promise<WorkPlan>;

  /**
   * Cambia el estado de completitud de un ítem de checklist
   * @param {string} id - ID del plan
   * @param {number} index - Índice del ítem en el array de checklist (0-based)
   * @returns {Promise<WorkPlan>} Plan actualizado con el ítem toggleado
   * @throws {Error} Si el plan no existe o el índice es inválido
   */
  toggleChecklistItem(id: string, index: number): Promise<WorkPlan>;

  /**
   * Elimina un plan de trabajo permanentemente (hard delete)
   * ADVERTENCIA: Esta operación es irreversible
   * @param {string} id - ID del plan
   * @returns {Promise<boolean>} True si se eliminó correctamente, false si no existía
   */
  delete(id: string): Promise<boolean>;

  /**
   * Elimina el plan de trabajo de una orden
   * Útil al eliminar una orden completa (cascade delete)
   * @param {string} orderId - ID de la orden
   * @returns {Promise<boolean>} True si se eliminó un plan, false si no existía
   */
  deleteByOrderId(orderId: string): Promise<boolean>;
}

