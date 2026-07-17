# Requisitos de la Tesis — Extraídos Atómicamente

> **Fuente:** `docs/requirements/THESIS_CANONICAL.md` (LTG — versión canónica)
> **Fecha:** 2026-07-09
> **Propósito:** Extraer cada requisito/falla como ítem atómico con ID trazable

---

## Fallas Críticas Identificadas (Capítulo 1.3 de la Tesis)

### FC-01: Falla de Planeación de la Actividad (Paso 5)

**Fuente:** Tesis, Capítulo 1.3.1 + `07_DESARROLLO_DE_UN_APLICATIVO_WEB...md`
**Cita textual:**
> "Se presentan fallas en la planeación: En el momento de ejecutar la actividad no se tienen todas las herramientas y equipos que se necesitan porque el alcance no se ha detallado a fondo y no se tiene un documento que relacione las herramientas y equipos típicos que se requieren para la actividad"

**Descripción del problema:**
La planeación de obra carece de un listado típico de herramientas y equipos por tipo de actividad. El alcance no se detalla a fondo antes de ejecutar. No existe un documento de planeación estandarizado que relacione recursos necesarios.

**Módulo propuesto:** 07 — Planning Packets, 08 — Kits / Tools / Equipment
**Estado de implementación:** [PENDIENTE VERIFICAR CONTRA CÓDIGO]
**Prioridad:** P0

---

### FC-02: Falla de Ejecución en Campo y Captura de Evidencias (Paso 6)

**Fuente:** Tesis, Capítulo 1.3.2 + `07_DESARROLLO_DE_UN_APLICATIVO_WEB...md`
**Cita textual:**
> "Se presentan fallas en la ejecución: Al momento de ejecutar la actividad no se tienen las herramientas y equipos completos por olvido de las personas encargadas o por desconocimiento de que se requieren."

**Descripción del problema:**
Durante la ejecución en campo faltan herramientas y equipos porque la planeación no fue detallada. Las evidencias fotográficas y checklist de ejecución no se capturan de forma estructurada. No hay verificación de que los recursos planeados estén realmente disponibles.

**Módulo propuesto:** 11 — Execution Sessions, 12 — Evidences
**Estado de implementación:** [PENDIENTE VERIFICAR CONTRA CÓDIGO]
**Prioridad:** P0

---

### FC-03: Falla de Consolidación Documental, Informes y Actas (Pasos 7-9)

**Fuente:** Tesis, Capítulo 1.3.3 + `07_DESARROLLO_DE_UN_APLICATIVO_WEB...md`
**Cita textual:**
> "Se presentan fallas en la elaboración de actas e informes finales a tiempo, por la dinámica de las actividades realizadas en ocasiones hay retrasos considerables en la elaboración de informes y actas finales de las actividades."

**Descripción del problema:**
Los informes técnicos y actas de entrega se elaboran con retraso. No hay un proceso de generación automatizada de documentos a partir de los datos de ejecución ya capturados.

**Módulo propuesto:** 13 — Technical Reports, 14 — Delivery Records
**Estado de implementación:** [PENDIENTE VERIFICAR CONTRA CÓDIGO]
**Prioridad:** P1

---

### FC-04: Falla de Retrasos en Facturación y Cierre Administrativo (Pasos 10-14)

**Fuente:** Tesis, Capítulo 1.3.4 + `07_DESARROLLO_DE_UN_APLICATIVO_WEB...md`
**Cita textual:**
> "Se presentan fallas en la facturación oportuna de las actividades realizadas, en ocasiones hay retrasos considerables en la facturación de las actividades cuando hay múltiples trabajos."

**Descripción del problema:**
La facturación se retrasa cuando hay múltiples trabajos simultáneos. No hay un pipeline de cierre administrativo SES → Factura → Pago con trazabilidad.

**Módulo propuesto:** 15 — SES / Ariba, 16 — Invoices / DIAN, 17 — Payments
**Estado de implementación:** [PENDIENTE VERIFICAR CONTRA CÓDIGO]
**Prioridad:** P1

---

### FC-05: Ausencia de Control Centralizado de Costos Reales (Transversal a Pasos 3-14)

**Fuente:** Tesis, Capítulo 1.3.5 + `07_DESARROLLO_DE_UN_APLICATIVO_WEB...md`
**Cita textual:**
> "Se presentan fallas en saber costos reales de la operación en el momento en que se ejecuta una actividad, no existe hoja de cálculo que relacione de forma centralizada los costos de realizar una actividad (incluyendo impuestos) versus lo estimado en la propuesta económica inicial."

**Descripción del problema:**
No existe control centralizado de costos reales vs. presupuestados. Los costos de materiales, herramientas, equipos, mano de obra e impuestos no se registran de forma estructurada ni se comparan contra la propuesta.

**Módulo propuesto:** 18 — Costs / ERP / Profitability
**Estado de implementación:** [PENDIENTE VERIFICAR CONTRA CÓDIGO]
**Prioridad:** P0

---

## Requisitos No Funcionales Explícitos

### REQ-006: Modo Offline en Ejecución de Campo

**Fuente:** `09_Observaciones_Anteproyecto_Juan_Diego2.md` (páginas 1-2)
**Cita textual:**
> "Módulo 1: Ejecución en Campo con Modo Online/Offline — La aplicación móvil funcionará de forma nativa en el dispositivo, permitiendo al técnico registrar toda la información del servicio (checklists, fotos, firmas) sin necesidad de una conexión a internet."

> "Sincronización Automática: El aplicativo detectará automáticamente la disponibilidad de una conexión a internet y sincronizará en segundo plano toda la información recolectada con el servidor central, sin requerir intervención del usuario."

**Prioridad declarada:** PRIORITARIO (primer módulo de la lista de funcionalidades mínimas)
**Estado de implementación:** [PENDIENTE VERIFICAR CONTRA CÓDIGO — revisar `frontend/src/lib/pwa/` y `frontend/src/modules/field-execution/`]
**Especificación técnica derivada:**
- IndexedDB para almacenamiento local de evidencias y formularios
- Sync queue con idempotency keys (clientMutationId)
- Detección de conectividad con indicador visual
- Resolución de conflictos cuando el servidor rechaza una mutación offline
- Retry con backoff exponencial

---

## Requisitos de Formularios Dinámicos (Futuro)

### REQ-007: Formularios Dinámicos desde Documentos Heredados

**Fuente:** Tesis, Resumen (párrafo final)
**Cita textual:**
> "Como extensión complementaria, el trabajo deja abierta la posibilidad de evolucionar hacia formularios dinámicos a partir de documentos heredados de la empresa, siempre que exista aprobación formal para su incorporación."

**Prioridad:** Futuro (requiere aprobación formal)
**Relación:** Los formatos operativos en `docs/domain/CERMONT_OPERATIONAL_FORMS.md` son los "documentos heredados" candidatos.

---

## Gaps Identificados

| ID | Gap | Impacto |
|---|---|---|
| GAP-001 | No se encontró módulo explícito para el listado típico de herramientas/equipos por actividad (FC-01) | Alto — la tesis lo pide explícitamente |
| GAP-002 | Costos reales vs presupuestados sin dashboard comparativo (FC-05) | Alto — falla crítica transversal |
| GAP-003 | Offline como requisito contractual no está formalizado en plan (REQ-006) | Alto — Observaciones del anteproyecto |
| GAP-004 | Formularios dinámicos desde formatos operativos no implementados (REQ-007) | Medio — extensión complementaria |
