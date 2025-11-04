import { rateLimitManager } from '../middleware/rateLimiter';
import { successResponse } from '../utils/response';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';
import { z } from 'zod';
const IpSchema = z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/);
const BlockBodySchema = z.object({
    ip: IpSchema,
    reason: z.string().optional(),
});
const IpBodySchema = z.object({
    ip: IpSchema,
});
const requireAdmin = (req) => {
    if (!req.user || req.user.role !== 'admin') {
        throw new Error('Acceso denegado: Requiere rol admin');
    }
};
export const getRateLimitStats = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const stats = rateLimitManager.getStats();
    successResponse(res, {
        stats,
        timestamp: new Date().toISOString(),
    }, 'Estadísticas de rate limiting obtenidas');
});
export const blockIp = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const { ip, reason } = BlockBodySchema.parse(req.body);
    rateLimitManager.blockIp(ip, reason || 'Manual block by admin');
    logger.info(`IP blocked by admin: ${ip} (reason: ${reason || 'N/A'}) by user ${req.user.userId}`);
    successResponse(res, { ip, reason: reason || 'Bloqueo manual' }, 'IP bloqueada exitosamente');
});
export const unblockIp = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const { ip } = IpBodySchema.parse(req.body);
    rateLimitManager.unblockIp(ip);
    logger.info(`IP unblocked by admin: ${ip} by user ${req.user.userId}`);
    successResponse(res, { ip }, 'IP desbloqueada exitosamente');
});
export const whitelistIp = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const { ip } = IpBodySchema.parse(req.body);
    rateLimitManager.whitelistIp(ip);
    logger.info(`IP whitelisted by admin: ${ip} by user ${req.user.userId}`);
    successResponse(res, { ip }, 'IP agregada a whitelist exitosamente');
});
export const removeFromWhitelist = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const ip = IpSchema.parse(req.params.ip);
    rateLimitManager.removeFromWhitelist(ip);
    logger.info(`IP removed from whitelist by admin: ${ip} by user ${req.user.userId}`);
    successResponse(res, { ip }, 'IP removida de whitelist exitosamente');
});
export const resetIpLimit = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const { ip } = IpBodySchema.parse(req.body);
    const keysReset = rateLimitManager.resetIpLimit(ip);
    logger.info(`Rate limit reset for IP: ${ip} by user ${req.user.userId}`);
    successResponse(res, { ip, keysReset }, `Límite reseteado para IP (${keysReset} keys)`);
});
export const checkIpStatus = asyncHandler(async (req, res) => {
    requireAdmin(req);
    const ip = IpSchema.parse(req.params.ip);
    const status = {
        ip,
        isWhitelisted: rateLimitManager.isWhitelisted(ip),
        isBlacklisted: rateLimitManager.isBlacklisted(ip),
        timestamp: new Date().toISOString(),
    };
    successResponse(res, status, 'Estado de IP obtenido');
});
//# sourceMappingURL=admin.controller.js.map