# 🔍 CERMONT - AUDITORÍA TÉCNICA Y PLAN DE REFACTOR

**Fecha:** 2026-01-07  
**Generado por:** GitHub Copilot  
**Estado del Proyecto:** 🟢 Estable (todos los checks pasan)

---

## 📊 RESUMEN EJECUTIVO

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Lint** | 2/2 paquetes pasan | ✅ |
| **TypeCheck** | Sin errores | ✅ |
| **Tests** | 204 passing, 6 skipped | ✅ |
| **Build** | FE 321KB, BE compiled | ✅ |
| **Duplicación** | 105 clones (1.48%) | ⚠️ |
| **Archivos Analizados** | 852 TypeScript | - |
| **Líneas Totales** | 84,245 | - |

**Conclusión:** El proyecto está en estado funcional estable. Los problemas identificados son de **deuda técnica** y **consistencia de tipos**, no de funcionalidad crítica bloqueante.

---

## 🔴 HALLAZGOS P0 - CRÍTICOS

### P0-1: UserRole Desalineado Frontend/Backend

**Problema:** El enum `UserRole` tiene valores diferentes entre frontend y backend.

| Rol | Backend | Frontend |
|-----|---------|----------|
| admin | ✅ | ✅ |
| supervisor | ✅ | ✅ |
| tecnico | ✅ | ✅ |
| administrativo | ✅ | ❌ FALTA |

**Ubicaciones Backend (4 definiciones duplicadas):**
- [roles.decorator.ts](../apps/api/src/common/decorators/roles.decorator.ts#L11)
- [security.config.ts](../apps/api/src/common/config/security.config.ts#L101)
- [permissions.interface.ts](../apps/api/src/modules/admin/interfaces/permissions.interface.ts#L8)
- [admin-legacy.dto.ts](../apps/api/src/modules/admin/application/dto/admin-legacy.dto.ts#L16)

**Ubicación Frontend:**
- [user.model.ts](../apps/web/src/app/core/models/user.model.ts#L1)

**Impacto:** Usuarios con rol `administrativo` podrían no manejarse correctamente en frontend.

**Solución:**
1. Crear archivo canónico `apps/api/src/common/enums/user-role.enum.ts`
2. Eliminar duplicados y re-exportar desde ubicación canónica
3. Añadir `ADMINISTRATIVO` a frontend

---

### P0-2: OrdenEstado con 3 Definiciones Duplicadas

**Problema:** El enum `OrdenEstado` está definido 3 veces en el backend.

**Ubicaciones:**
- [orden-state-machine.ts](../apps/api/src/modules/ordenes/domain/orden-state-machine.ts#L3) ← **CANÓNICO (tiene lógica de FSM)**
- [update-orden.dto.ts](../apps/api/src/modules/ordenes/application/dto/update-orden.dto.ts#L11) ← Eliminar
- [shared-types.ts](../apps/api/src/modules/ordenes/application/dto/shared-types.ts#L38) ← Como `OrdenEstadoEnum`

**Valores (consistentes):**
```typescript
PENDIENTE, PLANEACION, EJECUCION, COMPLETADA, CANCELADA, PAUSADA
```

**Impacto:** Confusión de imports, posible inconsistencia si se modifica uno y no los otros.

**Solución:** Mantener solo `orden-state-machine.ts`, actualizar imports en los demás archivos.

---

### P0-3: 4 Definiciones de UserRole en Backend

**Problema:** Además de la desalineación con frontend, hay 4 copias en backend.

**Detalles:**

| Archivo | Enum Name | Valores |
|---------|-----------|---------|
| roles.decorator.ts | UserRole | admin, supervisor, tecnico, administrativo |
| security.config.ts | UserRole | (igual) |
| permissions.interface.ts | UserRoleEnum | (igual) |
| admin-legacy.dto.ts | UserRoleEnum | (igual) |

**Solución:** Consolidar en un único archivo en `common/enums/`.

---

### P0-4: PlaneacionEstado No Existe en Backend

**Problema:** Frontend define enum `PlaneacionEstado`, pero backend usa `estado: string`.

**Frontend ([planeacion.model.ts](../apps/web/src/app/core/models/planeacion.model.ts#L7)):**
```typescript
export enum PlaneacionEstado {
    PENDIENTE = 'PENDIENTE',
    APROBADA = 'APROBADA',
    RECHAZADA = 'RECHAZADA',
    EN_REVISION = 'EN_REVISION',
}
```

**Backend ([planeacion.dto.ts](../apps/api/src/modules/planeacion/application/dto/planeacion.dto.ts#L75)):**
```typescript
interface PlaneacionResponse {
  estado: string;  // ← No tipado
}
```

**Impacto:** Contrato API indefinido, posibles valores inválidos.

**Solución:** Crear enum en `planeacion/domain/enums/planeacion-estado.enum.ts` y tipar correctamente.

---

### P0-5: `as any` Masivo en HES Repository

**Problema:** El repositorio de HES tiene 12+ usos de `as any`, perdiendo type-safety de Prisma.

**Ubicación:** [hes.repository.ts](../apps/api/src/modules/hes/infrastructure/persistence/hes.repository.ts)

**Ejemplos:**
```typescript
const saved = await (this.prisma as any).hojaEntradaServicio.upsert({...});
clienteInfo: prismaData.clienteInfo as any,
condicionesEntrada: prismaData.condicionesEntrada as any,
// ... 10+ más
```

**Causa probable:** El modelo `hojaEntradaServicio` no está definido en Prisma schema, o tiene campos JSON sin tipo.

**Solución:**
1. Verificar que el modelo existe en `schema.prisma`
2. Ejecutar `prisma generate`
3. Crear tipos para campos JSON
4. Eliminar `as any`

---

## 🟠 HALLAZGOS P1 - ALTA PRIORIDAD

### P1-1: 40+ Usos de `any` en Frontend

**Ubicaciones principales:**
- `search-filter.component.ts` - value?: any, onFieldChange(value: any)
- `default-inputs.component.ts` - dateValue: any, handleDateChange(event: any)
- `product-list-table.component.ts` - valA: any, valB: any
- `data-table.component.ts` - action: (row: any), getCellValue(): any
- `advanced-table.component.ts` - data: any[], filteredData: any[]

**Impacto:** Pérdida de type-safety, bugs difíciles de detectar.

**Solución:** Usar genéricos `<T>` en componentes de tabla, tipar eventos correctamente.

---

### P1-2: 20+ Usos de `as unknown as` en Tests

**Ubicaciones:** Archivos `__tests__/*.spec.ts`

**Ejemplos:**
```typescript
const jwtService = { sign: jest.fn(() => "tkn") } as unknown as IJwtService;
(bcrypt.compare as unknown as jest.Mock).mockResolvedValue(true);
```

**Causa:** Mocking de dependencias sin tipos completos.

**Impacto:** Menor (aceptable en tests), pero indica que interfaces podrían ser más pequeñas.

**Recomendación:** Baja prioridad, considerar crear factories de mocks tipadas.

---

### P1-3: Zod Schemas Marcados @deprecated

**Problema:** Hay schemas Zod con `@deprecated` pero aún presentes en código.

**Archivos afectados (8 módulos migrados):**
- admin.dto.ts, auth.dto.ts, weather.dto.ts
- reportes.dto.ts, costos.dto.ts, ejecucion.dto.ts
- planeacion.dto.ts, cierre-administrativo.dto.ts

**Impacto:** Peso de bundle innecesario, confusión para desarrolladores.

**Solución:** Eliminar schemas Zod deprecated y las importaciones de `z` donde no se usen.

---

### P1-4: Exception Filters Duplicados

**Problema:** `all-exceptions.filter.ts` y `http-exception.filter.ts` comparten 10+ líneas idénticas.

**Duplicación detectada:**
- Lines 1-11: Imports idénticos
- Lines 78-93 / 38-52: Lógica de formato de respuesta idéntica

**Solución:** Extraer lógica común a clase base o función utilitaria.

---

### P1-5: ESLint Config Deprecated

**Advertencia detectada:**
```
ESLint Config Inspector is disabled because you're using eslintrc, 
which is deprecated. Consider migrating to the flat config.
```

**Solución:** Migrar `.eslintrc.*` a `eslint.config.js` (flat config format).

---

## 🟡 HALLAZGOS P2 - MEDIA PRIORIDAD

### P2-1: Duplicación Interna en Pagination DTO

**Ubicación:** [pagination.dto.ts](../apps/api/src/common/dto/pagination.dto.ts)
- Lines 63-76 vs Lines 88-101 (13 líneas, 88 tokens)

**Solución:** Refactorizar a método reutilizable.

---

### P2-2: Duplicación en Logger Service

**Ubicación:** [logger.service.ts](../apps/api/src/lib/logging/logger.service.ts)
- Lines 171-185 vs Lines 197-211 (14 líneas, 114 tokens)

**Solución:** Extraer a método privado reutilizable.

---

### P2-3: Imports Similares en Controllers

**Archivos afectados:**
- clientes.controller.ts
- weather.controller.ts
- certificaciones.controller.ts
- checklists.controller.ts

**Patrón duplicado:** Decorators de Swagger, guards, pipes.

**Solución:** Crear decorador compuesto `@ApiController()`.

---

## 📋 PLAN DE SPRINTS

### 🚀 SPRINT 1: Unificación de Enums (P0)

**Objetivo:** Consolidar enums duplicados y alinear frontend/backend.

| # | Tarea | Archivos | Tamaño | PR |
|---|-------|----------|--------|-----|
| 1.1 | Crear `user-role.enum.ts` canónico | `common/enums/user-role.enum.ts` | S | `fix/enum-userrole-canonical` |
| 1.2 | Actualizar 4 archivos backend | roles.decorator.ts, security.config.ts, permissions.interface.ts, admin-legacy.dto.ts | S | (mismo PR) |
| 1.3 | Añadir `ADMINISTRATIVO` a frontend | user.model.ts | XS | `fix/fe-userrole-admin` |
| 1.4 | Consolidar OrdenEstado | Eliminar de update-orden.dto.ts, shared-types.ts | M | `fix/enum-ordenestado-canonical` |
| 1.5 | Crear PlaneacionEstado en BE | `planeacion/domain/enums/` | S | `feat/be-planeacion-estado-enum` |

**Estimación:** 2-3 horas  
**PRs:** 4 small

---

### 🚀 SPRINT 2: Limpieza de Types (P1)

| # | Tarea | Archivos | Tamaño | PR |
|---|-------|----------|--------|-----|
| 2.1 | Tipar HES repository | hes.repository.ts | M | `fix/hes-repository-types` |
| 2.2 | Eliminar Zod schemas deprecated | 8 archivos | S | `refactor/remove-deprecated-zod` |
| 2.3 | Tipar componentes tabla FE | data-table, advanced-table | M | `fix/fe-table-generics` |

**Estimación:** 3-4 horas  
**PRs:** 3 medium

---

### 🚀 SPRINT 3: DRY & Code Health (P2)

| # | Tarea | Archivos | Tamaño | PR |
|---|-------|----------|--------|-----|
| 3.1 | Consolidar exception filters | common/filters/ | S | `refactor/exception-filters-dry` |
| 3.2 | Consolidar pagination DTO | pagination.dto.ts | XS | `refactor/pagination-dto-dry` |
| 3.3 | Migrar ESLint flat config | raíz | S | `chore/eslint-flat-config` |

**Estimación:** 2 horas  
**PRs:** 3 small

---

## 📊 RESUMEN DE DUPLICACIÓN (jscpd)

| Métrica | Valor |
|---------|-------|
| Archivos analizados | 852 |
| Líneas totales | 84,245 |
| Tokens totales | 608,596 |
| **Clones encontrados** | **105** |
| Líneas duplicadas | 1,243 (1.48%) |
| Tokens duplicados | 8,242 (1.35%) |

**Evaluación:** Duplicación por debajo del umbral típico (5%), pero hay oportunidades de consolidación.

---

## 🔧 COMANDOS DE VERIFICACIÓN

```bash
# Verificación completa
pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run build

# Análisis de duplicación
pnpm run duplication

# Build solo backend
pnpm -C apps/api run build

# Build solo frontend
pnpm -C apps/web run build
```

---

## 📂 ESTRUCTURA DE ARCHIVOS CANÓNICOS PROPUESTA

```
apps/api/src/
├── common/
│   └── enums/
│       ├── index.ts
│       └── user-role.enum.ts  ← NUEVO: Canónico para UserRole
├── modules/
│   ├── ordenes/
│   │   └── domain/
│   │       └── orden-state-machine.ts  ← CANÓNICO: OrdenEstado
│   └── planeacion/
│       └── domain/
│           └── enums/
│               └── planeacion-estado.enum.ts  ← NUEVO
```

---

## ✅ CHECKLIST POST-IMPLEMENTACIÓN

Después de cada Sprint, verificar:

- [ ] `pnpm run lint` pasa
- [ ] `pnpm run typecheck` pasa
- [ ] `pnpm run test` pasa (204+ tests)
- [ ] `pnpm run build` genera artifacts
- [ ] No hay nuevos warnings de TypeScript
- [ ] Git diff limpio después de merge

---

**Generado automáticamente por auditoría de GitHub Copilot**  
**Próximo paso:** Ejecutar Sprint 1 - Unificación de Enums
