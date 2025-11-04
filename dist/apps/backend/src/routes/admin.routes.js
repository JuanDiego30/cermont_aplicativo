import express from 'express';
import { authenticate } from '';
import { authorizeRoles } from '';
import { validateRequest } from '';
import { auditAdminAction } from '';
import { getRateLimitStats, blockIp, unblockIp, whitelistIp, removeFromWhitelist, resetIpLimit, checkIpStatus, getSystemStats, clearCache, } from '';
const router = express.Router();
router.use(authenticate);
router.use(authorizeRoles('root', 'admin'));
router.use('/rate-limit', (req, res, next) => {
    next();
});
router.get('/rate-limit/stats', validateRequest({
    query: {
        period: { type: 'string', enum: ['24h', '7d', '30d'], optional: true },
        ip: { type: 'string', format: 'ip', optional: true },
        page: { type: 'integer', min: 1, optional: true },
        limit: { type: 'integer', min: 1, max: 100, optional: true },
    },
}), auditAdminAction('VIEW_RATE_STATS'), getRateLimitStats);
router.post('/rate-limit/block', validateRequest({
    body: {
        ip: { type: 'string', format: 'ip', required: true },
        duration: { type: 'string', enum: ['temp', 'permanent'], optional: true },
        reason: { type: 'string', maxlength: 500, optional: true },
    },
}), auditAdminAction('BLOCK_IP'), blockIp);
router.post('/rate-limit/unblock', validateRequest({
    body: {
        ip: { type: 'string', format: 'ip', required: true },
        reason: { type: 'string', maxlength: 500, optional: true },
    },
}), auditAdminAction('UNBLOCK_IP'), unblockIp);
router.post('/rate-limit/whitelist', validateRequest({
    body: {
        ip: { type: 'string', format: 'ip', required: true },
        reason: { type: 'string', maxlength: 500, required: true },
        expiresAt: { type: 'date-time', optional: true },
    },
}), auditAdminAction('WHITELIST_IP'), whitelistIp);
router.delete('/rate-limit/whitelist/:ip', validateRequest({
    params: {
        ip: { type: 'string', format: 'ip', required: true },
    },
}), auditAdminAction('REMOVE_WHITELIST_IP'), removeFromWhitelist);
router.post('/rate-limit/reset', validateRequest({
    body: {
        ip: { type: 'string', format: 'ip', required: true },
        reason: { type: 'string', maxlength: 500, optional: true },
    },
}), auditAdminAction('RESET_IP_LIMIT'), resetIpLimit);
router.get('/rate-limit/check/:ip', validateRequest({
    params: {
        ip: { type: 'string', format: 'ip', required: true },
    },
    query: {
        detailed: { type: 'boolean', optional: true },
    },
}), auditAdminAction('CHECK_IP_STATUS'), checkIpStatus);
router.get('/system/stats', validateRequest({
    query: {
        period: { type: 'string', enum: ['24h', '7d'], optional: true },
        detailed: { type: 'boolean', optional: true },
    },
}), auditAdminAction('VIEW_SYSTEM_STATS'), getSystemStats);
router.post('/system/clear-cache', validateRequest({
    body: {
        keys: { type: 'array', items: { type: 'string' }, optional: true },
        reason: { type: 'string', maxlength: 500, required: true },
    },
}), auditAdminAction('CLEAR_CACHE'), clearCache);
router.use((req, res) => {
    res.status(404).json({ message: 'Ruta admin no encontrada' });
});
export default router;
//# sourceMappingURL=admin.routes.js.map