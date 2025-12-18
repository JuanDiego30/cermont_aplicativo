/**
 * ARCHIVO: ip-blocking.ts
 * FUNCION: Sistema de bloqueo de IPs maliciosas
 * IMPLEMENTACION: Basado en vercel/examples/edge-middleware/ip-blocking
 * DEPENDENCIAS: Upstash Redis (opcional)
 * EXPORTS: isBlockedIp, blockIp, unblockIp, getBlockedIps
 */

// ============================================
// TIPOS
// ============================================

export interface BlockedIpEntry {
  ip: string;
  reason: string;
  blockedAt: number;
  expiresAt?: number;
  blockedBy?: string;
}

export interface IpBlockingConfig {
  /** Key en Redis para almacenar IPs bloqueadas */
  redisKey: string;
  /** TTL por defecto en segundos (0 = permanente) */
  defaultTtl: number;
}

// ============================================
// CONFIGURACIÓN
// ============================================

const config: IpBlockingConfig = {
  redisKey: 'cermont:blocked_ips',
  defaultTtl: 60 * 60 * 24, // 24 horas
};

// ============================================
// STORE EN MEMORIA (DESARROLLO)
// ============================================

const memoryBlockedIps = new Map<string, BlockedIpEntry>();

// IPs siempre bloqueadas (conocidas como maliciosas)
const permanentlyBlockedIps = new Set<string>([
  // Agregar IPs conocidas como maliciosas
]);

// Rangos de IP privados/reservados que nunca deben bloquearse
const reservedRanges = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^::1$/,
  /^localhost$/,
];

// ============================================
// VALIDACIÓN DE IP
// ============================================

const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;

function isValidIp(ip: string): boolean {
  return IP_REGEX.test(ip) || IPV6_REGEX.test(ip) || ip === '::1';
}

function isReservedIp(ip: string): boolean {
  return reservedRanges.some(range => range.test(ip));
}

// ============================================
// IMPLEMENTACIÓN CON UPSTASH
// ============================================

async function upstashOperation<T>(
  operation: () => Promise<T>,
  fallback: () => T
): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    return fallback();
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('[IpBlocking] Upstash error:', error);
    return fallback();
  }
}

async function upstashGet(key: string): Promise<string | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  const response = await fetch(`${url}/HGET/${config.redisKey}/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!response.ok) return null;
  const data = await response.json();
  return data.result;
}

async function upstashSet(key: string, value: string, ttl?: number): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  await fetch(`${url}/HSET/${config.redisKey}/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (ttl && ttl > 0) {
    // Nota: HSET no soporta TTL directamente, usar lógica de expiración en la entrada
  }
}

async function upstashDelete(key: string): Promise<void> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  await fetch(`${url}/HDEL/${config.redisKey}/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ============================================
// API PÚBLICA
// ============================================

/**
 * Verifica si una IP está bloqueada
 */
export async function isBlockedIp(ip: string): Promise<boolean> {
  // Nunca bloquear IPs reservadas
  if (isReservedIp(ip)) {
    return false;
  }
  
  // Verificar lista permanente
  if (permanentlyBlockedIps.has(ip)) {
    return true;
  }
  
  return upstashOperation(
    async () => {
      const result = await upstashGet(ip);
      if (!result) return false;
      
      try {
        const entry: BlockedIpEntry = JSON.parse(result);
        
        // Verificar expiración
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          // Expirado, eliminar
          await upstashDelete(ip);
          return false;
        }
        
        return true;
      } catch {
        return false;
      }
    },
    () => {
      const entry = memoryBlockedIps.get(ip);
      if (!entry) return false;
      
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        memoryBlockedIps.delete(ip);
        return false;
      }
      
      return true;
    }
  );
}

/**
 * Bloquea una IP
 */
export async function blockIp(
  ip: string,
  reason: string,
  ttlSeconds?: number,
  blockedBy?: string
): Promise<{ success: boolean; error?: string }> {
  // Validar IP
  if (!isValidIp(ip)) {
    return { success: false, error: 'IP inválida' };
  }
  
  // No permitir bloquear IPs reservadas
  if (isReservedIp(ip)) {
    return { success: false, error: 'No se pueden bloquear IPs reservadas' };
  }
  
  const entry: BlockedIpEntry = {
    ip,
    reason,
    blockedAt: Date.now(),
    expiresAt: ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined,
    blockedBy,
  };
  
  return upstashOperation(
    async () => {
      await upstashSet(ip, JSON.stringify(entry), ttlSeconds);
      return { success: true };
    },
    () => {
      memoryBlockedIps.set(ip, entry);
      return { success: true };
    }
  );
}

/**
 * Desbloquea una IP
 */
export async function unblockIp(ip: string): Promise<{ success: boolean }> {
  return upstashOperation(
    async () => {
      await upstashDelete(ip);
      return { success: true };
    },
    () => {
      memoryBlockedIps.delete(ip);
      return { success: true };
    }
  );
}

/**
 * Obtiene lista de IPs bloqueadas
 */
export async function getBlockedIps(): Promise<BlockedIpEntry[]> {
  return upstashOperation(
    async () => {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;
      
      const response = await fetch(`${url}/HGETALL/${config.redisKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) return [];
      const data = await response.json();
      
      const entries: BlockedIpEntry[] = [];
      const results = data.result || [];
      
      for (let i = 0; i < results.length; i += 2) {
        try {
          const entry: BlockedIpEntry = JSON.parse(results[i + 1]);
          if (!entry.expiresAt || entry.expiresAt > Date.now()) {
            entries.push(entry);
          }
        } catch {
          // Ignorar entradas inválidas
        }
      }
      
      return entries;
    },
    () => {
      const now = Date.now();
      return Array.from(memoryBlockedIps.values()).filter(
        entry => !entry.expiresAt || entry.expiresAt > now
      );
    }
  );
}

/**
 * Extrae IP del request
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || '127.0.0.1';
  }
  
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
