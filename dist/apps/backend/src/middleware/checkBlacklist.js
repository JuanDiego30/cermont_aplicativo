import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import BlacklistedToken from '../models/BlacklistedToken';
export const checkBlacklist = async (req, res, next) => {
    try {
        let token = req.headers.authorization?.startsWith('Bearer ')
            ? req.headers.authorization.split(' ')[1]
            : req.cookies?.accessToken;
        if (!token) {
            next();
            return;
        }
        const isBlacklisted = await BlacklistedToken.isBlacklisted(token);
        if (isBlacklisted) {
            const partialToken = token.substring(0, 20) + '...';
            const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
            const userAgent = req.get('User-Agent') || 'unknown';
            await createAuditLog({
                userId: null,
                userEmail: 'unknown',
                userRol: null,
                action: 'TOKEN_REVOKED_ATTEMPT',
                resource: 'Auth',
                resourceId: partialToken,
                ipAddress,
                userAgent,
                method: req.method,
                endpoint: req.originalUrl,
                status: 'DENIED',
                severity: 'HIGH',
                description: 'Intento de uso de token revocado',
                errorMessage: `Token blacklisted usado en ${req.originalUrl}`,
            });
            errorResponse(res, 'Token revocado. Inicia sesión nuevamente', HTTP_STATUS.UNAUTHORIZED, [], 'TOKEN_BLACKLISTED');
            return;
        }
        req.__tempToken = token;
        logger.debug('[Blacklist Check] Passed', { url: req.originalUrl, ip: req.ip });
        next();
    }
    catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        const ip = req.ip || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        logger.error('[Blacklist Check] Error', {
            error: errMsg,
            ip,
            url: req.originalUrl,
            userAgent,
        });
        createAuditLog({
            userId: null,
            action: 'BLACKLIST_CHECK_FAILED',
            resource: 'Auth',
            ipAddress: ip,
            userAgent,
            status: 'ERROR',
            severity: 'MEDIUM',
            description: 'Error en verificación de blacklist',
            errorMessage: errMsg,
        }).catch(() => { });
        next();
    }
};
export const isTokenBlacklisted = async (token, req) => {
    if (!token)
        return false;
    try {
        const blacklisted = await BlacklistedToken.isBlacklisted(token);
        if (blacklisted && req) {
            const ip = req.ip || 'unknown';
            const userAgent = req.get('User-Agent') || 'unknown';
            await createAuditLog({
                userId: null,
                action: 'TOKEN_REVOKED_INTEGRATED',
                resource: 'Auth',
                ipAddress: ip,
                userAgent,
                status: 'DENIED',
                severity: 'HIGH',
                description: 'Token blacklisted detectado en auth integrada',
            });
        }
        return blacklisted;
    }
    catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('[isTokenBlacklisted] Error', { error: errMsg });
        return false;
    }
};
export default checkBlacklist;
//# sourceMappingURL=checkBlacklist.js.map