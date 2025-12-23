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
5. ✅ **Specifications Pattern** - Para reglas de negocio reutilizables
6. ✅ **Budget Validation** - Validación robusta de presupuesto
7. ✅ **Export functionality** - CSV/Excel para contabilidad
8. ✅ **Testing strategy** - Unit, Integration, E2E con casos financieros
9. ✅ **Performance** - Caching de análisis, queries optimizadas
10. ✅ **Consistencia** - Mismo patrón que `/alertas` y `/checklists`

---

## 🎯 **OBJETIVOS DE REFACTORIZACIÓN**

1. ✅ **Domain-Driven Design (DDD)** completo
2. ✅ **Clean Architecture** con separación de capas
3. ✅ **SOLID Principles** en todas las capas
4. ✅ **Rich Domain Model** (no anémico)
5. ✅ **TypeScript estricto** (0 `any` en código crítico)
6. ✅ **Precisión financiera** (100% Decimal.js, NO `number`)
7. ✅ **Validación de presupuesto** automática
8. ✅ **Domain Events** para desacoplamiento
9. ✅ **Testing completo** (>90% coverage, casos financieros)
10. ✅ **Exportación** (CSV/Excel para contabilidad)
11. ✅ **Auditoría completa** (quién, cuándo, qué, por qué)
12. ✅ **Performance optimizado** (caching, índices)

---

## 📊 **FASE 1: ANÁLISIS Y AUDITORÍA (1 día)**

### **Task 1.1: Auditoría Completa**

**Entregables:**
- `COSTOS_AUDIT_REPORT.md` - Análisis de violaciones SOLID/DDD
- `COSTOS_ARCHITECTURE_DIAGRAM.md` - Diagrama de arquitectura actual vs objetivo
- `COSTOS_BUSINESS_FLOWS.md` - Flujos de negocio documentados
- `COSTOS_FINANCIAL_RISKS.md` - Matriz de riesgos financieros

---

## 🏗️ **FASE 2: DOMAIN LAYER (4 días)**

### **Task 2.1: Value Objects**

**Implementar:**
- `CostoId.vo.ts` - UUID v4
- `Money.vo.ts` - **CRÍTICO: Usa Decimal.js, NO number**
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
1. `RegistrarCostoUseCase` - Registrar con validación de presupuesto
2. `UpdateCostoUseCase` - Actualizar (validar 30 días)
3. `DeleteCostoUseCase` - Eliminar (solo ADMIN/COORDINADOR)
4. `GetCostoByIdUseCase` - Obtener por ID
5. `ListCostosByOrdenUseCase` - Listar por orden con totales
6. `ListCostosUseCase` - Listar con filtros y paginación
7. `GetAnalisisCostosUseCase` - Análisis financiero (con cache)
8. `GetBudgetSummaryUseCase` - Resumen presupuestal
9. `CalculateProfitabilityUseCase` - Rentabilidad (margen, ROI)
10. `ExportCostosUseCase` - Exportar CSV/Excel

### **Task 3.2: DTOs y Validación**

**Implementar:**
- `RegistrarCostoDto` - Con validación Zod + class-validator
- `UpdateCostoDto` - Con validación
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
- `BudgetLimitValidator` - Validación de presupuesto
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
- `CSVExporter` - Exportación CSV
- `ExcelExporter` - Exportación Excel (múltiples sheets)

---

## ✅ **FASE 5: TESTING (3 días)**

### **Task 5.1: Tests Unitarios**
- Value Objects (100% coverage, casos financieros)
- Entities (100% coverage)
- Domain Services (95% coverage)
- Use Cases (95% coverage)

### **Task 5.2: Tests de Integración**
- Repository Prisma
- Mappers
- Validators

### **Task 5.3: Tests E2E**
- Endpoints principales
- Flujos completos

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
| Code Coverage | >90% |
| SOLID Violations | 0 |
| DDD Compliance | 100% |
| Type Safety | 0 `any` en prod |
| **Decimal.js Usage** | **100% para dinero** |
| Financial Accuracy | 0 errores de redondeo |
| Performance | <200ms queries |
| Documentation | 100% JSDoc |

---

## ⚠️ **REQUISITOS CRÍTICOS**

### **1. Decimal.js OBLIGATORIO**
- ❌ **NUNCA usar `number` para dinero**
- ✅ **SIEMPRE usar `Decimal` de Decimal.js**
- ✅ Validar precisión de 2 decimales
- ✅ Operaciones aritméticas seguras

### **2. Validación de Presupuesto**
- ✅ Validar antes de guardar
- ✅ Alertas automáticas (>80%)
- ✅ Justificación obligatoria si excede
- ✅ Eventos de dominio

### **3. Auditoría Completa**
- ✅ Quién registró/modificó/eliminó
- ✅ Cuándo
- ✅ Qué cambió
- ✅ Por qué (justificación)

### **4. Performance**
- ✅ Caching de análisis (5 min TTL)
- ✅ Queries agregadas optimizadas
- ✅ Índices en BD (ordenId, tipo, createdAt)

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
- [ ] Tests unitarios (>90%)
- [ ] Tests de integración
- [ ] Tests E2E
- [ ] Documentación completa
- [ ] Zero TypeScript errors
- [ ] **100% Decimal.js para dinero**
- [ ] Validación presupuestal funcionando
- [ ] Production-ready code

---

**¿LISTO PARA EJECUTAR? 🚀**

