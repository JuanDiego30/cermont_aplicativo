import type { Evidence, EvidenceStatus, EvidenceType } from '../entities/Evidence';

/**
 * Filtros para buscar evidencias
 * @interface EvidenceFilters
 */
export interface EvidenceFilters {
  /** Filtrar por ID de orden asociada */
  orderId?: string;
  /** Filtrar por etapa del flujo */
  stage?: string;
  /** Filtrar por estado de aprobación */
  status?: EvidenceStatus;
  /** Filtrar por tipo de evidencia */
  type?: EvidenceType;
  /** Filtrar por usuario que subió el archivo */
  uploadedBy?: string;
  /** Filtrar por usuario que aprobó */
  approvedBy?: string;
  /** Página para paginación offset-based */
  page?: number;
  /** Límite de resultados por página */
  limit?: number;
  /** Saltar N registros (alternativa a page) */
  skip?: number;
}

/**
 * Repositorio: Evidencias
 * Contrato para persistencia de archivos asociados a órdenes
 * @interface IEvidenceRepository
 * @since 1.0.0
 */
export interface IEvidenceRepository {
  /**
   * Crea una nueva evidencia
   * @param {Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>} evidence - Datos de la evidencia (timestamps generados automáticamente)
   * @returns {Promise<Evidence>} Evidencia creada con ID y timestamps asignados
   * @throws {Error} Si la persistencia falla
   */
  create(evidence: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evidence>;

  /**
   * Encuentra una evidencia por ID
   * @param {string} id - ID de la evidencia
   * @returns {Promise<Evidence | null>} Evidencia o null
   */
  findById(id: string): Promise<Evidence | null>;

  /**
   * Lista de evidencias de una orden
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Evidence[]>} Evidencias ordenadas por createdAt DESC
   */
  findByOrderId(orderId: string): Promise<Evidence[]>;

  /**
   * Lista de evidencias filtrando por orden + etapa
   * @param {string} orderId - ID de la orden
   * @param {string} stage - Etapa del flujo de trabajo
   * @returns {Promise<Evidence[]>} Evidencias ordenadas por createdAt DESC
   */
  findByOrderIdAndStage(orderId: string, stage: string): Promise<Evidence[]>;

  /**
   * Busca evidencias con filtros y paginación
   * @param {EvidenceFilters} filters - Filtros de búsqueda
   * @returns {Promise<Evidence[]>} Lista filtrada
   */
  find(filters: EvidenceFilters): Promise<Evidence[]>;

  /**
   * Cuenta las evidencias que coinciden con filtros (sin pagina)
   * @param {Omit<EvidenceFilters, 'page' | 'limit' | 'skip'>} filters - Filtros sin paginación
   * @returns {Promise<number>} Total de evidencias
   */
  count(filters: Omit<EvidenceFilters, 'page' | 'limit' | 'skip'>): Promise<number>;

  /**
   * Actualiza una evidencia parcialmente
   * @param {string} id - ID de la evidencia
   * @param {Partial<Evidence>} evidence - Datos a actualizar
   * @returns {Promise<Evidence>} Evidencia actualizada
   * @throws {Error} Si la evidencia no existe
   */
  update(id: string, evidence: Partial<Evidence>): Promise<Evidence>;

  /**
   * Elimina una evidencia
   * NOTA: también se debe eliminar el archivo físico asociado
   * @param {string} id - ID de la evidencia
   * @returns {Promise<boolean>} True si se eliminó, false si no existía
   */
  delete(id: string): Promise<boolean>;

  /**
   * Rechaza una evidencia
   * @param {string} id - ID de la evidencia
   * @param {string} rejectedBy - ID del usuario que rechaza
   * @param {string} reason - Razón del rechazo
   * @returns {Promise<Evidence>} Evidencia rechazada
   * @throws {Error} Si la evidencia no existe
   */
  reject(id: string, rejectedBy: string, reason: string): Promise<Evidence>;

  /**
   * Elimina todas las evidencias de una orden (cascade delete)
   * @param {string} orderId - ID de la orden
   * @returns {Promise<number>} Cantidad de evidencias eliminadas
   */
  deleteByOrderId(orderId: string): Promise<number>;
}

