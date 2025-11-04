import mongoose, { Schema } from 'mongoose';
import { logger } from '';
const ACTIONS = [
    'LOGIN', 'LOGOUT', 'LOGOUT_ALL', 'LOGOUT_SESSION', 'LOGIN_FAILED', 'TOKEN_REFRESH', 'TOKEN_REVOKED', 'PASSWORD_CHANGE', 'PASSWORD_RESET',
    'CREATE', 'UPDATE', 'DELETE', 'READ',
    'CREATE_ORDER', 'UPDATE_ORDER', 'DELETE_ORDER', 'CREATE_WORKPLAN', 'UPDATE_WORKPLAN', 'ASSIGN_USER',
    'CREATE_REPORT', 'UPDATE_REPORT', 'DELETE_EVIDENCE', 'CREATE_TOOLKIT',
    'ROLE_CHANGE', 'PERMISSION_DENIED', 'ACCESS_DENIED', 'SECURITY_THREAT', 'SUSPICIOUS_ACTIVITY',
    'FILE_UPLOAD', 'FILE_DELETE', 'FILE_DOWNLOAD', 'EXPORT_DATA', 'IMPORT_DATA',
    'SYSTEM_ALERT', 'CONFIG_CHANGE',
];
const RESOURCES = [
    'User', 'Order', 'WorkPlan', 'ToolKit', 'CctvReport', 'Evidence', 'Auth', 'File', 'System', 'RBAC', 'Sanitization',
];
const ROLES = ['ROOT', 'ADMIN', 'ENGINEER', 'SUPERVISOR', 'TECHNICIAN', 'CLIENT', 'ANONYMOUS'];
const STATUSES = ['SUCCESS', 'FAILURE', 'DENIED'];
const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const auditLogSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        sparse: true,
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
    action: {
        type: String,
        required: [true, 'Acción requerida'],
        enum: ACTIONS,
        index: true,
    },
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
    changes: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed,
    },
    description: {
        type: String,
        maxlength: [1000, 'Descripción demasiado larga'],
    },
    ipAddress: {
        type: String,
        trim: true,
        maxlength: [45, 'IP inválida'],
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
    severity: {
        type: String,
        enum: SEVERITIES,
        default: 'LOW',
        index: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: false,
    collection: 'auditlogs',
    strict: true,
});
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, action: 1, timestamp: -1 });
auditLogSchema.index({ status: 1, severity: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1, status: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, status: 1, timestamp: -1 });
auditLogSchema.statics.log = async function (data) {
    try {
        if (!data.action || !data.resource || !data.userEmail) {
            logger.warn('[AuditLog] Invalid log data, skipped', { action: data.action, resource: data.resource });
            return;
        }
        const entry = {
            ...data,
            timestamp: data.timestamp || new Date(),
            status: data.status || 'SUCCESS',
            severity: data.severity || 'LOW',
            userRole: data.userRole || 'ANONYMOUS',
        };
        await this.create([entry]);
    }
    catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown save error';
        logger.error('[AuditLog] Save failed', { error: errMsg, action: data?.action, userEmail: data?.userEmail });
    }
};
auditLogSchema.statics.getUserActivity = async function (userId, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    return this.find({ userId })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'nombre email rol')
        .select('-__v -changes')
        .lean();
};
auditLogSchema.statics.getSecurityAlerts = async function (days = 7, limit = 100) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.find({
        status: { $in: ['DENIED', 'FAILURE'] },
        severity: { $in: ['HIGH', 'CRITICAL'] },
        timestamp: { $gte: since },
    })
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('userId', 'nombre email rol')
        .select('-__v -changes.before -changes.after')
        .lean();
};
auditLogSchema.statics.getStats = async function (days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
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
auditLogSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.__v;
    if (obj.changes) {
        obj.changes.before = obj.changes.before
            ? { ...obj.changes.before, password: '[REDACTED]' }
            : undefined;
        obj.changes.after = obj.changes.after
            ? { ...obj.changes.after, password: '[REDACTED]' }
            : undefined;
    }
    return obj;
};
const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
//# sourceMappingURL=AuditLog.js.map