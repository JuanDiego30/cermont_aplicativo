import NodeCache from 'node-cache';
import { logger } from '';
import { CACHE_TTL, CACHE_CHECK_PERIOD, CACHE_MAX_KEYS, CACHE_ENABLED } from '';
let shutdownHookRegistered = false;
export const registerShutdownHook = () => {
    if (shutdownHookRegistered)
        return;
    process.on('SIGTERM', () => {
        logger.warn('[Cache] Flushing cache on shutdown');
        if (cacheService.cache) {
            cacheService.flush();
        }
    });
    shutdownHookRegistered = true;
};
class CacheService {
    cache = null;
    stats = { hits: 0, misses: 0, sets: 0, deletes: 0, keysCount: 0, hitRate: 0, memoryUsage: 0 };
    constructor() {
        if (!CACHE_ENABLED) {
            logger.warn('[Cache] Cache deshabilitado via env');
            return;
        }
        const ttl = typeof CACHE_TTL === 'number' ? CACHE_TTL : 300;
        const checkPeriod = typeof CACHE_CHECK_PERIOD === 'number' ? CACHE_CHECK_PERIOD : 60;
        const maxKeys = typeof CACHE_MAX_KEYS === 'number' ? CACHE_MAX_KEYS : 1000;
        this.cache = new NodeCache({
            stdTTL: ttl,
            checkperiod: checkPeriod,
            maxKeys: maxKeys,
            useClones: false,
            deleteOnExpire: true,
        });
        const logLevel = process.env.LOG_LEVEL || 'info';
        this.cache.on('set', (key, _value) => {
            this.stats.sets++;
            if (logLevel === 'debug')
                logger.debug(`[Cache] Set: ${String(key)}`);
        });
        this.cache.on('del', (key, _value) => {
            this.stats.deletes++;
            if (logLevel === 'debug')
                logger.debug(`[Cache] Delete: ${String(key)}`);
        });
        this.cache.on('expired', (key, _value) => {
            if (logLevel === 'debug')
                logger.debug(`[Cache] Expired: ${String(key)}`);
        });
        logger.info(`✅ Cache service inicializado (in-memory, TTL: ${ttl}s, maxKeys: ${maxKeys})`);
    }
    get(key) {
        if (!this.cache)
            return undefined;
        const value = this.cache.get(key);
        if (value !== undefined) {
            this.stats.hits++;
        }
        else {
            this.stats.misses++;
        }
        return value;
    }
    mget(keys) {
        if (!this.cache || !Array.isArray(keys) || keys.length === 0)
            return {};
        const result = this.cache.mget(keys);
        Object.keys(result).forEach(k => {
            if (result[k] !== undefined)
                this.stats.hits++;
            else
                this.stats.misses++;
        });
        return result;
    }
    set(key, value, ttl = null) {
        if (!this.cache)
            return false;
        try {
            if (!key || typeof key !== 'string' || key.trim().length === 0 || /token|password/i.test(key)) {
                logger.warn(`[Cache] Invalid/sensitive key skipped: ${key}`);
                return false;
            }
            if (typeof value === 'function') {
                logger.warn(`[Cache] Function value skipped for key: ${key}`);
                return false;
            }
            const size = JSON.stringify(value).length;
            if (size > 1024 * 1024) {
                logger.warn(`[Cache] Large value skipped for key: ${key} (size: ${size} bytes)`);
                return false;
            }
            const success = ttl !== null ? this.cache.set(key, value, ttl) : this.cache.set(key, value);
            if (success)
                this.stats.sets++;
            return Boolean(success);
        }
        catch (error) {
            logger.error(`[Cache] Error guardando ${key}:`, error);
            return false;
        }
    }
    mset(data, ttl = null) {
        if (!this.cache || !data || Object.keys(data).length === 0)
            return 0;
        let count = 0;
        for (const [key, value] of Object.entries(data)) {
            if (this.set(key, value, ttl))
                count++;
        }
        return count;
    }
    del(key) {
        if (!this.cache)
            return 0;
        const deleted = this.cache.del(key);
        if (deleted > 0)
            this.stats.deletes += deleted;
        return deleted;
    }
    delMultiple(keys) {
        if (!this.cache)
            return 0;
        const keysArray = Array.isArray(keys) ? keys : [keys];
        if (keysArray.length === 0)
            return 0;
        const deleted = this.cache.del(keysArray);
        if (deleted > 0)
            this.stats.deletes += deleted;
        return deleted;
    }
    delPattern(pattern) {
        if (!this.cache || !pattern)
            return 0;
        const regexStr = pattern.replace(/\*/g, '.*').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`^${regexStr}$`, 'i');
        const allKeys = this.cache.keys();
        const matchedKeys = allKeys.filter((key) => regex.test(String(key)));
        if (matchedKeys.length === 0)
            return 0;
        const deleted = this.cache.del(matchedKeys);
        if (deleted > 0)
            this.stats.deletes += deleted;
        logger.debug(`[Cache] delPattern '${pattern}': deleted ${deleted} keys`);
        return deleted;
    }
    has(key) {
        return this.cache ? this.cache.has(key) : false;
    }
    keys() {
        return this.cache ? this.cache.keys() : [];
    }
    flush() {
        if (this.cache) {
            this.cache.flushAll();
            logger.info('[Cache] Cache limpiado completamente');
            this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, keysCount: 0, hitRate: 0, memoryUsage: 0 };
        }
    }
    getStats() {
        if (!this.cache) {
            return { enabled: false, message: 'Cache deshabilitado' };
        }
        const nodeStats = this.cache.getStats();
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
        const keysCount = this.cache.keys().length;
        const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
        return {
            ...this.stats,
            keysCount,
            hitRate,
            nodeCacheStats: nodeStats,
            memoryUsage,
        };
    }
    async wrap(key, fn, ttl = null) {
        if (!this.cache) {
            return await fn();
        }
        const cached = this.get(key);
        if (cached !== undefined) {
            return cached;
        }
        try {
            const result = await fn();
            this.set(key, result, ttl);
            return result;
        }
        catch (error) {
            logger.error(`[Cache] Error en wrap para ${key}:`, error);
            throw error;
        }
    }
}
const cacheService = new CacheService();
registerShutdownHook();
export default cacheService;
//# sourceMappingURL=cache.service.js.map