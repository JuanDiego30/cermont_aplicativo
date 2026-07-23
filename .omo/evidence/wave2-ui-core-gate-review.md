# Wave 2 UI/core remediation gate review

Date: 2026-07-21

## recommendation

NEEDS_FIX (REJECT)

## originalIntent

Cerrar de forma independiente y de solo lectura la remediación de Wave 2 UI/core sobre las nueve superficies indicadas, reproduciendo Vitest y Biome focalizados y comprobando expresamente que los formularios cancelan el submit nativo y que ningún `catch` relevante silencia errores. Typecheck y Playwright debían intentarse solo si eran viables, separando con claridad los bloqueos externos.

## desiredOutcome

Un resultado CONFIRMED requería que las correcciones funcionales estuvieran presentes y cubiertas, que los archivos del alcance superaran el gate focalizado de Biome y que no conservaran defectos que contradijeran los criterios no negociables aplicables al lane. Los bloqueos externos de navegador no debían presentarse como fallos del código ni como falsos PASS.

## userOutcomeReview

La remediación funcional principal sí está presente: los dos formularios de inventario ejecutan `event.preventDefault()` antes de las mutaciones asíncronas, y `ResourcesPage` transforma el rechazo de eliminación en un mensaje visible con `role="alert"`. Los cuatro tests focalizados pasan y el typecheck completo del frontend pasa. Sin embargo, el gate no puede confirmarse: el `biome check` focalizado falla con seis errores dentro del alcance y tres módulos continúan por encima del límite obligatorio de 250 LOC puros, en contradicción con la regla del repositorio que prohíbe componentes monolíticos gigantes. Playwright llegó al login real, pero el QA autenticado quedó bloqueado por falta de credenciales; esto se registra como bloqueo externo, no como blocker del artefacto.

## blockers

1. **violatedCriterion:** `W2-BIOME-FOCUSED`
   - **observation:** El chequeo completo y de solo lectura de Biome sobre los nueve archivos termina con exit 1 y seis errores: formato en `admin/users`, `assets`, `inventory` y `templates`, y organización de imports en `fleet` e `inventory`.
   - **evidencePointer:** comando `npx biome check -- <9 rutas del alcance>` reproducido en esta revisión; salida exacta resumida en `commandsAndResults`; archivos `frontend/src/app/(dashboard)/admin/users/page.tsx`, `frontend/src/app/(dashboard)/assets/page.tsx`, `frontend/src/app/(dashboard)/fleet/page.tsx`, `frontend/src/app/(dashboard)/inventory/page.tsx` y `frontend/src/app/(dashboard)/templates/page.tsx`.

2. **violatedCriterion:** `CQ-NO-GIANT-MONOLITH`
   - **observation:** Tres archivos incumplen el límite de 250 LOC puros del pase `programming`/`remove-ai-slops` y la regla explícita “No giant monolithic components”: inventory 523, fleet 288 y admin/users 313.
   - **evidencePointer:** `frontend/src/app/(dashboard)/inventory/page.tsx` (página en L115, formulario de alta en L328 y movimiento en L461); `frontend/src/app/(dashboard)/fleet/page.tsx` (banner en L37, filtros en L121 y página en L161); `frontend/src/app/(dashboard)/admin/users/page.tsx` (página interna en L106, paginación en L248 y fila en L299). Conteo reproducido excluyendo líneas vacías y comentarios.

## targetedBehaviorVerification

### Submit nativo

- `frontend/src/app/(dashboard)/inventory/page.tsx:365` y `:490`: ambos `onSubmit` llaman `event.preventDefault()` antes de iniciar `handleCreateItem`/`handleMovement`.
- `frontend/src/app/(dashboard)/inventory/page.tsx:451` y `:549`: ambos botones de acción son `type="submit"`.
- `frontend/tests/modules/inventory/inventory-page.test.tsx`: los dos tests verifican que `fireEvent.submit(form)` devuelve `false` y, además, observan la mutación y su payload. No son tests tautológicos ni de eliminación.
- `frontend/src/modules/customers/ui/CustomerForm.tsx:77` usa `handleSubmit(onSubmit)` de React Hook Form y conserva un botón `type="submit"` en L155.

### Catch no silencioso

- `frontend/src/app/(dashboard)/resources/page.tsx:79`: el rechazo se estrecha con `instanceof Error`, tiene fallback para valores no `Error` y se expone en un `role="alert"`.
- `frontend/src/app/(dashboard)/inventory/page.tsx:352` y `:480`: ambos catches convierten el error en estado visible con `role="alert"`.
- `frontend/tests/modules/resources/resources-page.test.tsx`: el test fuerza `Error("Permiso insuficiente")` y comprueba el mensaje visible. El segundo test comprueba la ruta canónica del CTA; ambos observan comportamiento de UI.
- No se hallaron catches vacíos, `console.log`, `debugger`, `alert(...)`, `as any`, `as unknown`, `@ts-ignore` ni `@ts-expect-error` en las nueve rutas revisadas.

## commandsAndResults

- `npm run test -w frontend -- tests/modules/inventory/inventory-page.test.tsx tests/modules/resources/resources-page.test.tsx` — **PASS**, exit 0: 2 archivos, 4 tests.
- `npx biome lint -- <9 rutas del alcance>` — **PASS**, exit 0: 9 archivos, sin fixes.
- `npx biome check -- <9 rutas del alcance>` — **FAIL**, exit 1: 6 errores dentro del alcance (4 de formato y 2 de organización de imports; inventory aporta ambos tipos).
- `npm run typecheck -w frontend` — **PASS**, exit 0: `tsc --noEmit` sin diagnósticos.
- `omo ulw-loop status --json` — el wrapper `.cmd` falló por sintaxis; la invocación directa del CLI devolvió `ULW_LOOP_PLAN_MISSING`. Se usó correctamente la ruta fallback `.omo/evidence/wave2-ui-core-gate-review.md`.

## manualQAMatrix

| Surface | Observation | Result |
| --- | --- | --- |
| `http://127.0.0.1:3000/inventory` | Navegador real abierto; redirección de seguridad a `/login`. | BLOCKED_EXTERNAL |
| `/login` | Renderizó, terminó hidratación, habilitó campos y botón; 0 errores de consola y 1 warning LCP no relacionado. | OBSERVED |
| Rutas autenticadas restantes | No se suministraron credenciales ni estado autenticado; no se intentaron credenciales inventadas. | BLOCKED_EXTERNAL |

El wrapper Playwright por Git Bash falló primero con `STATUS_DLL_INIT_FAILED`/`errno 11`; el fallback directo por `npx @playwright/cli` abrió y cerró correctamente la sesión `wave2remediation`. Evidencia de navegador: `.playwright-cli/page-2026-07-21T06-59-45-407Z.yml` y `.playwright-cli/console-2026-07-21T06-59-39-040Z.log`.

## remove-ai-slops direct pass

- **Tests excesivos/inútiles:** no detectados en los dos archivos focalizados.
- **Tests de eliminación o de mera remoción:** no detectados.
- **Tautologías / espejo de implementación:** los asserts de payload están acompañados por resultados observables del formulario; el retorno falso del submit detectaría la regresión de `preventDefault`. El test de error de Resources detectaría un catch vuelto a silenciar.
- **Extracción/parsing/normalización innecesaria:** no fue introducida por la remediación focalizada.
- **Slop de producción:** persisten comentarios que narran estructura/historial en resources y fleet, assertions literales engañosas en inventory (`as "herramienta"`, `as "salida"`) y ternarios anidados en resources. Son NOTES porque no se ligan por sí solos a un criterio de aceptación fallido.
- **Módulos sobredimensionados:** sí detectados y registrados como blocker `CQ-NO-GIANT-MONOLITH`.

## programming direct pass

- TypeScript estricto compila con `tsc --noEmit`.
- Los catches focalizados manejan un resultado visible y no silencian el fallo.
- No hay escape hatches prohibidos por AGENTS (`any`, `unknown` como escape, `as any`, ignores).
- Persisten assertions de tipo no necesarias y archivos por encima de 250 LOC; las primeras son NOTE, los segundos son blocker por criterio explícito.
- Hallazgo de cobertura no bloqueante: `frontend/tests/e2e/characterization/client-form-submit.spec.ts:47` usa `.fill(clientData.industry)` aunque `CustomerForm` renderiza un `<select>` para industria desde L95 y el valor `Tecnología` no figura entre sus opciones. El spec se salta sin credenciales, por lo que debe alinearse antes de considerarlo evidencia E2E confiable.

## codeReviewCoverage

No se encontró un code review report de remediación que documente simultáneamente los criterios `remove-ai-slops`, `programming` y la taxonomía de tests sobreajustados. El gate anterior contiene un pase directo, pero describe el estado previo y ya no es evidencia vigente para submit/catch. Esta revisión ejecutó directamente ambos pases; por ello, la ausencia del report separado se registra como gap y no como blocker adicional.

## checkedArtifactPaths

- `frontend/src/app/(dashboard)/inventory/page.tsx`
- `frontend/src/app/(dashboard)/resources/page.tsx`
- `frontend/src/app/(dashboard)/templates/page.tsx`
- `frontend/src/app/(dashboard)/assets/page.tsx`
- `frontend/src/app/(dashboard)/fleet/page.tsx`
- `frontend/src/app/(dashboard)/admin/users/page.tsx`
- `frontend/src/modules/customers/ui/CustomerForm.tsx`
- `frontend/tests/modules/inventory/inventory-page.test.tsx`
- `frontend/tests/modules/resources/resources-page.test.tsx`
- `frontend/package.json`
- `package.json`
- `frontend/playwright.config.ts`
- `frontend/tests/e2e/characterization/client-form-submit.spec.ts`
- `frontend/tests/e2e/qa-critical-bugs.spec.ts`
- `frontend/tests/e2e/pages/admin-pages.spec.ts`
- `frontend/tests/e2e/spec-008-009-smoke.spec.ts`
- `.omo/evidence/wave2-ui-remediation-20260721.md`
- `.omo/evidence/wave2-ui-20260721.md`
- `.omo/evidence/wave2-ui-core-gate-review.md` (estado previo leído antes de reemplazarlo)
- `.playwright-cli/page-2026-07-21T06-59-45-407Z.yml`
- `.playwright-cli/console-2026-07-21T06-59-39-040Z.log`

## exactEvidenceGaps

- No se suministraron diff verificable, code review report vigente, manual QA matrix previa ni notepad path. No se ejecutó Git por instrucción expresa.
- El brief original completo no está disponible fuera de los reportes Wave 2; la intención se reconstruyó del pedido actual y de esos artefactos.
- El QA autenticado no es reproducible sin credenciales/estado de sesión.
- No se ejecutaron build, verify, react-doctor ni suites largas adicionales: el usuario ordenó cerrar el gate y detener pruebas largas.
- El `biome lint` focalizado pasa, pero no cubre formato ni assists; el `biome check` focalizado sí los cubre y falla. No se presenta el lint parcial como confirmación global de Biome.

## finalResult

**NEEDS_FIX**
