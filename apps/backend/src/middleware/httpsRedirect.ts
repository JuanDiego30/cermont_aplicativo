/**
 * HTTPS Redirect Middleware (TypeScript - November 2025)
 * @description Fuerza redirección HTTP a HTTPS en producción para CERMONT ATG.
 * Deshabilitado en dev/test para evitar loops. Soporta proxies (x-forwarded-proto/protocol).
 * Skip paths sensibles (health, metrics, swagger). Usa 301 permanente.
 * Integra logger para trace redirects (non-sensitive, truncated UA).
 * Uso en server.ts (antes de routes principales): app.use(httpsRedirect); Nota: En VPS/NGINX, prefiere server-level redirect (más eficiente, less load).
 * Pruebas: Jest supertest non-https (expect redirect 301), https (expect next). Skip paths: next(). Dev: next(). Env: SSL_ENABLED=true/false.
 * Types: @types/express. RequestHandler = (req: Request, res: Response, next: NextFunction) => void.
 * Fixes: req.get('User-Agent')?.substring(0,100) || 'unknown'. isSecure: || req.protocol === 'https' (native). Early exits perf. No query leak (req.url includes ?).
 * Assumes: app.set('trust proxy', 1) en server.ts para x-forwarded. Logger: info level (no error for redirects).
 */


import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para redirección HTTP → HTTPS
 * @param req Request
 * @param res Response
 * @param next NextFunction
 */
export const httpsRedirect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const isProduction: boolean = process.env.NODE_ENV === 'production';
  const sslEnabled: boolean = process.env.SSL_ENABLED === 'true';
  const domain: string = process.env.DOMAIN || req.headers.host as string || 'localhost:3000'; // Fallback safe (string)

  // Early exit: Dev/test o SSL disabled
  if (!isProduction || !sslEnabled) {
    next();
    return;
  }

  // Skip paths sensibles (expandible: health, docs, metrics)
  const skipPaths: string[] = ['/health', '/api/health', '/metrics', '/swagger-ui', '/api-docs'];
  if (skipPaths.some((path: string) => req.path.startsWith(path))) {
    next();
    return;
  }

  // Check secure: Native secure + proxy header (trust proxy if app.set('trust proxy', 1))
  const isSecure: boolean =
    req.secure ||
    req.get('x-forwarded-proto') === 'https' ||
    req.get('x-forwarded-protocol') === 'https' ||
    req.protocol === 'https';

  if (!isSecure) {
    // Log redirect (info, no sensitive data)
    const userAgent: string = (req.get('User-Agent') ?? '').substring(0, 100) || 'unknown'; // Truncate + fallback
    logger.info('[HTTPS Redirect]', {
      from: `http://${domain}${req.url}`,
      to: `https://${domain}${req.url}`,
      ip: req.ip,
      method: req.method,
      userAgent,
    });

    // 301 redirect con full URL (incluye query params via req.url)
    const redirectUrl: string = `https://${domain}${req.url}`;
    res.redirect(301, redirectUrl);
    return;
  }

  next();
};

/**
 * Helper para conditional enable (e.g., en route groups)
 * @param enabled Force enable (override env)
 * @returns Wrapped middleware or noop
 */
export const conditionalHttpsRedirect = (enabled: boolean = true): ((req: Request, res: Response, next: NextFunction) => void) => {
  if (!enabled) {
    return (req: Request, res: Response, next: NextFunction): void => next();
  }
  return httpsRedirect;
};

export default httpsRedirect;
