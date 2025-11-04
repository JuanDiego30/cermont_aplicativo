import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
export const notFound = (req, res, next) => {
    void next;
    const userContext = req.user ? `${req.user.email || req.user.userId}` : 'anonymous';
    const errorCode = 'ROUTE_NOT_FOUND';
    const timestamp = new Date().toISOString();
    logger.warn('[404 Not Found]', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        user: userContext,
        userAgent: req.get('User-Agent') || 'unknown',
        timestamp,
    });
    if (req.user && req.user.userId) {
        const userAgent = req.get('User-Agent') || 'unknown';
        createAuditLog({
            userId: req.user.userId,
            userEmail: req.user.email || 'unknown',
            action: 'ROUTE_NOT_FOUND',
            resource: 'Routing',
            endpoint: req.originalUrl,
            method: req.method,
            ipAddress: req.ip,
            userAgent,
            status: 'WARNING',
            severity: 'LOW',
            description: 'Intento de acceso a ruta inexistente',
            metadata: { timestamp },
        }).catch((err) => {
            const errMsg = err instanceof Error ? err.message : 'Unknown audit error';
            logger.error('[Audit] NotFound audit failed', { error: errMsg });
        });
    }
    errorResponse(res, `Endpoint no encontrado: ${req.method} ${req.originalUrl}. Revisa la documentación de la API.`, HTTP_STATUS.NOT_FOUND, {
        errorCode,
        timestamp,
        suggested: 'Usa /api/v1/docs para Swagger si disponible.',
    });
};
export const notFoundViaError = (req, res, next) => {
    const error = new Error(`Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.errorCode = 'ROUTE_NOT_FOUND';
    next(error);
};
export default notFound;
//# sourceMappingURL=notFound.js.map