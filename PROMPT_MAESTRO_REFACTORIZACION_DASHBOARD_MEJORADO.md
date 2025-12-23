# 🎯 **PROMPT MAESTRO PARA REFACTORIZACIÓN DE `/dashboard` - CERMONT APLICATIVO**

**Versión:** 2.0 (Mejorado)  
**Fecha:** 2024-12-22  
**Autor:** Sistema de Refactorización Cermont  
**Estado:** ✅ Listo para ejecución

---

## 📋 **CONTEXTO DEL MÓDULO**

El módulo **`/dashboard`** es un **bounded context de visualización y análisis** responsable de agregar, calcular y presentar métricas clave de negocio (KPIs) en tiempo real para diferentes roles en Cermont. Actúa como capa de presentación de datos analíticos provenientes de múltiples bounded contexts.

### **⚠️ ANÁLISIS DE DUPLICADOS:**

**Módulo `/kpis` encontrado:**
- **Estado:** Módulo separado con funcionalidad similar
- **Decisión:** **CONSOLIDAR** en `/dashboard` (el dashboard es más completo)
- **Acción:** Migrar funcionalidad de `/kpis` a `/dashboard` y luego deprecar `/kpis`

### **Responsabilidades del Módulo:**
- ✅ **Cálculo de KPIs** (órdenes completadas, pendientes, costos totales, rentabilidad)
- ✅ **Agregación Cross-Context** (datos de órdenes, costos, usuarios, checklists)
- ✅ **Dashboards por Rol** (ADMIN, COORDINADOR, TECNICO, CLIENTE)
- ✅ **Métricas en Tiempo Real** (actualización periódica)
- ✅ **Filtros Temporales** (hoy, semana, mes, trimestre, año, custom)
- ✅ **Comparativas** (período actual vs anterior)
- ✅ **Tendencias** (gráficas de evolución temporal)
- ✅ **Alertas Visuales** (órdenes vencidas, presupuestos excedidos)
- ✅ **Caching Inteligente** (TTL por métrica, invalidación selectiva)
- ✅ **Performance Optimization** (queries agregadas, índices, materialized views)
- ✅ **Exportación de Reportes** (PDF, CSV, Excel)
- ✅ **Widgets Configurables** (personalización por usuario)

### **Arquitectura Actual (DDD incompleto):**

```
📁dashboard/
├── 📁__tests__/
│   ├── kpi-calculator.service.spec.ts
├── 📁application/
│   ├── 📁dto/
│   │   ├── dashboard-query.dto.ts
│   │   ├── dashboard-response.dto.ts
│   │   ├── dashboard.dto.ts
│   │   ├── index.ts
│   ├── 📁use-cases/
│   │   ├── get-dashboard-stats.use-case.ts
│   │   ├── index.ts
├── 📁dto/
│   ├── kpi-response.dto.ts
├── 📁infrastructure/
│   ├── 📁controllers/
│   │   ├── dashboard.controller.ts
│   │   ├── index.ts
│   ├── 📁persistence/
│   │   ├── dashboard.repository.ts
│   │   ├── index.ts
├── 📁interfaces/
│   ├── kpi.interface.ts
├── 📁services/
│   ├── cache-invalidation.service.ts
│   ├── kpi-calculator.service.ts
├── dashboard.module.ts
├── dashboard.service.ts
├── index.ts
└── README.md
```

### **Arquitectura Objetivo (DDD completo + CQRS):**

```
📁dashboard/
├── 📁domain/                                # ⚠️ CREAR DESDE CERO
│   ├── 📁exceptions/
│   │   ├── index.ts                         # Exporta desde common/domain/exceptions
│   ├── 📁value-objects/
│   │   ├── kpi-value.vo.ts                  # Valor de KPI tipado (usa Decimal.js)
│   │   ├── time-period.vo.ts                # Período temporal
│   │   ├── dashboard-role.vo.ts             # Rol del dashboard
│   │   ├── kpi-type.vo.ts                   # Tipo de KPI
│   │   ├── trend-direction.vo.ts            # UP, DOWN, STABLE
│   │   ├── comparison-result.vo.ts         # Comparación períodos
│   │   ├── index.ts
│   ├── 📁entities/
│   │   ├── dashboard-widget.entity.ts       # Widget configurable
│   │   ├── kpi-snapshot.entity.ts           # Snapshot de KPI en tiempo
│   │   ├── index.ts
│   ├── 📁services/                          # Domain Services
│   │   ├── kpi-aggregator.service.ts        # Agregación de KPIs
│   │   ├── trend-analyzer.service.ts        # Análisis de tendencias
│   │   ├── comparison.service.ts            # Comparación períodos
│   │   ├── index.ts
│   ├── 📁specifications/
│   │   ├── valid-time-period.spec.ts
│   │   ├── authorized-for-kpi.spec.ts       # Permisos por KPI
│   │   ├── index.ts
│   ├── 📁repositories/
│   │   ├── dashboard-query.repository.interface.ts  # CQRS Read
│   │   ├── kpi-snapshot.repository.interface.ts
│   │   ├── index.ts
│   ├── index.ts
├── 📁application/
│   ├── 📁dto/
│   │   ├── dashboard-query.dto.ts           # Filtros de consulta
│   │   ├── dashboard-response.dto.ts       # Respuesta completa
│   │   ├── kpi-response.dto.ts              # KPI individual
│   │   ├── widget-config.dto.ts             # Config de widgets
│   │   ├── trend-data.dto.ts                # Datos de tendencia
│   │   ├── comparison.dto.ts                # Comparación períodos
│   │   ├── index.ts
│   ├── 📁queries/                           # CQRS Query Handlers
│   │   ├── get-dashboard-by-role.query.ts
│   │   ├── get-ordenes-kpis.query.ts
│   │   ├── get-costos-kpis.query.ts
│   │   ├── get-usuarios-kpis.query.ts
│   │   ├── get-trend-data.query.ts
│   │   ├── get-comparison-data.query.ts
│   │   ├── index.ts
│   ├── 📁use-cases/
│   │   ├── get-dashboard-stats.use-case.ts   # Refactorizar existente
│   │   ├── get-dashboard-by-role.use-case.ts
│   │   ├── export-dashboard.use-case.ts
│   │   ├── save-widget-config.use-case.ts
│   │   ├── index.ts
│   ├── 📁mappers/
│   │   ├── dashboard.mapper.ts
│   │   ├── kpi.mapper.ts
│   │   ├── index.ts
│   ├── 📁calculators/                       # Calculadores especializados
│   │   ├── ordenes-kpi.calculator.ts
│   │   ├── costos-kpi.calculator.ts
│   │   ├── rentabilidad-kpi.calculator.ts
│   │   ├── usuarios-kpi.calculator.ts
│   │   ├── index.ts
│   ├── index.ts
├── 📁infrastructure/
│   ├── 📁controllers/
│   │   ├── dashboard.controller.ts          # Refactorizar existente
│   │   ├── index.ts
│   ├── 📁persistence/
│   │   ├── dashboard-query.repository.ts    # Read Model (refactorizar existente)
│   │   ├── kpi-snapshot.repository.ts       # Snapshots
│   │   ├── materialized-views.sql           # Views optimizadas
│   │   ├── index.ts
│   ├── 📁cache/
│   │   ├── dashboard-cache.service.ts       # Redis cache
│   │   ├── cache-keys.constants.ts
│   │   ├── cache-invalidation.service.ts    # Refactorizar existente
│   │   ├── index.ts
│   ├── 📁exporters/
│   │   ├── pdf-exporter.ts                  # Exportar a PDF
│   │   ├── excel-exporter.ts                # Exportar a Excel
│   │   ├── index.ts
│   ├── 📁schedulers/
│   │   ├── kpi-snapshot.scheduler.ts        # Snapshots periódicos
│   │   ├── cache-warming.scheduler.ts       # Pre-cachear datos
│   │   ├── index.ts
│   ├── index.ts
├── 📁__tests__/
│   ├── unit/
│   │   ├── kpi-calculator.spec.ts
│   │   ├── trend-analyzer.spec.ts
│   │   ├── value-objects.spec.ts
│   ├── integration/
│   │   ├── dashboard-repository.spec.ts
│   │   ├── cache-service.spec.ts
│   ├── e2e/
│   │   ├── dashboard.controller.spec.ts
├── dashboard.module.ts                      # Refactorizar existente
├── dashboard.service.ts                     # Legacy - deprecar gradualmente
├── index.ts
└── README.md
```

### **Stack Tecnológico:**
- **Framework:** NestJS 11.x + TypeScript 5.x
- **ORM:** Prisma (PostgreSQL con materialized views)
- **Arquitectura:** Clean Architecture + DDD + **CQRS** (Query-focused)
- **Patrones:** Repository Pattern (Read Model), Query Pattern, Domain Services, Specification Pattern
- **Caching:** Redis (estrategia TTL + invalidación selectiva)
- **Validación:** class-validator, Zod
- **Testing:** Jest
- **Cálculos:** Decimal.js (precisión financiera) - **USAR DESDE MÓDULO COSTOS**
- **Scheduling:** @nestjs/schedule (snapshots periódicos)
- **Exportación:** pdfkit, exceljs
- **Observability:** Métricas de performance de queries

### **⚠️ COMPONENTES COMUNES A REUTILIZAR:**

1. **Excepciones:** Usar `common/domain/exceptions` (ValidationError, BusinessRuleViolationError)
2. **Decimal.js:** Ya usado en `/costos` - reutilizar Money VO si aplica
3. **Guards/Decorators:** Usar `common/guards` y `common/decorators`
4. **NO duplicar:** Email, Password (ya en common)

---

## 🎯 **OBJETIVOS DE LA REFACTORIZACIÓN**

Refactorizar **TODO** el módulo `/dashboard` aplicando:

1. ✅ **SOLID Principles** (SRP, OCP, LSP, ISP, DIP)
2. ✅ **Clean Architecture** (dependencias siempre apuntan hacia adentro)
3. ✅ **DDD Tactical Patterns** (Value Objects, Entities, Domain Services, Specifications)
4. ✅ **CQRS Pattern** (separación Query/Command para optimización de lectura)
5. ✅ **Rich Domain Model** (lógica de cálculo en domain services)
6. ✅ **TypeScript Best Practices** (tipos estrictos, no `any`, generics)
7. ✅ **Performance Optimization** (caching Redis, materialized views, índices)
8. ✅ **Security** (autorización por rol, permisos por KPI)
9. ✅ **Error Handling** (excepciones descriptivas, fallbacks)
10. ✅ **Testing** (unit tests, integration tests, E2E tests, load tests)
11. ✅ **Observability** (logging, métricas de performance, alertas)
12. ✅ **Scalability** (caching distribuido, read replicas)
13. ✅ **Consolidación** (migrar funcionalidad de `/kpis` a `/dashboard`)

---

## 📝 **PLAN DE TRABAJO COMPLETO (TASK LIST)**

---

### **FASE 0: CONSOLIDACIÓN CON MÓDULO KPIS (1 día)**

#### **TASK 0.1: Analizar y Migrar Funcionalidad de `/kpis`**

**Acciones:**
1. Analizar `kpis.service.ts` y `kpis.controller.ts`
2. Identificar funcionalidad única vs duplicada
3. Migrar funcionalidad única a `/dashboard`
4. Actualizar referencias en otros módulos
5. Deprecar módulo `/kpis` (marcar como deprecated)

**Entregables:**
- Funcionalidad migrada
- Referencias actualizadas
- Módulo `/kpis` marcado como deprecated

---

### **FASE 1: REFACTORIZACIÓN DOMAIN LAYER (3 días)**

#### **TASK 1.1: Crear Value Objects**

**Value Objects a crear:**

1. **KpiValue.vo.ts**
```typescript
import { Decimal } from 'decimal.js';
import { ValidationError } from '../../../../common/domain/exceptions';

export enum KpiValueType {
  NUMBER = 'NUMBER',
  MONEY = 'MONEY',
  PERCENTAGE = 'PERCENTAGE',
  COUNT = 'COUNT',
}

export class KpiValue {
  private constructor(
    private readonly _value: Decimal,
    private readonly _type: KpiValueType,
    private readonly _currency?: string,
  ) {
    Object.freeze(this);
  }
  
  public static number(value: number | Decimal): KpiValue {
    const decimal = new Decimal(value);
    if (decimal.isNegative()) {
      throw new ValidationError('KPI value cannot be negative', 'kpiValue');
    }
    return new KpiValue(decimal, KpiValueType.NUMBER);
  }
  
  public static money(value: number | Decimal, currency: string): KpiValue {
    const decimal = new Decimal(value);
    if (decimal.isNegative()) {
      throw new ValidationError('Money value cannot be negative', 'kpiValue');
    }
    return new KpiValue(decimal, KpiValueType.MONEY, currency.toUpperCase());
  }
  
  public static percentage(value: number): KpiValue {
    const decimal = new Decimal(value);
    if (decimal.lessThan(0) || decimal.greaterThan(100)) {
      throw new ValidationError('Percentage must be between 0 and 100', 'kpiValue');
    }
    return new KpiValue(decimal, KpiValueType.PERCENTAGE);
  }
  
  public static count(value: number): KpiValue {
    const decimal = new Decimal(value);
    if (!decimal.isInteger() || decimal.isNegative()) {
      throw new ValidationError('Count must be a non-negative integer', 'kpiValue');
    }
    return new KpiValue(decimal, KpiValueType.COUNT);
  }
  
  public format(): string {
    switch (this._type) {
      case KpiValueType.MONEY:
        const formatted = this._value.toFixed(2);
        const [integer, decimal] = formatted.split('.');
        const integerWithCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `$ ${integerWithCommas}.${decimal} ${this._currency}`;
      case KpiValueType.PERCENTAGE:
        return `${this._value.toFixed(2)}%`;
      case KpiValueType.COUNT:
        return this._value.toFixed(0);
      default:
        return this._value.toString();
    }
  }
  
  public getValue(): Decimal {
    return this._value;
  }
  
  public getType(): KpiValueType {
    return this._type;
  }
  
  public getCurrency(): string | undefined {
    return this._currency;
  }
  
  public equals(other: KpiValue): boolean {
    return (
      this._value.equals(other._value) &&
      this._type === other._type &&
      this._currency === other._currency
    );
  }
  
  public toJSON(): any {
    return {
      value: this._value.toString(),
      type: this._type,
      currency: this._currency,
    };
  }
}
```

2. **TimePeriod.vo.ts** (con validación y comparación)
3. **DashboardRole.vo.ts** (con permisos)
4. **KpiType.vo.ts** (con metadata)
5. **TrendDirection.vo.ts** (con cálculo)
6. **ComparisonResult.vo.ts** (con diferencias)

**Entregables:**
- VOs implementados
- Tests unitarios >90%
- Documentación

---

#### **TASK 1.2: Implementar Domain Services**

**Domain Services a crear:**

1. **KpiAggregatorService** (agregación cross-context)
2. **TrendAnalyzerService** (análisis de tendencias)
3. **ComparisonService** (comparación períodos)

**Entregables:**
- Domain services implementados
- Tests unitarios
- Documentación

---

#### **TASK 1.3: Refactorizar Entities**

**Entities a crear:**

1. **DashboardWidget.entity.ts** (configuración de widgets)
2. **KpiSnapshot.entity.ts** (snapshots históricos)

**Entregables:**
- Entities implementadas
- Tests unitarios

---

#### **TASK 1.4: Implementar Specifications**

**Specifications a crear:**

1. **ValidTimePeriodSpecification**
2. **AuthorizedForKpiSpecification**

**Entregables:**
- Specifications implementadas
- Tests unitarios

---

#### **TASK 1.5: Definir Repository Interfaces**

**Interfaces a crear:**

1. **IDashboardQueryRepository** (CQRS Read Model)
2. **IKpiSnapshotRepository**

**Entregables:**
- Interfaces definidas
- Documentación

---

### **FASE 2: REFACTORIZACIÓN APPLICATION LAYER (CQRS) (4 días)**

#### **TASK 2.1: Implementar Query Handlers (CQRS)**

**Queries a implementar:**

1. **GetDashboardByRoleQuery + Handler**
2. **GetOrdenesKpisQuery + Handler**
3. **GetCostosKpisQuery + Handler**
4. **GetUsuariosKpisQuery + Handler**
5. **GetTrendDataQuery + Handler**
6. **GetComparisonDataQuery + Handler**

Cada handler:
- Aplica caching
- Usa queries optimizadas
- Maneja errores
- Retorna DTOs

**Entregables:**
- Query handlers implementados
- Tests unitarios

---

#### **TASK 2.2: Refactorizar Use Cases**

**Use Cases a refactorizar:**

1. **GetDashboardStatsUseCase** (orquestador principal) - Refactorizar existente
2. **GetDashboardByRoleUseCase** (filtrado por rol)
3. **ExportDashboardUseCase** (exportación)
4. **SaveWidgetConfigUseCase** (personalización)

**Entregables:**
- Use cases refactorizados
- Tests unitarios

---

#### **TASK 2.3: Implementar Calculators Especializados**

**Calculators a crear:**

1. **OrdenesKpiCalculator** (reemplaza parte de KpiCalculatorService)
2. **CostosKpiCalculator**
3. **RentabilidadKpiCalculator**
4. **UsuariosKpiCalculator**

Cada calculador:
- UNA responsabilidad (SRP)
- Queries optimizadas
- Retorna VOs tipados
- Testeable

**Entregables:**
- Calculators implementados
- Tests unitarios

---

#### **TASK 2.4: Refactorizar DTOs**

**DTOs a refactorizar:**

- `DashboardQueryDto` - Refactorizar existente
- `DashboardResponseDto` - Refactorizar existente
- `KpiResponseDto` - Refactorizar existente
- `WidgetConfigDto` - Nuevo
- `TrendDataDto` - Nuevo
- `ComparisonDto` - Nuevo

**Entregables:**
- DTOs refactorizados
- Validación Zod + class-validator
- Swagger docs

---

#### **TASK 2.5: Implementar Mappers**

**Mappers a crear:**

- `DashboardMapper`
- `KpiMapper`

**Entregables:**
- Mappers implementados
- Tests

---

### **FASE 3: REFACTORIZACIÓN INFRASTRUCTURE LAYER (3 días)**

#### **TASK 3.1: Implementar Cache Layer (Redis)**

**Componentes:**

1. **DashboardCacheService** (caching + warming)
2. **CacheInvalidationService** (invalidación selectiva) - Refactorizar existente
3. **CacheKeysConstants** (keys estandarizadas)

**Estrategia:**
- TTL variable por KPI
- Invalidación por eventos
- Cache warming periódico

**Entregables:**
- Cache layer implementado
- Tests de integración
- Métricas de hit/miss

---

#### **TASK 3.2: Refactorizar Repository (Read Model)**

**DashboardQueryRepository:**
- Queries optimizadas
- Uso de materialized views
- Agregaciones en BD
- Índices correctos
- Refactorizar existente `dashboard.repository.ts`

**Entregables:**
- Repository refactorizado
- Tests de integración
- Scripts de migración

---

#### **TASK 3.3: Crear Materialized Views**

**Views a crear:**

1. `mv_ordenes_kpis` (KPIs de órdenes)
2. `mv_costos_kpis` (KPIs de costos)
3. `mv_usuarios_kpis` (KPIs de usuarios)

**Entregables:**
- `materialized-views.sql`
- Scripts de refresh
- Índices en views

---

#### **TASK 3.4: Implementar Schedulers**

**Schedulers a crear:**

1. **KpiSnapshotScheduler** (snapshots cada hora)
2. **CacheWarmingScheduler** (warming cada 5 min)
3. **MaterializedViewRefreshScheduler** (refresh cada noche)

**Entregables:**
- Schedulers implementados
- Tests
- Logging de ejecución

---

#### **TASK 3.5: Implementar Exporters**

**Exporters a crear:**

1. **PDFExporter** (reporte PDF)
2. **ExcelExporter** (reporte Excel)

**Entregables:**
- Exporters implementados
- Tests
- Plantillas de diseño

---

#### **TASK 3.6: Refactorizar Controller**

**Controller:**
- Solo orquestación
- Guards + permisos
- Swagger docs
- Rate limiting
- Refactorizar existente `dashboard.controller.ts`

**Entregables:**
- Controller refactorizado
- Tests E2E

---

### **FASE 4: TESTING Y OPTIMIZACIÓN (2 días)**

#### **TASK 4.1: Tests Unitarios**

- VOs, Entities, Domain Services
- Calculators
- Query Handlers
- Cobertura >85%

---

#### **TASK 4.2: Tests de Integración**

- Repository con Prisma
- Cache con Redis
- Schedulers

---

#### **TASK 4.3: Tests E2E**

- Endpoints principales
- Flujo completo
- Performance tests

---

#### **TASK 4.4: Load Testing**

- Apache JMeter / k6
- Simular carga alta
- Medir cache hit rate
- Identificar cuellos de botella

---

### **FASE 5: DOCUMENTACIÓN Y ENTREGA (1 día)**

#### **TASK 5.1: Documentación Completa**

**Entregables:**
- README.md completo
- Swagger actualizado
- ADRs (decisiones arquitectónicas)
- Guía de performance tuning
- Estrategia de caching documentada
- Diagramas de arquitectura

---

## 📊 **MÉTRICAS DE ÉXITO**

### **Objetivos Cuantitativos:**
- ✅ Cobertura de tests >85%
- ✅ 0 errores de linter
- ✅ 0 uso de `any`
- ✅ Cache hit rate >80%
- ✅ Queries <100ms (p95)
- ✅ Dashboard load <500ms
- ✅ Reducción 50% en query time vs antes

### **Objetivos Cualitativos:**
- ✅ Código mantenible
- ✅ Arquitectura DDD + CQRS correcta
- ✅ SOLID principles aplicados
- ✅ Performance optimizado
- ✅ Caching eficiente
- ✅ Observabilidad completa
- ✅ Sin duplicación con otros módulos

---

## 🚀 **EJECUCIÓN**

**Total estimado:** 14 días

---

## ✅ **CHECKLIST FINAL**

- [ ] FASE 0: Consolidación con módulo `/kpis`
- [ ] VOs refactorizados
- [ ] Domain services implementados
- [ ] Entities refactorizadas
- [ ] Specifications implementadas
- [ ] Query handlers (CQRS) implementados
- [ ] Use cases refactorizados
- [ ] Calculators especializados implementados
- [ ] DTOs refactorizados
- [ ] Mappers implementados
- [ ] Cache layer con Redis implementado
- [ ] Repository (read model) optimizado
- [ ] Materialized views creadas
- [ ] Schedulers implementados
- [ ] Exporters (PDF, Excel) funcionando
- [ ] Controller refactorizado
- [ ] Tests unitarios >85%
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Load tests ejecutados
- [ ] Documentación completa
- [ ] 0 errores de linter
- [ ] 0 uso de `any`
- [ ] Cache hit rate >80%
- [ ] Queries optimizadas (<100ms p95)
- [ ] Dashboard load <500ms
- [ ] Módulo `/kpis` deprecado

---

**FIN DEL PROMPT MAESTRO MEJORADO** 🎯

