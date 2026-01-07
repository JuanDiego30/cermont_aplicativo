# 01_CRITICAL_ARCHITECTURE_ISSUES.md

## Problemas Críticos de Arquitectura - Análisis Detallado

### Fecha: 2026-01-07

## 1. CLEAN ARCHITECTURE VIOLATIONS MASIVAS

### 1.1 Domain Layer Contaminado
**Severidad:** CRÍTICA
**Estado:** NO CORREGIDO
**Impacto:** Arquitectura rota, testing imposible, acoplamiento fuerte

#### Problemas Específicos:

**Archivos con imports prohibidos en domain/:**

1. **JWT Token VO**
   ```typescript
   // ❌ INCORRECTO
   apps/api/src/modules/auth/domain/value-objects/jwt-token.vo.ts:6
   import { JwtService } from '@nestjs/jwt';
   ```

2. **Money VO**
   ```typescript
   // ❌ INCORRECTO
   apps/api/src/modules/costos/domain/value-objects/money.vo.ts:15
   import { Logger } from '@nestjs/common';
   ```

3. **File Validator Service**
   ```typescript
   // ❌ INCORRECTO
   apps/api/src/modules/evidencias/domain/services/file-validator.service.ts:6
   import { Injectable } from '@nestjs/common';
   ```

4. **State Machine**
   ```typescript
   // ❌ INCORRECTO
   apps/api/src/modules/ordenes/domain/orden-state-machine.ts:1
   import { Injectable, Logger } from '@nestjs/common';
   ```

#### Solución Requerida:
```typescript
// ✅ CORRECTO - Domain puro
export class JwtTokenVO {
  constructor(private value: string) {}

  static create(token: string): Result<JwtTokenVO, ValidationError> {
    // Validación pura
    return ok(new JwtTokenVO(token));
  }
}

// ✅ CORRECTO - Adapter en infrastructure
@Injectable()
export class NestJwtServiceAdapter implements IJwtService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: object): string {
    return this.jwtService.sign(payload);
  }
}
```

### 1.2 Dependencias Circulares Entre Módulos
**Severidad:** CRÍTICA
**Estado:** NO CORREGIDO
**Impacto:** Compilación lenta, debugging difícil

#### Patrones Problemáticos:
```
auth -> shared -> common -> auth (circular)
ordenes -> costos -> shared -> ordenes (circular)
dashboard -> kpis -> dashboard (circular)
```

#### Solución:
- Implementar **bounded contexts** claros
- Usar **event-driven communication** entre contexts
- Eliminar imports directos entre contexts no relacionados

### 1.3 Controllers con Lógica de Negocio
**Severidad:** ALTA
**Estado:** NO CORREGIDO
**Impacto:** Código duplicado, difícil testing

#### Ejemplo Problemático:
```typescript
// ❌ INCORRECTO - Controller con lógica de negocio
@Post()
async create(@Body() dto: CreateOrdenDto, @CurrentUser() user: JwtPayload) {
  // Validación manual
  if (!dto.cliente) throw new BadRequestException('Cliente requerido');

  // Lógica de negocio en controller
  const numero = await this.generarNumeroOrden();

  // Mapeo manual
  const ordenData = { ...dto, numero, creadorId: user.userId };

  return this.prisma.order.create({ data: ordenData });
}
```

#### Solución:
```typescript
// ✅ CORRECTO - Controller delgado
@Post()
async create(@Body() dto: CreateOrdenDto, @CurrentUser() user: JwtPayload) {
  return this.createOrdenUseCase.execute(dto, user.userId);
}
```

## 2. PATRÓN REPOSITORY INCONSISTENTE

### 2.1 Múltiples Estrategias de Acceso a Datos
**Severidad:** CRÍTICA
**Estado:** NO CORREGIDO
**Impacto:** Inconsistencia, debugging difícil

#### Patrones Encontrados:
1. **Direct Prisma en controllers:**
   ```typescript
   // ❌ INCORRECTO
   constructor(private readonly prisma: PrismaService) {}

   async findAll() {
     return this.prisma.order.findMany();
   }
   ```

2. **Repository + Service híbrido:**
   ```typescript
   // ⚠️ PROBLEMÁTICO
   constructor(
     private readonly repository: OrdenRepository,
     private readonly prisma: PrismaService // ¡Ambos!
   ) {}
   ```

3. **Repository puro (correcto pero inconsistente):**
   ```typescript
   // ✅ CORRECTO pero no aplicado consistentemente
   constructor(private readonly repository: OrdenRepository) {}
   ```

### 2.2 Transacciones No Manejadas
**Severidad:** ALTA
**Estado:** NO CORREGIDO
**Impacto:** Data inconsistency en operaciones complejas

#### Problema:
```typescript
// ❌ INCORRECTO - Sin transacción
async createOrdenWithItems(ordenDto: CreateOrdenDto, items: ItemDto[]) {
  const orden = await this.prisma.order.create({ data: ordenDto });
  const itemsCreated = await Promise.all(
    items.map(item => this.prisma.orderItem.create({
      data: { ...item, ordenId: orden.id }
    }))
  );
  // Si falla creación de items, orden queda huérfana
}
```

#### Solución:
```typescript
// ✅ CORRECTO - Con transacción
async createOrdenWithItems(ordenDto: CreateOrdenDto, items: ItemDto[]) {
  return this.prisma.$transaction(async (tx) => {
    const orden = await tx.order.create({ data: ordenDto });
    const itemsCreated = await tx.orderItem.createMany({
      data: items.map(item => ({ ...item, ordenId: orden.id }))
    });
    return { orden, items: itemsCreated };
  });
}
```

## 3. TYPE SAFETY COMPROMETIDA

### 3.1 Type Casting `as unknown as` Masivo
**Severidad:** CRÍTICA
**Estado:** DOCUMENTADO PERO NO CORREGIDO
**Impacto:** Runtime errors, debugging difícil

#### Estadísticas:
- **Total ocurrencias:** 66
- **Archivos afectados:** 12+
- **Tipos comprometidos:** DTOs, Enums, Interfaces

#### Ejemplos:
```typescript
// ❌ INCORRECTO - Type casting inseguro
const zodQuery: OrdenQueryDto = {
  estado: query.estado
    ? (query.estado as unknown as OrdenQueryDto["estado"]) // ¡Peligroso!
    : undefined,
  prioridad: query.prioridad
    ? (query.prioridad as unknown as OrdenQueryDto["prioridad"]) // ¡Peligroso!
    : undefined,
};
```

### 3.2 DTOs Duplicados sin Sincronización
**Severidad:** ALTA
**Estado:** NO CORREGIDO
**Impacto:** Inconsistencia frontend-backend

#### Problema:
```typescript
// Backend - Zod DTO
export const OrdenEstadoSchema = z.enum([
  "planeacion", "ejecucion", "pausada", "completada", "cancelada"
]);

// Backend - Class Validator DTO
export class CreateOrdenDto {
  @IsEnum(OrdenEstado) // ¿Qué enum usa?
  estado?: OrdenEstado;
}

// Frontend - Interface diferente
export interface Orden {
  estado: 'pendiente' | 'planeacion' | 'en_progreso' | 'ejecucion' | 'completada';
}
```

## 4. PLAN DE ACCIÓN - FASE 1

### Semana 1: Domain Layer Cleanup
1. **Día 1-2:** Crear ports/interfaces para dependencias framework
2. **Día 3-4:** Implementar adapters en infrastructure layer
3. **Día 5:** Refactorizar 7 archivos domain con violations

### Semana 2: Repository Pattern Unification
1. **Día 1-3:** Auditar uso de Prisma vs Repositories
2. **Día 4-5:** Unificar estrategia de acceso a datos
3. **Día 6-7:** Implementar transacciones consistentes

### Semana 3: Type Safety Restoration
1. **Día 1-2:** Sincronizar DTOs Zod vs ClassValidator
2. **Día 3-4:** Eliminar 66 type casts inseguros
3. **Día 5-6:** Generar tipos frontend desde backend
4. **Día 7:** Testing de type safety

### Semana 4: Architecture Validation
1. **Día 1-2:** Implementar boundary checks
2. **Día 3-4:** Configurar CI para validar arquitectura
3. **Día 5-7:** Code review y documentación

## 5. CRITERIOS DE ÉXITO

### Arquitectura:
- ✅ **Domain layer puro:** Sin imports de NestJS/Prisma
- ✅ **Dependency inversion:** Interfaces en domain, implementations en infrastructure
- ✅ **Repository pattern:** Acceso consistente a datos
- ✅ **Transacciones:** Operaciones complejas envueltas en tx

### Código:
- ✅ **Type safety:** Sin `as unknown as`, tipos sincronizados
- ✅ **Clean controllers:** Solo HTTP concerns, lógica en use cases
- ✅ **No circular dependencies:** Imports unidireccionales

### Testing:
- ✅ **Unit tests domain:** 100% coverage en domain puro
- ✅ **Integration tests:** Controllers + Use Cases + Repositories
- ✅ **E2E tests:** Flujos completos con DB real

## 6. RIESGOS Y MITIGACIONES

### Riesgo: Breaking changes en APIs
**Mitigación:** Versionado de APIs, feature flags, tests exhaustivos

### Riesgo: Performance degradation
**Mitigación:** Benchmarks antes/durante/después, profiling continuo

### Riesgo: Team learning curve
**Mitigación:** Documentación detallada, pair programming, training sessions

---

**Estado:** ✅ **ANÁLISIS COMPLETADO**
**Próximo:** Implementación Fase 1 - Semana 1
**Tiempo estimado:** 4 semanas
**Impacto:** Arquitectura sólida y mantenible