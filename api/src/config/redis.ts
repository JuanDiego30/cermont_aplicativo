/**
 * Cliente Redis y gestor de cache distribuido para Cermont. Proporciona conexión
 * singleton a Redis con reconexión automática, y clase CacheManager con operaciones
 * estándar (get/set/delete), patrón cache-aside (getOrSet), operaciones de hash,
 * contadores e incrementadores con TTL. Incluye prefijo automático de claves,
 * manejo robusto de errores y sincronización con Prisma para invalidación.
 */

import { createClient } from 'redis';
import { logger } from './logger.js';

export type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;

export async function initRedis(): Promise<RedisClient> {
  try {
    const client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.error('Redis max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          return Math.min(retries * 100, 3000);
        },
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    client.on('error', (err: Error) => logger.error('Redis error:', err));
    client.on('connect', () => logger.info('Redis connecting...'));
    client.on('ready', () => logger.info('Redis ready'));
    client.on('reconnecting', () => logger.warn('Redis reconnecting...'));

    await client.connect();
    redisClient = client;

    logger.info('Redis connected successfully');
    return client;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export function getRedisClient(): RedisClient {
  if (!redisClient) {
    throw new Error('Redis not initialized. Call initRedis() first.');
  }
  return redisClient;
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

export function isRedisConnected(): boolean {
  return redisClient?.isOpen || false;
}

export class CacheManager {
  private client: RedisClient;
  private defaultTTL: number;
  private prefix: string;

  constructor(
    client: RedisClient,
    options?: { defaultTTL?: number; prefix?: string }
  ) {
    this.client = client;
    this.defaultTTL = options?.defaultTTL || 300;
    this.prefix = options?.prefix || 'cermont:';
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(this.getKey(key));
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    try {
      await this.client.setEx(
        this.getKey(key),
        ttl,
        JSON.stringify(value)
      );
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(this.getKey(key));
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(this.getKey(pattern));
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.debug(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  async increment(key: string, ttl: number = this.defaultTTL): Promise<number> {
    try {
      const fullKey = this.getKey(key);
      const result = await this.client.incr(fullKey);
      if (result === 1) {
        await this.client.expire(fullKey, ttl);
      }
      return result;
    } catch (error) {
      logger.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  async decrement(key: string): Promise<number> {
    try {
      return await this.client.decr(this.getKey(key));
    } catch (error) {
      logger.error(`Cache decrement error for key ${key}:`, error);
      return 0;
    }
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      logger.debug(`Cache hit for key: ${key}`);
      return cached;
    }

    logger.debug(`Cache miss for key: ${key}`);
    const value = await fn();

    await this.set(key, value, ttl);

    return value;
  }

  async hSet(key: string, field: string, value: any): Promise<void> {
    try {
      await this.client.hSet(
        this.getKey(key),
        field,
        JSON.stringify(value)
      );
    } catch (error) {
      logger.error(`Cache hSet error for key ${key}:`, error);
    }
  }

  async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hGet(this.getKey(key), field);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Cache hGet error for key ${key}:`, error);
      return null;
    }
  }

  async hGetAll<T>(key: string): Promise<Record<string, T>> {
    try {
      const data = await this.client.hGetAll(this.getKey(key));
      const result: Record<string, T> = {};
      for (const [field, value] of Object.entries(data)) {
        result[field] = JSON.parse(value as string);
      }
      return result;
    } catch (error) {
      logger.error(`Cache hGetAll error for key ${key}:`, error);
      return {};
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(this.getKey(key));
    } catch (error) {
      logger.error(`Cache ttl error for key ${key}:`, error);
      return -1;
    }
  }

  async flush(): Promise<void> {
    try {
      const keys = await this.client.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await this.client.del(keys);
        logger.info(`Flushed ${keys.length} cache keys`);
      }
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }
}

export let cacheManager: CacheManager;

export async function initCacheManager(): Promise<CacheManager> {
  const client = await initRedis();
  cacheManager = new CacheManager(client, {
    defaultTTL: 300,
    prefix: 'cermont:',
  });
  return cacheManager;
}

export function getCacheManager(): CacheManager {
  if (!cacheManager) {
    throw new Error('CacheManager not initialized. Call initCacheManager() first.');
  }
  return cacheManager;
}

