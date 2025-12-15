/**
 * ARCHIVO: rate-limit.ts
 * FUNCION: Configuración avanzada de Rate Limiting preparada para Vercel KV
 * IMPLEMENTACION: Basado en vercel/examples/edge-middleware/rate-limit-any-framework
 * DEPENDENCIAS: Opcional: @upstash/ratelimit, @vercel/kv
 * EXPORTS: RateLimiter, createRateLimiter, rateLimitConfigs
 * 
 * NOTA: Para producción, instalar @upstash/ratelimit y @vercel/kv:
 * pnpm add @upstash/ratelimit @vercel/kv
 */

/**
 * Configuración de rate limiting por tipo de endpoint
 */
export const rateLimitConfigs = {
  // API general
  default: {
    requests: 100,
    window: 60, // segundos
  },
  // Login/Auth - más restrictivo
  auth: {
    requests: 10,
    window: 60,
  },
  // Endpoints críticos
  sensitive: {
    requests: 20,
    window: 60,
  },
  // Upload de archivos
  upload: {
    requests: 10,
    window: 300, // 5 minutos
  },
} as const;

export type RateLimitConfig = keyof typeof rateLimitConfigs;

/**
 * Rate Limiter en memoria para desarrollo
 * En producción reemplazar con Vercel KV
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class InMemoryRateLimiter {
  private cache: Map<string, RateLimitEntry> = new Map();
  
  async limit(
    identifier: string,
    config: { requests: number; window: number }
  ): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const windowMs = config.window * 1000;
    const key = identifier;
    
    let entry = this.cache.get(key);
    
    // Limpiar entrada expirada
    if (entry && now >= entry.resetAt) {
      this.cache.delete(key);
      entry = undefined;
    }
    
    if (!entry) {
      entry = {
        count: 0,
        resetAt: now + windowMs,
      };
      this.cache.set(key, entry);
    }
    
    entry.count++;
    
    const remaining = Math.max(0, config.requests - entry.count);
    const success = entry.count <= config.requests;
    
    return {
      success,
      limit: config.requests,
      remaining,
      reset: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  
  // Limpiar caché periódicamente
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.resetAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Instancia singleton
let rateLimiterInstance: InMemoryRateLimiter | null = null;

export function getRateLimiter(): InMemoryRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new InMemoryRateLimiter();
    
    // Limpieza cada 5 minutos
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        rateLimiterInstance?.cleanup();
      }, 5 * 60 * 1000);
    }
  }
  return rateLimiterInstance;
}

/**
 * Helper para usar en API routes
 */
export async function checkRateLimit(
  ip: string,
  configType: RateLimitConfig = 'default'
): Promise<{
  success: boolean;
  headers: Record<string, string>;
}> {
  const config = rateLimitConfigs[configType];
  const limiter = getRateLimiter();
  const result = await limiter.limit(`${configType}:${ip}`, config);
  
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
  
  if (!result.success) {
    headers['Retry-After'] = result.reset.toString();
  }
  
  return {
    success: result.success,
    headers,
  };
}

/**
 * ============================================
 * CÓDIGO PARA PRODUCCIÓN CON VERCEL KV
 * ============================================
 * Descomentar cuando se configure Vercel KV:
 * 
 * import { Ratelimit } from '@upstash/ratelimit';
 * import { kv } from '@vercel/kv';
 * 
 * export const ratelimit = new Ratelimit({
 *   redis: kv,
 *   limiter: Ratelimit.slidingWindow(100, '1 m'),
 *   analytics: true,
 *   prefix: 'cermont:ratelimit',
 * });
 * 
 * export async function checkRateLimitProduction(ip: string) {
 *   const { success, limit, remaining, reset } = await ratelimit.limit(ip);
 *   return {
 *     success,
 *     headers: {
 *       'X-RateLimit-Limit': limit.toString(),
 *       'X-RateLimit-Remaining': remaining.toString(),
 *       'X-RateLimit-Reset': reset.toString(),
 *     },
 *   };
 * }
 */
