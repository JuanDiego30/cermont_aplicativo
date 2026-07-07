# CERMONT S.A.S. — Documentacion Canonica Definitiva v2.0

## Plataforma Documental-Operativa para Contratistas Multiservicio

**Fecha:** Mayo 2026
**Version:** v2.1 canónica ampliada para ejecución IA/Codex
**Estado:** SOURCE_OF_TRUTH + ANEXO v2.1 operativo
**Total documentos:** 10 canonicos (compresion de 25+ documentos originales)

---

## Mapa de Documentos

| # | Documento | Contenido Principal | Origen (Docs Comprimidos) |
|---|---|---|---|
| **00** | **Indice y Guia de Navegacion** | Este documento — roadmap de toda la documentacion | Nuevo |
| **01** | **Vision, Arquitectura y Stack** | Fundamentos del proyecto, stack tecnologico, estructura de carpetas, patrones, roles, design system, anti-patrones | DOC-01 + DOC-02 + partes DOC-21 |
| **02** | **Entorno, Setup y Flujo de Trabajo** | Instalacion, variables de entorno, comandos, Git, ramas, commits, PRs, seed, diagnostico de errores, plan de fases completo | DOC-13 + DOC-15 + DOC-16 + DOC-17 + DOC-11 |
| **03** | **Backend, API, Seguridad y Datos** | Express 5, Mongoose, MongoDB, JWT + cookies httpOnly, RBAC, manejo de errores, logging, auditoria, esquemas completos de todas las entidades, endpoints REST, validacion Zod | DOC-03 + DOC-04 + DOC-09 + DOC-10 + DOC-14 |
| **04** | **Frontend, PWA, Offline-First y Diseno** | Next.js 16, React 19, TanStack Query, Zustand, apiClient, sistema de diseno (colores, tipografia, componentes, layout responsive), componentes de estado (loading/error/empty/offline), Service Worker, IndexedDB, sync engine, layout, sidebar | DOC-05 + DOC-06 + DOC-19 + DESIGN |
| **05** | **Flujo Operacional de 14 Pasos** | Pipeline completo, entidad ServiceCase, bloqueadores, next actions, FSM de cada entidad, dashboard y KPIs, comandos de dominio, criterios de aceptacion | DOC-07 + DOC-07B + DOC-22 + DOC-23 |
| **06** | **Sistema Documental y Costos** | Document-driven forms, ingesta, deteccion de campos, plantillas versionadas, formularios dinamicos offline, motor de costos, variacion vs propuesta, catalogo configurable | DOC-07B + DOC-07 + DOC-22 |
| **07** | **Archivos, Evidencias y Almacenamiento** | Upload seguro, hash SHA-256, escaneo de virus, evidencias fotograficas con GPS, firma digital, certificados con vencimiento, activos y mantenimiento | DOC-19 + DOC-12 + DOC-15 |
| **08** | **Plan de Ejecucion y Testing** | Fases 0-12 con tareas detalladas, estrategia de testing, piramide de tests, tests de contrato, integracion, E2E, fixtures, cobertura, React Doctor | DOC-11 + DOC-15 + DOC-17 |
| **09** | **DevOps, Observabilidad y Cierre** | Docker Compose, CI/CD, Nginx, logs estructurados, metricas, alertas, health checks, cierre de brechas, madurez documental, KPIs de exito, criterios de entrega final | DOC-08 + DOC-12 + DOC-14 + DOC-18 + DOC-21 + DOC-22 |

---

## Como Usar Esta Documentacion

### Si eres un desarrollador nuevo en el proyecto:

1. Lee el **DOC-CANON-01** para entender la vision, arquitectura y stack
2. Lee el **DOC-CANON-02** para instalar el entorno y entender el flujo de trabajo
3. Lee el **DOC-CANON-08** para entender las fases de implementacion
4. Implementa vertical slices usando el **DOC-CANON-03** (backend) y **DOC-CANON-04** (frontend)
5. Valida tu trabajo con los gates del **DOC-CANON-02**

### Si vas a implementar una fase especifica:

| Fase | Documentos de referencia |
|---|---|
| Fase 0: Fundacion | DOC-CANON-02 (setup) |
| Fase 1: Autenticacion | DOC-CANON-03 (seguridad) + DOC-CANON-04 (login UI) |
| Fase 2: Solicitudes y Propuestas | DOC-CANON-05 (pasos 1-4) + DOC-CANON-03 (schemas) |
| Fase 3: Ordenes y Planeacion | DOC-CANON-05 (paso 5) + DOC-CANON-03 (PlanningPacket) |
| Fase 4: Ejecucion y Evidencias | DOC-CANON-05 (pasos 6-7) + DOC-CANON-04 (offline) + DOC-CANON-07 (evidencias) |
| Fase 5: Informes y Actas | DOC-CANON-05 (pasos 8-10) |
| Fase 6: Cierre Administrativo | DOC-CANON-05 (pasos 11-14) |
| Fase 7: Dashboard y Costos | DOC-CANON-05 (dashboard) + DOC-CANON-06 (costos) |
| Fase 8: Sistema Documental | DOC-CANON-06 (document-driven) |
| Fase 9: Activos y Mantenimiento | DOC-CANON-07 (activos, certificados) |
| Fase 10: PWA y Optimizacion | DOC-CANON-04 (PWA + Diseno) + DOC-CANON-09 (DevOps) |
| Fase 11: Observabilidad | DOC-CANON-09 (monitoreo) |
| Fase 12: Estabilizacion | DOC-CANON-08 (testing) + DOC-CANON-09 (cierre) |

### Si necesitas resolver un problema:

| Problema | Documento | Seccion |
|---|---|---|
| Error de instalacion | DOC-CANON-02 | Diagnostico de Errores Frecuentes |
| Como funciona el login | DOC-CANON-03 | Autenticacion y Autorizacion |
| Como crear un endpoint nuevo | DOC-CANON-03 | Backend + Contratos API |
| Como funciona el offline | DOC-CANON-04 | Arquitectura Offline-First |
| Por que no avanza la orden | DOC-CANON-05 | Bloqueadores |
| Como funcionan los costos | DOC-CANON-06 | Motor de Costos |
| Como subir un archivo | DOC-CANON-07 | Pipeline de Upload |
| Como escribir un test | DOC-CANON-08 | Estrategia de Testing |
| Como desplegar | DOC-CANON-09 | DevOps y Despliegue |
| Reglas de negocio criticas | DOC-CANON-05 | Pipeline Administrativo FSM |

---

## Stack Tecnologico Resumido

| Capa | Tecnologia | Version |
|---|---|---|
| Frontend | Next.js + React + TypeScript | 16 + 19 + 5.x |
| Estado Frontend | TanStack Query v5 + Zustand | ^5.0 |
| Estilos | Tailwind CSS v4 + Shadcn/ui | ^4.0 |
| Backend | Express 5 + Mongoose + TypeScript | ^5.0 + ^8.0 |
| Base de Datos | MongoDB | 8.x |
| Validacion | Zod | ^3.24 |
| Testing | Vitest + Testing Library + Playwright | ^3.0 |
| DevOps | Docker + Docker Compose + Nginx | Latest |

---

## Principios Fundamentales (No Negociables)

1. **Contract-First Development** — Todo endpoint parte de un esquema Zod en `packages/shared-types`
2. **Vertical Slices** — Implementar de extremo a extremo
3. **No Silent Failures** — Prohibido `catch {}` o `catch (e) { return [] }`
4. **Zero Any** — Prohibido `any` y `as any`
5. **No Mock Data in Production** — Mocks solo en tests
6. **Fail Fast** — Errores detectados cerca del origen
7. **Observability by Design** — Logs, metricas y auditoria desde el diseno
8. **Document-Driven** — Los documentos reales de Cermont definen los formularios

---

## Contexto del Proyecto

**Empresa:** Cermont S.A.S. — Contratista multiservicio
**Sector:** Construccion, electricidad, refrigeracion, mantenimiento, CCTV, lineas de vida, obra civil, telecomunicaciones, montajes
**Cliente principal:** Sierracol Energy (Campo petrolero Caño Limon, Arauca, Colombia)
**Problema:** Dificultades en planeacion, ejecucion y cierre administrativo debido a formatos fisicos, falta de trazabilidad y procesos manuales
**Solucion:** Plataforma documental-operativa que transforma documentos en formularios dinamicos, gestiona el flujo de 14 pasos, controla costos y cierra administrativamente con trazabilidad completa

---

## Archivos en este Directorio

```
/mnt/agents/output/docs/
├── DOC-CANON-00-Indice-Guia-Navegacion.md
├── DOC-CANON-01-Vision-Arquitectura-Stack.md
├── DOC-CANON-02-Entorno-Setup-Flujo-Trabajo.md
├── DOC-CANON-03-Backend-API-Seguridad-Datos.md
├── DOC-CANON-04-Frontend-PWA-Offline.md
├── DOC-CANON-05-Flujo-Operacional-14-Pasos.md
├── DOC-CANON-06-Sistema-Documental-Costos.md
├── DOC-CANON-07-Archivos-Evidencias-Almacenamiento.md
├── DOC-CANON-08-Plan-Ejecucion-Fases-Testing.md
└── DOC-CANON-09-DevOps-Observabilidad-Cierre.md
```

---

*Documentacion canonica generada a partir del analisis exhaustivo de 25+ documentos del proyecto Cermont S.A.S. Incluye anteproyecto academico, especificaciones tecnicas, documentacion de arquitectura, flujos operacionales, formatos de negocio reales, y observaciones de stakeholders.*
---

# ANEXO v2.1 — Cierre de puntos ciegos para agentes IA/Codex

> **Prevalencia normativa:** si alguna sección anterior de este documento contradice este anexo, prevalece el **ANEXO v2.1**.  
> **Propósito:** convertir la documentación canónica en un plano arquitectónico ejecutable, verificable y sin ambigüedades para agentes IA/Codex.  
> **Regla base:** ningún agente puede declarar una función como implementada si no aporta **archivo + endpoint/contrato/componente + prueba + evidencia**.


## 1. Jerarquía de fuente de verdad

Cuando exista contradicción entre documentación, planes, reportes de agentes y código, el agente debe aplicar este orden:

| Prioridad | Fuente | Regla |
|---:|---|---|
| 1 | Código local real + tests ejecutados | Prevalece sobre reportes anteriores. |
| 2 | `package.json`, `package-lock.json`, `packages/domain`, `packages/shared-types` | Fuente real de versiones, contratos, roles, permisos y tipos. |
| 3 | Documentación canónica DOC-CANON-00 a DOC-CANON-09 | Plano arquitectónico objetivo. |
| 4 | Planes `.sisyphus/plans` | Guías de ejecución, no prueba de implementación. |
| 5 | Reportes de agentes | Evidencia auxiliar; debe verificarse con comandos. |

**Regla:** si dos fuentes se contradicen, escribir `CONTRADICCIÓN` y no asumir.

## 2. Estados oficiales de implementación

Todo requisito debe etiquetarse con uno de estos estados:

| Estado | Definición | Evidencia mínima |
|---|---|---|
| `IMPLEMENTADO` | Existe en código, pasa tests y tiene evidencia. | Ruta de archivo + test + log/screenshot. |
| `PARCIAL` | Existe parte del backend, frontend o contrato, pero falta integración o prueba. | Ruta parcial + lista de faltantes. |
| `PLANIFICADO` | Está diseñado en documentación, pero no existe en código. | Plan con tareas y archivos objetivo. |
| `FUTURO` | Depende de tecnología no integrada todavía, como OCR avanzado o IA semántica. | Justificación y alcance. |
| `NO_VERIFICADO` | Hay archivo o afirmación, pero no se ejecutó prueba. | Motivo de no verificación. |
| `CONTRADICCIÓN` | Documentos, código o reportes dicen cosas incompatibles. | Fuentes en conflicto. |

## 3. Regla contra “already exists”

El agente no puede responder “ya existe” sin esta tabla:

| Elemento | Archivo exacto | Endpoint/componente/contrato | Test | Evidencia | Estado |
|---|---|---|---|---|---|
| Ejemplo | `backend/src/modules/service-cases/...` | `GET /api/service-cases/:id/workflow` | `service-case.workflow.test.ts` | `evidence/curl/workflow.log` | `IMPLEMENTADO` |

Si falta una columna, el estado máximo permitido es `NO_VERIFICADO`.

## 4. Matriz mínima documentación ↔ código

Esta matriz debe completarse y actualizarse durante el desarrollo:

| Requisito | Documento fuente | `packages/domain` | `shared-types` | Backend | Frontend | Test | Evidencia | Estado |
|---|---|---|---|---|---|---|---|---|
| Flujo 14 pasos | DOC-05 | `workflow/operational-steps.ts` | `service-case-workflow.schema.ts` | `modules/service-cases` | `/service-cases/[id]` | workflow unit + Playwright | cockpit screenshot | `NO_VERIFICADO` |
| Formularios dinámicos | DOC-06 | rules/form | template schemas | `modules/templates`, `modules/documents` | `DynamicFormRenderer`, `FormBuilder` | form tests | form screenshot | `PARCIAL` |
| Evidencias categorizadas | DOC-07 | evidence rules | evidence schemas | `modules/evidences` | Evidence gallery/categorizer | evidence tests | gallery screenshot | `PARCIAL` |
| Offline real | DOC-04 | offline command rules | sync schemas | `modules/sync` | IndexedDB/outbox | offline E2E | sync log | `PLANIFICADO` |
| Cierre SES-factura-pago | DOC-05/DOC-06 | billing rules | billing schemas | billing/payment modules | billing pages | integration + Playwright | billing flow log | `NO_VERIFICADO` |
| Costos reales | DOC-06 | cost rules | cost schemas | costs module | costs dashboard | cost variance test | dashboard screenshot | `NO_VERIFICADO` |

## 5. Orden de lectura para agentes

1. DOC-CANON-00.
2. DOC-CANON-01.
3. DOC-CANON-05.
4. DOC-CANON-03 y DOC-CANON-04.
5. DOC-CANON-06 y DOC-CANON-07.
6. DOC-CANON-08.
7. DOC-CANON-09.

## 6. Reglas de trabajo para agentes

- No implementar UI sin contrato y endpoint.
- No implementar endpoint sin schema Zod y test.
- No actualizar documentación para ocultar deuda de código.
- No declarar `APROBADO` si falla `verify`, `quality:strict`, React Doctor o Playwright obligatorio.
- No crear páginas huérfanas fuera del `ServiceCase`.
- No acoplar el sistema a un cliente, contrato, sede o campo específico.
- No fingir IA/OCR si el motor real no existe.
