import type { AuditLog, AuditAction } from '../entities/AuditLog.js';

/**
 * Filtros para buscar audit logs
 * @interface AuditLogFilters
 */
export interface AuditLogFilters {
  /** Filtrar por tipo de entidad (e.g., 'User', 'Order', 'WorkPlan') */
  entityType?: string;
  /** Filtrar por ID de entidade específica */
  entityId?: string;
  /** Filtrar por acción concreta */
  action?: AuditAction;
  /** Filtrar por el usuario que realizó la acción */
  userId?: string;
  /** Filtrar por rango de fechas de inicio */
  startDate?: Date;
  /** Filtrar por rango de fechas de cierre */
  endDate?: Date;
  /** Página para paginación offset-based */
  page?: number;
  /** Límite de resultados por página */
  limit?: number;
  /** Saltar N registros (alternativa a page) */
  skip?: number;
}

/**
 * Repositorio: Audit Logs
 * Contrato para persistencia de logs de auditoría (append-only log)
 * @interface IAuditLogRepository
 * @since 1.0.0
 */
export interface IAuditLogRepository {
  /**
   * Crea un registro de auditoría
   * @param {Omit<AuditLog, 'id' | 'timestamp'>} data - Datos del log (timestamp generado por la infraestructura)
   * @returns {Promise<AuditLog>} Registro creado con ID y timestamp definidos
   * @throws {Error} Si falla la persistencia
   */
  create(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;

  /**
   * Busca logs con filtros y paginación
   * @param {AuditLogFilters} filters - Filtros de búsqueda
   * @returns {Promise<AuditLog[]>} Lista ordenada por timestamp DESC
   */
  find(filters: AuditLogFilters): Promise<AuditLog[]>;

  /**
   * Cuenta logs que coinciden con los filtros
   * @param {Omit<AuditLogFilters, 'page' | 'limit' | 'skip'>} filters - Filtros sin paginación
   * @returns {Promise<number>} Total de logs
   */
  count(filters: Omit<AuditLogFilters, 'page' | 'limit' | 'skip'>): Promise<number>;

  /**
   * Retorna el historial completo de una entidad específica
   * @param {string} entityType - Tipo de entidad (e.g., 'User', 'Order')
   * @param {string} entityId - ID de la entidad
   * @returns {Promise<AuditLog[]>} Logs ordenados por timestamp DESC
   */
  findByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;

  /**
   * Obtiene logs generados por un usuario en un rango de fechas
   * @param {string} userId - ID del usuario
   * @param {Date} [startDate] - Fecha mínima (opcional)
   * @param {Date} [endDate] - Fecha máxima (opcional)
   * @returns {Promise<AuditLog[]>} Logs ordenados por timestamp DESC
   */
  findByUser(userId: string, startDate?: Date, endDate?: Date): Promise<AuditLog[]>;

  /**
   * Elimina logs antiguos para cumplir políticas de retención
   * @param {number} days - Dias de antigüedad mínima (debe ser >= 1)
   * @returns {Promise<number>} Cantidad de registros eliminados
   * @throws {Error} Si days < 1
   */
  deleteOlderThan(days: number): Promise<number>;
}
