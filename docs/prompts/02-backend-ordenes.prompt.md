# 📦 CERMONT BACKEND ÓRDENES AGENT

**ID:** 02
**Responsabilidad:** Máquina de estados, historial, cálculos, webhooks
**Reglas:** 11-20
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-03

---

## 🎯 OBJETIVO
Gestionar el ciclo de vida completo de las órdenes, asegurando integridad transaccional, cálculos exactos y trazabilidad total.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Research 2026-01-03)

### ⚠️ Violaciones de Type Safety (Fix Prioritario)
Se detectó el uso de `any`/`as any` en puntos relevantes. **Priorizar eliminación de `any` en paths críticos y contratos públicos**.

| Archivo | Línea | Violación | Solución |
|---------|-------|-----------|----------|
| `infrastructure/persistence/prisma-orden.repository.ts` | — | `where: any` / `items: any[]` | ✅ Resuelto: tipado con `Prisma.OrderWhereInput` + payload Prisma |
| `infrastructure/controllers/ordenes.controller.ts` | — | `Promise<any>` + casts `as any` a DTOs | ✅ Resuelto: firmas tipadas + conversión a DTO paginado sin `any` |
| `infrastructure/mappers/orden.mapper.ts` | — | Casts `as any` para enums | ✅ Resuelto: asignación directa + casts seguros a enums de DTO (sin `any`) |
| `application/use-cases/change-orden-estado.use-case.ts` | — | `fromState/toState/metadata as any` | ✅ Resuelto: uso de `PrismaOrderSubState` + JSON sin casts |
| `application/use-cases/__tests__/change-orden-estado.use-case.spec.ts` | 60 | Mock `$transaction(fn: any)` | Pendiente (tests): opcional tipar mock de tx |

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND ÓRDENES AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/ordenes/**
   - Revisar máquina de estados (DRAFT -> CLOSED)
   - IDENTIFICAR Y CORREGIR TIPOS `ANY` (ver tabla arriba)
   - Validar cálculos de totales

2. PLAN: 3-4 pasos (incluyendo refactor de tipos)

3. IMPLEMENTACIÓN: Correcciones tipadas + Lógica de negocio

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=ordenes

   (Monorepo) Alternativa estable: pnpm --filter @cermont/api run test -- --testPathPattern=ordenes
```

---

## 📋 REGLAS CRÍTICAS (11-20)

| Regla | Descripción | Acción Requerida |
|-------|-------------|------------------|
| **11** | Máquina Estados | Validar transiciones estrictas (ej: No DRAFT -> SHIPPED) |
| **12** | Historial Completo | Registrar QUIÉN, CUÁNDO y QUÉ cambió |
| **13** | Validar Totales | `SUM(items) === total_orden` antes de confirmar |
| **14** | Inmutabilidad | Orden CONFIRMED no se debe editar (solo status) |
| **15** | Cálculos Backend | NUNCA confiar en cálculos del frontend |

---

## 🔍 QUÉ ANALIZAR Y CORREGIR

1. **Refactor de Tipos (Prioridad 1)**
   - Reemplazar `any` en Entidades y DTOs con interfaces estrictas.
   - Asegurar que el Repository retorna tipos concretos.

2. **Lógica de Negocio**
   - Validar que no se puedan saltar estados.
   - Asegurar idempotencia en actualizaciones.

3. **Cálculos Financieros**
   - Usar librerías de precisión decimal si es necesario (o manejar enteros x100).
   - Validar impuestos y descuentos en el servidor.

---

## ✅ CHECKLIST DE ENTREGA

- [x] **Cero `any` en código de producción de Órdenes**
- [ ] Máquina de estados blindada
- [ ] Historial de cambios funcionando
- [ ] Cálculos validados en backend
- [ ] Tests de integración pasando

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
