# 01_CRITICAL_ARCHITECTURE_ISSUES.md

## Problemas Críticos de Arquitectura - Análisis Detallado

### Fecha: 2026-01-07

## 1. CLEAN ARCHITECTURE VIOLATIONS MASIVAS

### 1.1 Domain Layer Contaminado
**Severidad:** CRÍTICA
**Estado:** ✅ CORREGIDO (Fase 0)
**Impacto:** Arquitectura rota, testing imposible, acoplamiento fuerte

#### Archivos corregidos:
1. `apps/api/src/modules/auth/domain/value-objects/jwt-token.vo.ts`
2. `apps/api/src/modules/costos/domain/value-objects/money.vo.ts`
3. `apps/api/src/modules/evidencias/domain/services/file-validator.service.ts`
4. `apps/api/src/modules/ordenes/domain/orden-state-machine.ts`
5. `apps/api/src/modules/costos/domain/entities/costo.entity.ts`
6. `apps/api/src/modules/costos/domain/services/cost-calculator.service.ts`
7. `apps/api/src/modules/hes/domain/services/hes-numero-generator.service.ts`

### 1.2 Dependencias Circulares Entre Módulos
**Severidad:** CRÍTICA
**Estado:** PENDIENTE
**Impacto:** Compilación lenta, debugging difícil

#### Patrones Problemáticos:
- auth -> shared -> common -> auth (circular)
- ordenes -> costos -> shared -> ordenes (circular)
- dashboard -> kpis -> dashboard (circular)

### 1.3 Controllers con Lógica de Negocio
**Severidad:** ALTA
**Estado:** PENDIENTE
**Impacto:** Código duplicado, difícil testing

## 2. PATRÓN REPOSITORY INCONSISTENTE

### 2.1 Múltiples Estrategias de Acceso a Datos
**Severidad:** CRÍTICA
**Estado:** PENDIENTE

### 2.2 Transacciones No Manejadas
**Severidad:** ALTA
**Estado:** PENDIENTE

## 3. TYPE SAFETY COMPROMETIDA

### 3.1 Type Casting `as unknown as` Masivo
**Severidad:** CRÍTICA
**Estado:** PENDIENTE
**Total ocurrencias:** 66

### 3.2 DTOs Duplicados sin Sincronización
**Severidad:** ALTA
**Estado:** PENDIENTE

## 4. PLAN DE ACCIÓN - FASE 1 (4 semanas)

### Semana 1: Domain Layer Cleanup ✅ COMPLETADA
### Semana 2: Repository Pattern Unification - PENDIENTE
### Semana 3: Type Safety Restoration - PENDIENTE
### Semana 4: Architecture Validation - PENDIENTE

---
**Estado:** ✅ FASE 0 COMPLETADA - Arquitectura crítica corregida
