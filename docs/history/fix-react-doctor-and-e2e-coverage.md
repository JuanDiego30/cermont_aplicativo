# Plan: Corrección React Doctor + Cobertura E2E Completa

## TL;DR

> **Quick Summary**: Corregir los 12 issues reportados por React Doctor en `npm run verify` y completar la cobertura de tests E2E (Playwright) para todas las rutas del frontend (81+ rutas).
>
> **Deliverables**:
> - 3 archivos de componentes corregidos (QRScanner, CameraCapture, EvidenceUploader)
> - 3 archivos de queries/utils con exports no usados limpiados
> - 1 suite E2E expandida con cobertura de todas las rutas del frontend
> - `react-doctor --verbose` limpio (0 issues)
>
> **Estimated Effort**: Medium (6-8 tareas paralelizables)
> **Parallel Execution**: YES — 3 waves
> **Critical Path**: Task 3 (EvidenceUploader refactor) → dependencias más complejas

---

## Context

### Original Request
El usuario ejecutó `npm run verify` y encontró 12 issues de React Doctor en el frontend. Además, la cobertura de tests E2E page-smoke solo cubre 18 de 81+ rutas implementadas. Solicita:
1. Corregir todos los issues de React Doctor
2. Revisar y corregir lógica de páginas
3. Agregar tests E2E para todas las páginas

### Interview Summary
**Key Findings**:
- **QRScanner.tsx:18**: `useEffect` cleanup lee `scannerRef.current` que puede cambiar. Fix con refs de callbacks.
- **CameraCapture.tsx:45**: Mismo patrón con `streamRef.current`. Además el `<video>` en línea 126 carece de `aria-label`.
- **Unused exports**: Confirmado por grep. `businessDocumentKeys`, `useCreateBusinessDocument`, `DOCUMENT_TYPE_LABELS`, `erpConnectorKeys`, `useErpConnector`, `useCreateErpConnector`, `useDeleteErpConnector` no son importados por ningún módulo.
- **EvidenceUploader.tsx:38**: 342 líneas, 6 `useState` → refactor a `useReducer` + split en sub-componentes.
- **E2E gap**: 63+ rutas sin cobertura de smoke test.

### Metis Review
No disponible (saldo insuficiente). Gaps identificados manualmente:
- Ningún gap crítico — todos los issues están claramente diagnosticados en el output de React Doctor y confirmados por grep.
- Edge case: Algunos exports "unused" podrían ser necesarios si hay páginas planeadas pero no implementadas. Se asume que si no existen consumidores ahora, deben limpiarse (YAGNI).

---

## Work Objectives

### Core Objective
Corregir todos los 12 issues de React Doctor y expandir cobertura E2E al 100% de las rutas del frontend.

### Concrete Deliverables
- [ ] 12 React Doctor issues corregidos (score 100/100)
- [ ] Suite E2E page-smoke cubriendo 81+ rutas
- [ ] Componentes evidences refactorizados con mejor separación de responsabilidades
- [ ] Código muerto limpio (unused exports)

### Must Have
1. `react-doctor --verbose` reporta 0 issues después de los cambios
2. Todos los tests existentes siguen pasando (`npm run test -w frontend`)
3. Typecheck, lint y build pasan limpios
4. E2E smoke tests para cada ruta del frontend

### Must NOT Have (Guardrails)
- No cambiar comportamiento funcional de los componentes
- No modificar lógica de negocio
- No modificar páginas existentes (solo componentes de UI afectados)
- No agregar nuevas funcionalidades
- No modificar `package.json` ni dependencias

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES (Playwright 1.58.2 + Vitest)
- **Automated tests**: Tests-after (existing tests + new E2E smoke tests)
- **Framework**: Vitest (unit) + Playwright (E2E)
- **Verification commands**:
  ```bash
  # After changes
  cd frontend && npx react-doctor@latest --verbose
  npm run typecheck -w frontend
  npm run lint -w frontend
  npm run test -w frontend
  npm run test:e2e -w frontend -- tests/e2e/page-smoke.spec.ts
  ```

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario}.{ext}`.

- **Frontend/UI**: Use Playwright (browser) — Navigate, interact, assert DOM
- **CLI**: Use bash — run typecheck, lint, build, react-doctor

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — React Doctor fixes, MAX PARALLEL):
├── Task 1: Fix QRScanner.tsx useEffect missing dep [deep]
├── Task 2: Fix CameraCapture.tsx useEffect + accesibilidad [deep]
├── Task 3: Remove unused exports (3 files) [quick]
├── Task 4: Refactor EvidenceUploader.tsx (split + useReducer) [deep]

Wave 2 (After Wave 1 — tests):
├── Task 5: Expand E2E page-smoke coverage [unspecified-high]
├── Task 6: Add evidence module E2E tests [unspecified-high]

Wave FINAL (After ALL tasks):
├── Task F1: Run verification gates + react-doctor
├── Task F2: Run full E2E suite
└── → Present results → Get explicit user okay

Critical Path: Task 4 → Task 5 → F1
Parallel Speedup: ~60% faster than sequential
```

### Dependency Matrix
- **1-3**: - - 4-5, 1
- **4**: 1-3 - 5, 1
- **5**: 4 - F1-F2, 2
- **6**: 4 - F2, 2
- **F1-F2**: 5, 6 - user-okay, 3

---

## TODOs

> Implementation + Verification = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + QA Scenarios.

- [ ] 1. Fix QRScanner.tsx — useEffect missing dependency

  **What to do**:
  - Archivo: `frontend/src/modules/evidences/ui/QRScanner.tsx`
  - El `useEffect` en línea 18 tiene `onScan` y `onClose` en el array de dependencias pero el cleanup lee `scannerRef.current` que puede haber cambiado.
  - Solución canónica (recomendada por React Doctor): convertir `onScan` y `onClose` a refs estables (`useRef`) para que el effect no dependa de ellos, y que el cleanup siempre lea la versión correcta via ref.
  - Alternativamente: estabilizar las funciones con `useCallback` en el padre (pero eso es responsabilidad del consumidor).
  - Mantener `active` flag pattern para evitar setState después de unmount.

  **Fix detallado**:
  ```typescript
  // Añadir useRef para callbacks
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);
  onScanRef.current = onScan;
  onCloseRef.current = onClose;

  // useEffect ahora depende solo de [] (no de callbacks)
  useEffect(() => {
    let active = true;
    const start = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader-container");
        scannerRef.current = scanner;
        if (!active) return;
        setScannerReady(true);
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.7777 },
          (decodedText) => {
            if (active) {
              onScanRef.current(decodedText);
              onCloseRef.current();
            }
          },
          () => {},
        );
      } catch {
        if (active) setError("No se pudo iniciar la cámara para escanear.");
      }
    };
    start();
    return () => {
      active = false;
      (async () => {
        try { await scannerRef.current?.stop(); } catch { /* cleanup */ }
        try { await scannerRef.current?.clear(); } catch { /* cleanup */ }
      })();
    };
  }, []);
  // Deps vacío — scannerRef es estable por definición
  ```

  **Must NOT do**:
  - No cambiar la lógica de escaneo
  - No modificar el JSX de render
  - No agregar dependencias nuevas

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Corrección precisa de effects con side effects (cámara, limpieza)
  - **Skills**: []
  - **Skills Evaluated but Omitted**: none

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 4 (EvidenceUploader depends on QRScanner)
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/evidences/ui/QRScanner.tsx` — Archivo completo a modificar
  - Documentación React Doctor: `https://react.doctor/docs/rules/react-doctor/exhaustive-deps`

  **Acceptance Criteria**:
  - [ ] `cd frontend && npx react-doctor@latest --verbose` ya no reporta issue en QRScanner.tsx

  **QA Scenarios**:
  ```
  Scenario: QRScanner useEffect no longer has missing dep warning
    Tool: Bash
    Steps:
      1. cd frontend && npx react-doctor@latest --verbose 2>&1
      2. Grep output for "QRScanner"
    Expected Result: No mention of QRScanner.tsx in output, or only unrelated issues
    Failure Indicators: "QRScanner.tsx:18" still appears in react-doctor output
    Evidence: .sisyphus/evidence/task-1-react-doctor-clean.txt

  Scenario: TypeScript compiles without errors
    Tool: Bash
    Steps:
      1. cd frontend && npx tsc --noEmit --pretty 2>&1
    Expected Result: Exit code 0, no type errors
    Failure Indicators: Any TypeScript compilation error
    Evidence: .sisyphus/evidence/task-1-tsc-pass.txt
  ```

  **Commit**: YES
  - Message: `fix(evidences): stabilize QRScanner effect deps with ref pattern`
  - Files: `frontend/src/modules/evidences/ui/QRScanner.tsx`

---

- [ ] 2. Fix CameraCapture.tsx — useEffect + aria-label en video

  **What to do**:
  - Archivo: `frontend/src/modules/evidences/ui/CameraCapture.tsx`
  - **Issue 1 (bug)**: `useEffect` en línea 45 depende de `facingMode` y `startCamera`, y el cleanup lee `streamRef.current` que puede haber cambiado.
    - Solución canónica: Extraer `startCamera` a una función fuera del componente o mover la lógica de stream al effect directamente con refs para `facingMode`.
    - Implementación: Usar `useRef` para `facingModeRef` y eliminar `startCamera` del effect dependencia. Poner `startCamera` como función estable memoizada.
  - **Issue 2 (accessibility)**: Elemento `<video>` en línea 126 no tiene `aria-label` ni `title` descriptivo.
    - Añadir `aria-label="Vista previa de la cámara"` al `<video>`.

  **Fix detallado**:
  ```typescript
  // 1. Añadir facingModeRef
  const facingModeRef = useRef(facingMode);
  facingModeRef.current = facingMode;

  // 2. Extraer startCamera como función independiente
  const startCamera = useCallback(async (mode: FacingMode) => {
    // ... contenido actual ...
  }, []); // Sin dependencias — todo se pasa como argumento

  // 3. useEffect simplificado
  useEffect(() => {
    startCamera(facingModeRef.current);
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]); // Solo startCamera (estable)

  // 4. Añadir aria-label al video
  // <video ref={videoRef} autoPlay playsInline className="max-h-full" aria-label="Vista previa de la cámara">
  ```

  **Must NOT do**:
  - No cambiar lógica de captura de foto
  - No modificar handlers de botones

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Requiere entender el lifecycle de MediaStream + accesibilidad

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:
  - `frontend/src/modules/evidences/ui/CameraCapture.tsx` — Archivo a modificar
  - `frontend/AGENTS.md` — Reglas de accesibilidad

  **Acceptance Criteria**:
  - [ ] `npx react-doctor@latest --verbose` no reporta issues en CameraCapture.tsx
  - [ ] El `<video>` tiene `aria-label="Vista previa de la cámara"`
  - [ ] TypeScript compila sin errores

  **QA Scenarios**:
  ```
  Scenario: React Doctor no longer reports CameraCapture issues
    Tool: Bash
    Steps:
      1. cd frontend && npx react-doctor@latest --verbose 2>&1
      2. Grep output for "CameraCapture"
    Expected Result: No mention of CameraCapture.tsx in react-doctor issues
    Failure Indicators: CameraCapture.tsx still listed at lines 45 or 126
    Evidence: .sisyphus/evidence/task-2-react-doctor-clean.txt

  Scenario: TypeScript compiles
    Tool: Bash
    Steps:
      1. cd frontend && npx tsc --noEmit --pretty 2>&1
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-2-tsc-pass.txt
  ```

  **Commit**: YES
  - Message: `fix(evidences): stabilize CameraCapture deps and add video aria-label`
  - Files: `frontend/src/modules/evidences/ui/CameraCapture.tsx`

---

- [ ] 3. Remove unused exports (3 files)

  **What to do**:
  - **File 1**: `frontend/src/modules/business-documents/queries.ts`
    - `businessDocumentKeys`: Eliminar export (dejar como constante interna o eliminar si no se usa internamente)
    - `useCreateBusinessDocument`: Eliminar export (o eliminar función completa si no se usa)
    - Verificar: `useBusinessDocuments` y `useBusinessDocument` sí son usados → conservar
  - **File 2**: `frontend/src/modules/business-documents/utils.ts`
    - `DOCUMENT_TYPE_LABELS`: Eliminar export (dejar como constante interna si se necesita, o eliminar)
    - Verificar: `getDocumentTypeLabel` sí es usado → conservar
  - **File 3**: `frontend/src/modules/erp-connector/queries.ts`
    - `erpConnectorKeys`: Eliminar export (dejar como interna o eliminar)
    - `useErpConnector`: Eliminar export (o eliminar función)
    - `useCreateErpConnector`: Eliminar export (o eliminar función)
    - `useDeleteErpConnector`: Eliminar export (o eliminar función)
    - Verificar: `useErpConnectors` y `useSyncErpConnector` sí son usados → conservar

  **Regla**: Si la función/símbolo solo se usa internamente en el mismo archivo, quitar `export` pero mantener la declaración. Si no se usa en absoluto (ni interna ni externamente), eliminar la declaración completa. Verificar con grep antes de eliminar.

  **Must NOT do**:
  - No eliminar funciones que SÍ son usadas (verificar cada una)
  - No eliminar funciones que tienen consumidores planeados pero aún no implementados
  - No modificar la API de las funciones que permanecen

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Tarea mecánica de limpieza, cambios predecibles

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: None
  - **Blocked By**: None

  **Reference**:
  - `frontend/src/modules/business-documents/queries.ts`
  - `frontend/src/modules/business-documents/utils.ts`
  - `frontend/src/modules/erp-connector/queries.ts`

  **Acceptance Criteria**:
  - [ ] `npx react-doctor@latest --verbose` no reporta unused exports
  - [ ] TypeScript compila sin errores
  - [ ] Las páginas que usan `useBusinessDocuments`, `useBusinessDocument`, `getDocumentTypeLabel`, `useErpConnectors`, `useSyncErpConnector` siguen funcionando

  **QA Scenarios**:
  ```
  Scenario: React Doctor no unused exports
    Tool: Bash
    Steps:
      1. cd frontend && npx react-doctor@latest --verbose 2>&1
      2. Grep for "unused-export" or "deslop/unused-export"
    Expected Result: No unused-export findings
    Failure Indicators: Any "unused-export" warning still present
    Evidence: .sisyphus/evidence/task-3-no-unused-exports.txt

  Scenario: TypeScript compiles without errors
    Tool: Bash
    Steps:
      1. cd frontend && npx tsc --noEmit --pretty 2>&1
    Expected Result: Exit code 0
    Failure Indicators: Any compilation error
    Evidence: .sisyphus/evidence/task-3-tsc-pass.txt

  Scenario: Affected pages still build
    Tool: Bash
    Steps:
      1. cd frontend && npx next build --turbopack 2>&1 | tail -20
    Expected Result: Build succeeds without errors
    Evidence: .sisyphus/evidence/task-3-build-pass.txt
  ```

  **Commit**: YES (groups with all unused exports changes)
  - Message: `refactor: remove unused exports across business-documents and erp-connector`
  - Files: `frontend/src/modules/business-documents/queries.ts`, `frontend/src/modules/business-documents/utils.ts`, `frontend/src/modules/erp-connector/queries.ts`

---

- [ ] 4. Refactor EvidenceUploader.tsx — split + useReducer

  **What to do**:
  - Archivo: `frontend/src/modules/evidences/ui/EvidenceUploader.tsx` (342 líneas, actualmente)
  - **Problema**: 6 `useState` calls + lógica mezclada + componente monolítico
  - **Refactor**: Dividir en responsabilidades claras usando `useReducer` + extracción de lógica

  **4a. Crear `evidenceReducer` y tipos** en `frontend/src/modules/evidences/model/evidenceReducer.ts`:
  ```typescript
  import type { PhotoEntry, GpsCaptureState } from "./constants";

  export interface EvidenceUploadState {
    photos: PhotoEntry[];
    gpsCapture: GpsCaptureState;
    isSubmitting: boolean;
    uploadProgress: { current: number; total: number } | null;
  }

  export type EvidenceAction =
    | { type: "ADD_PHOTOS"; photos: PhotoEntry[] }
    | { type: "REMOVE_PHOTO"; id: string }
    | { type: "UPDATE_PHOTO_TITLE"; id: string; title: string }
    | { type: "UPDATE_PHOTO_TYPE"; id: string; type: string }
    | { type: "SET_GPS"; gps: GpsCaptureState }
    | { type: "SET_SUBMITTING"; isSubmitting: boolean }
    | { type: "SET_UPLOAD_PROGRESS"; progress: { current: number; total: number } | null }
    | { type: "RESET" };

  export function evidenceReducer(state: EvidenceUploadState, action: EvidenceAction): EvidenceUploadState {
    switch (action.type) {
      case "ADD_PHOTOS":
        return { ...state, photos: [...state.photos, ...action.photos] };
      case "REMOVE_PHOTO": {
        const target = state.photos.find(p => p.id === action.id);
        if (target) URL.revokeObjectURL(target.previewUrl);
        return { ...state, photos: state.photos.filter(p => p.id !== action.id) };
      }
      case "UPDATE_PHOTO_TITLE":
        return {
          ...state,
          photos: state.photos.map(p =>
            p.id === action.id ? { ...p, title: action.title, error: action.title.trim() ? undefined : p.error } : p
          ),
        };
      case "UPDATE_PHOTO_TYPE":
        return {
          ...state,
          photos: state.photos.map(p =>
            p.id === action.id ? { ...p, type: action.type as any } : p
          ),
        };
      case "SET_GPS":
        return { ...state, gpsCapture: action.gps };
      case "SET_SUBMITTING":
        return { ...state, isSubmitting: action.isSubmitting };
      case "SET_UPLOAD_PROGRESS":
        return { ...state, uploadProgress: action.progress };
      case "RESET":
        return { photos: [], gpsCapture: { state: "idle" }, isSubmitting: false, uploadProgress: null };
      default:
        return state;
    }
  }

  export const initialUploadState: EvidenceUploadState = {
    photos: [],
    gpsCapture: { state: "idle" },
    isSubmitting: false,
    uploadProgress: null,
  };
  ```

  **4b. Extraer hook `useEvidenceUpload`** en `frontend/src/modules/evidences/hooks/useEvidenceUpload.ts`:
  - Mover toda la lógica de negocio (addFiles, remove, update, validate, submit, GPS, camera)
  - El hook retorna: state, dispatch, acciones, UI state (showCamera, showQRScanner), derived state (canSubmit, hasErrors, etc.)
  - Separar `showCamera`/`showQRScanner` como `useState` de UI (no necesitan reducer)

  **4c. Simplificar EvidenceUploader.tsx**:
  - Importar hook `useEvidenceUpload`
  - JSX puro — sin lógica de negocio
  - Pasar props a sub-componentes

  **Must NOT do**:
  - No cambiar comportamiento visual o funcional
  - No modificar `EvidenceDropZone`, `EvidencePhotoCard`, `EvidenceGpsCapture`, `EvidenceSubmitBar`
  - No modificar `QRScanner` o `CameraCapture` (ya corregidos en Tasks 1-2)
  - No eliminar funcionalidad existente

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Refactor complejo que requiere dividir estado y lógica sin romper funcionalidad

  **Parallelization**:
  - **Can Run In Parallel**: NO (depende de Tasks 1-2)
  - **Parallel Group**: Wave 2 (sequential)
  - **Blocks**: Task 5 (evidence E2E tests dependen de este refactor)
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `frontend/src/modules/evidences/ui/EvidenceUploader.tsx` — Archivo a refactorizar
  - `frontend/src/modules/evidences/model/constants.ts` — Tipos existentes
  - `frontend/src/modules/evidences/hooks/useOfflineEvidence.ts` — Hook existente
  - Patrón useReducer vs useState: `https://react.doctor/docs/rules/react-doctor/prefer-useReducer`

  **Acceptance Criteria**:
  - [ ] EvidenceUploader.tsx < 200 líneas (vs 342 actuales)
  - [ ] useReducer reemplaza 4 de 6 useState calls
  - [ ] `npx react-doctor@latest --verbose` no reporta "no-giant-component" ni "prefer-useReducer" en EvidenceUploader
  - [ ] TypeScript compila sin errores
  - [ ] Todos los tests existentes pasan

  **QA Scenarios**:
  ```
  Scenario: EvidenceUploader no longer triggers React Doctor warnings
    Tool: Bash
    Steps:
      1. cd frontend && npx react-doctor@latest --verbose 2>&1
      2. Grep for "EvidenceUploader"
    Expected Result: No "no-giant-component" or "prefer-useReducer" warnings for EvidenceUploader
    Failure Indicators: React Doctor still reports EvidenceUploader as too large or too many useState
    Evidence: .sisyphus/evidence/task-4-react-doctor-clean.txt

  Scenario: TypeScript compiles
    Tool: Bash
    Steps:
      1. cd frontend && npx tsc --noEmit --pretty 2>&1
    Expected Result: Exit code 0
    Evidence: .sisyphus/evidence/task-4-tsc-pass.txt

  Scenario: Existing tests pass
    Tool: Bash
    Steps:
      1. cd frontend && npx vitest run 2>&1 | tail -20
    Expected Result: All tests pass (226 passed, 3 skipped)
    Failure Indicators: Any test failure
    Evidence: .sisyphus/evidence/task-4-tests-pass.txt

  Scenario: Build succeeds
    Tool: Bash
    Steps:
      1. cd frontend && npx next build --turbopack 2>&1 | tail -10
    Expected Result: Build succeeds
    Evidence: .sisyphus/evidence/task-4-build-pass.txt
  ```

  **Commit**: YES
  - Message: `refactor(evidences): split EvidenceUploader with useReducer and extract hook`
  - Files:
    - `frontend/src/modules/evidences/model/evidenceReducer.ts` (NEW)
    - `frontend/src/modules/evidences/hooks/useEvidenceUpload.ts` (NEW)
    - `frontend/src/modules/evidences/ui/EvidenceUploader.tsx`

---

- [ ] 5. Expand E2E page-smoke coverage to all routes

  **What to do**:
  - Archivo: `frontend/tests/e2e/page-smoke.spec.ts`
  - Expandir el array `CRITICAL_PAGES` para cubrir TODAS las rutas del frontend
  - Usar las rutas del build output como fuente de verdad (81+ routes)
  - Agrupar rutas por módulo para mejor organización
  - Mantener la misma estructura de test: login → navigate → assert main visible → no console errors

  **Rutas a agregar** (organizadas por módulo):
  ```
  // Core / Auth
  { path: "/", name: "Root" },
  { path: "/login", name: "Login" },
  { path: "/register", name: "Register" },

  // Admin
  { path: "/admin", name: "Admin" },
  { path: "/admin/audit", name: "Admin Audit" },
  { path: "/admin/backups", name: "Admin Backups" },
  { path: "/admin/custom-fields", name: "Admin Custom Fields" },
  { path: "/admin/erp-connectors", name: "Admin ERP Connectors" },
  { path: "/admin/personnel", name: "Admin Personnel" },
  { path: "/admin/settings", name: "Admin Settings" },
  { path: "/admin/users", name: "Admin Users" },
  { path: "/admin/users/new", name: "Admin New User" },
  // ... todas las rutas del build output
  ```

  **Deben excluirse del smoke test** (no aplican):
  - `/api/*` — Son API routes, no páginas
  - `/serwist/*` — Service worker internals
  - `/_not-found` — Next.js interno
  - `/sitemap.xml` — XML estático

  **Mantener login como precondition** con `E2E_ADMIN` credentials.

  **Must NOT do**:
  - No modificar ningún otro spec existente
  - No eliminar tests existentes
  - No agregar lógica de negocio en los tests (solo smoke)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Tarea meticulosa de listar y testear 63+ rutas

  **Parallelization**:
  - **Can Run In Parallel**: YES (después de Task 4)
  - **Parallel Group**: Wave 2 (with Task 6)
  - **Blocks**: F1, F2
  - **Blocked By**: Task 4

  **References**:
  - `frontend/tests/e2e/page-smoke.spec.ts` — Archivo a expandir
  - Build output de `npm run verify` — Lista completa de 81+ rutas
  - `frontend/tests/e2e/auth-credentials.ts` — Helper de autenticación
  - `frontend/tests/e2e/evidence-flow.spec.ts` — Patrón de test existente

  **Acceptance Criteria**:
  - [ ] `CRITICAL_PAGES` array contiene todas las rutas del frontend (~81 rutas)
  - [ ] `cd frontend && npx playwright test tests/e2e/page-smoke.spec.ts --project=chromium` pasa
  - [ ] Ningún test falla por timeout (ajustar timeout si es necesario)
  - [ ] Ninguna ruta produce console.error

  **QA Scenarios**:
  ```
  Scenario: All page smoke tests pass
    Tool: Bash
    Steps:
      1. cd frontend && npx playwright test tests/e2e/page-smoke.spec.ts --project=chromium --reporter=list 2>&1 | tail -100
    Expected Result: All tests PASS, exit code 0
    Failure Indicators: Any test FAIL or TIMEOUT
    Evidence: .sisyphus/evidence/task-5-all-smoke-pass.txt

  Scenario: Affected spec file has all 81+ routes
    Tool: Bash
    Steps:
      1. grep -c "path:" frontend/tests/e2e/page-smoke.spec.ts
    Expected Result: Count >= 81 routes
    Failure Indicators: Less than 81 routes defined
    Evidence: .sisyphus/evidence/task-5-route-count.txt
  ```

  **Commit**: YES
  - Message: `test(e2e): expand page-smoke coverage to all 81+ frontend routes`
  - Files: `frontend/tests/e2e/page-smoke.spec.ts`

---

- [ ] 6. Add evidence module-specific E2E tests

  **What to do**:
  - Archivo: `frontend/tests/e2e/evidence-flow.spec.ts` (ya existe con 3 tests básicos)
  - Expandir con más escenarios de evidencia:
    - Test: Upload form renders with all UI elements (dropzone, camera button, QR button)
    - Test: File selection via dropzone simulation
    - Test: Photo card renders with title input and type selector
    - Test: Submit bar disables when no photos
    - Test: GPS capture interaction
    - Test: Camera modal open/close
    - Test: QR scanner modal open/close
    - Test: Evidence list/gallery renders
  - Usar fixtures de test existentes en `frontend/tests/e2e/fixtures/`

  **Estrategia**: Usar page objects si tiene sentido o tests directos.

  **Must NOT do**:
  - No modificar lógica de producción
  - No mockear la cámara (solo testear UI de modales, no el stream)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Tests E2E que requieren entender el componente EvidenceUploader

  **Parallelization**:
  - **Can Run In Parallel**: YES (después de Task 4)
  - **Parallel Group**: Wave 2 (with Task 5)
  - **Blocks**: F2
  - **Blocked By**: Task 4

  **References**:
  - `frontend/tests/e2e/evidence-flow.spec.ts` — Archivo a expandir
  - `frontend/src/modules/evidences/ui/EvidenceUploader.tsx` — Componente a testear
  - `frontend/tests/e2e/auth-credentials.ts` — Helper de login
  - `frontend/tests/e2e/page-smoke.spec.ts` — Patrón de test

  **Acceptance Criteria**:
  - [ ] `evidence-flow.spec.ts` tiene >= 8 tests
  - [ ] Todos los tests pasan
  - [ ] Cobertura de UI states: loading, empty, error
  - [ ] No hay tests que requieran cámara física (solo UI)

  **QA Scenarios**:
  ```
  Scenario: Evidence E2E tests pass
    Tool: Bash
    Steps:
      1. cd frontend && npx playwright test tests/e2e/evidence-flow.spec.ts --project=chromium --reporter=list 2>&1 | tail -30
    Expected Result: All evidence tests PASS
    Failure Indicators: Any test FAIL
    Evidence: .sisyphus/evidence/task-6-evidence-tests-pass.txt

  Scenario: Test count >= 8
    Tool: Bash
    Steps:
      1. grep -c "test(" frontend/tests/e2e/evidence-flow.spec.ts
    Expected Result: Count >= 8
    Evidence: .sisyphus/evidence/task-6-evidence-test-count.txt
  ```

  **Commit**: YES
  - Message: `test(e2e): expand evidence flow tests with UI interaction coverage`
  - Files: `frontend/tests/e2e/evidence-flow.spec.ts`

---

## Final Verification Wave (MANDATORY)

- [ ] F1. **Plan Compliance + React Doctor Audit** — `oracle`
  - Run `cd frontend && npx react-doctor@latest --verbose`
  - Verify 0 issues reported
  - Check all 4 fix tasks produced expected changes
  - Read each modified file to verify correctness
  - Output: `React Doctor [0 issues] | Tasks [4/4 verified] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Full E2E Suite** — `unspecified-high`
  - Run `cd frontend && npx playwright test tests/e2e/page-smoke.spec.ts tests/e2e/evidence-flow.spec.ts --project=chromium --reporter=list`
  - Verify all tests PASS
  - Output: `Page Smoke [N/N pass] | Evidence [N/N pass] | VERDICT: APPROVE/REJECT`

- [ ] F3. **Quality Gates** — `deep`
  - Run `cd frontend && npm run typecheck -w frontend && npm run lint -w frontend && npm run test -w frontend && npm run build -w frontend`
  - All must PASS
  - Output: `Typecheck [PASS/FAIL] | Lint [PASS/FAIL] | Test [N pass/N fail] | Build [PASS/FAIL] | VERDICT`

---

## Commit Strategy

- **1**: `fix(evidences): stabilize QRScanner effect deps with ref pattern` — `frontend/src/modules/evidences/ui/QRScanner.tsx`
- **2**: `fix(evidences): stabilize CameraCapture deps and add video aria-label` — `frontend/src/modules/evidences/ui/CameraCapture.tsx`
- **3**: `refactor: remove unused exports across business-documents and erp-connector` — `frontend/src/modules/business-documents/queries.ts`, `frontend/src/modules/business-documents/utils.ts`, `frontend/src/modules/erp-connector/queries.ts`
- **4**: `refactor(evidences): split EvidenceUploader with useReducer and extract hook` — `evidenceReducer.ts` (NEW), `useEvidenceUpload.ts` (NEW), `EvidenceUploader.tsx`
- **5**: `test(e2e): expand page-smoke coverage to all 81+ frontend routes` — `page-smoke.spec.ts`
- **6**: `test(e2e): expand evidence flow tests with UI interaction coverage` — `evidence-flow.spec.ts`

---

## Success Criteria

### Verification Commands
```bash
cd frontend && npx react-doctor@latest --verbose
# Expected: 0 issues, score 100/100

cd frontend && npx tsc --noEmit --pretty
# Expected: Exit 0, no errors

cd frontend && npx biome lint .
# Expected: No lint errors

cd frontend && npx vitest run
# Expected: 226+ passed, 3 skipped, 0 failures

cd frontend && npx playwright test tests/e2e/page-smoke.spec.ts tests/e2e/evidence-flow.spec.ts --project=chromium --reporter=list
# Expected: All tests pass

cd frontend && npx next build --turbopack
# Expected: Build succeeds, all 81+ routes
```

### Final Checklist
- [ ] React Doctor score 100/100 (0 issues)
- [ ] All 12 original issues resolved
- [ ] TypeScript strict compiles with 0 errors
- [ ] Biome lint passes with 0 errors
- [ ] All 226+ existing unit tests pass
- [ ] All E2E smoke tests pass for 81+ routes
- [ ] Evidence E2E suite has 8+ tests
- [ ] Build succeeds (Next.js Turbopack)
- [ ] No unused exports remain
- [ ] EvidenceUploader < 200 lines with useReducer
- [ ] QRScanner and CameraCapture have stable effect deps
- [ ] All interactive controls have accessible labels
