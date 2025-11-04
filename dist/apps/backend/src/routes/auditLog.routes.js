import express from 'express';
import { getAuditLogs, getUserActivity, getSecurityAlerts, getAuditStats, } from '';
import { authenticate } from '';
import { requireMinRole } from '';
import { validateRequest } from '';
import { auditAdminAction } from '';
const router = express.Router();
router.use(authenticate);
router.use((req, res, next) => {
    next();
});
router.get('/', requireMinRole('coordinator'), validateRequest({
    query: {
        page: { type: 'integer', min: 1, default: 1 },
        limit: { type: 'integer', min: 1, max: 100, default: 50 },
        action: { type: ['string', 'array'], optional: true },
        resource: { type: 'string', optional: true },
        severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'], optional: true },
        userId: { type: 'string', format: 'mongo-id', optional: true },
        startDate: { type: 'date-time', optional: true },
        endDate: { type: 'date-time', optional: true },
        ip: { type: 'string', format: 'ip', optional: true },
    },
}), auditAdminAction('VIEW_AUDIT_LOGS'), getAuditLogs);
router.get('/user/:userId', requireMinRole('coordinator'), validateRequest({
    params: {
        userId: { type: 'string', format: 'mongo-id', required: true },
    },
    query: {
        page: { type: 'integer', min: 1, default: 1 },
        limit: { type: 'integer', min: 1, max: 100, default: 50 },
        action: { type: ['string', 'array'], optional: true },
        resource: { type: 'string', optional: true },
        severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'], optional: true },
        startDate: { type: 'date-time', optional: true },
        endDate: { type: 'date-time', optional: true },
        ip: { type: 'string', format: 'ip', optional: true },
        export: { type: 'string', enum: ['csv', 'json'], optional: true },
    },
}), auditAdminAction('VIEW_USER_ACTIVITY'), getUserActivity);
router.get('/security-alerts', requireMinRole('admin'), validateRequest({
    query: {
        severity: { type: 'string', enum: ['HIGH', 'MEDIUM'], default: 'HIGH' },
        period: { type: 'string', enum: ['24h', '7d', '30d'], default: '24h' },
        limit: { type: 'integer', min: 1, max: 50, default: 20 },
        page: { type: 'integer', min: 1, default: 1 },
    },
}), auditAdminAction('VIEW_SECURITY_ALERTS'), getSecurityAlerts);
router.get('/stats', requireMinRole('coordinator'), validateRequest({
    query: {
        period: { type: 'string', enum: ['7d', '30d', 'all'], default: '30d' },
        groupBy: { type: 'string', enum: ['action', 'resource', 'user', 'severity'], optional: true },
    },
}), auditAdminAction('VIEW_AUDIT_STATS'), getAuditStats);
router.get('/export', requireMinRole('admin'), validateRequest({
    query: {
        format: { type: 'string', enum: ['csv', 'json'], required: true },
        page: { type: 'integer', min: 1, default: 1 },
        limit: { type: 'integer', min: 1, max: 1000, default: 1000 },
        action: { type: ['string', 'array'], optional: true },
        resource: { type: 'string', optional: true },
        severity: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'], optional: true },
        userId: { type: 'string', format: 'mongo-id', optional: true },
        startDate: { type: 'date-time', optional: true },
        endDate: { type: 'date-time', optional: true },
        ip: { type: 'string', format: 'ip', optional: true },
    },
}), auditAdminAction('EXPORT_AUDIT_LOGS'), exportAuditLogs);
router.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta de auditoría no encontrada' });
});
export default router;
//# sourceMappingURL=auditLog.routes.js.map