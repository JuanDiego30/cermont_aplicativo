# 📊 MATRIZ DE PROBLEMAS Y PRIORIZACIÓN - MÓDULO `/alertas`

**Fecha:** 2024-12-22

---

## 🎯 MATRIZ IMPACTO vs ESFUERZO

```
        ALTO IMPACTO
            │
            │  [P0-1]  [P0-2]  [P0-3]
            │   🔴      🔴      🔴
            │
            │  [P1-1]  [P1-2]  [P1-3]
            │   🟠      🟠      🟠
            │
            │  [P2-1]  [P2-2]
            │   🟡      🟡
            │
            └─────────────────────────────
              BAJO ESFUERZO    ALTO ESFUERZO
```

---

## 🔴 PRIORIDAD P0 (CRÍTICO - Hacer Primero)

### **P0-1: God Object - AlertasService**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🔴 CRÍTICO (Mantenibilidad) |
| **Esfuerzo** | 🔴 ALTO (3-4 días) |
| **Riesgo** | 🟡 MEDIO |
| **Ubicación** | `alertas.service.ts` |

**Problema:**
- Service con 11 métodos (4 CRONs + 5 CRUD + 2 privados)
- Múltiples responsabilidades mezcladas
- Viola SRP (Single Responsibility Principle)

**Solución:**
- Separar en Use Cases (Application Layer)
- Mover lógica de negocio a Domain Entities
- Crear servicios específicos por responsabilidad

**Justificación:**
- Base para toda la refactorización
- Sin esto, no se puede avanzar

---

### **P0-2: Sin Separación de Capas (DDD)**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🔴 CRÍTICO (Arquitectura) |
| **Esfuerzo** | 🔴 ALTO (4-5 días) |
| **Riesgo** | 🟡 MEDIO |
| **Ubicación** | Todo el módulo |

**Problema:**
- No existe Domain Layer
- No existe Application Layer
- Todo está en Infrastructure (service)

**Solución:**
- Crear estructura DDD completa
- Domain: Entities, VOs, Events, Repository Interfaces
- Application: Use Cases, DTOs, Mappers
- Infrastructure: Controllers, Repositories, Services externos

**Justificación:**
- Requisito fundamental para arquitectura DDD
- Sin esto, no hay separación de responsabilidades

---

### **P0-3: Dependencias Concretas (Prisma Directo)**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🔴 CRÍTICO (Testabilidad, DIP) |
| **Esfuerzo** | 🟡 MEDIO (2 días) |
| **Riesgo** | 🟢 BAJO |
| **Ubicación** | `alertas.service.ts` |

**Problema:**
- Service usa Prisma directamente
- Viola DIP (Dependency Inversion Principle)
- Imposible testear sin mock de Prisma

**Solución:**
- Crear Repository Interfaces (Domain)
- Implementar Repositories con Prisma (Infrastructure)
- Inyectar interfaces en Use Cases

**Justificación:**
- Requisito para testabilidad
- Permite cambiar implementación sin afectar lógica

---

## 🟠 PRIORIDAD P1 (ALTO - Hacer Pronto)

### **P1-1: Sin Sistema de Queue**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟠 ALTO (Performance) |
| **Esfuerzo** | 🟡 MEDIO (2 días) |
| **Riesgo** | 🟡 MEDIO |
| **Ubicación** | Todo el módulo |

**Problema:**
- Envío síncrono de notificaciones
- Bloquea requests si hay muchos registros
- No escala

**Solución:**
- Implementar Bull/BullMQ
- Queue para procesamiento asíncrono
- Workers para envío de notificaciones

**Justificación:**
- Requisito de performance (RNF-1)
- Permite escalabilidad

---

### **P1-2: Sin Retry Mechanism**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟠 ALTO (Reliability) |
| **Esfuerzo** | 🟡 MEDIO (1-2 días) |
| **Riesgo** | 🟢 BAJO |
| **Ubicación** | Queue/Workers |

**Problema:**
- Fallos en envío no se reintentan
- Alertas se pierden si falla el primer intento

**Solución:**
- Retry automático (3 intentos)
- Backoff exponencial
- Logs de fallos

**Justificación:**
- Requisito de reliability (RNF-3)
- Mejora experiencia de usuario

---

### **P1-3: Sin Validación de Entrada**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟠 ALTO (Security) |
| **Esfuerzo** | 🟢 BAJO (1 día) |
| **Riesgo** | 🟢 BAJO |
| **Ubicación** | Controller/Use Cases |

**Problema:**
- No hay DTOs con validación
- Entrada no validada
- Posible inyección de datos

**Solución:**
- Crear DTOs con class-validator + Zod
- Validación en Controller y Use Cases
- Mensajes de error descriptivos

**Justificación:**
- Requisito de security (RNF-5)
- Previene errores y ataques

---

## 🟡 PRIORIDAD P2 (MEDIO - Hacer Después)

### **P2-1: Sin Tests**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟡 MEDIO (Calidad) |
| **Esfuerzo** | 🔴 ALTO (3-4 días) |
| **Riesgo** | 🟢 BAJO |
| **Ubicación** | Todo el módulo |

**Problema:**
- No hay tests unitarios
- No hay tests de integración
- No hay tests E2E

**Solución:**
- Tests unitarios para VOs, Entities, Use Cases
- Tests de integración para Repositories
- Tests E2E para Controllers

**Justificación:**
- Requisito de maintainability (RNF-6)
- Previene regresiones

---

### **P2-2: Sin Rate Limiting**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟡 MEDIO (Security) |
| **Esfuerzo** | 🟢 BAJO (1 hora) |
| **Riesgo** | 🟢 BAJO |
| **Ubicación** | Controller |

**Problema:**
- Endpoints sin protección contra spam
- Posible abuso

**Solución:**
- Agregar ThrottlerGuard
- Límites por endpoint
- Configuración por rol

**Justificación:**
- Requisito de security (RNF-5)
- Previene abusos

---

## 📋 PLAN DE EJECUCIÓN RECOMENDADO

### **Sprint 1 (Semana 1): Arquitectura Base**
- ✅ P0-2: Crear estructura DDD
- ✅ P0-3: Crear Repository Interfaces
- ✅ P0-1: Refactorizar Service a Use Cases

### **Sprint 2 (Semana 2): Domain Layer**
- ✅ Crear Value Objects
- ✅ Crear Entities
- ✅ Crear Domain Events

### **Sprint 3 (Semana 3): Application Layer**
- ✅ Crear Use Cases
- ✅ Crear DTOs con validación
- ✅ Crear Mappers

### **Sprint 4 (Semana 4): Infrastructure Layer**
- ✅ Implementar Repositories
- ✅ Refactorizar Controller
- ✅ P1-1: Implementar Queue System
- ✅ P1-2: Implementar Retry

### **Sprint 5 (Semana 5): Funcionalidades**
- ✅ Implementar canales de notificación
- ✅ Implementar preferencias
- ✅ Implementar WebSockets

### **Sprint 6 (Semana 6): Testing y Mejoras**
- ✅ P2-1: Tests unitarios
- ✅ Tests de integración
- ✅ Tests E2E
- ✅ P2-2: Rate limiting
- ✅ Documentación

---

## 🎯 ROI (Return on Investment)

| Tarea | Impacto | Esfuerzo | ROI | Prioridad |
|-------|---------|----------|-----|-----------|
| P0-1: God Object | 🔴 CRÍTICO | 🔴 ALTO | ⭐⭐⭐⭐ | 1 |
| P0-2: Separación Capas | 🔴 CRÍTICO | 🔴 ALTO | ⭐⭐⭐⭐⭐ | 2 |
| P0-3: Dependencias | 🔴 CRÍTICO | 🟡 MEDIO | ⭐⭐⭐⭐⭐ | 3 |
| P1-1: Queue System | 🟠 ALTO | 🟡 MEDIO | ⭐⭐⭐⭐ | 4 |
| P1-2: Retry | 🟠 ALTO | 🟡 MEDIO | ⭐⭐⭐⭐ | 5 |
| P1-3: Validación | 🟠 ALTO | 🟢 BAJO | ⭐⭐⭐⭐⭐ | 6 |
| P2-1: Tests | 🟡 MEDIO | 🔴 ALTO | ⭐⭐⭐ | 7 |
| P2-2: Rate Limiting | 🟡 MEDIO | 🟢 BAJO | ⭐⭐⭐⭐ | 8 |

---

## ✅ CONCLUSIÓN

**Orden de ejecución recomendado:**
1. P0-2, P0-3 (Arquitectura base) - Semana 1
2. P0-1 (Refactorizar Service) - Semana 1-2
3. Domain Layer completo - Semana 2
4. Application Layer completo - Semana 3
5. Infrastructure Layer + Queue + Retry - Semana 4
6. Funcionalidades adicionales - Semana 5
7. Testing y mejoras - Semana 6

**ROI Total:** Alto (muchos problemas críticos que bloquean el desarrollo)

