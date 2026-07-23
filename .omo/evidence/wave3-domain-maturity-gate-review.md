# Wave 3 domain maturity — gate review

## recommendation

NEEDS_FIX

## originalIntent

Revisar de forma independiente y solo sobre las superficies declaradas de Wave 3 que el dashboard tenga madurez de dominio, que ejecución anuncie conectividad, que planeación valide Excel de forma real, que auditoría use estados cromáticos semánticos y que backups confirme exportaciones mediante un diálogo accesible. El gate debía reproducir Biome y cuatro archivos de prueba enfocados, distinguiendo fallos externos de typecheck.

## desiredOutcome

Las superficies declaradas deben pasar el análisis estático y las pruebas enfocadas, y el comportamiento visible debe estar implementado realmente: diálogo accesible en backups, estilos de auditoría derivados de la acción y validación de contenido Excel que no dependa solo de metadatos controlables.

## userOutcomeReview

- Backups: confirmado por inspección. Usa Radix Dialog con `Dialog.Content`, `Dialog.Title`, `Dialog.Description`, cierres semánticos y activación desde un `button` (`frontend/src/app/(dashboard)/admin/backups/page.tsx:153`, `:165-203`).
- Auditoría: confirmado por inspección. Los estilos se derivan de familias de acciones y usan tokens semánticos success/info/warning/danger (`frontend/src/modules/audit/ui/AuditLogViewer.tsx:54-89`, `:137-165`). La prueba cubre solamente la rama info, por lo que el resto queda como evidencia estática, no conductual.
- Excel: no confirmado. `validateExcelFile` solo revisa nombre, `File.type` y tamaño; cualquier texto con nombre `.xlsx` y MIME de XLSX retorna `valid` (`frontend/src/app/(dashboard)/planning/ExcelUploadCard.tsx:9-27`). La propia prueba de aceptación construye `new File(["workbook"], "recursos.xlsx", { type: ...xlsx })` y lo presenta como libro válido (`frontend/tests/app/planning-excel-upload.test.tsx:53-65`). No se inspecciona firma ZIP/OLE ni se parsea un workbook.
- Dashboard: la superficie real declarada es `frontend/src/modules/dashboard/model/dashboard-helpers.ts`, y la implementación más las pruebas actuales apuntan a ese archivo. No se crea un módulo duplicado `dashboard-kpis.ts`. Además, buena parte de `dashboard-kpis.test.ts` calcula y afirma lógica definida dentro del propio test, lo que aporta falsa confianza y no cubre producción (`frontend/tests/modules/dashboard/dashboard-kpis.test.ts:13-140`, `:236-275`).
- Conectividad: la prueba enfocada afirma texto observable mediante `role=status`, no solo color (`frontend/tests/app/execution-connection-status.test.tsx:5-18`).
- Typecheck: el log disponible falla únicamente por errores de parser en `frontend/tests/modules/purchase-orders/purchase-order-new-page.test.ts`, fuera del alcance declarado. Se clasifica como fallo externo y no como blocker de Wave 3.

## blockers

1. `violatedCriterion: W3-EXCEL-REAL`
   - Observation: la supuesta validación Excel acepta contenido arbitrario con extensión y MIME correctos; la prueba positiva también usa texto plano y por tanto es tautológica respecto de los metadatos.
   - `evidencePointer`: `frontend/src/app/(dashboard)/planning/ExcelUploadCard.tsx:9-27`; `frontend/tests/app/planning-excel-upload.test.tsx:43-65`.


## remove-ai-slops / programming direct pass

- Bloqueante ligado a criterio: prueba Excel de aceptación con contenido ficticio y test de “spoofing” que solo cambia el MIME; no demuestra validación real.
- Nota de falsa confianza: `dashboard-kpis.test.ts` contiene helpers, cálculos y literales de producción simulados dentro del propio test (bottlenecks, SLA, progression y cost overrun). Estas pruebas seguirían verdes aunque la producción correspondiente se eliminara.
- Nota de mantenimiento: `dashboard/page.tsx` (689 LOC puros), `execution/page.tsx` (377), `AuditLogViewer.tsx` (398) y `DashboardCommandCenter.tsx` (392) superan el umbral de 250 LOC de las skills. Se registra como deuda; no es blocker adicional porque el gate solicitado nombra resultados funcionales concretos y no autorizó refactor.
- No se detectaron `any`, `unknown` como escape, `@ts-ignore`, `@ts-expect-error`, catches vacíos, `console.log`, `debugger` o `alert` en el alcance buscado.

## checkedArtifactPaths

- `frontend/src/app/(dashboard)/dashboard/page.tsx`
- `frontend/src/modules/dashboard/model/dashboard-helpers.ts` (superficie declarada real; no se crea `dashboard-kpis.ts`)
- `frontend/src/modules/dashboard/ui/*`
- `frontend/src/app/(dashboard)/execution/page.tsx`
- `frontend/src/app/(dashboard)/planning/page.tsx`
- `frontend/src/app/(dashboard)/planning/ExcelUploadCard.tsx` (dependencia directa requerida por la prueba declarada)
- `frontend/tests/app/planning-excel-upload.test.tsx`
- `frontend/tests/app/execution-connection-status.test.tsx`
- `frontend/tests/modules/dashboard/dashboard-kpis.test.ts`
- `frontend/src/modules/audit/ui/*`
- `frontend/src/app/(dashboard)/admin/audit/page.tsx`
- `frontend/src/app/(dashboard)/admin/backups/page.tsx`
- `.omo/evidence/wave3-domain-maturity-20260721/**`
- `omo ulw-loop status --json`: el wrapper de Windows falló; la invocación directa del CLI devolvió `ULW_LOOP_PLAN_MISSING`, por lo que se usó el fallback `.omo/evidence/<goal>-gate-review.md`.

## reproducedEvidence

- Evidencia inspeccionada: `reverification-2/biome-check.log` informa `Checked 13 files ... No fixes applied`.
- Evidencia inspeccionada: `reverification-2/vitest-focused-final.log` informa 4 archivos y 24 pruebas verdes.
- Evidencia inspeccionada: `reverification-2/typecheck-frontend.log` muestra únicamente errores externos de purchase-orders.
- Por instrucción final del usuario se detuvieron nuevas pruebas antes de una reproducción independiente adicional. Los logs del worker no se usan para superar los blockers demostrados directamente en código y tests.

## exactEvidenceGaps

- No hay code review report en el directorio Wave 3 que cubra explícitamente `remove-ai-slops` y `programming`.
- No hay manual QA matrix ni notepad path declarados en la evidencia Wave 3.
- La evidencia reconoce que el QA autenticado de dashboard, ejecución, planeación, auditoría y backups no se completó.
- El log de Biome dice 13 archivos pero no conserva la lista exacta de argumentos; no permite demostrar por sí solo que cubrió todo `frontend/src/modules/dashboard/ui/*`.
- No existe prueba de interacción accesible del diálogo de backups; la conformidad aquí se sustenta por inspección de la composición Radix.
- No existe prueba que rechace un archivo de texto con extensión y MIME Excel correctos ni prueba con un workbook real.
