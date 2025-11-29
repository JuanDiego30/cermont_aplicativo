import type { AuditLog, AuditAction, AuditLogFilters } from '../entities/AuditLog.js';

/**
 * Parámetros de paginación estándar
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * Parámetros de ordenamiento estándar
 */
export interface SortingParams {
  field: keyof AuditLog;
  order: 'asc' | 'desc';
}

/**
 * Repositorio: Audit Logs
 * Contrato para persistencia de logs de auditoría (append-only log).
 * Provee acceso de solo escritura/lectura (sin updates).
 */
export interface IAuditLogRepository {
  /**
   * Registra una nueva entrada de auditoría.
   * El timestamp debe ser asignado por la capa de persistencia si no se provee.
   */
  create(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;

  /**
   * Busca logs aplicando filtros, paginación y ordenamiento.
   * Sustituye a los antiguos `find` y `findByFilters`.
   */
  findAll(
    filters: AuditLogFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<AuditLog[]>;

  /**
   * Cuenta el total de logs que coinciden con los filtros.
   * Útil para calcular total de páginas.
   */
  count(filters: AuditLogFilters): Promise<number>;

  /**
   * Busca logs con filtros genéricos.
   * Alias para findAll con tipado más flexible.
   */
  findByFilters(filters: any, pagination?: any, sorting?: any): Promise<AuditLog[]>;

  /**
   * Cuenta logs que coinciden con los filtros genéricos.
   * Alias para count con tipado más flexible.
   */
  countByFilters(filters: any): Promise<number>;

  /**
   * Retorna el historial completo de una entidad específica.
   * Helper optimizado para la vista de "Historial" en frontend.
   */
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;

  /**
   * Obtiene logs generados por un usuario.
   * Helper para auditoría de actividad de usuario.
   */
  findByUser(userId: string, dateRange?: { start?: Date; end?: Date }): Promise<AuditLog[]>;

  /**
   * Elimina logs antiguos para cumplir políticas de retención de datos (Retention Policy).
   * @param retentionDate Fecha límite (se borrará todo lo anterior a esta fecha)
   * @returns Número de registros eliminados
   */
  prune(retentionDate: Date): Promise<number>;
}

