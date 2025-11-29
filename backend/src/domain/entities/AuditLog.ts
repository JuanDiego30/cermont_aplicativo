/**
 * Acciones auditables del sistema
 * 
 * Convenciones:
 * - Usar acciones específicas (e.g., CREATE_USER) en vez de genéricas cuando sea posible
 * - Los genéricos (CREATE, READ, UPDATE, DELETE) solo para entidades sin acciones específicas
 * - Todas las acciones de seguridad deben registrarse con contexto completo (IP, userAgent)
 * 
 * @enum {string}
 */
export enum AuditAction {
  // ========================================
  // USUARIOS
  // ========================================
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  ACTIVATE_USER = 'ACTIVATE_USER',
  DEACTIVATE_USER = 'DEACTIVATE_USER',

  // ========================================
  // AUTENTICACIÓN Y SEGURIDAD
  // ========================================
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  LOCK_USER_ACCOUNT = 'LOCK_USER_ACCOUNT',
  UNLOCK_USER_ACCOUNT = 'UNLOCK_USER_ACCOUNT',
  SECURITY_INCIDENT = 'SECURITY_INCIDENT', // Token reuse, intentos de acceso no autorizados, etc.

  // ========================================
  // ÓRDENES DE TRABAJO
  // ========================================
  CREATE_ORDER = 'CREATE_ORDER',
  UPDATE_ORDER = 'UPDATE_ORDER',
  DELETE_ORDER = 'DELETE_ORDER',
  ARCHIVE_ORDER = 'ARCHIVE_ORDER',
  ASSIGN_ORDER = 'ASSIGN_ORDER',
  ASSIGN_RESPONSIBLE = 'ASSIGN_RESPONSIBLE',
  TRANSITION_ORDER_STATE = 'TRANSITION_ORDER_STATE',

  // ========================================
  // PLANES DE TRABAJO
  // ========================================
  CREATE_WORKPLAN = 'CREATE_WORKPLAN',
  UPDATE_WORKPLAN = 'UPDATE_WORKPLAN',
  DELETE_WORKPLAN = 'DELETE_WORKPLAN',
  APPROVE_WORKPLAN = 'APPROVE_WORKPLAN',
  REJECT_WORKPLAN = 'REJECT_WORKPLAN',

  // ========================================
  // EVIDENCIAS
  // ========================================
  UPLOAD_EVIDENCE = 'UPLOAD_EVIDENCE',
  DELETE_EVIDENCE = 'DELETE_EVIDENCE',
  APPROVE_EVIDENCE = 'APPROVE_EVIDENCE',
  REJECT_EVIDENCE = 'REJECT_EVIDENCE',

  // ========================================
  // REPORTES (NUEVOS - Fix Prioridad 5)
  // ========================================
  GENERATE_SES = 'GENERATE_SES',
  GENERATE_ACTA = 'GENERATE_ACTA',
  GENERATE_INFORME = 'GENERATE_INFORME',
  GENERATE_COST_REPORT = 'GENERATE_COST_REPORT',
  GENERATE_DASHBOARD_REPORT = 'GENERATE_DASHBOARD_REPORT',

  // ========================================
  // ACCIONES GENÉRICAS
  // (Solo usar cuando no exista acción específica)
  // ========================================
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  TRANSITION = 'TRANSITION',
}

/**
 * Entidad: Registro de auditoría
 * 
 * Almacena todas las acciones críticas del sistema para compliance, debugging y análisis de seguridad.
 * 
 * Casos de uso:
 * - Compliance: Rastreo de cambios en datos sensibles
 * - Seguridad: Detección de accesos no autorizados o patrones anómalos
 * - Debugging: Reproducción de estados previos del sistema
 * - Análisis: Generación de reportes de actividad
 * 
 * @interface AuditLog
 * @since 1.0.0
 */
export interface AuditLog {
  /** ID único del registro de auditoría (UUID v4) */
  id: string;

  /** 
   * Tipo de entidad afectada
   * @example 'User', 'Order', 'WorkPlan', 'RefreshToken'
   */
  entityType: string;

  /** ID de la entidad afectada */
  entityId: string;

  /** Acción realizada sobre la entidad */
  action: AuditAction;

  /** ID del usuario que realizó la acción (o SYSTEM_USER_ID para acciones automáticas) */
  userId: string;

  /** 
   * Estado previo de la entidad antes de la acción
   * null para CREATE o acciones que no modifican estado
   */
  before?: Record<string, unknown> | null;

  /** 
   * Estado posterior de la entidad después de la acción
   * null para DELETE o acciones de solo lectura
   */
  after?: Record<string, unknown> | null;

  /** 
   * Dirección IP del cliente
   * @example '192.168.1.100', '2001:0db8:85a3::8a2e:0370:7334'
   */
  ip?: string;

  /** 
   * User-Agent del navegador/cliente
   * @example 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
   */
  userAgent?: string;

  /** 
   * Razón o contexto adicional sobre la acción
   * Especialmente útil para rechazos, incidentes de seguridad, o acciones administrativas
   * @example 'Cuenta bloqueada automáticamente (5 intentos fallidos)'
   */
  reason?: string;

  /** Fecha y hora de la acción (UTC) */
  timestamp: Date;
}

/**
 * Tipo helper: Datos mínimos requeridos para crear un registro de auditoría
 * @since 1.0.0
 */
export type CreateAuditLogInput = Omit<AuditLog, 'id' | 'timestamp'>;

/**
 * Tipo helper: Filtros para búsqueda de registros de auditoría
 * @since 1.0.0
 */
export interface AuditLogFilters {
  /** Filtrar por tipo de entidad */
  entityType?: string;
  
  /** Filtrar por ID de entidad específica */
  entityId?: string;
  
  /** Filtrar por acción */
  action?: AuditAction;
  
  /** Filtrar por usuario que realizó la acción */
  userId?: string;
  
  /** Filtrar por rango de fechas - desde */
  startDate?: Date;
  
  /** Filtrar por rango de fechas - hasta */
  endDate?: Date;
  
  /** Filtrar por dirección IP */
  ip?: string;
  
  /** Búsqueda de texto en el campo reason */
  reasonContains?: string;
}



