/**
 * AuditLog Model (TypeScript - November 2025)
 * @description Modelo Mongoose para logs de auditoría en CERMONT ATG. Registra acciones (CRUD, auth, security)
 * con trazabilidad completa (user, resource, changes, metadata). Cumple ISO 27001/compliance: TTL 365d auto-delete.
 * Integra con middleware/auditLogger.ts para auto-creación. Queries optimizadas con indexes/compounds.
 * Single collection 'auditlogs'; lean() por default en methods para perf.
 * Uso: AuditLog.log(data); // Fire-and-forget
 *       AuditLog.getSecurityAlerts(30); // HIGH/CRITICAL last 30d, populated
 * Nota: No pre-save hooks (req context not available); call from controllers/middleware.
 *       En prod: TTLIndex expires logs >365d. Searchable via /api/audit-logs (controller separate).
 *       Para ATG: Resources enum includes Order/WorkPlan/CctvReport; actions cover LOGIN/ORDER_CREATE etc.
 * Pruebas: Jest mock mongoose.create({action:'LOGIN'}), expect(1).toBeSaved; getUserActivity(userId) (array length 50), securityAlerts (filtered HIGH+).
 * Types: Interface AuditLogDoc (Document), AuditData (Partial input), AuditModel (Model<AuditLogDoc> & Statics).
 * Fixes: Schema<AuditLogDoc>, model<AuditLogDoc, AuditModel>. Statics: async (data: Partial<AuditData>): Promise<void>.
 * Assumes: User model exists ('User' ref). logger.error safe (unknown to string). Aggregate: any (flexible).
 * Deps: mongoose ^7-8; @types/mongoose if needed (built-in types).
 */

import mongoose, { Schema, Document, Model, PopulateOptions } from 'mongoose';
import { logger } from '../utils/logger';

// Enums as const for type safety
const ACTIONS = [
  // Authentication
  'LOGIN', 'LOGOUT', 'LOGOUT_ALL', 'LOGOUT_SESSION', 'LOGIN_FAILED', 'TOKEN_REFRESH', 'TOKEN_REVOKED', 'TOKEN_REVOKED_ALL', 'PASSWORD_CHANGE', 'PASSWORD_RESET',
  // CRUD Operations (ATG-specific + Generic)
  'CREATE', 'UPDATE', 'DELETE', 'READ',
  'CREATE_ORDER', 'UPDATE_ORDER', 'DELETE_ORDER', 'CREATE_WORKPLAN', 'UPDATE_WORKPLAN', 'ASSIGN_USER',
  'CREATE_REPORT', 'UPDATE_REPORT', 'DELETE_EVIDENCE', 'CREATE_TOOLKIT',
  // Security & Access
  'ROLE_CHANGE', 'PERMISSION_DENIED', 'ACCESS_DENIED', 'SECURITY_THREAT', 'SUSPICIOUS_ACTIVITY',
  // Files & Data
  'FILE_UPLOAD', 'FILE_DELETE', 'FILE_DOWNLOAD', 'EXPORT_DATA', 'IMPORT_DATA',
  // System
  'SYSTEM_ALERT', 'CONFIG_CHANGE',
] as const;
type Action = typeof ACTIONS[number];

const RESOURCES = [
  'User', 'Order', 'WorkPlan', 'ToolKit', 'CctvReport', 'Evidence', 'Auth', 'File', 'System', 'RBAC', 'Sanitization',
] as const;
type Resource = typeof RESOURCES[number];

const ROLES = ['ROOT', 'ADMIN', 'ENGINEER', 'SUPERVISOR', 'TECHNICIAN', 'CLIENT', 'ANONYMOUS'] as const;
type UserRole = typeof ROLES[number];

const STATUSES = ['SUCCESS', 'FAILURE', 'DENIED'] as const;
type Status = typeof STATUSES[number];

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'] as const;
type HttpMethod = typeof METHODS[number];

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
type Severity = typeof SEVERITIES[number];

// Input data type (Partial for flexibility)
interface AuditData {
  userId?: mongoose.Types.ObjectId;
  userEmail: string;
  userRole?: UserRole;
  action: Action;
  resource: Resource;
  resourceId?: mongoose.Types.ObjectId;
  changes?: {
    before?: mongoose.Schema.Types.Mixed;
    after?: mongoose.Schema.Types.Mixed;
  };
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: HttpMethod;
  endpoint?: string;
  status?: Status;
  errorMessage?: string;
  severity?: Severity;
  metadata?: mongoose.Schema.Types.Mixed;
  timestamp?: Date;
}

// Document interface
interface AuditLogDoc extends Document {
  userId: mongoose.Types.ObjectId | null;
  userEmail: string;
  userRole: UserRole;
  action: Action;
  resource: Resource;
  resourceId: mongoose.Types.ObjectId | null;
  changes: {
    before?: mongoose.Schema.Types.Mixed;
    after?: mongoose.Schema.Types.Mixed;
  };
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  method?: HttpMethod | null;
  endpoint?: string;
  status: Status;
  errorMessage?: string;
  severity: Severity;
  metadata?: mongoose.Schema.Types.Mixed;
  timestamp: Date;

  // Methods
  toJSON(): any;

  // Populate helper
  populateUser(): Promise<this>;
}

// Model with statics
interface AuditLogModel extends Model<AuditLogDoc> {
  log(data: Partial<AuditData>): Promise<void>;
  getUserActivity(userId: mongoose.Types.ObjectId, limit?: number, page?: number): Promise<AuditLogDoc[]>;
  getSecurityAlerts(days?: number, limit?: number): Promise<AuditLogDoc[]>;
  getStats(days?: number): Promise<any[]>;
}

// AuditLog Schema - Comprehensive tracing
const auditLogSchema: Schema<AuditLogDoc, AuditLogModel> = new Schema({
  // ========================================
  // QUIÉN - User Identification
  // ========================================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    sparse: true, // Allow null for anonymous (LOGIN_FAILED)
  },
  userEmail: {
    type: String,
    required: [true, 'Email requerido para trazabilidad'],
    trim: true,
    maxlength: [255, 'Email demasiado largo'],
  },
  userRole: {
    type: String,
    enum: ROLES,
    default: 'ANONYMOUS',
  },

  // ========================================
  // QUÉ - Action Performed
  // ========================================
  action: {
    type: String,
    required: [true, 'Acción requerida'],
    enum: ACTIONS,
    index: true,
  },

  // ========================================
  // DÓNDE - Resource Affected
  // ========================================
  resource: {
    type: String,
    required: [true, 'Recurso requerido'],
    enum: RESOURCES,
    index: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    sparse: true,
  },

  // ========================================
  // DETALLES - Changes & Description
  // ========================================
  changes: {
    before: mongoose.Schema.Types.Mixed, // Previous state (UPDATE/DELETE; limit size in middleware)
    after: mongoose.Schema.Types.Mixed, // New state (CREATE/UPDATE)
  },
  description: {
    type: String,
    maxlength: [1000, 'Descripción demasiado larga'],
  },

  // ========================================
  // METADATA DE SEGURIDAD
  // ========================================
  ipAddress: {
    type: String,
    trim: true,
    maxlength: [45, 'IP inválida'], // IPv6 support
    index: true,
  },
  userAgent: {
    type: String,
    maxlength: [500, 'User-Agent demasiado largo'],
  },
  method: {
    type: String,
    enum: METHODS,
    uppercase: true,
  },
  endpoint: {
    type: String,
    maxlength: [500, 'Endpoint demasiado largo'],
  },

  // ========================================
  // RESULTADO
  // ========================================
  status: {
    type: String,
    enum: STATUSES,
    default: 'SUCCESS',
    index: true,
  },
  errorMessage: {
    type: String,
    maxlength: [1000, 'Error message demasiado largo'],
  },

  // ========================================
  // SEVERIDAD
  // ========================================
  severity: {
    type: String,
    enum: SEVERITIES,
    default: 'LOW',
    index: true,
  },

  // ========================================
  // METADATA ADICIONAL (Flexible)
  // ========================================
  metadata: {
    type: mongoose.Schema.Types.Mixed, // {fieldChanges, threats, etc.} - No schema for flexibility
    default: {},
  },

  // ========================================
  // TIMESTAMP
  // ========================================
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false, // Manual via timestamp
  collection: 'auditlogs',
  strict: true, // Enforce schema
});

// ========================================
// TTL INDEX for Compliance (auto-delete >365 days)
// ========================================
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 365 days

// ========================================
// COMPOUND INDEXES for Fast Queries
// ========================================
auditLogSchema.index({ userId: 1, timestamp: -1 }); // User activity (recent first)
auditLogSchema.index({ resource: 1, action: 1, timestamp: -1 }); // Resource actions
auditLogSchema.index({ status: 1, severity: 1, timestamp: -1 }); // Errors/alerts
auditLogSchema.index({ ipAddress: 1, status: 1, timestamp: -1 }); // IP abuse detection
auditLogSchema.index({ action: 1, status: 1, timestamp: -1 }); // Action success/fail trends

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

/**
 * Log audit entry (fire-and-forget, non-blocking)
 * @param data Audit data
 * @returns Promise<void>
 */
auditLogSchema.statics.log = async function (data: Partial<AuditData>): Promise<void> {
  try {
    // Validate required fields minimally
    if (!data.action || !data.resource || !data.userEmail) {
      logger.warn('[AuditLog] Invalid log data, skipped', { action: data.action, resource: data.resource });
      return;
    }

    // Normalize defaults
    const entry: Partial<AuditData> = {
      ...data,
      timestamp: data.timestamp || new Date(),
      status: data.status || 'SUCCESS',
      severity: data.severity || 'LOW',
      userRole: data.userRole || 'ANONYMOUS',
    };

    // Create with bulk for multi if called in loop
    await this.create([entry as AuditData]); // Cast for create
  } catch (error: unknown) {
    // Silent fail: Don't block main flow
    const errMsg: string = error instanceof Error ? error.message : 'Unknown save error';
    logger.error('[AuditLog] Save failed', { error: errMsg, action: data?.action, userEmail: data?.userEmail });
  }
};

/**
 * Get recent user activity (paginated, populated)
 * @param userId User ID
 * @param limit Page limit
 * @param page Page number
 * @returns Promise<AuditLogDoc[]>
 */
auditLogSchema.statics.getUserActivity = async function (
  userId: mongoose.Types.ObjectId,
  limit: number = 50,
  page: number = 1
): Promise<AuditLogDoc[]> {
  const skip: number = (page - 1) * limit;
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .populate<AuditLogDoc>('userId', 'nombre email rol') // Only if userId present
    .select('-__v -changes') // Exclude sensitive/large fields
    .lean() as any as Promise<AuditLogDoc[]>; // Perf: plain JS objects, cast for type
};

/**
 * Get security alerts (HIGH/CRITICAL, recent)
 * @param days Days back
 * @param limit Result limit
 * @returns Promise<AuditLogDoc[]>
 */
auditLogSchema.statics.getSecurityAlerts = async function (
  days: number = 7,
  limit: number = 100
): Promise<AuditLogDoc[]> {
  const since: Date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({
    status: { $in: ['DENIED', 'FAILURE'] },
    severity: { $in: ['HIGH', 'CRITICAL'] },
    timestamp: { $gte: since },
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate<AuditLogDoc>('userId', 'nombre email rol')
    .select('-__v -changes.before -changes.after') // Exclude diffs for alerts
    .lean() as any as Promise<AuditLogDoc[]>;
};

/**
 * Get stats summary (e.g., actions count by resource/severity)
 * @param days Days back
 * @returns Promise<any[]>
 */
auditLogSchema.statics.getStats = async function (days: number = 30): Promise<any[]> {
  const since: Date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: {
          resource: '$resource',
          action: '$action',
          severity: '$severity',
        },
        count: { $sum: 1 },
        statuses: { $push: '$status' },
      },
    },
    { $sort: { '_id.resource': 1, count: -1 } },
    { $limit: 50 },
  ]);
};

// ========================================
// QUERY HELPERS (Virtuals/Methods if needed)
// ========================================
auditLogSchema.methods.toJSON = function (this: AuditLogDoc): any {
  const obj: any = this.toObject();
  delete obj.__v;
  if (obj.changes) {
    // Sanitize changes (remove sensitive)
    obj.changes.before = obj.changes.before
      ? { ...obj.changes.before, password: '[REDACTED]' }
      : undefined;
    obj.changes.after = obj.changes.after
      ? { ...obj.changes.after, password: '[REDACTED]' }
      : undefined;
  }
  return obj;
};

const AuditLog: AuditLogModel = mongoose.model<AuditLogDoc, AuditLogModel>('AuditLog', auditLogSchema);

export default AuditLog;
export type AuditLogDocument = HydratedDocument<AuditLogDoc>;
