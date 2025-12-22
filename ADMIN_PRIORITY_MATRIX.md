# 📊 MATRIZ DE PRIORIZACIÓN - REFACTORIZACIÓN `/admin`

**Fecha:** 2024-12-22

---

## 🎯 MATRIZ IMPACTO vs ESFUERZO

```
        ALTO IMPACTO
            │
            │  [P0-1]  [P0-2]
            │   🔴      🔴
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

### **P0-1: Cambiar bcrypt Rounds a 12**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🔴 CRÍTICO (Seguridad) |
| **Esfuerzo** | 🟢 BAJO (5 min) |
| **Riesgo** | 🟢 BAJO |
| **Ubicaciones** | `password.vo.ts:19`, `admin.service.ts:39` |

**Acción:**
```typescript
// Cambiar de:
private static readonly SALT_ROUNDS = 10;

// A:
private static readonly SALT_ROUNDS = 12;
```

**Justificación:**
- OWASP recomienda mínimo 12 rounds
- Vulnerabilidad de seguridad crítica
- Cambio trivial

---

### **P0-2: Deprecar/Migrar AdminService**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🔴 CRÍTICO (Mantenibilidad) |
| **Esfuerzo** | 🟡 MEDIO (2-3 horas) |
| **Riesgo** | 🟡 MEDIO (verificar que no se use) |
| **Ubicaciones** | `admin.service.ts` |

**Acción:**
1. Verificar dónde se usa `AdminService`
2. Migrar usos a Use Cases
3. Marcar como `@deprecated`
4. Eliminar después de migración completa

**Justificación:**
- Duplicación con Use Cases
- Viola DIP (usa Prisma directamente)
- Confusión sobre qué usar

---

## 🟠 PRIORIDAD P1 (ALTO - Hacer Pronto)

### **P1-1: Agregar Object.freeze en Value Objects**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟠 ALTO (Inmutabilidad) |
| **Esfuerzo** | 🟢 BAJO (30 min) |
| **Riesgo** | 🟢 BAJO |
| **Ubicaciones** | Todos los VOs (4 archivos) |

**Acción:**
```typescript
private constructor(...) {
  this.value = ...;
  Object.freeze(this);  // ✅ Agregar esto
}
```

**Justificación:**
- Garantiza inmutabilidad
- Previene bugs
- Cambio simple

---

### **P1-2: Crear Excepciones de Dominio Custom**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟠 ALTO (Type Safety) |
| **Esfuerzo** | 🟢 BAJO (1 hora) |
| **Riesgo** | 🟢 BAJO |
| **Ubicaciones** | Domain layer |

**Acción:**
1. Crear `ValidationError` class
2. Crear `BusinessRuleViolationError` class
3. Reemplazar `Error` genérico

**Justificación:**
- Mejor manejo de errores
- Type safety
- Distingue tipos de error

---

### **P1-3: Eliminar uso de `any`**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟠 ALTO (Type Safety) |
| **Esfuerzo** | 🟡 MEDIO (2 horas) |
| **Riesgo** | 🟢 BAJO |
| **Ubicaciones** | Múltiples use cases |

**Acción:**
```typescript
// Cambiar de:
private publishDomainEvents(user: any): void {
  events.forEach((event: any) => { ... });
}

// A:
private publishDomainEvents(user: UserEntity): void {
  const events = user.getDomainEvents();
  events.forEach((event: UserDomainEvent) => { ... });
}
```

**Justificación:**
- Type safety
- Mejor autocompletado
- Previene errores

---

### **P1-4: Estandarizar Roles del Sistema**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟠 ALTO (Consistencia) |
| **Esfuerzo** | 🟡 MEDIO (3 horas) |
| **Riesgo** | 🟡 MEDIO (cambios en BD) |
| **Ubicaciones** | `user-role.vo.ts`, BD, otros módulos |

**Acción:**
1. Decidir: ¿Mantener roles actuales o cambiar?
2. Si cambiar: Migración de BD
3. Actualizar todos los lugares

**Justificación:**
- Inconsistencia actual
- Confusión
- Requiere decisión de negocio

---

## 🟡 PRIORIDAD P2 (MEDIO - Hacer Después)

### **P2-1: Agregar Transacciones**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟡 MEDIO (Consistencia) |
| **Esfuerzo** | 🟡 MEDIO (2 horas) |
| **Riesgo** | 🟡 MEDIO |
| **Ubicaciones** | Use Cases críticos |

**Acción:**
- Agregar transacciones en operaciones críticas
- Ej: Cambio de rol, desactivación

---

### **P2-2: Abstraer Prisma en Event Handlers**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟡 MEDIO (DIP) |
| **Esfuerzo** | 🟡 MEDIO (2 horas) |
| **Riesgo** | 🟢 BAJO |
| **Ubicaciones** | Event Handlers |

**Acción:**
- Crear `IAuditRepository`
- Implementar con Prisma
- Inyectar en handlers

---

### **P2-3: Mejorar Validación de Permisos**

| Métrica | Valor |
|---------|-------|
| **Impacto** | 🟡 MEDIO (Seguridad) |
| **Esfuerzo** | 🟢 BAJO (1 hora) |
| **Riesgo** | 🟢 BAJO |
| **Ubicaciones** | Use Cases |

**Acción:**
- Agregar validación explícita de permisos en cada use case
- Centralizar lógica de permisos

---

## 📋 PLAN DE EJECUCIÓN RECOMENDADO

### **Sprint 1 (Día 1-2): Críticos**
- ✅ P0-1: Cambiar bcrypt rounds
- ✅ P0-2: Deprecar AdminService

### **Sprint 2 (Día 3-4): Altos**
- ✅ P1-1: Object.freeze en VOs
- ✅ P1-2: Excepciones custom
- ✅ P1-3: Eliminar `any`

### **Sprint 3 (Día 5): Decisión**
- ⚠️ P1-4: Estandarizar roles (requiere decisión)

### **Sprint 4 (Día 6-7): Medios**
- ⚠️ P2-1: Transacciones
- ⚠️ P2-2: Abstraer Prisma en handlers
- ⚠️ P2-3: Validación permisos

---

## 🎯 ROI (Return on Investment)

| Tarea | Impacto | Esfuerzo | ROI | Prioridad |
|-------|---------|----------|-----|-----------|
| P0-1: bcrypt rounds | 🔴 CRÍTICO | 🟢 BAJO | ⭐⭐⭐⭐⭐ | 1 |
| P0-2: Deprecar AdminService | 🔴 CRÍTICO | 🟡 MEDIO | ⭐⭐⭐⭐ | 2 |
| P1-1: Object.freeze | 🟠 ALTO | 🟢 BAJO | ⭐⭐⭐⭐⭐ | 3 |
| P1-2: Excepciones custom | 🟠 ALTO | 🟢 BAJO | ⭐⭐⭐⭐ | 4 |
| P1-3: Eliminar `any` | 🟠 ALTO | 🟡 MEDIO | ⭐⭐⭐ | 5 |
| P1-4: Estandarizar roles | 🟠 ALTO | 🟡 MEDIO | ⭐⭐⭐ | 6 |
| P2-1: Transacciones | 🟡 MEDIO | 🟡 MEDIO | ⭐⭐ | 7 |
| P2-2: Abstraer Prisma | 🟡 MEDIO | 🟡 MEDIO | ⭐⭐ | 8 |
| P2-3: Validación permisos | 🟡 MEDIO | 🟢 BAJO | ⭐⭐⭐ | 9 |

---

## ✅ CONCLUSIÓN

**Orden de ejecución recomendado:**
1. P0-1 (bcrypt) - Inmediato
2. P0-2 (AdminService) - Pronto
3. P1-1, P1-2, P1-3 - Siguiente
4. P1-4 (roles) - Requiere decisión
5. P2-* - Después

**ROI Total:** Alto (muchos cambios de bajo esfuerzo con alto impacto)

