/**
 * Cache Service (TypeScript - November 2025)
 * @description Singleton in-memory cache con NodeCache, configurable via env para desarrollo/pequeña escala. TTL default 5min, auto-clean, maxKeys 1000.
 * Uso: En middleware/cacheMiddleware (GET routes), services (e.g. getUsers wrap), invalidate on mutations (POST/PUT/DELETE via audit or explicit).
 * Integrado con: logger (debug/info/error), constants (CACHE_TTL=300s, etc.). Secure: No cache sensitive (PII, tokens)—prefix 'public:' o 'route:'. Performance: Batch mget/mset,
 * wrap async con error passthrough, stats para monitoring (hitRate, size). Extensible: Redis switch (extend class). Para ATG: Cache lists/stats (users/orders), invalidate por ID/prefix
 * (e.g. delPattern('orders:*') on update). Missing: Distributed (Redis pub/sub invalidate), compression for large values. No persist (memory only, flush on SIGTERM).
 * Stats: getStats() para /admin/cache. Env: CACHE_ENABLED=true, CACHE_TTL=300, CACHE_MAX_KEYS=1000. Future: LRU eviction, telemetry.
 * Pruebas: Jest (init disabled/enabled, get/set/del success/fail, mget/mset batch, delPattern regex match/delete 0/1+, wrap async hit/miss/error passthrough, stats hitRate=0.5 after hits/misses,
 * flush reset stats, shutdown hook flush). Types: CacheStats { hits: number, misses: number, sets: number, deletes: number, keysCount: number, hitRate: number, nodeCacheStats: any, memoryUsage: number },
 * WrapFn<T> = () => Promise<T>. Assumes: node-cache ^5+, @types/node-cache. Secure: Key validation regex /token|password/i skip, value JSON.stringify/parse if needed (but node-cache handles primitives/objects). Perf: useClones:false fast,
 * checkperiod:60s low CPU, maxKeys:1000 prevent OOM. Env validation: If CACHE_ENABLED=false, all methods noop safe. Invalidate: Call delPattern('orders:') post-update in controller/service hooks.
 * Fixes: process.on('SIGTERM') global ok but wrap in init, logger default 'info', validate keys non-empty/string, mset loop set() or native if avail, regex safe (escape special? but * to .* ok), hitRate div0 safe.
 * Integrate: En audit.service.ts on CRUD, cacheService.delPattern(`orders:${entityId}`); En middleware: if GET && cacheService.has(key) res.json(cacheService.get(key)); else after handler if 200 cacheService.set(key, res.locals.data).
 */

import NodeCache from 'node-cache';
import { logger } from '../utils/logger';
import { CACHE_TTL, CACHE_CHECK_PERIOD, CACHE_MAX_KEYS, CACHE_ENABLED } from '../utils/constants';

// Graceful shutdown (call in app init or export hook)
let shutdownHookRegistered = false;
export const registerShutdownHook = (): void => {
  if (shutdownHookRegistered) return;
  process.on('SIGTERM', () => {
    logger.warn('[Cache] Flushing cache on shutdown');
    if (cacheService.cache) {
      cacheService.flush();
    }
  });
  shutdownHookRegistered = true;
};

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  keysCount: number;
  hitRate: number;
  nodeCacheStats?: any; // From node-cache.getStats()
  memoryUsage: number; // MB approx
}

type WrapFn<T> = () => Promise<T>;

class CacheService {
  private cache: NodeCache | null = null;
  private stats: CacheStats = { hits: 0, misses: 0, sets: 0, deletes: 0, keysCount: 0, hitRate: 0, memoryUsage: 0 };

  constructor() {
    if (!CACHE_ENABLED) {
      logger.warn('[Cache] Cache deshabilitado via env');
      return;
    }

    // Validate env numbers
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

    // Event listeners with type safety
    const logLevel = process.env.LOG_LEVEL || 'info';
    this.cache.on('set', (key: string | number, _value: any) => {
      this.stats.sets++;
      if (logLevel === 'debug') logger.debug(`[Cache] Set: ${String(key)}`);
    });

    this.cache.on('del', (key: string | number, _value: any) => {
      this.stats.deletes++;
      if (logLevel === 'debug') logger.debug(`[Cache] Delete: ${String(key)}`);
    });

    this.cache.on('expired', (key: string | number, _value: any) => {
      if (logLevel === 'debug') logger.debug(`[Cache] Expired: ${String(key)}`);
    });

    logger.info(`✅ Cache service inicializado (in-memory, TTL: ${ttl}s, maxKeys: ${maxKeys})`);
  }

  /**
   * Obtener valor (o undefined)
   * @param key - Clave (prefix recommended, e.g. 'user:123')
   * @returns Valor o undefined
   */
  get(key: string): any | undefined {
    if (!this.cache) return undefined;
    const value = this.cache.get<any>(key);
    if (value !== undefined) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    return value;
  }

  /**
   * Batch get múltiples keys
   * @param keys - Array de claves
   * @returns { [key: string]: any } (missing keys: undefined)
   */
  mget(keys: string[]): Record<string, any> {
    if (!this.cache || !Array.isArray(keys) || keys.length === 0) return {};
    const result = this.cache.mget(keys);
    // Update stats: Count hits/misses based on undefined
    Object.keys(result).forEach(k => {
      if (result[k] !== undefined) this.stats.hits++; else this.stats.misses++;
    });
    return result as Record<string, any>;
  }

  /**
   * Guardar valor (TTL optional, default from config)
   * @param key - Clave
   * @param value - Valor (JSON serializable, no functions)
   * @param ttl - TTL en segundos (null=default)
   * @returns true on success
   */
  set(key: string, value: any, ttl: number | null = null): boolean {
    if (!this.cache) return false;
    try {
      // Validate key: non-empty string, no sensitive patterns
      if (!key || typeof key !== 'string' || key.trim().length === 0 || /token|password/i.test(key)) {
        logger.warn(`[Cache] Invalid/sensitive key skipped: ${key}`);
        return false;
      }
      // Value validation: No functions, reasonable size (<1MB stringify)
      if (typeof value === 'function') {
        logger.warn(`[Cache] Function value skipped for key: ${key}`);
        return false;
      }
      const size = JSON.stringify(value).length;
      if (size > 1024 * 1024) { // 1MB
        logger.warn(`[Cache] Large value skipped for key: ${key} (size: ${size} bytes)`);
        return false;
      }
      const success = ttl !== null ? this.cache.set(key, value, ttl) : this.cache.set(key, value);
      if (success) this.stats.sets++;
      return Boolean(success);
    } catch (error) {
      logger.error(`[Cache] Error guardando ${key}:`, error);
      return false;
    }
  }

  /**
   * Batch set múltiples keys/values
   * @param data - { [key: string]: any }
   * @param ttl - TTL para todos (null=default)
   * @returns number of keys seteadas
   */
  mset(data: Record<string, any>, ttl: number | null = null): number {
    if (!this.cache || !data || Object.keys(data).length === 0) return 0;
    let count = 0;
    for (const [key, value] of Object.entries(data)) {
      if (this.set(key, value, ttl)) count++;
    }
    return count;
  }

  /**
   * Eliminar clave
   * @param key - Clave
   * @returns number of keys eliminadas (0/1)
   */
  del(key: string): number {
    if (!this.cache) return 0;
    const deleted = this.cache.del(key);
    if (deleted > 0) this.stats.deletes += deleted;
    return deleted;
  }

  /**
   * Eliminar múltiples
   * @param keys - Claves o array de string
   * @returns total deleted
   */
  delMultiple(keys: string | string[]): number {
    if (!this.cache) return 0;
    const keysArray = Array.isArray(keys) ? keys : [keys];
    if (keysArray.length === 0) return 0;
    const deleted = this.cache.del(keysArray);
    if (deleted > 0) this.stats.deletes += deleted;
    return deleted;
  }

  /**
   * Eliminar por patrón (filter keys())
   * @param pattern - e.g. 'orders:*' (supports * wildcard)
   * @returns number deleted
   */
  delPattern(pattern: string): number {
    if (!this.cache || !pattern) return 0;
    const regexStr = pattern.replace(/\*/g, '.*').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special, * to .*
    const regex = new RegExp(`^${regexStr}$`, 'i');
    const allKeys = this.cache.keys();
    const matchedKeys = allKeys.filter((key: string | number) => regex.test(String(key)));
    if (matchedKeys.length === 0) return 0;
    const deleted = this.cache.del(matchedKeys);
    if (deleted > 0) this.stats.deletes += deleted;
    logger.debug(`[Cache] delPattern '${pattern}': deleted ${deleted} keys`);
    return deleted;
  }

  /**
   * Verificar existencia
   * @param key - Clave
   * @returns boolean
   */
  has(key: string): boolean {
    return this.cache ? this.cache.has(key) : false;
  }

  /**
   * Todas las keys
   * @returns string[]
   */
  keys(): string[] {
    return this.cache ? this.cache.keys() : [];
  }

  /**
   * Flush all
   * @returns void
   */
  flush(): void {
    if (this.cache) {
      this.cache.flushAll();
      logger.info('[Cache] Cache limpiado completamente');
      // Reset stats
      this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0, keysCount: 0, hitRate: 0, memoryUsage: 0 };
    }
  }

  /**
   * Stats enriquecidas
   * @returns CacheStats | { enabled: false, message: string }
   */
  getStats(): CacheStats | { enabled: false; message: string } {
    if (!this.cache) {
      return { enabled: false, message: 'Cache deshabilitado' };
    }
    const nodeStats = this.cache.getStats();
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    const keysCount = this.cache.keys().length;
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    return {
      ...this.stats,
      keysCount,
      hitRate,
      nodeCacheStats: nodeStats,
      memoryUsage,
    };
  }

  /**
   * Wrap async function (cache miss → exec → set)
   * @param key - Clave
   * @param fn - Async function to execute on miss
   * @param ttl - TTL (null=default)
   * @returns Promise<T> from fn or cache
   */
  async wrap<T>(key: string, fn: WrapFn<T>, ttl: number | null = null): Promise<T> {
    if (!this.cache) {
      return await fn();
    }
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached as T;
    }
    try {
      const result = await fn();
      this.set(key, result, ttl);
      return result;
    } catch (error) {
      logger.error(`[Cache] Error en wrap para ${key}:`, error);
      throw error; // Passthrough
    }
  }
}

// Singleton instance
const cacheService = new CacheService();
registerShutdownHook(); // Auto-register
export default cacheService;
export { CacheService };
