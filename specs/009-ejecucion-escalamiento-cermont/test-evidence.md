# Spec 009 — Test evidence

## Baseline 2026-06-29

| Comando | Resultado |
|---|---|
| `npm run typecheck` | PASS — 7/7 |
| `npm run lint` | PASS — 7/7 |
| `npm test` | PASS — 1057/1057 |
| `npm run build` | PASS — 5/5, 89 páginas |
| `npm run contracts:check` | PASS — snapshot `c2cd5b…` |
| `npm run quality:strict` | PASS — 2862 hallazgos dentro del baseline |
| `npm run verify` | PASS — exit 0 |
| `npx react-doctor@latest` | 77/100 — 1 error, 19 warnings |

No se declara P0 completo: React Doctor y los incidentes post-deploy siguen abiertos.

## Evidencia enfocada P0

| Comando | Resultado |
|---|---|
| Tests frontend P0/header/gallery/PWA | PASS — 14/14 |
| Tests FileAsset backend | PASS — 9/9 |
| Tests contrato FileAsset | PASS — 21/21 |
| `npm run typecheck` | PASS |
| `npm run quality:strict` | PASS — sin subir baseline; weak tokens 2853 |
| `npm run contracts:check` | PASS — `sha256:451daecd…`, migración 055 |
| `npx react-doctor@latest . --verbose` | 97/100 — 0 errores, 1 warning |

La declaración final de P0 depende de ejecutar nuevamente todos los gates completos sobre este delta.
