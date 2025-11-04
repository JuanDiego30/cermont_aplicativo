/**
 * Cache Middleware
 * @description Middleware para caché de rutas
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

// En memoria (temporalmente; después usar Redis)
const cache = new Map<string, { data: any; expires: number }>();

/**
 * Middleware para caché de respuestas GET
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Solo cachear GET
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);

    if (cached && cached.expires > Date.now()) {
      logger.debug(`Cache HIT: ${key}`);
      res.json(cached.data);
      return;
    }

    // Interceptar res.json original
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      cache.set(key, {
        data,
        expires: Date.now() + ttl * 1000,
      });
      logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalida caché por patrón
 */
export const invalidateCache = (pattern: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const keysToDelete: string[] = [];

    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => cache.delete(key));

    if (keysToDelete.length > 0) {
      logger.debug(`Cache INVALIDATED: ${keysToDelete.length} keys with pattern "${pattern}"`);
    }

    next();
  };
};

/**
 * Invalida caché por ID
 */
export const invalidateCacheById = (resource: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.params.id) {
      return next();
    }

    const keysToDelete: string[] = [];

    for (const key of cache.keys()) {
      if (key.includes(resource) || key.includes(req.params.id)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => cache.delete(key));

    if (keysToDelete.length > 0) {
      logger.debug(`Cache INVALIDATED: ${keysToDelete.length} keys for ${resource}/${req.params.id}`);
    }

    next();
  };
};

/**
 * Limpia el caché completo
 */
export const clearCache = (): void => {
  cache.clear();
  logger.info('Cache cleared completely');
};

/**
 * Obtiene estadísticas del caché
 */
export const getCacheStats = () => {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
};