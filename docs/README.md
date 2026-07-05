# Cermont S.A.S. — Documentación Técnica Oficial

> **Índice principal de documentación — Fuente Única de Verdad**
>
> Última actualización: 2026-06-06
> Reconstrucción documental: Fase 0–14 completada

---

## ⚠️ AVISO PARA AGENTES DE IA

Antes de tocar código, lee obligatoriamente:
1. `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md`
2. `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md`
3. `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md`

Los 10 documentos CANON (DOC-CANON-00 a DOC-CANON-09) son la fuente de verdad única. Los 24+ documentos DOC-*-v2 han sido consolidados y eliminados.

---

## 1. ¿Qué es el aplicativo Cermont?

**Plataforma documental y operativa para contratistas multiservicio.**

Cermont S.A.S. presta servicios de construcción, electricidad, refrigeración, mantenimiento, montajes, obras civiles, telecomunicaciones, CCTV, líneas de vida, suministro de materiales, equipos, herramientas y personal técnico — con cobertura nacional.

El aplicativo web digitaliza el ciclo completo de trabajo: desde la solicitud del cliente hasta el pago, pasando por planeación, ejecución en campo, evidencias, informes, actas, SES, facturación y control de costos reales.

---

## 2. ¿Qué problema resuelve?

| # | Problema |
|---|----------|
| 1 | Planeación incompleta (alcances, herramientas, equipos, EPP olvidados) |
| 2 | Falta de verificación de certificaciones de equipos y personal |
| 3 | Diligenciamiento manual de formatos (papel, Excel, Word) |
| 4 | Retraso en informes técnicos y actas de entrega |
| 5 | Retraso en SES/Ariba y facturación |
| 6 | Falta de costos reales centralizados |
| 7 | Comparación débil entre propuesta y costo real |
| 8 | Evidencias fotográficas dispersas (WhatsApp, dispositivos personales) |
| 9 | Operación en campo con baja conectividad |
| 10 | Dependencia de Excel, Word, PDF y formatos físicos |
| 11 | Pérdida de trazabilidad documental |
| 12 | Falta de seguimiento del pago |

---

## 3. ¿Qué NO es el aplicativo?

- ❌ NO es solo un dashboard
- ❌ NO es solo órdenes de trabajo
- ❌ NO es solo una app de mantenimiento
- ❌ NO es solo una app petrolera
- ❌ NO es solo 14 formularios hardcodeados
- ❌ NO es un CMMS genérico
- ❌ NO es un ERP
- ❌ NO es solo para Caño Limón

---

## 4. Estructura real del monorepo

```
cermont_aplicativo/
├── backend/               ← Express 5.2.1 + Mongoose (workspace: "backend")
├── frontend/              ← Next.js 16 + React 19 (workspace: "frontend")
├── packages/
│   ├── shared-types/      ← Zod schemas, API contracts (@cermont/shared-types)
│   ├── domain/            ← RBAC roles, permissions (@cermont/domain)
│   └── config/            ← Env validation (@cermont/config)
├── docs/                  ← Toda la documentación (esta carpeta)
├── tooling/               ← Scripts de mantenimiento
├── docker/                ← Dockerfiles y compose
└── scripts/               ← Scripts auxiliares
```

**Workspaces válidos (package.json):** `["backend", "frontend", "packages/*"]`

---

## 5. Documentos canónicos (fuente de verdad actual)

### Para empezar
| Orden | Documento | Tema |
|-------|-----------|------|
| 1 | `docs/README.md` | Este índice |
| 2 | `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` | Visión del producto |
| 3 | `docs/domain/CERMONT_BUSINESS_FLOW_MAP.md` | Flujo de 14 pasos, entidades, RBAC |
| 4 | `docs/architecture/CERMONT_ARCHITECTURE_BLUEPRINT.md` | Arquitectura técnica completa |

### Para implementar
| Orden | Documento | Tema |
|-------|-----------|------|
| 5 | `docs/agents/AGENT_IMPLEMENTATION_PLAYBOOK.md` | Reglas para agentes antes de programar |
| 6 | `docs/architecture/FRONTEND_ROUTE_MAP.md` | Mapa de rutas frontend |
| 7 | `docs/architecture/API_ENDPOINT_MATRIX.md` | Matriz de endpoints backend |
| 8 | `docs/plans/CERMONT_REBUILD_ROADMAP.md` | Roadmap de reconstrucción por fases |

### Especificaciones de producto
| Documento | Tema |
|-----------|------|
| `docs/product/DOCUMENT_DRIVEN_FORMS_SPEC.md` | Formularios dinámicos desde documentos |
| `docs/product/COST_ENGINE_SPEC.md` | Motor de costos reales vs. propuesta |
| `docs/offline-scope.md` | Alcance real del modo offline/online |
| `docs/offline-online-module.md` | Arquitectura del módulo offline/online |
| `docs/offline-test-plan.md` | Plan de pruebas offline |
| `docs/offline-known-limitations.md` | Limitaciones conocidas del modo offline |

### Diseño y reglas
| Documento | Tema |
|-----------|------|
| `docs/Intrucciones_para_crear_app_web/DOC-CANON-04.md` (sección 5) | Sistema de diseño Cermont — colores, tipografía, componentes, layout responsive |

| `docs/design/CERMONT_UIUX_GUIDE.md` | Guía UI/UX para implementación |
| `docs/REGLAS_DESARROLLO_CERMONT.md` | Reglas obligatorias de desarrollo |
| `docs/research-cermont/12_MATURITY_PHASE_2_IMPLEMENTED_PATTERNS.md` | Patrones profesionales aplicados en recordatorios, estados vacíos y dashboard |

### Despliegue y operación
| Documento | Tema |
|-----------|------|
| `docs/deploy/PRODUCTION_DEPLOYMENT.md` | Despliegue canónico en VPS, HTTPS, backup y rollback |
| `docs/deploy/VARIABLES_ENTORNO.md` | Variables requeridas y reglas de secretos |
| `docs/deploy/pm2-vps.md` | Alternativa PM2 sin reemplazar Docker/CI |

### Auditoría y validación
| Documento | Tema |
|-----------|------|
| `docs/DOCUMENTATION_INVENTORY.md` | Inventario completo de documentación |
| `docs/STALE_DOCUMENTATION_REPORT.md` | Reporte de documentación obsoleta |
| `docs/DOCUMENTATION_VALIDATION_REPORT.md` | Validación final de documentación |

### Decisiones arquitectónicas
| Documento | Tema |
|-----------|------|
| `docs/adr/ADR-001-contract-first-domain-boundaries.md` | Contract-first y límites de dominio |
| `docs/adr/ADR-002-offline-first-indexeddb-serwist.md` | IndexedDB, Serwist y recuperación no destructiva |
| `docs/adr/ADR-003-cermont-workflow-14-steps.md` | Workflow documental de 14 pasos |
| `docs/adr/ADR-004-evidence-blob-outbox.md` | Evidencias y blob outbox |
| `docs/adr/ADR-005-administrative-closure-state-machine.md` | Cierre administrativo y estados |

---

## 6. Documentos consolidados

Los 24 documentos redundantes que estaban en docs/Intrucciones_para_crear_app_web/ han sido consolidados en los 10 archivos CANON (DOC-CANON-00 a DOC-CANON-09).

**Eliminados (24 archivos):**
- 23 documentos DOC-01 a DOC-23 v2 (25,086+ lineas de contenido redundante)
- DESIGN_CERMONT_COLORS_ONLY.md (401 lineas, fusionado en CANON-04 seccion 5)

**Documentos que permanecen como historicos (no consolidados):**
- docs/plans/plans1.md — Plan anterior
- docs/pdf/"ATG JUAN DIEGO AREVALO-1".md — Documento academico/tesis
- Root README.md — README principal (parcialmente obsoleto)
- Root AGENTS.md — AGENTS principal
- .github/copilot-instructions.md — Instrucciones Copilot

**Referencia:** La documentacion canonica actual son los 10 archivos CANON en docs/Intrucciones_para_crear_app_web/.
Ver el indice en DOC-CANON-00-Indice-Guia-Navegacion.md.

---

## 7. Reglas para agentes (resumen)

1. **Leer documentación canónica antes de programar.**
2. **Verificar documentación obsoleta:** si un doc dice `apps/backend` o `apps/frontend`, desconfiar.
3. **Contract-first:** definir schema Zod → modelo Mongoose → servicio → controller → ruta → API client → hook → UI.
4. **No duplicar:** schemas, tipos, rutas, permisos, lógica.
5. **RBAC:** usar `@cermont/domain`, no hardcodear roles.
6. **Offline-first:** IndexedDB, cola de sync, estado visible.
7. **Mobile-first:** diseñar para móvil primero.
8. **Jamás:** `any`, `null`, `undefined`, `console.log` en prod, fetch directo, middleware.ts, NextAuth, PostgreSQL, Prisma.

---

## 8. Roadmap de reconstrucción

Ver `docs/plans/CERMONT_REBUILD_ROADMAP.md` para el plan completo de 23 fases.

**Estado actual:** Documentación base completada. Próxima fase: Auth + API_ROOT + Sidebar route matrix.

---

## 9. Advertencias

- Los 10 documentos CANON (DOC-CANON-00 a DOC-CANON-09) son la fuente de verdad unica. Los DOC-*-v2 han sido eliminados.
- ⚠️ Si un documento dice `apps/backend` o `apps/frontend` como estructura actual, **está obsoleto**.
- ⚠️ Si un documento trata a Cermont como empresa solo petrolera o solo de Caño Limón, **está desactualizado**.
- ⚠️ NO usar `apps/` como prefijo. Los workspaces reales son `backend/`, `frontend/`, `packages/`.

---

## 10. Estado de la documentación

| Métrica | Valor |
|---------|-------|
| Documentos inventariados | 63+ (24 consolidados en 10 CANON) |
| Documentos canónicos | 10 CANON (DOC-CANON-00 a 09) |
| Documentos consolidados/eliminados | 24 |
| Contradicciones críticas resueltas | 4 (incluye fusion DESIGN → CANON-04) |
| Documentos DOC marcados con banner | 0 (todos eliminados) |
| Fase actual | Documentación base ✅ → Auth + API_ROOT |

---

**Próximo paso recomendado:** Leer `docs/product/CERMONT_PRODUCT_BLUEPRINT.md` para entender la visión del producto.
