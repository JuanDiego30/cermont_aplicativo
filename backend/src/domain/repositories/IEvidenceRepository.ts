import type { Evidence, EvidenceStatus, EvidenceType } from '../entities/Evidence.js';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortingParams {
  field: keyof Evidence;
  order: 'asc' | 'desc';
}

export interface EvidenceFilters {
  orderId?: string;
  stage?: string;
  status?: EvidenceStatus;
  type?: EvidenceType;
  uploadedBy?: string;
  approvedBy?: string;
  // Eliminados page, limit, skip de aquí
}

/**
 * Repositorio: Evidencias
 * Gestión de persistencia de metadatos de archivos (no los archivos binarios).
 */
export interface IEvidenceRepository {
  create(evidence: Omit<Evidence, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evidence>;

  update(id: string, evidence: Partial<Evidence>): Promise<Evidence>;

  findById(id: string): Promise<Evidence | null>;

  /**
   * Busca evidencias por orderId.
   * Shorthand para findAll({ orderId }).
   */
  findByOrderId(orderId: string): Promise<Evidence[]>;

  /**
   * Busca evidencias con filtros genéricos.
   * Alias para findAll con tipado más flexible.
   */
  findByFilters(filters: any, pagination?: any, sorting?: any): Promise<Evidence[]>;

  /**
   * Cuenta evidencias que coinciden con los filtros.
   * Alias para count con tipado más flexible.
   */
  countByFilters(filters: any): Promise<number>;

  /**
   * Busca evidencias aplicando filtros dinámicos.
   * Reemplaza a findByOrderId, findByStage, etc.
   */
  findAll(
    filters: EvidenceFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<Evidence[]>;

  count(filters: EvidenceFilters): Promise<number>;

  /**
   * Elimina el registro de la base de datos.
   * Nota: El borrado del archivo físico es responsabilidad del UseCase.
   */
  delete(id: string): Promise<boolean>;

  // --- Helpers específicos para integridad referencial ---

  /**
   * Cuenta evidencias asociadas a una orden.
   * Útil para validaciones antes de borrar órdenes.
   */
  countByOrderId(orderId: string): Promise<number>;

  /**
   * Desvincula evidencias de una orden (ej: al eliminar orden).
   * Puede setear orderId = null o marcar status = ORPHANED.
   */
  markAsOrphaned(orderId: string): Promise<void>;
}


