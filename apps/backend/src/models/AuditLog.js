import mongoose from 'mongoose';

/**
 * Modelo de registro de auditoría para trazabilidad de acciones críticas
 * Cumple con estándares ISO 27001 y requisitos de compliance empresarial
 */
const auditLogSchema = new mongoose.Schema({
  // ========================================
  // QUIÉN - Identificación del usuario
  // ========================================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      // userId es requerido solo para acciones que tienen un usuario identificado
      return !['LOGIN_FAILED', 'TOKEN_REVOKED'].includes(this.action);
    },
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userRole: String,

  // ========================================
  // QUÉ - Acción realizada
  // ========================================
  action: {
    type: String,
    required: true,
    enum: [
      // Autenticación
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'TOKEN_REFRESH', 'TOKEN_REVOKED',
      // CRUD
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      // Seguridad
      'PASSWORD_CHANGE', 'PASSWORD_RESET', 'ROLE_CHANGE',
      'PERMISSION_DENIED', 'SUSPICIOUS_ACTIVITY',
      // Archivos
      'FILE_UPLOAD', 'FILE_DELETE', 'FILE_DOWNLOAD',
      // Otros
      'EXPORT_DATA', 'IMPORT_DATA'
    ],
    index: true
  },

  // ========================================
  // DÓNDE - Recurso afectado
  // ========================================
  resource: {
    type: String,
    required: true,
    enum: ['User', 'Order', 'WorkPlan', 'ToolKit', 'Report', 'Evidence', 'Auth', 'System'],
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },

  // ========================================
  // DETALLES - Cambios realizados
  // ========================================
  changes: {
    before: mongoose.Schema.Types.Mixed, // Estado anterior (solo en UPDATE/DELETE)
    after: mongoose.Schema.Types.Mixed   // Estado nuevo (solo en CREATE/UPDATE)
  },
  description: String, // Descripción adicional legible

  // ========================================
  // METADATA DE SEGURIDAD
  // ========================================
  ipAddress: {
    type: String,
    index: true
  },
  userAgent: String,
  method: String, // HTTP method: GET, POST, PUT, DELETE
  endpoint: String, // URL del endpoint

  // ========================================
  // RESULTADO
  // ========================================
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'DENIED'],
    default: 'SUCCESS',
    index: true
  },
  errorMessage: String,

  // ========================================
  // SEVERIDAD
  // ========================================
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW',
    index: true
  },

  // ========================================
  // TIMESTAMP
  // ========================================
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    // Opcional: auto-eliminar logs después de 90 días (compliance)
    // expires: 7776000 // 90 días en segundos
  }
}, {
  timestamps: false, // Usar solo timestamp manual
  collection: 'auditlogs'
});

// ========================================
// ÍNDICES COMPUESTOS PARA QUERIES RÁPIDAS
// ========================================
auditLogSchema.index({ userId: 1, timestamp: -1 }); // Logs por usuario
auditLogSchema.index({ resource: 1, action: 1, timestamp: -1 }); // Logs por recurso
auditLogSchema.index({ status: 1, severity: 1, timestamp: -1 }); // Logs de errores

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

/**
 * Crear log de auditoría (método estático para uso en servicios)
 */
auditLogSchema.statics.log = async function(data) {
  try {
    await this.create(data);
  } catch (error) {
    // No lanzar error para no interrumpir flujo principal
    console.error('[AuditLog] Error guardando log:', error.message);
  }
};

/**
 * Obtener logs recientes de un usuario
 */
auditLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('-__v');
};

/**
 * Obtener logs de acciones denegadas (seguridad)
 */
auditLogSchema.statics.getSecurityAlerts = async function(days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return this.find({
    status: { $in: ['DENIED', 'FAILURE'] },
    severity: { $in: ['HIGH', 'CRITICAL'] },
    timestamp: { $gte: since }
  })
  .sort({ timestamp: -1 })
  .populate('userId', 'nombre email rol');
};

export default mongoose.model('AuditLog', auditLogSchema);