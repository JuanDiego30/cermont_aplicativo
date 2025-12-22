# 🎯 **PROMPT MAESTRO PARA REFACTORIZACIÓN DE `/checklists` - CERMONT APLICATIVO**

**Versión:** 2.0 (Mejorado)  
**Fecha:** 2024-12-22  
**Estado:** ✅ Listo para ejecución completa

---

## 📋 **CONTEXTO Y MEJORAS DEL PROMPT**

### **Mejoras Implementadas:**

1. ✅ **Análisis del código actual** - Revisado y documentado
2. ✅ **Estructura Prisma clara** - ChecklistTemplate vs ChecklistEjecucion
3. ✅ **Domain Events** - Para integración con otros módulos
4. ✅ **Validaciones robustas** - Value Objects con reglas de negocio
5. ✅ **Testing strategy** - Unit, Integration, E2E
6. ✅ **Performance** - Paginación, índices, evitar N+1
7. ✅ **Consistencia** - Mismo patrón que `/alertas` y `/admin`

---

## 🎯 **OBJETIVOS DE REFACTORIZACIÓN**

1. ✅ **Domain-Driven Design (DDD)** completo
2. ✅ **Clean Architecture** con separación de capas
3. ✅ **SOLID Principles** en todas las capas
4. ✅ **Rich Domain Model** (no anémico)
5. ✅ **TypeScript estricto** (0 `any` en código crítico)
6. ✅ **Validación robusta** (Value Objects + DTOs)
7. ✅ **Domain Events** para desacoplamiento
8. ✅ **Testing completo** (>90% coverage)
9. ✅ **Performance optimizado** (paginación, índices)
10. ✅ **Documentación completa** (JSDoc + Swagger)

---

## 📊 **FASE 1: ANÁLISIS Y AUDITORÍA (1 día)**

### **Task 1.1: Auditoría Completa**

**Entregables:**
- `CHECKLISTS_AUDIT_REPORT.md` - Análisis de violaciones SOLID/DDD
- `CHECKLISTS_ARCHITECTURE_DIAGRAM.md` - Diagrama de arquitectura actual vs objetivo
- `CHECKLISTS_BUSINESS_FLOWS.md` - Flujos de negocio documentados

---

## 🏗️ **FASE 2: DOMAIN LAYER (3 días)**

### **Task 2.1: Value Objects**

**Implementar:**
- `ChecklistId.vo.ts` - UUID v4
- `ChecklistItemId.vo.ts` - UUID v4
- `ChecklistStatus.vo.ts` - DRAFT | ACTIVE | COMPLETED | ARCHIVED
- `OrdenId.vo.ts` - Referencia externa (UUID)

**Características:**
- Inmutabilidad con `Object.freeze()`
- Validaciones estrictas
- Métodos `equals()`, `toString()`, `toJSON()`

### **Task 2.2: Entities**

**Implementar:**
- `ChecklistItem.entity.ts` - Item individual
  - `id: ChecklistItemId`
  - `label: string`
  - `isRequired: boolean`
  - `isChecked: boolean`
  - `checkedAt?: Date`
  - `observaciones?: string`
  - Métodos: `toggle()`, `markAsChecked()`, `uncheck()`

- `Checklist.entity.ts` - Aggregate Root
  - `id: ChecklistId`
  - `name: string`
  - `description?: string`
  - `status: ChecklistStatus`
  - `tipo?: string`
  - `ordenId?: string` (si está instanciado)
  - `ejecucionId?: string` (si está instanciado)
  - `items: ChecklistItem[]`
  - `createdAt`, `updatedAt`
  - Métodos de negocio:
    - `createTemplate()`
    - `addItem()`
    - `activate()`
    - `assignToOrden()`
    - `assignToEjecucion()`
    - `toggleItem()`
    - `getCompletionRatio()`
    - `completeIfAllItemsDone()`
    - `archive()`

### **Task 2.3: Domain Events**

**Implementar:**
- `ChecklistCreatedEvent`
- `ChecklistAssignedEvent`
- `ChecklistItemToggledEvent`
- `ChecklistCompletedEvent`

### **Task 2.4: Repository Interfaces**

**Implementar:**
- `IChecklistRepository` - Interfaz completa
- `CHECKLIST_REPOSITORY` - Token de inyección

---

## 🧠 **FASE 3: APPLICATION LAYER (4 días)**

### **Task 3.1: Use Cases Refactorizados**

**Implementar:**
1. `CreateChecklistUseCase` - Crear plantilla
2. `ListChecklistsUseCase` - Listar con filtros y paginación
3. `AssignChecklistToOrdenUseCase` - Asignar a orden
4. `AssignChecklistToEjecucionUseCase` - Asignar a ejecución
5. `GetChecklistsByOrdenUseCase` - Obtener por orden
6. `GetChecklistsByEjecucionUseCase` - Obtener por ejecución
7. `ToggleChecklistItemUseCase` - Toggle item
8. `UpdateChecklistItemUseCase` - Actualizar item (observaciones)
9. `CompleteChecklistUseCase` - Completar checklist manualmente
10. `ArchiveChecklistUseCase` - Archivar checklist

### **Task 3.2: DTOs y Validación**

**Implementar:**
- `CreateChecklistDto` - Con validación Zod + class-validator
- `ChecklistResponseDto` - DTO de respuesta
- `AssignChecklistDto` - Asignar a orden/ejecución
- `ToggleItemDto` - Toggle item
- `UpdateItemDto` - Actualizar item
- `ListChecklistsQueryDto` - Filtros y paginación

### **Task 3.3: Mappers**

**Implementar:**
- `ChecklistMapper` - Domain ↔ DTO
- `ChecklistItemMapper` - Domain ↔ DTO

---

## 🏗️ **FASE 4: INFRASTRUCTURE LAYER (3 días)**

### **Task 4.1: Repository Prisma**

**Implementar:**
- `ChecklistRepository` - Implementación completa
- `ChecklistPrismaMapper` - Prisma ↔ Domain
- Queries optimizadas (evitar N+1)
- Paginación eficiente

### **Task 4.2: Controllers**

**Implementar:**
- `ChecklistsController` - Endpoints HTTP
- Swagger documentation completa
- Validación de entrada
- Manejo de errores

---

## ✅ **FASE 5: TESTING (2 días)**

### **Task 5.1: Tests Unitarios**
- Value Objects (100% coverage)
- Entities (100% coverage)
- Use Cases (95% coverage)

### **Task 5.2: Tests de Integración**
- Repository Prisma
- Mappers

### **Task 5.3: Tests E2E**
- Endpoints principales

---

## 📚 **FASE 6: DOCUMENTACIÓN (1 día)**

### **Task 6.1: Documentación Técnica**
- `CHECKLISTS_ARCHITECTURE.md`
- `CHECKLISTS_API_SPEC.md`
- `CHECKLISTS_TESTING_STRATEGY.md`

---

## 🎯 **MÉTRICAS DE ÉXITO**

| Métrica | Target |
|---------|--------|
| Code Coverage | >90% |
| SOLID Violations | 0 |
| DDD Compliance | 100% |
| Type Safety | 0 `any` en prod |
| Performance | <200ms queries |
| Documentation | 100% JSDoc |

---

## ✅ **CHECKLIST FINAL**

- [ ] Value Objects implementados y testeados
- [ ] Entities con Rich Domain Model
- [ ] Domain Events publicados
- [ ] 10 Use Cases orquestando lógica
- [ ] DTOs validados
- [ ] Mappers bidireccionales
- [ ] Repository con queries optimizadas
- [ ] Controller con Swagger
- [ ] Tests unitarios (>90%)
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Documentación completa
- [ ] Zero TypeScript errors
- [ ] Production-ready code

---

**¿LISTO PARA EJECUTAR? 🚀**

