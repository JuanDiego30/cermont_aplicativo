# Arquitectura Enforced (Backend + Frontend)

Este documento define la **arquitectura objetivo** del monorepo y las **reglas de dependencia** que se deben hacer cumplir con tooling (lint/checks) para evitar regresiones.

> Principio: *la arquitectura no es un diagrama*, es un conjunto de **límites verificables**.

---

## Objetivos

- Evitar mezcla de capas (Clean Architecture / DDD) en backend.
- Eliminar ambigüedad entre `core/features/shared/pages` en frontend.
- Contratos estables: DTOs HTTP y modelos de dominio bien definidos.
- Guardrails automatizados: boundaries + lint + typecheck + build.

---

# Backend (NestJS) — Arquitectura objetivo

## Estructura por módulo

Para cada módulo en `apps/api/src/modules/<modulo>/`:

- `domain/`
  - Entidades, value objects, invariantes, reglas de negocio
  - Interfaces (puertos) **del dominio** cuando aplique
- `application/`
  - Use cases (commands/queries), DTOs internos (inputs/outputs), mappers
  - Orquestación de dominio + puertos (repositorios, servicios externos)
- `infrastructure/`
  - Controllers HTTP, adapters (Prisma/DB), implementations de repositorios, integración con Nest

> Nota: `apps/api/src/common` y `apps/api/src/shared` se reservan para cross-cutting real (logging, errores, validación común, etc.).

## Matriz de dependencias (enforced)

Regla simple: **las dependencias apuntan hacia adentro**.

| Capa | Puede importar | No puede importar |
|------|---------------|------------------|
| `domain` | TypeScript + utilidades puras + librerías sin runtime framework (p.ej. `zod`, `decimal.js`) | `@nestjs/*`, `@prisma/*`, `express`, controllers, servicios HTTP, mappers de infraestructura |
| `application` | `domain`, contratos/puertos, utilidades cross-cutting puras | controllers HTTP, detalles de persistencia (Prisma), adapters concretos |
| `infrastructure` | `application` + `domain` | (n/a) |

**Regla crítica:** `domain` debe ser portable (no debe “oler” a Nest/Prisma).

## DTOs y contratos (política)

Para evitar duplicidad, separar explícitamente:

- **HTTP DTOs** (request/response):
  - Viven en `infrastructure/controllers/dto/**`
  - Nombrado: `CreateXRequestDto`, `UpdateXRequestDto`, `XResponseDto`
- **Use-case DTOs** (inputs/outputs internos):
  - Viven en `application/dto/**`
  - Nombrado: `CreateXInput`, `UpdateXInput`, `XResult`

Si se necesita mapping entre ambos, se hace en `infrastructure` (controller) o en un mapper explícito, pero sin que `application` conozca HTTP.

## Barrel exports (`index.ts`) — convención

- Los `index.ts` exportan **solo API pública** del módulo.
- Prohibido re-exportar “internals” por comodidad (eso crea imports transversales y acoplamiento).
- Política recomendada:
  - `modules/<modulo>/index.ts` exporta el `*.module` y (opcional) tokens públicos
  - `domain/index.ts`, `application/index.ts`, `infrastructure/index.ts` exportan solo lo que sea público.

## Errores y observabilidad — contrato

Objetivo: un único modelo de error que sea consistente para frontend y logs.

- Error envelope (respuesta HTTP):
  - `code`: string estable (p.ej. `AUTH_INVALID_CREDENTIALS`)
  - `message`: string de usuario (no sensible)
  - `details`: opcional (debug controlado)
  - `requestId`: id de trazabilidad
- Logging estructurado:
  - Incluir siempre `requestId`, `userId` (si aplica), `module`, `action`

---

# Frontend (Angular) — Arquitectura objetivo

## Paquetes lógicos

En `apps/web/src/app/`:

- `core/` (cross-cutting):
  - auth, http, interceptors, guards, storage, i18n, config, api base
  - **No depende de** `features/**` ni `pages/**`
- `shared/`:
  - UI reutilizable, utilidades UI, services compartidos (Toast, Dialog)
- `features/<dominio>/`:
  - Todo lo del dominio, sin duplicarse con `pages/`
  - Recomendado:
    - `routes/` (routing del feature)
    - `pages/` (smart components)
    - `components/` (presentational)
    - `data-access/` (facade + api adapters + stores)
    - `ui/` (componentes internos del feature)

## Política sobre `pages/` y `demo-legacy/`

- `pages/` debe ser solo “shell” (si se mantiene) o migrarse dentro de `features/**`.
- `demo-legacy/`:
  - No debe ser dependencia de features reales.
  - Ideal: extraer a una app sandbox o eliminar.

## Typed Reactive Forms obligatorio

- Preferir `NonNullableFormBuilder` y `FormGroup<{...}>`.
- Prohibido depender de `FormGroup` sin tipar en features críticos.

## HTTP tipado obligatorio

- `HttpClient` siempre con genéricos: `get<T>()`, `post<T>()`.
- En `data-access/` se concentran contratos y adapters por feature.

---

# Guardrails automáticos

- `pnpm run boundaries`: chequeo de límites (no estricto inicialmente)
- `pnpm run boundaries:strict`: modo estricto (para CI cuando esté limpio)

Estrategia: primero visibilidad, luego enforcement.
