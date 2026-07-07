# Draft: Corrección Issues React Doctor + Cobertura E2E

## Requirements (confirmed from verify output)

1. **12 issues de React Doctor** en el reporte `npm run verify`:
   - 2 Bugs: Missing effect dependencies (QRScanner.tsx:18, CameraCapture.tsx:45)
   - 1 Accessibility: Control missing accessible label (CameraCapture.tsx:126 - elemento `<video>`)
   - 7 Maintainability: Unused exports (business-documents/queries.ts, utils.ts, erp-connector/queries.ts)
   - 1 Maintainability: Large component 342 lines (EvidenceUploader.tsx:38)
   - 1 Bug: 6 useState calls prefer useReducer (EvidenceUploader.tsx:38)

2. **Cobertura E2E incompleta**: page-smoke.spec.ts solo cubre 18 rutas de 81+ existentes

## Technical Analysis

### QRScanner.tsx:18 — Missing dep pattern
- `scannerRef.current` es usado en cleanup pero es un ref (estable por definición)
- El problema real: `onScan` y `onClose` están en el array de deps, pero el cleanup lee `scannerRef.current` que podría cambiar
- Fix: usar refs para `onScan`/`onClose` o reestructurar cleanup

### CameraCapture.tsx:45 — Missing dep pattern + accesibilidad  
- Mismo patrón: `facingMode` y `startCamera` en deps, cleanup lee `streamRef.current`
- Fix: simplificar dependencias y usar refs para funciones estables
- `<video>` en línea 126 no tiene `aria-label` ni `title`

### Unused exports (confirmed via grep):
- `businessDocumentKeys` — solo se referencia a sí mismo
- `useCreateBusinessDocument` — no importado por ninguna página
- `DOCUMENT_TYPE_LABELS` — no importado (solo `getDocumentTypeLabel` es usado)
- `erpConnectorKeys` — solo autorreferencia
- `useErpConnector`, `useCreateErpConnector`, `useDeleteErpConnector` — no importados
- `useErpConnectors` y `useSyncErpConnector` SÍ son usados por admin/erp-connectors/page.tsx

### EvidenceUploader.tsx — 342 líneas, 6 useState calls
- Estados: `photos`, `gpsCapture`, `isSubmitting`, `uploadProgress`, `showCamera`, `showQRScanner`
- `photos`, `gpsCapture`, `isSubmitting`, `uploadProgress` pueden agruparse en useReducer
- `showCamera` y `showQRScanner` son UI state que pueden quedar como useState

### E2E Gap Analysis
- Build output: 81+ rutas (app router)
- page-smoke.spec.ts solo cubre: 18 rutas → ~22% coverage
- Rutas críticas sin smoke test: `/admin/*`, `/costs/*`, `/customers/*`, `/documents/*`, `/execution/*`, `/login`, `/maintenance/*`, `/orders/*`, `/planning/*`, `/portal/*`, `/proposals/*`, `/purchase-orders/*`, `/reports/*`, `/resources/*`, `/service-cases/*`, `/site-visits/*`, `/work-requests/*`

## Test Strategy Decision
- **Infrastructure exists**: YES (Playwright 1.58.2)
- **Automated tests**: Tests-after (E2E coverage addition)
- **Agent-Executed QA**: REQUIRED for all fix tasks

## Scope Boundaries
- INCLUDE: Fix all 12 React Doctor issues, comprehensive E2E smoke tests
- EXCLUDE: No functional changes to business logic, no refactors beyond what React Doctor requires
