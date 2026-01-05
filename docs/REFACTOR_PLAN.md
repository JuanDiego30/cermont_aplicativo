# Plan de refactor por fases (sin romper producto)

Este plan prioriza **mergeabilidad por PR**, guardrails automáticos y migraciones seguras.

---

## Principios de ejecución

- Cada fase se mergea en PRs pequeños (1 objetivo por PR).
- No se rompe contrato HTTP sin estrategia de compatibilidad.
- No se introduce `any` para “apagar fuego”.
- Cada PR deja evidencia:
  - `lint`, `typecheck`, `test`, `build` (y cuando aplique, `boundaries`).

---

# Fase 0 — Guardrails y baseline (1–2 días)

## Entregables

- Documento de arquitectura: `docs/ARCHITECTURE.md`.
- Boundary checker inicial:
  - `pnpm run boundaries` (no estricto, no rompe CI)
  - `pnpm run boundaries:strict` (preparado para CI)
- Checklist de calidad por PR:
  - build OK, no nuevos warnings críticos, typed forms en áreas tocadas.

## PRs sugeridos

1) **Docs + scripts**
- Agregar `docs/ARCHITECTURE.md` y `docs/REFACTOR_PLAN.md`
- Agregar `scripts/boundaries/check-boundaries.mjs`

2) **CI visibility** (opcional)
- Ejecutar `pnpm run boundaries` en CI como “informativo” (no bloqueante)

---

# Fase 1 — Contratos y tipado (2–5 días)

## Backend

- Definir un “Error Model” único (envelope) y documentarlo.
- Consolidar DTO policy:
  - HTTP DTOs → `infrastructure/controllers/dto`
  - Use-case DTOs → `application/dto`
- Reducir `any` residuales en repositorios/servicios.

## Frontend

- Typed forms en features críticos (auth, admin, ordenes).
- Tipado estricto de `core/api` y `core/services`.

## DoD

- `pnpm --filter @cermont/api check` OK
- `pnpm --filter @cermont/web build` OK
- `pnpm run boundaries` sin crecer (no más violaciones que el baseline)

---

# Fase 2 — Reorganización por dominios (1–3 semanas)

## Backend

- Homogeneizar módulos para que todos tengan `application/domain/infrastructure`.
- Estabilizar puertos:
  - repositorios como interfaces en `domain` o `application` (según decisión)
  - adapters concretos en `infrastructure`

## Frontend

- Unificar `pages` dentro de `features/<dominio>/pages`.
- Crear `features/<dominio>/data-access`:
  - facade (API pública)
  - adapters HTTP
  - store/state (si aplica)
- `core` queda solo con cross-cutting.

## DoD

- `boundaries:strict` habilitado para al menos 1 módulo (piloto)
- Rutas públicas preservadas (redirigir internamente si se mueve ubicación)

---

# Fase 3 — Limpieza de legado y performance (continuo)

- Extraer o eliminar `demo-legacy`.
- Reducir superficie de `shared` (solo verdaderamente reutilizable).
- Optimización incremental:
  - lazy loading por feature
  - auditoría de dependencias

---

# Checklist de calidad (enforced)

## Backend

- Domain sin framework (Nest/Prisma) y sin HTTP.
- Application sin controllers ni adapters concretos.
- Infrastructure implementa adapters y controllers.
- Errores con `code` + `requestId`.
- Logs estructurados.

## Frontend

- `core` sin dependencias hacia features/pages.
- Forms tipados (`NonNullableFormBuilder` / `FormGroup<{...}>`).
- HTTP tipado (`HttpClient.get<T>()`).
- `demo-legacy` aislado o eliminado.

---

# Cómo medir avance

- Violaciones de boundaries: `pnpm run boundaries` (y luego `:strict`).
- Duplicación: `pnpm run duplication`.
- Calidad: `pnpm run check`.
