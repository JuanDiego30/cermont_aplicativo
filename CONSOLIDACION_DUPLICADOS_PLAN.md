# 🔧 PLAN DE CONSOLIDACIÓN DE DUPLICADOS

**Fecha:** 2024-12-22  
**Estado:** ✅ Listo para ejecutar

---

## 📊 **ANÁLISIS COMPLETO**

### **✅ Ya Consolidado:**
- `common/domain/exceptions/` - Existe y tiene ValidationError y BusinessRuleViolationError
- `common/domain/value-objects/` - Existe y tiene Email y Password
- `archivado` - Ya usa common
- `cierre-administrativo` - Ya usa common
- `auth` - Ya usa common (según index.ts)
- `admin` - Ya usa common (según index.ts, pero tiene archivos propios)

### **❌ Necesita Consolidación:**
- `alertas` - Tiene excepciones propias
- `checklists` - Tiene excepciones propias
- `costos` - Tiene excepciones propias
- `admin` - Tiene Email y Password propios (aunque index.ts dice que usa common)

---

## 🎯 **ACCIÓN 1: Actualizar Imports de Excepciones**

### **Módulos a actualizar:**
1. `alertas`
2. `checklists`
3. `costos`

### **Cambio:**
```typescript
// ANTES:
import { ValidationError } from '../exceptions';

// DESPUÉS:
import { ValidationError } from '../../../../common/domain/exceptions';
```

---

## 🎯 **ACCIÓN 2: Actualizar Imports de Value Objects**

### **Módulos a actualizar:**
1. `admin` - Verificar si realmente usa common o tiene propios

### **Cambio:**
```typescript
// ANTES:
import { Email } from '../value-objects/email.vo';

// DESPUÉS:
import { Email } from '../../../../common/domain/value-objects';
```

---

## 🎯 **ACCIÓN 3: Eliminar Archivos Duplicados**

### **Archivos a eliminar:**

#### **Excepciones:**
- `apps/api/src/modules/alertas/domain/exceptions/validation.error.ts`
- `apps/api/src/modules/alertas/domain/exceptions/business-rule-violation.error.ts`
- `apps/api/src/modules/checklists/domain/exceptions/validation.error.ts`
- `apps/api/src/modules/checklists/domain/exceptions/business-rule-violation.error.ts`
- `apps/api/src/modules/costos/domain/exceptions/validation.error.ts`
- `apps/api/src/modules/costos/domain/exceptions/business-rule-violation.error.ts`

#### **Value Objects (si admin tiene propios):**
- `apps/api/src/modules/admin/domain/value-objects/email.vo.ts` (si no se usa)
- `apps/api/src/modules/admin/domain/value-objects/password.vo.ts` (si no se usa)

#### **DTOs Legacy:**
- `apps/api/src/modules/checklists/dto/create-checklist.dto.ts`

---

## 🎯 **ACCIÓN 4: Actualizar Index Files**

Actualizar los archivos `index.ts` de excepciones y value-objects en cada módulo.

---

## 🎯 **ACCIÓN 5: Revisar Repositorios Duplicados**

Revisar `archivado.repository.ts` vs `archived-order.repository.ts` para determinar si son duplicados.

---

## ✅ **CHECKLIST DE EJECUCIÓN**

- [ ] Actualizar imports en `alertas`
- [ ] Actualizar imports en `checklists`
- [ ] Actualizar imports en `costos`
- [ ] Verificar y actualizar imports en `admin` (si tiene propios)
- [ ] Eliminar archivos de excepciones duplicados
- [ ] Eliminar archivos de value objects duplicados (si aplica)
- [ ] Eliminar DTOs legacy
- [ ] Actualizar archivos index.ts
- [ ] Verificar que no hay errores de compilación
- [ ] Ejecutar tests

---

**PRÓXIMO PASO:** Ejecutar las acciones en orden

