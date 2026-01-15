---
name: nestjs-performance
description: Experto en optimización de performance para NestJS. Usar para caching, throttling, compresión, optimización de queries, memory management y escalabilidad.
triggers:
  - performance
  - caching
  - Redis
  - throttling
  - rate limiting
  - compression
  - memory
  - optimization
  - scalability
role: specialist
scope: optimization
output-format: code
---

# NestJS Performance Optimization

Especialista en optimización de rendimiento para aplicaciones NestJS.

## Rol

Arquitecto de software con 8+ años de experiencia en sistemas de alta carga. Experto en caching, throttling, profiling y optimización de aplicaciones Node.js/NestJS.

## Cuándo Usar Este Skill

- Implementar caching con Redis
- Configurar rate limiting
- Optimizar queries de base de datos
- Reducir uso de memoria
- Configurar compresión
- Escalar horizontalmente
- Profiling y monitoreo
- Optimizar respuestas HTTP

## Caching con Redis

### Configuración del Módulo

```typescript
// cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST', 'localhost'),
        port: config.get('REDIS_PORT', 6379),
        password: config.get('REDIS_PASSWORD'),
        ttl: 300, // 5 minutos default
        max: 1000, // máximo de items en cache
      }),
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {}
```

### Decorador @Cacheable

```typescript
// cache/cacheable.decorator.ts
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export function Cacheable(keyPrefix: string, ttl: number = 300) {
  const cacheManager = Inject(CACHE_MANAGER);

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    cacheManager(target, 'cacheManager');

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cache: Cache = this.cacheManager;
      const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;

      // Intentar obtener del cache
      const cached = await cache.get(cacheKey);
      if (cached !== undefined && cached !== null) {
        return cached;
      }

      // Ejecutar método original
      const result = await originalMethod.apply(this, args);

      // Guardar en cache
      if (result !== undefined && result !== null) {
        await cache.set(cacheKey, result, ttl);
      }

      return result;
    };

    return descriptor;
  };
}

// Uso en servicio
@Injectable()
export class ProductService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Cacheable('products', 600) // 10 minutos
  async getProducts(categoryId: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: { categoryId },
    });
  }

  async invalidateProductCache(categoryId: number): Promise<void> {
    const keys = await this.cacheManager.store.keys(`products:*${categoryId}*`);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }
}
```

### Cache Interceptor Personalizado

```typescript
// cache/http-cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Request } from 'express';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    // Solo cachear GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // No cachear si tiene auth header (personalizado por usuario)
    if (request.headers.authorization) {
      return next.handle();
    }

    const cacheKey = `http:${request.url}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async response => {
        await this.cacheManager.set(cacheKey, response, 300);
      }),
    );
  }
}
```

## Rate Limiting / Throttling

### Configuración Básica

```typescript
// throttler/throttler.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000,  // 1 segundo
            limit: 3,   // 3 requests
          },
          {
            name: 'medium',
            ttl: 10000, // 10 segundos
            limit: 20,  // 20 requests
          },
          {
            name: 'long',
            ttl: 60000, // 1 minuto
            limit: 100, // 100 requests
          },
        ],
        storage: new ThrottlerStorageRedisService({
          host: config.get('REDIS_HOST'),
          port: config.get('REDIS_PORT'),
          password: config.get('REDIS_PASSWORD'),
        }),
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class RateLimitModule {}
```

### Decoradores Personalizados

```typescript
// throttler/throttle.decorator.ts
import { Throttle, SkipThrottle } from '@nestjs/throttler';

// Rate limit estricto para login
export const LoginThrottle = () => Throttle({ short: { ttl: 60000, limit: 5 } });

// Rate limit para APIs públicas
export const PublicApiThrottle = () => Throttle({ medium: { ttl: 60000, limit: 30 } });

// Skip para endpoints internos
export const NoThrottle = () => SkipThrottle();

// Uso
@Controller('auth')
export class AuthController {
  @Post('login')
  @LoginThrottle() // 5 intentos por minuto
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('verify')
  @NoThrottle() // Sin límite
  async verify(@Headers('authorization') token: string) {
    return this.authService.verify(token);
  }
}
```

### Throttler por Usuario/IP

```typescript
// throttler/custom-throttler.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    // Usar user ID si está autenticado, sino IP
    const user = (req as any).user;
    if (user?.id) {
      return `user:${user.id}`;
    }
    return `ip:${this.getIp(req)}`;
  }

  private getIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Skip para health checks
    if (request.url === '/health') {
      return true;
    }

    // Skip para admins
    const user = (request as any).user;
    if (user?.role === 'admin') {
      return true;
    }

    return false;
  }
}
```

## Compresión

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Compresión Gzip/Brotli
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024, // Solo comprimir >1KB
    level: 6, // Balance entre velocidad y compresión
  }));

  await app.listen(3000);
}
```

## Optimización de Queries

### Eager Loading Selectivo

```typescript
// products/products.service.ts
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ❌ N+1 Query Problem
  async getProductsBad(): Promise<Product[]> {
    const products = await this.prisma.product.findMany();
    // Cada producto hace otra query para categoría
    return Promise.all(
      products.map(async p => ({
        ...p,
        category: await this.prisma.category.findUnique({
          where: { id: p.categoryId },
        }),
      })),
    );
  }

  // ✅ Eager Loading
  async getProductsGood(): Promise<Product[]> {
    return this.prisma.product.findMany({
      include: {
        category: true,
        variants: {
          select: { id: true, name: true, price: true },
        },
      },
    });
  }

  // ✅ Campos selectivos (reducir payload)
  async getProductsList(): Promise<ProductListDto[]> {
    return this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        category: {
          select: { name: true },
        },
      },
    });
  }
}
```

### Paginación con Cursor

```typescript
// common/pagination/cursor-pagination.ts
export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

@Injectable()
export class ProductsService {
  async getProductsPaginated(
    params: CursorPaginationParams,
  ): Promise<CursorPaginatedResult<Product>> {
    const { cursor, limit = 20 } = params;
    const take = Math.min(limit, 100); // Máximo 100

    const products = await this.prisma.product.findMany({
      take: take + 1, // Uno extra para saber si hay más
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = products.length > take;
    const data = hasMore ? products.slice(0, -1) : products;

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    };
  }
}
```

## Memory Management

### Streaming de Archivos Grandes

```typescript
// files/files.controller.ts
import { Controller, Get, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller('files')
export class FilesController {
  @Get('download/:filename')
  downloadFile(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const filePath = join(process.cwd(), 'storage', filename);
    
    // Stream en lugar de cargar todo en memoria
    const file = createReadStream(filePath);
    
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return new StreamableFile(file);
  }
}
```

### Batch Processing

```typescript
// jobs/batch-processor.ts
@Injectable()
export class BatchProcessor {
  private readonly BATCH_SIZE = 1000;

  async processLargeDataset<T>(
    fetchBatch: (offset: number, limit: number) => Promise<T[]>,
    processFn: (item: T) => Promise<void>,
  ): Promise<void> {
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await fetchBatch(offset, this.BATCH_SIZE);
      
      if (batch.length < this.BATCH_SIZE) {
        hasMore = false;
      }

      // Procesar en paralelo con límite de concurrencia
      const chunks = this.chunkArray(batch, 50);
      for (const chunk of chunks) {
        await Promise.all(chunk.map(processFn));
      }

      offset += this.BATCH_SIZE;

      // Permitir garbage collection
      if (global.gc) {
        global.gc();
      }
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
```

## Connection Pooling

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Configuración del pool
      // Para PostgreSQL con Prisma 7:
      // connection_limit en la URL o configuración
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

// .env
// DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"
```

## Health Checks

```typescript
// health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database
      () => this.prisma.pingCheck('database'),
      
      // Memory: máximo 500MB heap
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
      
      // Disk: mínimo 20% libre
      () => this.disk.checkStorage('storage', {
        path: '/',
        thresholdPercent: 0.2,
      }),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.prisma.pingCheck('database'),
    ]);
  }

  @Get('live')
  liveness() {
    return { status: 'ok' };
  }
}
```

## Restricciones

### DEBE HACER
- Implementar caching para datos frecuentes
- Usar rate limiting en APIs públicas
- Optimizar queries con includes selectivos
- Monitorear uso de memoria
- Configurar health checks

### NO DEBE HACER
- Cachear datos sensibles sin TTL
- Ignorar connection pooling
- Cargar archivos grandes en memoria
- Omitir paginación en listas
- Rate limit sin considerar usuarios auth

## Skills Relacionados

- **prisma-architect** - Optimización de Prisma
- **security-hardening** - Rate limiting seguro
- **clean-architecture** - Servicios optimizados
