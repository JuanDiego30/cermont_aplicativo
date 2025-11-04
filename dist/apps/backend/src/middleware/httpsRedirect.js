import { logger } from '../utils/logger';
export const httpsRedirect = (req, res, next) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const sslEnabled = process.env.SSL_ENABLED === 'true';
    const domain = process.env.DOMAIN || req.headers.host || 'localhost:3000';
    if (!isProduction || !sslEnabled) {
        next();
        return;
    }
    const skipPaths = ['/health', '/api/health', '/metrics', '/swagger-ui', '/api-docs'];
    if (skipPaths.some((path) => req.path.startsWith(path))) {
        next();
        return;
    }
    const isSecure = req.secure ||
        req.get('x-forwarded-proto') === 'https' ||
        req.get('x-forwarded-protocol') === 'https' ||
        req.protocol === 'https';
    if (!isSecure) {
        const userAgent = (req.get('User-Agent') ?? '').substring(0, 100) || 'unknown';
        logger.info('[HTTPS Redirect]', {
            from: `http://${domain}${req.url}`,
            to: `https://${domain}${req.url}`,
            ip: req.ip,
            method: req.method,
            userAgent,
        });
        const redirectUrl = `https://${domain}${req.url}`;
        res.redirect(301, redirectUrl);
        return;
    }
    next();
};
export const conditionalHttpsRedirect = (enabled = true) => {
    if (!enabled) {
        return (req, res, next) => next();
    }
    return httpsRedirect;
};
export default httpsRedirect;
//# sourceMappingURL=httpsRedirect.js.map