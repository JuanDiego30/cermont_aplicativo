BORRADOR TÉCNICO — requiere revisión jurídica antes de uso.

# Third-Party License Audit

Desarrollo académico y técnico: Juan Diego Arévalo Pidiache.

Universidad de Pamplona.

Proyecto desarrollado para CERMONT S.A.S. en modalidad de trabajo de grado/práctica empresarial.

La titularidad patrimonial, permisos de uso, distribución y explotación deben revisarse según acuerdos con CERMONT S.A.S., Universidad de Pamplona y documentación contractual aplicable.

## Current Technical Inventory

| Area | Dependency examples | Action |
|---|---|---|
| Frontend | Next.js, React, TanStack Query, GSAP, Serwist, Lucide | Export machine-readable license report before release |
| Backend | Express, Mongoose, Zod, Helmet, BullMQ, Sharp | Export machine-readable license report before release |
| Testing | Vitest, Playwright, Testing Library | Confirm dev-only license obligations |
| Tooling | TypeScript, Biome, Turbo | Confirm notices needed in distributed artifacts |

## Required Next Gate

Run a dependency license collector in CI or release preparation and attach the generated report to this file. This draft is not a final legal license clearance.
