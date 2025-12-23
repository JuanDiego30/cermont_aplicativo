# 🎯 **PROMPT MAESTRO PARA REFACTORIZACIÓN DE `/formularios` - MEJORADO**

**Versión:** 2.0  
**Fecha:** 2024-12-23  
**Estado:** ✅ Optimizado y listo para ejecución

---

## 📋 **ANÁLISIS DEL ESTADO ACTUAL**

### **Problemas Identificados:**
1. ❌ **Sin Domain Layer** - Toda la lógica en `FormulariosService` (anémico)
2. ❌ **Sin Value Objects** - Validaciones primitivas
3. ❌ **Sin Entities** - No hay modelos de dominio ricos
4. ❌ **Sin Domain Services** - Validación, cálculos, lógica condicional ausentes
5. ❌ **Sin JSON Schema Validation** - Solo validación básica
6. ❌ **Sin Versionado** - No se trackean cambios
7. ❌ **Sin Lógica Condicional** - Formularios estáticos
8. ❌ **Sin Cálculos** - No hay campos calculados
9. ❌ **Sin Export** - No se pueden exportar respuestas
10. ❌ **Sin Analytics** - No hay estadísticas

### **Arquitectura Actual:**
```
formularios/
├── application/dto/          # DTOs básicos
├── infrastructure/
│   ├── controllers/          # Controller básico
│   └── services/             # Parser de PDF/Excel
├── formularios.service.ts    # ❌ Legacy - deprecar
└── formularios.module.ts
```

---

## 🎯 **OBJETIVOS DE REFACTORIZACIÓN**

1. ✅ **DDD Completo** - Domain Layer con Entities, VOs, Services, Events
2. ✅ **Clean Architecture** - Separación clara de capas
3. ✅ **JSON Schema Validation** - Validación robusta con AJV
4. ✅ **Formularios Dinámicos** - Lógica condicional, cálculos
5. ✅ **Versionado** - Historial de cambios
6. ✅ **Export** - CSV, Excel, PDF
7. ✅ **Analytics** - Estadísticas de respuestas

---

## 📝 **PLAN DE IMPLEMENTACIÓN**

### **FASE 1: Domain Layer (5 días)**
- Value Objects (10)
- Entities (5)
- Domain Services (4)
- Domain Events (5)
- Repository Interfaces (2)
- Specifications (3)

### **FASE 2: Application Layer (4 días)**
- Use Cases (14)
- DTOs refactorizados
- Mappers
- Event Handlers

### **FASE 3: Infrastructure Layer (4 días)**
- Repositories (Prisma)
- JSON Schema Validator (AJV)
- Export Services
- Analytics Services
- Controllers refactorizados

### **FASE 4: Testing y Documentación (2 días)**
- Unit tests
- Integration tests
- E2E tests
- Documentación

---

## 🚀 **EJECUCIÓN**

**Total estimado:** 15 días

**FIN DEL PROMPT MEJORADO** 🎯

