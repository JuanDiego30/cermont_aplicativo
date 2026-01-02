---
description: "Agente especializado para caching multi-layer con Redis en Cermont: cache de datos, rate limiting, session storage, invalidación inteligente."
tools: []
---

# ⚡ BACKEND CACHING & REDIS AGENT

**Especialidad:** Multi-layer caching, Redis, invalidación inteligente, rate limiting, session storage  
**Stack:** Redis, ioredis, @nestjs/cache-manager, Bull  
**Ubicación:** `apps/api/src/common/caching/**`

---

## 🎯 Cuando Usarlo

| Situación | Usa Este Agente |
|-----------|---------------|
| Cache de datos frecuentes | ✅ |
| Rate limiting por usuario | ✅ |
| Session storage | ✅ |
| Invalidación en cambios | ✅ |
| Multi-layer caching | ✅ |
| Caché distribuido | ✅ |
| Contador de requests | ✅ |
| Cache de reportes pesados | ✅ |

---

## 📋 Patrón Obligatorio

### 1. Cache Service

```typescript
// apps/api/src/common/caching/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { LoggerService } from '../logging/logger.service';

export interface CacheOptions {
  ttl?: number;
  key: string;
  tags?: string[];
}

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private logger: LoggerService
  ) {}

  // Obtener del cache
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      
      if (value) {
        this.logger.debug('CACHE_HIT', { key });
      }
      
      return value;
    } catch (error) {
      this.logger.warn('Cache get error', { key });
      return undefined;
    }
  }

  // Guardar en cache
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl || 300);
      this.logger.debug('CACHE_SET', { key, ttl: ttl || 300 });
    } catch (error) {
      this.logger.warn('Cache set error', { key });
    }
  }

  // Get o Set
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    let cached = await this.get<T>(key);
    
    if (cached) {
      return cached;
    }

    const fresh = await factory();
    await this.set(key, fresh, ttl);
    
    return fresh;
  }

  // Invalidar cache
  async invalidate(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug('CACHE_INVALIDATED', { key });
    } catch (error) {
      this.logger.warn('Cache invalidate error', { key });
    }
  }

  // Invalidar por patrón
  async invalidateByPattern(pattern: string): Promise<void> {
    const redis = (this.cacheManager.store as any).getClient();
    
    try {
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        this.logger.debug('CACHE_PATTERN_INVALIDATED', {
          pattern,
          count: keys.length,
        });
      }
    } catch (error) {
      this.logger.warn('Cache pattern invalidate error', { pattern });
    }
  }
}
```

### 2. Rate Limiting Guard

```typescript
// apps/api/src/common/caching/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, TooManyRequestsException } from '@nestjs/common';
import { CacheService } from './cache.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private cache: CacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip;
    const endpoint = request.path;

    const key = `ratelimit:${userId}:${endpoint}`;
    const limit = 100;
    const windowSeconds = 60;

    const current = (await this.cache.get<number>(key)) || 0;

    if (current >= limit) {
      throw new TooManyRequestsException(
        `Rate limit exceeded. Max ${limit} requests per ${windowSeconds}s`
      );
    }

    await this.cache.set(key, current + 1, windowSeconds);

    return true;
  }
}
```

### 3. Usar en Servicio

```typescript
// apps/api/src/modules/ordenes/ordenes.service.ts
@Injectable()
export class OrdenesService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  // Obtener orden (cacheada)
  async findById(id: string): Promise<Orden> {
    return this.cache.getOrSet(
      `orden:${id}`,
      () => this.prisma.orden.findUnique({ where: { id } }),
      60 * 5
    );
  }

  // Listar órdenes (cacheada)
  async findAll(filtros: OrdenFiltros): Promise<Orden[]> {
    const cacheKey = `ordenes:all:${JSON.stringify(filtros)}`;
    
    return this.cache.getOrSet(
      cacheKey,
      () => this.prisma.orden.findMany({ where: filtros }),
      60 * 10
    );
  }

  // Crear orden (invalida cache)
  async create(dto: CreateOrdenDto): Promise<Orden> {
    const orden = await this.prisma.orden.create({ data: dto });

    // Invalidar lista cacheada
    await this.cache.invalidateByPattern('ordenes:all:*');

    return orden;
  }

  // Actualizar orden (invalida cache)
  async update(id: string, dto: UpdateOrdenDto): Promise<Orden> {
    const orden = await this.prisma.orden.update({
      where: { id },
      data: dto,
    });

    // Invalidar caches específicos
    await this.cache.invalidate(`orden:${id}`);
    await this.cache.invalidateByPattern('ordenes:all:*');

    return orden;
  }
}
```

### 4. App Module

```typescript
// apps/api/src/app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      ttl: 60 * 5,
    }),
  ],
})
export class AppModule {}
```

---

## ✅ Checklist

- [ ] Redis instalado y ejecutándose
- [ ] CacheService creado
- [ ] RateLimitGuard implementado
- [ ] Invalidación en CRUD
- [ ] TTL configurado apropiadamente
- [ ] Tests para caching
- [ ] Variables de entorno (REDIS_HOST, REDIS_PORT)
- [ ] Monitoreo de cache hits/misses

---

## 🚫 Límites

| ❌ NO | ✅ HACER |
|-----|----------|
| Cache sin TTL | Siempre con TTL |
| Cachear datos sensibles | Solo públicos |
| Olvidar invalidar | Invalidar en CRUD |
| Cachear N+1 queries | Optimizar queries primero |

---

**Status:** ✅ Listo para uso  
**Última actualización:** 2026-01-02
