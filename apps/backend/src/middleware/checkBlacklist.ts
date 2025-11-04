/**
 * Blacklist Token Check Middleware (TypeScript - November 2025)
 * @description Middleware para verificar tokens JWT blacklisted ANTES de autenticación principal en CERMONT ATG.
 * Extrae token de header/cookie, consulta BlacklistedToken model (isBlacklisted async). Deniega si revocado (401 + audit HIGH TOKEN_REVOKED_ATTEMPT).
 * Útil como capa extra de security en routes sensibles (e.g., /admin). Integra audit (createAuditLog), logger. Fail-open on DB error (continue to auth).
 * Nota: Recomendado integrar directamente en auth.ts (authenticate) para eficiencia single-check; este es opcional para granular (pre-auth only).
 * Uso (opcional): router.get('/admin', checkBlacklist, authenticate, requireAdmin, getAdminData). O integra en auth para todo. Pruebas: Jest mock BlacklistedToken.isBlacklisted (true: errorResponse 401 + audit call), false: next(), no token: next(), error: log + next() (fail-open).
 * @requires ../models/BlacklistedToken.ts - Model con isBlacklisted(token: string): Promise<boolean>
 * @requires ./auditLogger.ts - createAuditLog(options: AuditOptions): Promise<void>
 * @requires ../utils/response.ts - errorResponse(res: Response, msg: string, status: number, details: any[], code: string): void
 * @requires ../utils/logger.ts - logger (winston/pino)
 * @requires ../utils/constants.ts - HTTP_STATUS { UNAUTHORIZED: 401 }
 */


import { errorResponse } from '../utils/response';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import BlacklistedToken from '../models/BlacklistedToken';
import { Request, Response, NextFunction } from 'express';
import { createAuditLog } from './auditLogger';

import type { TypedRequest } from '../types'; // Para req.cookies, ip

// Tipos inferidos de audit (asumir interface en auditLogger.ts)
interface AuditOptions {
  userId?: string | null;
  userEmail?: string;
  userRol?: string | null;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  method?: string;
  endpoint?: string;
  status: 'SUCCESS' | 'DENIED' | 'ERROR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  errorMessage?: string;
}

/**
 * Middleware asíncrono para check de blacklist
 * Ejecuta antes de authenticate; no bloquea si error DB (fail-open con log).
 * @param req TypedRequest
 * @param res Response
 * @param next NextFunction
 * @returns Promise<void>
 */
export const checkBlacklist = async (
  req: TypedRequest,
  res: Response<any, any>,
  next: NextFunction
): Promise<void> => {
  try {
    // Extraer token: Header Bearer > Cookie (consistent con auth.ts)
    let token: string | undefined =
      req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : req.cookies?.accessToken;

    // No token: Skip (deja auth.ts manejar)
    if (!token) {
      next();
      return;
    }

    // Verificar blacklist (await para security; asume index en token/expires)
    const isBlacklisted: boolean = await BlacklistedToken.isBlacklisted(token);

    if (isBlacklisted) {
      // Audit denegado (HIGH severity, anon user)
      const partialToken: string = token.substring(0, 20) + '...'; // Partial para log (no full token)
      const ipAddress: string = req.ip || req.connection?.remoteAddress as string || 'unknown';
      const userAgent: string = req.get('User-Agent') || 'unknown';

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
      } as AuditOptions);

      // Response estandarizado
      errorResponse(
        res,
        'Token revocado. Inicia sesión nuevamente',
        HTTP_STATUS.UNAUTHORIZED,
        [],
        'TOKEN_BLACKLISTED'
      );
      return;
    }

    // OK: Adjunta token a req para auth.ts si needed (opcional)
    (req as any).__tempToken = token; // No expose; internal if integrate

    logger.debug('[Blacklist Check] Passed', { url: req.originalUrl, ip: req.ip });

    next();
  } catch (error: unknown) {
    // Fail-open: Log y continue (no denegar por DB fail)
    const errMsg: string = error instanceof Error ? error.message : 'Unknown error';
    const ip: string = req.ip || 'unknown';
    const userAgent: string = req.get('User-Agent') || 'unknown';

    logger.error('[Blacklist Check] Error', {
      error: errMsg,
      ip,
      url: req.originalUrl,
      userAgent,
    });

    // Audit si error high (e.g., DB down)
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
    } as AuditOptions).catch(() => {}); // Silent si audit fail

    next();
  }
};

/**
 * Helper para integrar check en auth.ts (si se prefiere single middleware)
 * Llama isBlacklisted y maneja en contexto auth.
 * @param token Token a check
 * @param req Request para logs/audit (opcional)
 * @returns true si blacklisted
 */
export const isTokenBlacklisted = async (
  token: string,
  req?: TypedRequest
): Promise<boolean> => {
  if (!token) return false;

  try {
    const blacklisted: boolean = await BlacklistedToken.isBlacklisted(token);
    if (blacklisted && req) {
      const ip: string = req.ip || 'unknown';
      const userAgent: string = req.get('User-Agent') || 'unknown';

      await createAuditLog({
        userId: null,
        action: 'TOKEN_REVOKED_INTEGRATED',
        resource: 'Auth',
        ipAddress: ip,
        userAgent,
        status: 'DENIED',
        severity: 'HIGH',
        description: 'Token blacklisted detectado en auth integrada',
      } as AuditOptions);
    }
    return blacklisted;
  } catch (error: unknown) {
    const errMsg: string = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[isTokenBlacklisted] Error', { error: errMsg });
    return false; // Fail-open
  }
};

export default checkBlacklist;
