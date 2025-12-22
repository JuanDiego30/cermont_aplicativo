# 🎯 **PROMPT MAESTRO PARA REFACTORIZACIÓN DE `/costos` - CERMONT APLICATIVO**

**Versión:** 2.0 (Mejorado)  
**Fecha:** 2024-12-22  
**Estado:** ✅ Listo para ejecución completa

---

## 📋 **CONTEXTO Y MEJORAS DEL PROMPT**

### **Mejoras Implementadas:**

1. ✅ **Análisis del código actual** - Revisado y documentado
2. ✅ **Estructura Prisma clara** - Modelo `Cost` identificado
3. ✅ **Decimal.js obligatorio** - Precisión financiera crítica
4. ✅ **Domain Services** - Para cálculos complejos
5. ✅ **Specifications Pattern** - Reglas de negocio reutilizables
6. ✅ **Budget Validation** - Validación automática de presupuesto
7. ✅ **Export functionality** - CSV/Excel para contabilidad
8. ✅ **Consistencia** - Mismo patrón que `/alertas` y `/checklists`

---

## 🎯 **OBJETIVOS DE REFACTORIZACIÓN**

1. ✅ **Domain-Driven Design (DDD)** completo
2. ✅ **Clean Architecture** con separación de capas
3. ✅ **SOLID Principles** en todas las capas
4. ✅ **Rich Domain Model** (no anémico)
5. ✅ **TypeScript estricto** (0 `any` en código crítico)
6. ✅ **Precisión financiera** (Decimal.js obligatorio, NO number)
7. ✅ **Validación presupuestal** automática
8. ✅ **Domain Events** para desacoplamiento
9. ✅ **Domain Services** para cálculos complejos
10. ✅ **Specifications** para reglas de negocio
11. ✅ **Testing completo** (>85% coverage)
12. ✅ **Export functionality** (CSV, Excel)
13. ✅ **Auditoría completa** (quién, cuándo, por qué)

---

## 📊 **FASE 1: ANÁLISIS Y AUDITORÍA (1 día)**

### **Task 1.1: Auditoría Completa**

**Entregables:**
- `COSTOS_AUDIT_REPORT.md` - Análisis de violaciones SOLID/DDD
- `COSTOS_ARCHITECTURE_DIAGRAM.md` - Diagrama de arquitectura actual vs objetivo
- `COSTOS_BUSINESS_FLOWS.md` - Flujos de negocio documentados
- `COSTOS_FINANCIAL_RISKS.md` - Análisis de riesgos financieros

---

## 🏗️ **FASE 2: DOMAIN LAYER (4 días)**

### **Task 2.1: Value Objects**

**Implementar:**
- `CostoId.vo.ts` - UUID v4
- `Money.vo.ts` - **CRÍTICO: Usar Decimal.js, NO number**
- `CostoType.vo.ts` - MATERIAL, MANO_OBRA, TRANSPORTE, EQUIPO, SUBCONTRATO, OTROS
- `CostoCategory.vo.ts` - DIRECTO, INDIRECTO
- `BudgetLimit.vo.ts` - Límite presupuestal con alertas
- `CostVariance.vo.ts` - Desviación vs presupuesto

**Características:**
- Inmutabilidad con `Object.freeze()`
- Validaciones estrictas
- **Decimal.js obligatorio para Money**
- Métodos `equals()`, `toString()`, `toJSON()`

### **Task 2.2: Entities**

**Implementar:**
- `Costo.entity.ts` - Aggregate Root
  - Validaciones de monto (> 0)
  - Validación de presupuesto
  - Restricción de edición (>30 días)
  - Domain events
  - Métodos de negocio

### **Task 2.3: Domain Services**

**Implementar:**
- `CostCalculatorService` - Cálculos financieros complejos
- `BudgetValidatorService` - Validación de presupuesto

### **Task 2.4: Specifications**

**Implementar:**
- `BudgetNotExceededSpecification`
- `ValidCostTypeSpecification`
- `CostEditableSpecification`

### **Task 2.5: Domain Events**

**Implementar:**
- `CostoRegisteredEvent`
- `BudgetExceededEvent`
- `CostUpdatedEvent`
- `CostDeletedEvent`
- `BudgetAlertTriggeredEvent`

### **Task 2.6: Repository Interfaces**

**Implementar:**
- `ICostoRepository` - Interfaz completa
- `COSTO_REPOSITORY` - Token de inyección

---

## 🧠 **FASE 3: APPLICATION LAYER (5 días)**

### **Task 3.1: Use Cases Refactorizados**

**Implementar:**
1. `RegistrarCostoUseCase` - Registrar con validación presupuestal
2. `UpdateCostoUseCase` - Actualizar (validar 30 días)
3. `DeleteCostoUseCase` - Eliminar (requiere justificación)
4. `GetCostoByIdUseCase` - Obtener por ID
5. `ListCostosUseCase` - Listar con filtros y paginación
6. `ListCostosByOrdenUseCase` - Listar por orden con totales
7. `GetAnalisisCostosUseCase` - Análisis financiero completo
8. `GetBudgetSummaryUseCase` - Resumen presupuestal
9. `CalculateProfitabilityUseCase` - Rentabilidad
10. `ExportCostosUseCase` - Exportar CSV/Excel

### **Task 3.2: DTOs y Validación**

**Implementar:**
- `RegistrarCostoDto` - Con validación Zod + class-validator
- `UpdateCostoDto` - Actualizar costo
- `CostoResponseDto` - DTO de respuesta
- `CostoAnalysisResponseDto` - Análisis financiero
- `BudgetSummaryDto` - Resumen presupuestal
- `ProfitabilityResponseDto` - Rentabilidad
- `CostoQueryDto` - Filtros y paginación

### **Task 3.3: Mappers**

**Implementar:**
- `CostoMapper` - Domain ↔ DTO
- `CostAnalysisMapper` - Domain ↔ DTO

### **Task 3.4: Event Handlers**

**Implementar:**
- `CostoRegisteredHandler` - Auditoría
- `BudgetExceededHandler` - Alertas
- `CostUpdatedHandler` - Auditoría
- `CostDeletedHandler` - Auditoría

### **Task 3.5: Validators**

**Implementar:**
- `BudgetLimitValidator` - Validación presupuestal
- `CostAmountValidator` - Validación de montos

---

## 🏗️ **FASE 4: INFRASTRUCTURE LAYER (4 días)**

### **Task 4.1: Repository Prisma**

**Implementar:**
- `CostoRepository` - Implementación completa
- `CostoPrismaMapper` - Prisma ↔ Domain
- Queries optimizadas (evitar N+1)
- Cálculos con Decimal.js
- Transacciones donde sea necesario

### **Task 4.2: Controllers**

**Implementar:**
- `CostosController` - Endpoints HTTP
- Swagger documentation completa
- Validación de entrada
- Manejo de errores

### **Task 4.3: Exporters**

**Implementar:**
- `CSVExporter` - Exportar a CSV
- `ExcelExporter` - Exportar a Excel (múltiples sheets)

---

## ✅ **FASE 5: TESTING (2 días)**

### **Task 5.1: Tests Unitarios**
- Value Objects (100% coverage, especialmente Money)
- Entities (100% coverage)
- Domain Services (95% coverage)
- Use Cases (90% coverage)

### **Task 5.2: Tests de Integración**
- Repository Prisma
- Mappers
- Validators

### **Task 5.3: Tests E2E**
- Endpoints principales
- Flujo completo de registro → análisis → export

---

## 📚 **FASE 6: DOCUMENTACIÓN (1 día)**

### **Task 6.1: Documentación Técnica**
- `COSTOS_ARCHITECTURE.md`
- `COSTOS_API_SPEC.md`
- `COSTOS_FINANCIAL_CALCULATIONS.md`
- `COSTOS_TESTING_STRATEGY.md`

---

## 🎯 **MÉTRICAS DE ÉXITO**

| Métrica | Target |
|---------|--------|
| Code Coverage | >85% |
| SOLID Violations | 0 |
| DDD Compliance | 100% |
| Type Safety | 0 `any` en prod |
| Financial Precision | 100% Decimal.js |
| Budget Validation | 100% |
| Performance | <200ms queries |
| Documentation | 100% JSDoc |

---

## ⚠️ **REQUISITOS CRÍTICOS**

1. **Decimal.js OBLIGATORIO** - NO usar `number` para dinero
2. **Validación presupuestal** - Antes de guardar
3. **Auditoría completa** - Quién, cuándo, por qué
4. **ISO 4217** - Monedas válidas (COP, USD)
5. **Restricción de edición** - No editar después de 30 días
6. **Justificación obligatoria** - Si excede presupuesto o elimina

---

## ✅ **CHECKLIST FINAL**

- [ ] Value Objects implementados (Money con Decimal.js)
- [ ] Entities con Rich Domain Model
- [ ] Domain Services para cálculos
- [ ] Specifications para reglas
- [ ] Domain Events publicados
- [ ] 10 Use Cases orquestando lógica
- [ ] DTOs validados
- [ ] Mappers bidireccionales
- [ ] Event Handlers funcionando
- [ ] Validators implementados
- [ ] Repository con queries optimizadas
- [ ] Controller con Swagger
- [ ] Exporters (CSV, Excel) funcionando
- [ ] Tests unitarios (>85%)
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Documentación completa
- [ ] Zero TypeScript errors
- [ ] **100% Decimal.js para dinero**
- [ ] Production-ready code

---

**¿LISTO PARA EJECUTAR? 🚀**

