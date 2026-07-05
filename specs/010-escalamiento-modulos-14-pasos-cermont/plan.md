# Spec 010 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:executing-plans` or an equivalent reviewed execution workflow. Every change must follow the impact map and vertical-slice gates.

**Goal:** llevar el flujo documental de 14 pasos a una operación profesional, verificable y comercializable sin romper producción.

**Architecture:** conservar los contratos Zod y las reglas puras de `@cermont/domain` como núcleo compartido. Los servicios Express/Mongoose son autoridad de transición y agregación; Next.js consume contratos mediante `apiClient` y TanStack Query. `FileAsset` continúa como SSOT transversal y las capacidades P2/P3 permanecen detrás de condiciones de entrada explícitas.

**Tech Stack:** TypeScript estricto, Zod 4.x, Express 5.2.1, Mongoose/MongoDB, Next.js 16, React 19, TanStack Query, Zustand, Vitest y Playwright.

## Global Constraints

- Estructura única: `backend/`, `frontend/`, `packages/`.
- No modificar manifests ni instalar dependencias sin autorización.
- No rutas, roles, contratos ni componentes duplicados.
- No acceso directo con `fetch` desde componentes.
- No lógica de negocio compleja en UI.
- P0 y P1 deben estar estables antes de activar P2/P3.
- Todo slice termina con tests enfocados y gates raíz.
- No deploy desde esta fase documental.

---

## Estrategia de ejecución

### Fase 0 — Baseline y fuentes

- Confirmar rama, estado del worktree y fuentes obligatorias.
- Ejecutar gates completos en un checkpoint sin cambios concurrentes.
- Usar la fuente verificada `C:\Users\camil\Downloads\LTG_JUAN_DIEGO_AREVALO-3_markdown.md` y conservar la discrepancia frente al nombre “(4)” solicitado.
- Reconciliar mapas documentales obsoletos con inventario físico y pruebas.

### Fase 1 — Flujo de 14 pasos

- Slice 02: consolidar y verificar ServiceCase Cockpit.
- Slice 03: robustecer solicitud → visita → propuesta → PO.
- Slice 04: hacer readiness de planeación autoritativo en servidor.
- Slice 05: completar Field Mode e idempotencia offline.
- Slice 06: cerrar la FSM de evidencia y su integración con `FileAsset`.
- Slice 07: asegurar informe → acta → firma.
- Slice 08: asegurar SES → factura → aprobación → pago → cierre.

### Fase 2 — Módulos operativos de soporte

- Slice 09: unificar readiness, disponibilidad y mantenimiento de flota/herramientas/activos.
- Slice 10: consolidar checklists versionados y bloqueantes.
- Slice 11: mantener dashboard orientado a decisiones, no métricas genéricas.
- Slice 12: consolidar catálogo, presupuesto, margen, alertas y exportación de costos.
- Slice 13: reglas SI-ENTONCES, outbox, idempotencia y auditoría.

### Fase 3 — Diferenciación controlada

- Digital twin como read model del ServiceCase, no como segundo agregado.
- IA segura solo para borradores y recomendaciones con revisión humana.
- QR/NFC sobre identificadores y permisos existentes.
- Formularios dinámicos sobre contratos/versiones existentes.

### Fase 4 — Fundación SaaS

- Producir ADR de aislamiento por tenant, migración y autorización.
- Reutilizar feature flags existentes; no confundir flags globales con multitenancy.
- Ampliar portal únicamente con ownership verificable.
- No añadir `tenantId` hasta aprobar el ADR y sus pruebas negativas cross-tenant.

## Dependencias entre slices

```text
Foundation/FileAsset
  ├─ ServiceCase Cockpit ── 14-step gates ── Financial closure
  ├─ Planning readiness ── Field execution ── Evidence ── Reports/signatures
  ├─ Fleet/Tools/Assets ── Planning readiness
  └─ Checklists/Costs ── Dashboard/Automation
                                     └─ P2/P3 only after stable P1
```

## Método por tarea

1. Escribir o ajustar el contrato y su test de esquema.
2. Ejecutar el test para confirmar el fallo esperado.
3. Implementar regla pura en `packages/domain` cuando corresponda.
4. Implementar modelo/servicio/controlador/ruta y tests backend.
5. Implementar API/query/hook/UI y estados visuales, con tests de componente.
6. Añadir E2E para caminos críticos y denegaciones.
7. Actualizar docs y evidencia.
8. Ejecutar `typecheck`, `lint`, `test`, `build`, `contracts:check`, `quality:strict`, `verify` y React Doctor.

## Condiciones de parada

- Cualquier regresión de contrato, RBAC, FileAsset, sincronización offline o gate detiene el siguiente slice.
- Una transición crítica sin auditoría o idempotencia impide considerar el slice completado.
- Un hallazgo de seguridad alto/crítico impide deploy.
