/**
 * Acciones auditables del sistema
 * @enum {string}
 */
export enum AuditAction {
  // === Usuarios ===
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  CHANGE_USER_PASSWORD = 'CHANGE_USER_PASSWORD',
  ACTIVATE_USER = 'ACTIVATE_USER',
  DEACTIVATE_USER = 'DEACTIVATE_USER',
  LOCK_USER_ACCOUNT = 'LOCK_USER_ACCOUNT',
  UNLOCK_USER_ACCOUNT = 'UNLOCK_USER_ACCOUNT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',

  // === Autenticación ===
  LOGIN = 'LOGIN',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',

  // === Órdenes ===
  CREATE_ORDER = 'CREATE_ORDER',
  UPDATE_ORDER = 'UPDATE_ORDER',
  UPDATE_ORDER_STATE = 'UPDATE_ORDER_STATE',
  TRANSITION_ORDER_STATE = 'TRANSITION_ORDER_STATE',
  ARCHIVE_ORDER = 'ARCHIVE_ORDER',
  ASSIGN_ORDER = 'ASSIGN_ORDER',
  ASSIGN_RESPONSIBLE = 'ASSIGN_RESPONSIBLE',
  DELETE_ORDER = 'DELETE_ORDER',

  // === Planes de trabajo ===
  CREATE_WORKPLAN = 'CREATE_WORKPLAN',
  UPDATE_WORKPLAN = 'UPDATE_WORKPLAN',
  APPROVE_WORKPLAN = 'APPROVE_WORKPLAN',
  REJECT_WORKPLAN = 'REJECT_WORKPLAN',
  DELETE_WORKPLAN = 'DELETE_WORKPLAN',

  // === Evidencias ===
  UPLOAD_EVIDENCE = 'UPLOAD_EVIDENCE',
  APPROVE_EVIDENCE = 'APPROVE_EVIDENCE',
  REJECT_EVIDENCE = 'REJECT_EVIDENCE',
  DELETE_EVIDENCE = 'DELETE_EVIDENCE',

  // === Genéricos ===
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  TRANSITION = 'TRANSITION',
}

/**
 * Entidad: Registro de auditoría
 * Almacena todas las acciones críticas del sistema para compliance y debugging
 * @interface AuditLog
 * @since 1.0.0
 */
export interface AuditLog {
  /** ID único del registro de auditoría */
  id: string;

  /** Tipo de entidad afectada (e.g., 'User', 'Order', 'WorkPlan') */
  entityType: string;

  /** ID de la entidad afectada */
  entityId: string;

  /** Acción realizada sobre la entidad */
  action: AuditAction;

  /** ID del usuario que realizó la acción */
  userId: string;

  /** Estado previo de la entidad antes de la acción */
  before?: Record<string, unknown> | null;

  /** Estado posterior de la entidad después de la acción */
  after?: Record<string, unknown> | null;

  /** Dirección IP del usuario */
  ip?: string;

  /** User-Agent del navegador/cliente */
  userAgent?: string;

  /** Razón o comentario sobre la acción */
  reason?: string;

  /** Fecha y hora de la acción */
  timestamp: Date;
}

