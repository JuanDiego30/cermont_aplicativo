import { HTTP_STATUS } from '../utils/constants';
import { logger } from '../utils/logger';
import cacheService from '../services/cache.service';
export const cacheMiddleware = (ttl = 60, keyGenerator, userSpecific = true, skipQueries = []) => {
    const effectiveTtl = Number.isInteger(ttl) && ttl >= 1 && ttl <= 3600 ? ttl : 60;
    return async (req, res, next) => {
        if (req.method !== 'GET') {
            next();
            return;
        }
        if (!cacheService || req.path.includes('/admin/') || req.path.includes('/audit/')) {
            next();
            return;
        }
        let cacheKey;
        if (keyGenerator) {
            cacheKey = await keyGenerator(req);
        }
        else {
            cacheKey = await generateCacheKey(req, userSpecific, skipQueries);
        }
        if (!cacheKey) {
            logger.debug('[Cache] Skipping: Invalid key', { url: req.originalUrl });
            next();
            return;
        }
        try {
            const cached = await cacheService.get(cacheKey);
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
                res.set('Cache-Control', `public, max-age=${effectiveTtl}`);
                res.status(HTTP_STATUS.OK).json(responseBody);
                return;
            }
        }
        catch (err) {
            logger.error('[Cache] Get failed', { error: err.message, key: cacheKey });
        }
        const originalJson = res.json.bind(res);
        const originalStatus = res.status.bind(res);
        res.status = function (code) {
            res.__cacheStatus = code;
            return originalStatus.call(this, code);
        };
        res.json = async function (body) {
            try {
                const statusCode = res.__cacheStatus || HTTP_STATUS.OK;
                if (statusCode >= 200 && statusCode < 300) {
                    cacheService
                        .set(cacheKey, body, effectiveTtl)
                        .catch((err) => {
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
                res.set('Cache-Control', statusCode >= 200 && statusCode < 300 ? `public, max-age=${effectiveTtl}` : 'no-cache');
            }
            catch (err) {
                logger.error('[Cache] JSON wrapper error', { error: err.message, key: cacheKey });
            }
            return originalJson.call(this, body);
        };
        next();
    };
};
const generateCacheKey = async (req, userSpecific = true, skipQueries = []) => {
    const basePath = req.originalUrl.split('?')[0];
    const userId = userSpecific && req.user?.userId ? req.user.userId : 'anonymous';
    const queryParams = { ...req.query };
    skipQueries.forEach((key) => delete queryParams[key]);
    const sanitizedQuery = await sanitizeQueryForCache(queryParams);
    const queryString = sanitizedQuery ? JSON.stringify(sanitizedQuery) : '';
    const queryHash = Buffer.from(queryString, 'utf-8').toString('base64');
    const key = `cermont:api:${basePath.replace(/\//g, ':')}:${queryHash}:${userId}`;
    return key.length < 250 ? key : null;
};
export const invalidateCache = (patterns) => {
    const effectivePatterns = Array.isArray(patterns) ? patterns : [patterns];
    return async (req, res, next) => {
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            next();
            return;
        }
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                let totalDeleted = 0;
                for (const pattern of effectivePatterns) {
                    try {
                        const deleted = await cacheService.delPattern(pattern);
                        totalDeleted += deleted;
                        logger.info('[Cache Invalidate] Pattern', { pattern, deleted, url: req.originalUrl });
                    }
                    catch (err) {
                        logger.error('[Cache] DelPattern failed', { error: err.message, pattern });
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
export const invalidateCacheById = (resourceType, idParam = 'id') => {
    return async (req, res, next) => {
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            next();
            return;
        }
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const resourceId = req.params[idParam] || req.body?._id || req.body?.id;
                if (resourceId) {
                    try {
                        await cacheService.del(`cermont:api:${resourceType}:${resourceId}:*`);
                        await cacheService.delPattern(`cermont:api:${resourceType}*`);
                        logger.info('[Cache Invalidate By ID]', { resourceType, resourceId, url: req.originalUrl });
                    }
                    catch (err) {
                        logger.error('[Cache] InvalidateById failed', {
                            error: err.message,
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
export const clearAllCache = async () => {
    try {
        const deleted = await cacheService.flushAll();
        logger.warn('[Cache] Full clear', { deleted });
        return deleted;
    }
    catch (err) {
        logger.error('[Cache] ClearAll failed', { error: err.message });
        throw err;
    }
};
export default { cacheMiddleware, invalidateCache, invalidateCacheById, clearAllCache };
//# sourceMappingURL=cacheMiddleware.js.map