# 02_PERFORMANCE_OPTIMIZATION_PLAN.md

## Plan de Optimización de Performance - Análisis Detallado

### Fecha: 2026-01-07

## 1. QUERIES DE BASE DE DATOS INEFICIENTES

### 1.1 N+1 Queries en Listados Grandes
**Severidad:** ALTA
**Estado:** PARCIALMENTE CORREGIDO
**Impacto:** Aplicación lenta con datos crecientes

#### Problema Actual:
```typescript
// ❌ INEFICIENTE - N+1 queries
async findAll() {
  const orders = await this.prisma.order.findMany({
    select: { id: true, numero: true, cliente: true }
  });

  // Para cada orden, query separada para creador y asignado
  const ordersWithUsers = await Promise.all(
    orders.map(order =>
      this.prisma.order.findUnique({
        where: { id: order.id },
        include: {
          creador: { select: { id: true, name: true } },
          asignado: { select: { id: true, name: true } }
        }
      })
    )
  );
}
```

#### Solución Óptima:
```typescript
// ✅ EFICIENTE - Single query con joins
async findAll(filters: OrdenFilters) {
  return this.prisma.order.findMany({
    where: this.buildWhereClause(filters),
    include: {
      creador: { select: { id: true, name: true } },
      asignado: { select: { id: true, name: true } }
    },
    orderBy: { createdAt: "desc" },
    skip: (filters.page - 1) * filters.limit,
    take: filters.limit
  });
}
```

### 1.2 Índices Estratégicos Faltantes
**Severidad:** ALTA
**Estado:** NO CORREGIDO
**Impacto:** Queries lentas en producción

#### Índices Críticos Faltantes:

```prisma
// ❌ ACTUAL - Índices insuficientes
model Order {
  @@index([deletedAt])
  @@index([prioridad])
  @@index([cliente])
  @@index([asignadoId])
  @@index([fechaInicio])
  @@index([createdAt])
  @@index([estado, prioridad])
  @@index([cliente, estado])
  @@index([asignadoId, estado])
  @@index([fechaInicio, fechaFin])
  @@index([estado, prioridad, fechaInicio])
  @@index([subEstado, createdAt(sort: Desc)])
  @@index([creadorId])
}
```

#### Índices Óptimos Requeridos:
```prisma
// ✅ PROPUESTO - Índices estratégicos
model Order {
  // Índices existentes (mantener)
  @@index([deletedAt])
  @@index([prioridad])
  @@index([cliente])
  @@index([asignadoId])
  @@index([fechaInicio])
  @@index([createdAt])

  // Índices compuestos críticos para queries frecuentes
  @@index([estado, prioridad, createdAt]) // Dashboard stats + listados
  @@index([asignadoId, estado, createdAt]) // Asignaciones por técnico
  @@index([cliente, estado, createdAt]) // Búsqueda por cliente
  @@index([fechaInicio, fechaFin, estado]) // Reportes por período
  @@index([prioridad, estado, fechaInicio]) // Urgentes primero

  // Índices para búsquedas full-text
  @@index([numero, estado]) // Búsqueda por número + estado
  @@index([cliente, estado]) // Cliente + estado
  @@index([descripcion(search: BTree)]) // Búsqueda en descripción

  // Índices para reportes
  @@index([createdAt, estado, costoReal]) // Reportes financieros
  @@index([asignadoId, fechaInicio, fechaFin]) // Productividad técnicos
}
```

### 1.3 Paginación Ineficiente
**Severidad:** MEDIA
**Estado:** NO CORREGIDO
**Impacto:** Memoria excesiva en listados grandes

#### Problema:
```typescript
// ❌ INEFICIENTE - Carga todo en memoria
async findAll() {
  const allOrders = await this.prisma.order.findMany();
  const total = allOrders.length;
  const paginated = allOrders.slice((page-1)*limit, page*limit);
  return { data: paginated, total };
}
```

#### Solución:
```typescript
// ✅ EFICIENTE - Paginación en DB
async findAll(filters: OrdenFilters) {
  const [orders, total] = await Promise.all([
    this.prisma.order.findMany({
      where: this.buildWhereClause(filters),
      include: { creador: true, asignado: true },
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit
    }),
    this.prisma.order.count({
      where: this.buildWhereClause(filters)
    })
  ]);

  return {
    data: orders,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages: Math.ceil(total / filters.limit)
  };
}
```

## 2. CACHE IMPLEMENTATION DEFICIENT

### 2.1 Dashboard sin Cache Estratégico
**Severidad:** ALTA
**Estado:** PARCIALMENTE CORREGIDO
**Impacto:** Dashboard lento, DB sobrecargada

#### Problemas Actuales:
1. **Stats calculados en cada request**
2. **Sin invalidación inteligente**
3. **Cache solo en controller level**

#### Solución Completa:
```typescript
// ✅ CACHE ESTRATÉGICO
@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: Cache // Inyectar cache
  ) {}

  @CacheTTL(300) // 5 minutos
  async getStats(): Promise<DashboardStats> {
    const cacheKey = 'dashboard:stats';

    // Intentar obtener del cache primero
    const cached = await this.cache.get<DashboardStats>(cacheKey);
    if (cached) return cached;

    // Calcular si no está en cache
    const stats = await this.calculateStats();

    // Guardar en cache
    await this.cache.set(cacheKey, stats, 300000); // 5 minutos

    return stats;
  }

  @CacheTTL(600) // 10 minutos para métricas
  async getMetricas(): Promise<DashboardMetricas> {
    const cacheKey = 'dashboard:metricas';
    // Similar implementación
  }

  // Invalidación inteligente
  async invalidateDashboardCache() {
    await this.cache.del('dashboard:stats');
    await this.cache.del('dashboard:metricas');
    await this.cache.del('dashboard:ordenes-recientes');
  }
}
```

### 2.2 Cache Keys Inconsistentes
**Severidad:** MEDIA
**Estado:** NO CORREGIDO
**Impacto:** Cache no invalidado correctamente

#### Patrón Actual:
```typescript
// ❌ INCONSISTENTE
@CacheKey("dashboard:stats")
@CacheKey("dashboardStats")
@CacheKey("stats")
```

#### Patrón Óptimo:
```typescript
// ✅ CONSISTENTE Y ESTRUCTURADO
export const CACHE_KEYS = {
  DASHBOARD: {
    STATS: 'dashboard:stats',
    METRICAS: 'dashboard:metricas',
    ORDENES_RECIENTES: 'dashboard:ordenes:recientes'
  },
  ORDENES: {
    LIST: (page: number, limit: number) => `ordenes:list:${page}:${limit}`,
    DETAIL: (id: string) => `ordenes:detail:${id}`
  }
} as const;

// Uso
@CacheKey(CACHE_KEYS.DASHBOARD.STATS)
async getStats() { /* ... */ }
```

## 3. FRONTEND PERFORMANCE ISSUES

### 3.1 Bundle Splitting Insuficiente
**Severidad:** ALTA
**Estado:** NO CORREGIDO
**Impacto:** Time-to-Interactive alto, Core Web Vitals bajos

#### Problema Actual:
```typescript
// ❌ SIN LAZY LOADING
export const routes: Routes = [
  {
    path: 'ordenes',
    loadComponent: () => import('./features/ordenes/ordenes.component').then(m => m.OrdenesComponent)
  },
  {
    path: 'dashboard',
    component: DashboardComponent // ❌ Eager loading
  }
];
```

#### Solución Completa:
```typescript
// ✅ LAZY LOADING COMPLETO
export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'ordenes',
    loadChildren: () => import('./features/ordenes/ordenes.routes')
      .then(m => m.ORDENES_ROUTES)
  },
  {
    path: 'reportes',
    loadChildren: () => import('./features/reportes/reportes.routes')
      .then(m => m.REPORTES_ROUTES)
  }
];
```

### 3.2 Imágenes sin Optimización
**Severidad:** MEDIA
**Estado:** NO CORREGIDO
**Impacto:** Bandwidth excesivo, loading lento

#### Problemas:
1. **Sin WebP/AVIF conversion**
2. **Sin lazy loading de imágenes**
3. **Sin responsive images**
4. **Sin preload de imágenes críticas**

#### Solución:
```typescript
// ✅ COMPONENTE DE IMAGEN OPTIMIZADO
@Component({
  selector: 'app-optimized-image',
  template: `
    <picture>
      <source [srcset]="webpSrc" type="image/webp">
      <img
        [src]="fallbackSrc"
        [alt]="alt"
        [width]="width"
        [height]="height"
        loading="lazy"
        [fetchpriority]="priority"
      >
    </picture>
  `
})
export class OptimizedImageComponent {
  @Input() src!: string;
  @Input() alt!: string;
  @Input() priority: 'high' | 'low' = 'low';

  get webpSrc(): string {
    return this.convertToWebP(this.src);
  }

  get fallbackSrc(): string {
    return this.src;
  }

  private convertToWebP(src: string): string {
    return src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
}
```

## 4. CONNECTION POOLING Y DATABASE OPTIMIZATION

### 4.1 Connection Pooling no Configurado
**Severidad:** ALTA
**Estado:** PARCIALMENTE CORREGIDO
**Impacto:** Conexiones agotadas en alta concurrencia

#### Configuración Actual:
```env
# ❌ SIN POOLING
DATABASE_URL=postgresql://user:pass@localhost:5432/cermont
```

#### Configuración Óptima:
```env
# ✅ CON POOLING OPTIMIZADO
DATABASE_URL=postgresql://user:pass@localhost:5432/cermont?connection_limit=10&pool_timeout=2&pgbouncer=true
```

### 4.2 Query Optimization Patterns
**Severidad:** MEDIA
**Estado:** NO CORREGIDO
**Impacto:** Queries lentas en producción

#### Bulk Operations no Optimizadas:
```typescript
// ❌ INEFICIENTE - Multiple queries
async bulkUpdateStatuses(orderIds: string[], status: OrderStatus) {
  for (const id of orderIds) {
    await this.prisma.order.update({
      where: { id },
      data: { estado: status }
    });
  }
}
```

#### Solución:
```typescript
// ✅ EFICIENTE - Single query
async bulkUpdateStatuses(orderIds: string[], status: OrderStatus) {
  await this.prisma.order.updateMany({
    where: { id: { in: orderIds } },
    data: { estado: status }
  });
}
```

## 5. PERFORMANCE MONITORING

### 5.1 Métricas de Performance Faltantes
**Severidad:** MEDIA
**Estado:** NO IMPLEMENTADO
**Impacto:** No visibility de performance issues

#### Métricas Requeridas:
```typescript
// ✅ PERFORMANCE MONITORING
@Injectable()
export class PerformanceService {
  private metrics = new Map<string, number[]>();

  measureExecutionTime<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    return fn().finally(() => {
      const duration = Date.now() - start;
      this.recordMetric(operation, duration);

      if (duration > 1000) { // Alert on slow operations
        this.logger.warn(`Slow operation: ${operation} took ${duration}ms`);
      }
    });
  }

  private recordMetric(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    const timings = this.metrics.get(operation)!;
    timings.push(duration);

    // Keep only last 100 measurements
    if (timings.length > 100) {
      timings.shift();
    }
  }

  getMetrics(operation: string) {
    const timings = this.metrics.get(operation) || [];
    return {
      avg: timings.reduce((a, b) => a + b, 0) / timings.length,
      min: Math.min(...timings),
      max: Math.max(...timings),
      count: timings.length
    };
  }
}
```

## 6. PLAN DE IMPLEMENTACIÓN - FASE PERFORMANCE

### Semana 1: Database Optimization
- **Día 1:** Análisis de queries lentas con EXPLAIN ANALYZE
- **Día 2:** Agregar índices estratégicos en schema.prisma
- **Día 3:** Optimizar N+1 queries restantes
- **Día 4:** Implementar connection pooling
- **Día 5:** Testing de performance DB

### Semana 2: Cache Implementation
- **Día 1-2:** Implementar cache estratégico en servicios críticos
- **Día 3:** Configurar invalidación inteligente de cache
- **Día 4:** Implementar cache keys consistentes
- **Día 5:** Testing de cache effectiveness

### Semana 3: Frontend Optimization
- **Día 1-2:** Implementar lazy loading completo
- **Día 3:** Optimizar imágenes y assets
- **Día 4:** Code splitting avanzado
- **Día 5:** Bundle analysis y optimization

### Semana 4: Monitoring y Alerting
- **Día 1-2:** Implementar performance monitoring
- **Día 3:** Configurar alerting para slow queries
- **Día 4:** Dashboard de métricas de performance
- **Día 5:** Testing end-to-end con load

## 7. CRITERIOS DE ÉXITO

### Database Performance:
- ✅ **Query time < 100ms** para operaciones críticas
- ✅ **Zero N+1 queries** en listados principales
- ✅ **Connection pool** configurado y funcionando
- ✅ **Índices utilizados** en queries (EXPLAIN ANALYZE)

### Cache Effectiveness:
- ✅ **Cache hit rate > 80%** para datos frecuentes
- ✅ **Cache invalidation** funcionando correctamente
- ✅ **Memory usage** controlado (< 500MB cache)
- ✅ **Cache TTL** optimizado por tipo de dato

### Frontend Performance:
- ✅ **First Contentful Paint < 1.5s**
- ✅ **Largest Contentful Paint < 2.5s**
- ✅ **Bundle size < 2MB** para chunks principales
- ✅ **Lazy loading** implementado en todas las features

### Monitoring:
- ✅ **Performance metrics** recolectadas automáticamente
- ✅ **Alerting** configurado para degradaciones
- ✅ **Dashboard** de métricas accesible
- ✅ **Historical data** disponible para análisis

## 8. HERRAMIENTAS DE MEDICIÓN

### Database:
```bash
# Análisis de queries
EXPLAIN ANALYZE SELECT * FROM "Order" WHERE estado = 'pendiente';

# Monitoring de conexiones
SELECT count(*) as connections FROM pg_stat_activity;

# Índices utilizados
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes ORDER BY idx_scan DESC;
```

### Application:
```typescript
// Performance interceptor
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        console.log(`${request.method} ${request.url} - ${duration}ms`);
      })
    );
  }
}
```

---

**Estado:** ✅ **ANÁLISIS COMPLETADO**
**Próximo:** Implementación Fase Performance
**Tiempo estimado:** 4 semanas
**Impacto esperado:** 60-80% mejora en performance general