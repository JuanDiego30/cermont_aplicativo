/**
 * Cache Middleware Module (TypeScript - November 2025 - FIXED)
 * @description Middleware para caching de respuestas API CERMONT ATG
 */

import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import cacheService from '../services/cache.service';

// ==================== INTERFACES ====================

interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

interface TypedRequest extends Request {
  user?: AuthUser;
}

interface ICacheService {
  get(key: string): Promise<any | null>;
  set(key: string, value: any, ttl: number): Promise<void>;
  del(key: string): Promise<number>;
  delPattern(pattern: string): Promise<number>;
  flushAll(): Promise<number>;
}

// ==================== HELPERS ====================

const sanitizeQueryForCache = (query: Record<string, any>): Record<string, string> => {
  const clean: Record<string, string> = {};
  
  for (const key of Object.keys(query)) {
    if (['token', 'password', 'apiKey', 'secret'].includes(key.toLowerCase())) {
      continue;
    }
    clean[key] = String(query[key]);
  }
  
  return clean;
};

const generateCacheKey = async (
  req: TypedRequest,
  userSpecific: boolean = true,
  skipQueries: string[] = []
): Promise<string | null> => {
  const basePath = req.originalUrl.split('?')[0];
  const userId = userSpecific && req.user?.userId ? req.user.userId : 'anonymous';

  const queryParams: Record<string, any> = { ...req.query };
  skipQueries.forEach((key) => delete queryParams[key]);
  
  const sanitizedQuery = sanitizeQueryForCache(queryParams);
  const queryString = Object.keys(sanitizedQuery).length > 0 ? JSON.stringify(sanitizedQuery) : '';
  const queryHash = Buffer.from(queryString, 'utf-8').toString('base64').slice(0, 50);

  const key = `cermont:api:${basePath.replace(/\//g, ':')}:${queryHash}:${userId}`;
  return key.length < 250 ? key : null;
};

// ==================== MIDDLEWARE ====================

export const cacheMiddleware = (
  ttl: number = 60,
  keyGenerator?: (req: TypedRequest) => Promise<string | null>,
  userSpecific: boolean = true,
  skipQueries: string[] = []
) => {
  const effectiveTtl: number = Number.isInteger(ttl) && ttl >= 1 && ttl <= 3600 ? ttl : 60;

  return async (req: TypedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET') {
      next();
      return;
    }

    if (!cacheService || req.path.includes('/admin/') || req.path.includes('/audit/')) {
      next();
      return;
    }

    let cacheKey: string | null;
    if (keyGenerator) {
      cacheKey = await keyGenerator(req);
    } else {
      cacheKey = await generateCacheKey(req, userSpecific, skipQueries);
    }

    if (!cacheKey) {
      logger.debug('[Cache] Skipping: Invalid key', { url: req.originalUrl });
      next();
      return;
    }

    try {
      const cached = await (cacheService as any).get(cacheKey);

      if (cached !== null && cached !== undefined) {
        logger.debug('[Cache Middleware] HIT', { key: cacheKey, ttl: effectiveTtl, url: req.originalUrl });
        
        const responseBody = {
          ...cached,
          _meta: {
            cached: true,
            cachedAt: new Date().toISOString(),
            ttlRemaining: effectiveTtl,
          },
        };
        
        res.setHeader('Cache-Control', `public, max-age=${effectiveTtl}`);
        res.status(HTTP_STATUS.OK).json(responseBody);
        return;
      }
    } catch (err) {
      logger.error('[Cache] Get failed', { error: (err as Error).message, key: cacheKey });
    }

    const originalJson = res.json.bind(res);
    let capturedStatus: number = HTTP_STATUS.OK;

    const statusProxy = new Proxy(res.status.bind(res), {
      apply: (target, thisArg, args: [number]) => {
        capturedStatus = args[0];
        return target.apply(thisArg, args);
      }
    });

    (res as any).status = statusProxy;

    res.json = function(body: any): Response {
      try {
        const statusCode = capturedStatus;
        if (statusCode >= 200 && statusCode < 300) {
          (cacheService as any)
            .set(cacheKey, body, effectiveTtl)
            .catch((err: Error) => {
              logger.error('[Cache] Set failed after MISS', {
                error: err.message,
                key: cacheKey,
              });
            });
          logger.debug('[Cache Middleware] MISS saved', {
            key: cacheKey,
            ttl: effectiveTtl,
            url: req.originalUrl,
          });
        }
        res.setHeader(
          'Cache-Control',
          statusCode >= 200 && statusCode < 300 ? `public, max-age=${effectiveTtl}` : 'no-cache'
        );
      } catch (err) {
        logger.error('[Cache] JSON wrapper error', { error: (err as Error).message, key: cacheKey });
      }

      return originalJson.call(this, body);
    };

    next();
  };
};

export const invalidateCache = (patterns: string | string[]) => {
  const effectivePatterns: string[] = Array.isArray(patterns) ? patterns : [patterns];

  return async (req: TypedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      next();
      return;
    }

    res.on('finish', async () => {
      if ((res as any).statusCode >= 200 && (res as any).statusCode < 300) {
        let totalDeleted = 0;
        for (const pattern of effectivePatterns) {
          try {
            const deleted = await (cacheService as any).delPattern(pattern);
            totalDeleted += deleted;
            logger.info('[Cache Invalidate] Pattern', { pattern, deleted, url: req.originalUrl });
          } catch (err) {
            logger.error('[Cache] DelPattern failed', { error: (err as Error).message, pattern });
          }
        }
        if (totalDeleted > 0) {
          logger.info('[Cache] Total invalidated', {
            total: totalDeleted,
            method: req.method,
            url: req.originalUrl,
          });
        }
      }
    });

    next();
  };
};

export const invalidateCacheById = (resourceType: string, idParam: string = 'id') => {
  return async (req: TypedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      next();
      return;
    }

    res.on('finish', async () => {
      if ((res as any).statusCode >= 200 && (res as any).statusCode < 300) {
        const resourceId = req.params[idParam] || req.body?._id || req.body?.id;
        if (resourceId) {
          try {
            await (cacheService as any).del(`cermont:api:${resourceType}:${resourceId}:*`);
            await (cacheService as any).delPattern(`cermont:api:${resourceType}*`);
            logger.info('[Cache Invalidate By ID]', { resourceType, resourceId, url: req.originalUrl });
          } catch (err) {
            logger.error('[Cache] InvalidateById failed', {
              error: (err as Error).message,
              resourceType,
              resourceId,
            });
          }
        }
      }
    });

    next();
  };
};

export const clearAllCache = async (): Promise<number> => {
  try {
    const deleted = await (cacheService as any).flushAll();
    logger.warn('[Cache] Full clear', { deleted });
    return deleted;
  } catch (err) {
    logger.error('[Cache] ClearAll failed', { error: (err as Error).message });
    throw err;
  }
};

export default { cacheMiddleware, invalidateCache, invalidateCacheById, clearAllCache };
