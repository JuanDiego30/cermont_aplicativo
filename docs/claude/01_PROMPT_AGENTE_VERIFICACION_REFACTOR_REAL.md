# 01 — Prompt para agente: verificación y refactor real CERMONT

Actúa como arquitecto full-stack senior, auditor de producto, especialista en refactorización de monorepos TypeScript y analista de lógica de negocio para CERMONT S.A.S.

Tu tarea NO es escribir más documentación ni declarar que los planes están completos. Tu tarea es verificar si los planes implementados realmente corrigieron el software y, si no, refactorizarlo con evidencia.

## Contexto obligatorio

El aplicativo CERMONT debe funcionar como un orquestador operativo de 14 pasos:

1. Solicitud de servicio
2. Visita técnica
3. Propuesta económica
4. Aprobación / PO
5. Planeación
6. Ejecución
7. Informe técnico
8. Acta de entrega
9. Firma del cliente
10. SES / Ariba
11. Aprobación SES
12. Factura
13. Aprobación factura
14. Pago y cierre definitivo

El sistema debe resolver estas fallas:

- Planeación incompleta.
- Falta de verificación de certificaciones.
- Diligenciamiento manual de formatos.
- Retraso en informes técnicos.
- Retraso en SES/Ariba y facturación.
- Falta de costos reales centralizados.
- Comparación débil propuesta vs real.
- Evidencias dispersas.
- Operación offline/online.
- Dependencia de Excel, Word y PDF.
- Pérdida de trazabilidad documental.
- Falta de seguimiento del pago.

## Archivos que debes leer primero

Lee completos, no por encima:

- `libro-proyecto-refactorizacion.md`
- `refactor-funcional-cermont.md`
- `refactor-cermont-14-pasos-v2.md`
- `cermont-dynamic-platform.md`
- Libro/PDF principal del proyecto
- Docs canónicos del repositorio
- Código real en `frontend/`, `backend/`, `packages/`
- Logs actuales de `verify`, `lint`, `test`, `build`

## Uso obligatorio de herramientas, skills y MCP

Antes de modificar, debes usar las herramientas adecuadas:

### Para código
- Usa búsqueda estructural (`rg`, `grep`, AST si está disponible).
- Usa lectura de archivos antes de editar.
- Usa `git diff` y `git status`.
- Usa pruebas específicas antes de gates globales.

### Para UI
- Usa Playwright o herramienta equivalente para navegar pantallas reales.
- Captura screenshots de antes y después.
- No evalúes UI solo leyendo JSX.

### Para Figma
- Si existe enlace Figma o diseño de referencia, usa MCP de Figma para obtener contexto visual.
- Compara la app contra el blueprint esperado.
- No inventes pantallas sin verificar el diseño.

### Para repositorio/GitHub
- Si hay GitHub disponible, usa MCP para revisar diffs, PRs, archivos y commits.
- No asumas que una tarea fue implementada solo porque existe un archivo.

### Para docs/libro
- Lee la documentación y contrástala con código real.
- Si el libro promete algo que no existe, marca desalineación.

Si no usas tools/MCP/skills donde aplican, tu entrega es inválida.

## Protocolo de trabajo obligatorio

### Paso 1 — Baseline técnico

Ejecuta y guarda evidencia:

```bash
git status --short
git diff --stat
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
```

No empieces a refactorizar sin este diagnóstico.

### Paso 2 — Verificar planes implementados

Construye una matriz:

```text
Plan | Task | Promesa | Evidencia en código | Prueba ejecutada | Estado | Riesgo
```

No basta con “archivo existe”. Debes demostrar que funciona.

### Paso 3 — Detectar deuda legacy

Busca y corrige patrones como:

```text
href="/documents"
router.push("/documents")
window.location
fetch( directo en componentes
console.log en producción
as any
@ts-ignore
stub
dummy
mock
test client
Cliente 1
Sin valor
$ 0
blockers: 0
evidences: 0
new Map() en servicios productivos
in-memory storage
synthetic draftId
```

Cada hallazgo debe tener archivo:línea y corrección.

### Paso 4 — Refactorizar por vertical slices

No trabajes por capas aisladas. Cada refactor debe completar:

```text
Zod schema → tipo inferido → modelo Mongoose → servicio → controlador → ruta → hook TanStack → componente/página → test → QA
```

### Paso 5 — Corregir gates sin ocultar problemas

Si `lint` falla por formato/imports, corrige con Biome.
Si `test` falla por snapshot de contratos, actualiza snapshot solo si el cambio de contrato es intencional y agrega explicación/migración.
Si una prueba falla por lógica de negocio, corrige la lógica; no cambies la prueba para que pase.

### Paso 6 — Pruebas funcionales obligatorias

Ejecuta como mínimo:

1. Crear solicitud y convertirla en caso.
2. Crear visita técnica con fotos/mediciones.
3. Crear propuesta con presupuesto > 0.
4. Registrar PO.
5. Planeación incompleta bloquea ejecución.
6. Planeación completa habilita ejecución.
7. Ejecución sin evidencia bloquea cierre.
8. Ejecución completa genera informe.
9. Informe aprobado genera acta.
10. Acta firmada habilita SES.
11. SES aprobada habilita factura.
12. Factura aprobada habilita pago.
13. Pago cierra el caso.
14. Excel importado genera TemplateDraft.
15. TemplateDraft se publica como formulario.
16. Formulario se completa y queda asociado a OT/paso.
17. Documento existente se puede seleccionar y reutilizar.
18. Costos reales se comparan contra propuesta.

## Cómo debe quedar el software

### Dashboard
Debe mostrar KPIs reales:

- Casos activos.
- Casos bloqueados.
- Próximas acciones.
- SES pendientes.
- Facturas pendientes.
- Pagos pendientes.
- Costos con sobrecosto.
- Evidencias faltantes.
- Informes/actas atrasados.

No debe ser un dashboard genérico.

### Cockpit de caso / OT
Debe ser la pantalla principal:

- Stepper 14 pasos.
- Paso actual.
- Requisitos del paso actual.
- Bloqueadores.
- Documentos vinculados.
- Evidencias vinculadas.
- Formularios dinámicos.
- Costos.
- Cierre administrativo.
- NextActions.

### Botones de documentos
Ningún botón debe redirigir a `/documents` sin contexto.

Cada botón debe abrir modal contextual con:

```ts
serviceCaseId/orderId
stepCode
requirementKey
documentPurpose
acceptedFileTypes
processingMode
```

Opciones:

- Subir nuevo archivo.
- Seleccionar documento existente.
- Convertir en formulario.
- Usar como evidencia.
- Usar como soporte de cierre.

### Backend
Debe exponer endpoints coherentes:

```text
GET    /api/service-cases/:id/cockpit
POST   /api/service-cases/:id/advance-step
POST   /api/documents/upload-contextual
GET    /api/documents/library
POST   /api/documents/:id/associate
POST   /api/document-ingestion/jobs
GET    /api/document-ingestion/jobs/:id
POST   /api/template-drafts/:id/publish
POST   /api/template-responses
GET    /api/orders/:id/blockers
POST   /api/orders/:id/evidences/bulk
GET    /api/orders/:id/cost-traceability
GET    /api/orders/:id/closure-readiness
POST   /api/orders/:id/closure/advance
```

### Packages
Toda lógica compartida debe vivir en `packages`:

- `CERMONT_OPERATIONAL_STEPS`
- `CERMONT_STEP_REQUIREMENTS`
- `DocumentPurpose`
- `DocumentProcessingStatus`
- `DynamicFieldType`
- `EvidenceType`
- `WorkflowBlocker`
- `ClosureReadinessCheck`
- `CostTraceability`
- `TemplateDraft`
- `TemplateResponse`

No dupliques tipos en frontend/backend.

## Criterios de rechazo

Rechaza tu propia entrega si ocurre cualquiera de estos puntos:

- Los botones siguen redirigiendo a `/documents` sin contexto.
- Se suben archivos pero no se pueden seleccionar después.
- Excel/PDF/Word no generan al menos TemplateDraft revisable.
- Formularios dinámicos son hardcodeados.
- Los bloqueadores no impiden transiciones.
- Costos siguen en `$0` o “Sin valor”.
- Cierre administrativo sigue siendo solo conteos.
- Tests pasan porque cambiaste snapshots sin justificación.
- No hay evidencia Playwright/curl.
- No usaste herramientas/MCP/skills cuando aplicaba.

## Entrega final obligatoria

Entrega:

```text
1. Resumen de baseline.
2. Matriz de planes implementados.
3. Deuda legacy encontrada y corregida.
4. Archivos modificados.
5. Endpoints verificados.
6. Pantallas verificadas con Playwright.
7. Tests agregados/corregidos.
8. Gates finales.
9. Riesgos pendientes.
10. Veredicto: APROBADO / PARCIAL / RECHAZADO.
```
