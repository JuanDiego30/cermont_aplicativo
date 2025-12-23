# 🎯 **PROMPT MAESTRO PARA REFACTORIZACIÓN DE `/hes` - CERMONT APLICATIVO**

**Versión:** 2.0 (Mejorado)  
**Fecha:** 2024-12-23  
**Autor:** Sistema de Refactorización Cermont  
**Estado:** ✅ Listo para ejecución

---

## 📋 **CONTEXTO DEL MÓDULO**

El módulo **`/hes`** será refactorizado para convertirse en **"Hoja de Entrada de Servicio"** (HES), un bounded context de documentación y registro de entrada de servicios responsable de gestionar la información inicial de órdenes de trabajo.

### **⚠️ NOTA IMPORTANTE:**
El módulo actual maneja "Health, Environment, and Safety" (equipos de seguridad). Esta refactorización **transforma** el módulo para que gestione "Hoja de Entrada de Servicio" con todas las funcionalidades descritas.

### **Responsabilidades del Módulo (Nuevas):**
- ✅ **Registro de HES** (captura de información de entrada)
- ✅ **Datos del Cliente** (información de contacto y ubicación)
- ✅ **Tipo de Servicio** (mantenimiento, reparación, instalación, inspección)
- ✅ **Condiciones de Entrada** (estado inicial del equipo/instalación)
- ✅ **Diagnóstico Preliminar** (evaluación inicial por técnico)
- ✅ **Requerimientos de Seguridad** (EPP, permisos, riesgos identificados)
- ✅ **Checklist de Seguridad** (verificación de condiciones seguras)
- ✅ **Fotográfico Inicial** (evidencias del estado de entrada)
- ✅ **Firma del Cliente** (aceptación de condiciones)
- ✅ **Firma del Técnico** (responsabilidad del servicio)
- ✅ **Versionado** (historial de modificaciones)
- ✅ **Auditoría Completa** (trazabilidad de cambios)
- ✅ **Export a PDF** (documento oficial)
- ✅ **Validaciones** (campos obligatorios según tipo de servicio)
- ✅ **Integración con Órdenes** (relación 1:1 con orden de trabajo)

---

## 🏗️ **ARQUITECTURA OBJETIVO (DDD Completo + PDF Generation)**

```
📁hes/
├── 📁domain/                                    # ⚠️ CREAR COMPLETO
│   ├── 📁entities/
│   │   ├── hes.entity.ts                       # Aggregate Root
│   │   ├── cliente-info.entity.ts
│   │   ├── condiciones-entrada.entity.ts
│   │   ├── diagnostico-preliminar.entity.ts
│   │   ├── requerimientos-seguridad.entity.ts
│   │   ├── firma-digital.entity.ts
│   │   ├── index.ts
│   ├── 📁value-objects/
│   │   ├── hes-id.vo.ts
│   │   ├── hes-numero.vo.ts                    # HES-YYYY-0001
│   │   ├── tipo-servicio.vo.ts
│   │   ├── prioridad.vo.ts
│   │   ├── estado-hes.vo.ts
│   │   ├── nivel-riesgo.vo.ts
│   │   ├── direccion.vo.ts
│   │   ├── coordenadas-gps.vo.ts
│   │   ├── telefono.vo.ts
│   │   ├── email.vo.ts
│   │   ├── epp-requerido.vo.ts
│   │   ├── index.ts
│   ├── 📁events/
│   │   ├── hes-created.event.ts
│   │   ├── hes-completed.event.ts
│   │   ├── hes-signed.event.ts
│   │   ├── hes-approved.event.ts
│   │   ├── hes-cancelled.event.ts
│   │   ├── index.ts
│   ├── 📁services/
│   │   ├── hes-validator.service.ts
│   │   ├── hes-numero-generator.service.ts
│   │   ├── riesgo-evaluator.service.ts
│   │   ├── index.ts
│   ├── 📁specifications/
│   │   ├── hes-completo.spec.ts
│   │   ├── firmas-validas.spec.ts
│   │   ├── seguridad-verificada.spec.ts
│   │   ├── index.ts
│   ├── 📁repositories/
│   │   ├── hes.repository.interface.ts
│   │   ├── index.ts
│   ├── 📁exceptions/
│   │   ├── hes-incompleto.exception.ts
│   │   ├── firma-invalida.exception.ts
│   │   ├── hes-ya-completado.exception.ts
│   │   ├── numero-hes-duplicado.exception.ts
│   │   ├── index.ts
│   └── index.ts
├── 📁application/
│   ├── 📁dto/
│   │   ├── create-hes.dto.ts
│   │   ├── update-hes.dto.ts
│   │   ├── complete-hes.dto.ts
│   │   ├── sign-hes.dto.ts
│   │   ├── hes-response.dto.ts
│   │   ├── list-hes-query.dto.ts
│   │   ├── export-hes-pdf.dto.ts
│   │   ├── index.ts
│   ├── 📁use-cases/
│   │   ├── create-hes.use-case.ts
│   │   ├── update-hes.use-case.ts
│   │   ├── complete-hes.use-case.ts
│   │   ├── sign-hes-cliente.use-case.ts
│   │   ├── sign-hes-tecnico.use-case.ts
│   │   ├── cancel-hes.use-case.ts
│   │   ├── get-hes.use-case.ts
│   │   ├── list-hes.use-case.ts
│   │   ├── export-hes-pdf.use-case.ts
│   │   ├── get-hes-by-orden.use-case.ts
│   │   ├── index.ts
│   ├── 📁mappers/
│   │   ├── hes.mapper.ts
│   │   ├── index.ts
│   ├── 📁event-handlers/
│   │   ├── hes-completed.handler.ts
│   │   ├── hes-signed.handler.ts
│   │   ├── index.ts
│   └── index.ts
├── 📁infrastructure/
│   ├── 📁controllers/
│   │   ├── hes.controller.ts
│   │   ├── index.ts
│   ├── 📁persistence/
│   │   ├── hes.repository.ts
│   │   ├── hes.prisma.mapper.ts
│   │   ├── index.ts
│   ├── 📁pdf/
│   │   ├── hes-pdf-generator.service.ts
│   │   ├── hes-pdf-template.ts
│   │   ├── pdf-styles.ts
│   │   ├── index.ts
│   ├── 📁validators/
│   │   ├── firma-validator.service.ts
│   │   ├── seguridad-validator.service.ts
│   │   ├── index.ts
│   ├── 📁integrations/
│   │   ├── ordenes-integration.service.ts
│   │   ├── index.ts
│   └── index.ts
├── hes.module.ts
├── index.ts
└── README.md
```

---

## 🎯 **OBJETIVOS DE LA REFACTORIZACIÓN**

1. ✅ **SOLID Principles** (SRP, OCP, LSP, ISP, DIP)
2. ✅ **Clean Architecture** (dependencias siempre apuntan hacia adentro)
3. ✅ **DDD Tactical Patterns** (Entities, Value Objects, Aggregates, Domain Events, Domain Services)
4. ✅ **Rich Domain Model** (lógica de validación en VOs y Entities)
5. ✅ **Factory Pattern** (generación de PDFs, números HES)
6. ✅ **Strategy Pattern** (validaciones según tipo de servicio)
7. ✅ **TypeScript Best Practices** (tipos estrictos, no `any`)
8. ✅ **Business Rules** (validaciones de negocio en dominio)
9. ✅ **Digital Signatures** (captura y validación de firmas)
10. ✅ **PDF Generation** (documentos oficiales con pdfkit)
11. ✅ **Security Compliance** (checklist de seguridad obligatorio)
12. ✅ **Error Handling** (excepciones descriptivas)
13. ✅ **Testing** (unit tests, integration tests, E2E tests)
14. ✅ **Observability** (logging, métricas de completitud)

---

## 📝 **PLAN DE TRABAJO COMPLETO**

### **FASE 1: ANÁLISIS Y AUDITORÍA** ⚠️ INICIAR AQUÍ

**TASK 1.1: Auditoría de Arquitectura Actual**

Analizar:
- Estructura actual del módulo
- Modelos de Prisma relacionados
- Dependencias con otros módulos
- Funcionalidades existentes que se mantendrán
- Funcionalidades que se eliminarán
- Funcionalidades nuevas a agregar

**Entregables:**
- `HES_AUDIT_REPORT.md`
- Diagrama de migración
- Plan de implementación detallado

---

### **FASE 2: DOMAIN LAYER** (5 días)

**TASK 2.1: Value Objects (11 VOs)**
- HESId, HESNumero, TipoServicio, Prioridad, EstadoHES
- NivelRiesgo, Direccion, CoordenadasGPS, Telefono, Email, EPPRequerido

**TASK 2.2: Entities (6 Entities)**
- HES (Aggregate Root)
- ClienteInfo, CondicionesEntrada, DiagnosticoPreliminar
- RequerimientosSeguridad, FirmaDigital

**TASK 2.3: Domain Services (3 Services)**
- HESValidatorService
- HESNumeroGeneratorService
- RiesgoEvaluatorService

**TASK 2.4: Specifications (3 Specs)**
- HESCompletoSpec
- FirmasValidasSpec
- SeguridadVerificadaSpec

**TASK 2.5: Domain Events (5 Events)**
- HESCreatedEvent, HESCompletedEvent, HESSignedEvent
- HESApprovedEvent, HESCancelledEvent

**TASK 2.6: Exceptions (4 Exceptions)**
- HESIncompletoException, FirmaInvalidaException
- HESYaCompletadoException, NumeroHESDuplicadoException

**TASK 2.7: Repository Interface**
- IHESRepository

---

### **FASE 3: APPLICATION LAYER** (4 días)

**TASK 3.1: Use Cases (10 Use Cases)**
- CreateHESUseCase, UpdateHESUseCase, CompleteHESUseCase
- SignHESClienteUseCase, SignHESTecnicoUseCase, CancelHESUseCase
- GetHESUseCase, ListHESUseCase, ExportHESPDFUseCase
- GetHESByOrdenUseCase

**TASK 3.2: DTOs (7 DTOs)**
- CreateHESDto, UpdateHESDto, CompleteHESDto, SignHESDto
- HESResponseDto, ListHESQueryDto, ExportHESPDFDto

**TASK 3.3: Mappers**
- HESMapper

**TASK 3.4: Event Handlers**
- HESCompletedHandler, HESSignedHandler

---

### **FASE 4: INFRASTRUCTURE LAYER** (4 días)

**TASK 4.1: Repository Implementation**
- HESRepository (Prisma)
- HESPrismaMapper

**TASK 4.2: PDF Generation**
- HESPDFGeneratorService (pdfkit)
- HESPDFTemplate
- PDFStyles

**TASK 4.3: Validators**
- FirmaValidatorService
- SeguridadValidatorService

**TASK 4.4: Controllers**
- HESController (refactorizado)

**TASK 4.5: Integrations**
- OrdenesIntegrationService

---

### **FASE 5: TESTING** (2 días)

**TASK 5.1: Unit Tests**
- VOs, Entities, Services

**TASK 5.2: Integration Tests**
- Repository, PDF Generator

**TASK 5.3: E2E Tests**
- Controllers

---

### **FASE 6: DOCUMENTACIÓN** (1 día)

**TASK 6.1: README completo**
**TASK 6.2: Guía de uso HES**
**TASK 6.3: Swagger**
**TASK 6.4: Ejemplo de PDF**

---

## 📊 **MÉTRICAS DE ÉXITO**

- ✅ Cobertura de tests >85%
- ✅ 0 errores de linter
- ✅ Validación de completitud 100%
- ✅ Generación de PDF funcional
- ✅ Checklist de seguridad obligatorio
- ✅ Firmas digitales implementadas
- ✅ Integración con órdenes funcional

---

## 🚀 **EJECUCIÓN**

**Total estimado:** 18 días

**FIN DEL PROMPT MAESTRO MEJORADO** 🎯

