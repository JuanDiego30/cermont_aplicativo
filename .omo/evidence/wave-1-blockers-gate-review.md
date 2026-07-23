# Gate Review — Wave 1 blockers

## recommendation

**REJECT / NEEDS_FIX**

La implementación no puede confirmarse: la prueba focalizada reproducida falla y el lint focalizado falla. Además, la cobertura de BUG-VISIT-01 y BUG-PO-01 no alcanza los resultados de usuario exigidos por el plan.

## originalIntent

Cerrar los bloqueantes de Wave 1 en las rutas de creación de visita técnica, propuesta y orden de compra:

- **BUG-VISIT-01:** el `datetime-local` debe iniciar en hoy + 1 hora, aceptar cambios, permitir submit y terminar en redirección exitosa.
- **BUG-PROP-01:** una propuesta creada debe navegar a `/proposals/{id}` usando el identificador real (`_id` o respuesta enveloped), nunca a `/proposals/undefined`.
- **BUG-PO-01:** abrir el formulario sin propuesta seleccionada no debe disparar validación/fetch por un ID vacío ni exponer “Invalid MongoDB ObjectId”; debe mostrar una opción vacía comprensible.

Fuente de criterios: `.sisyphus/plans/plan-completo-3000l-refactor-corregir-madurar-escalar.md`, tareas 1.2, 1.3 y 1.4.

## desiredOutcome

Los tres flujos deben ser utilizables desde la UI, con pruebas focalizadas verdes, TypeScript verde y lint focalizado sin errores. Las pruebas deben observar el resultado real del usuario, no limitarse a replicar validadores o comprobar que una cadena técnica desapareció.

## userOutcomeReview

- **Visita técnica:** el código usa estado React controlado y un `onChange` explícito para la fecha, pero la suite falla antes de llegar al campo por un literal mojibake (`Seleccionar â†’`). El test agregado solo comprueba valor inicial y edición; no ejecuta submit ni comprueba redirección, aunque ambos son criterios explícitos. Resultado de usuario: **no confirmado**.
- **Propuesta:** `resolveCreatedProposalId` acepta respuesta directa o enveloped y rechaza IDs inválidos sin construir una ruta; las pruebas del servicio pasan. Sin embargo, el escenario de página para respuesta enveloped falla antes del submit por `DescripciÃ³n`. Resultado de usuario completo: **no confirmado**.
- **Orden de compra:** el schema reemplaza el error técnico por “Selecciona una propuesta aprobada.” y su prueba unitaria pasa. La prueba solo invoca el mismo schema exportado; no renderiza el formulario, no verifica el placeholder y no demuestra que no haya llamada con ID vacío. El plan también exige un ErrorBoundary, no presente en la página revisada. Resultado de usuario: **insuficientemente demostrado**.

## blockers

### 1. Focused-tests-green

- **violatedCriterion:** `GATE-FOCUSED-TESTS` — las pruebas focalizadas solicitadas deben pasar.
- **observation:** 2 de 8 pruebas fallan en 2 de 4 archivos; ambos fallos provienen de literales mojibake introducidos en las pruebas.
- **evidencePointer:** comando `npm run test -w frontend -- tests/modules/site-visits/site-visits-new-page.test.tsx tests/modules/proposals/proposal-new-page.test.tsx tests/modules/proposals/proposals-service.test.ts tests/modules/purchase-orders/purchase-order-new-page.test.ts`; salida: `Test Files 2 failed | 2 passed`, `Tests 2 failed | 6 passed`; fallos en `site-visits-new-page.test.tsx:150` y `proposal-new-page.test.tsx:103`.

### 2. BUG-VISIT-01-submit-redirection

- **violatedCriterion:** `BUG-VISIT-01-QA-4/5` — hacer submit y verificar redirección exitosa.
- **observation:** ninguna prueba revisada envía el formulario de visita ni comprueba la navegación; el test de fecha falla antes de alcanzar el input.
- **evidencePointer:** `frontend/tests/modules/site-visits/site-visits-new-page.test.tsx:148`; criterio en la tarea 1.2 del plan, QA pasos 4–5.

### 3. BUG-PO-01-observable-empty-state

- **violatedCriterion:** `BUG-PO-01-QA-2/4` — sin selección, no exponer ObjectId técnico y mostrar el placeholder de selección.
- **observation:** la única prueba de PO llama directamente a `RegisterPOFormSchema`; no renderiza la página, no observa el placeholder y no prueba ausencia de request/fetch con ID vacío. Es una prueba que refleja la implementación y crea falsa confianza sobre la conducta de UI solicitada.
- **evidencePointer:** `frontend/tests/modules/purchase-orders/purchase-order-new-page.test.ts:4`; criterio en la tarea 1.4 del plan, QA pasos 2–4.

### 4. Frontend-lint-green

- **violatedCriterion:** `GATE-FRONTEND-LINT` — lint proporcional sin errores.
- **observation:** Biome reportó 4 errores en el alcance: formato en las páginas de propuesta y visita, y orden/formato en la prueba de propuesta.
- **evidencePointer:** comando `npx --no-install biome check <8 archivos del lane>` ejecutado desde `frontend`; salida `Checked 8 files`, `Found 4 errors`.

### 5. BUG-PO-01-error-boundary

- **violatedCriterion:** `BUG-PO-01-IMPLEMENTATION-4` — envolver el formulario en ErrorBoundary para errores no controlados.
- **observation:** `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx` no contiene ni monta un ErrorBoundary alrededor del formulario.
- **evidencePointer:** tarea 1.4, paso 4 del plan; archivo revisado `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx`.

## reproducedCommandsAndResults

- `npm run test -w frontend -- tests/modules/site-visits/site-visits-new-page.test.tsx tests/modules/proposals/proposal-new-page.test.tsx tests/modules/proposals/proposals-service.test.ts tests/modules/purchase-orders/purchase-order-new-page.test.ts` — **FAIL**, 2 archivos/2 tests fallidos, 6 tests pasaron.
- `npm run typecheck -w frontend` — **PASS**, exit 0.
- `npx --no-install biome check <los 8 archivos del lane>` desde `frontend` — **FAIL**, 4 errores.
- QA Playwright manual — **NOT RUN**; el usuario cerró la verificación y prohibió ejecutar más comandos antes de iniciar esta fase.

## remove-ai-slopsDirectPass

- Pruebas mojibake: dos regresiones nuevas no son ejecutables y bloquean su propio comportamiento objetivo.
- `purchase-order-new-page.test.ts` es implementation-mirroring: valida directamente el schema exportado y no la UI/flujo solicitado.
- Cobertura de visita incompleta: prueba edición, pero omite submit/redirección.
- No se observaron pruebas de borrado, deletion-only tests ni extracciones de producción creadas únicamente para satisfacer una aserción de eliminación.
- `site-visits/new/page.tsx` tiene 447 líneas físicas y concentra varias responsabilidades; se registra como riesgo de mantenimiento, no como blocker adicional porque la recomendación ya está fundada en gates y criterios funcionales explícitos.

## programmingDirectPass

- Typecheck frontend verde.
- La resolución del ID de propuesta usa un resultado discriminado (`found`/`invalid`) y validación Zod; es una mejora válida en el límite de respuesta.
- Las pruebas de página usan assertions (`as Proposal`) para forzar formas directas/enveloped, lo que reduce el valor del typecheck en el test.
- `SiteVisitFormBodyProps.mutationError: unknown` y casts en la página de visita agregan deuda de tipado frente a las reglas estrictas del repositorio; se registran como notas, no como blockers funcionales independientes.
- Biome no está verde en el alcance.

## codeReviewReportCoverage

No se encontró code review report del lane. El único artefacto del directorio `.omo/evidence/wave1-blockers-20260721/` es `vitest-targeted.log`, truncado después del encabezado de Vitest y sin resultado. La revisión directa cubrió slop/overfit, tipado, lint y criterios funcionales, pero no sustituye los gates fallidos.

## checkedArtifactPaths

- `.sisyphus/plans/plan-completo-3000l-refactor-corregir-madurar-escalar.md`
- `.omo/evidence/wave1-blockers-20260721/vitest-targeted.log`
- `frontend/src/app/(dashboard)/site-visits/new/page.tsx`
- `frontend/src/app/(dashboard)/site-visits/new/SiteVisitFormFields.tsx` (dependencia directa)
- `frontend/src/app/(dashboard)/site-visits/new/SiteVisitCaseSelector.tsx` (dependencia directa)
- `frontend/tests/modules/site-visits/site-visits-new-page.test.tsx`
- `frontend/src/app/(dashboard)/proposals/new/page.tsx`
- `frontend/src/modules/proposals/api/proposals.service.ts`
- `frontend/src/modules/proposals/queries.ts` (seam directo de mutación)
- `frontend/tests/modules/proposals/proposal-new-page.test.tsx`
- `frontend/tests/modules/proposals/proposals-service.test.ts`
- `frontend/src/app/(dashboard)/purchase-orders/new/page.tsx`
- `frontend/src/app/(dashboard)/purchase-orders/new/PurchaseOrderFormFields.tsx` (dependencia directa)
- `frontend/tests/modules/purchase-orders/purchase-order-new-page.test.ts`

## exactEvidenceGaps

- No code review report del lane.
- No manual QA matrix del lane.
- No notepad path específico del lane.
- El log del executor no contiene finalización ni conteos.
- No evidencia Playwright de los tres flujos.
- No prueba de submit/redirección de visita.
- No prueba renderizada del estado vacío de PO ni de ausencia de request con ID vacío.
- No prueba de listado posterior a creación de propuesta, requerida por BUG-PROP-01 QA paso 6.

## risksAndNotes

- La implementación del resolver de propuesta parece correcta por inspección y su prueba de servicio pasa, pero la prueba de integración de página está rota.
- El placeholder real de PO es “Seleccione una propuesta aprobada”, no el texto literal “Selecciona una propuesta” del QA; el significado es equivalente, pero debe fijarse en una prueba de UI.
- No se ejecutó build, verify ni React Doctor por cierre explícito del usuario; no se usan como blockers adicionales en esta revisión proporcional.

