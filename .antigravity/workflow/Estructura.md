# Estructura.md (Curada) — Cermont

## Propósito
Este documento es el mapa canónico del repositorio para gobernanza y para definir scopes de trabajo (Antigravity).
No es un listado exhaustivo de archivos.

## Principios
- “Scope-first”: todo trabajo debe declarar un scope usando las rutas de este documento.
- “No repo sweep”: leer/modificar fuera del scope está prohibido.
- “Curado”: no se listan artefactos generados, caches, ni internals de Git.

## Exclusiones (NO TOCAR / NO MAPEAR)
Estas rutas existen o pueden existir, pero se consideran fuera de scope por defecto:
- `.git/**`
- `.turbo/**`
- `**/node_modules/**`
- `**/dist/**`
- `**/build/**`
- `**/coverage/**`
- `**/.angular/**`
- `**/.next/**`
- `**/*.log`
- `**/*.map`
- `**/*.tar.zst`
- `**/tmp/**`
- `**/.cache/**`

---

## Mapa top-level
- `.github/`: workflows y automatización CI/CD.
- `.antigravity/`: governance + workflow templates (Research/Plan/Verify).
- `ANTIGRAVITY.md`: manifiesto y reglas.
- `Estructura.md`: este mapa.
- `apps/`: aplicaciones (backend y frontend).
- `packages/`: librerías compartidas (si aplica).
- `docs/`: documentación del repo (si aplica).

---

## Apps
### Backend (API)
- `apps/api/`: aplicación backend.
- `apps/api/src/`: código fuente principal.
  - `apps/api/src/common/`: base, config, security, decorators, guards, interceptors, middleware, pipes, utils.
  - `apps/api/src/shared/`: utilidades/VOs compartidos (preferido para reducir duplicidad).
  - `apps/api/src/modules/`: módulos por dominio (feature modules).
- `apps/api/prisma/`: schema, migrations, seeds (si aplica).
- `apps/api/scripts/`: scripts de auditoría/export/ops (si aplica).

#### Convención de módulos (backend)
Los módulos del backend viven dentro de:
- `apps/api/src/modules/<modulo>/**`

Ejemplos (no exhaustivo, solo “mapa mental”):
- `apps/api/src/modules/auth/**`
- `apps/api/src/modules/admin/**`
- `apps/api/src/modules/alertas/**`
- `apps/api/src/modules/checklists/**`
- `apps/api/src/modules/cierre-administrativo/**`
- `apps/api/src/modules/clientes/**`
- `apps/api/src/modules/costos/**`

### Frontend (Web)
- `apps/web/`: aplicación frontend.
- `apps/web/src/`: código fuente principal.
  - `apps/web/src/app/**`: features, pages, core, services, components (según estructura actual).
  - `apps/web/src/assets/**`: assets.

---

## Scopes canónicos (para Antigravity)
> Cada task debe usar UNO de estos scopes o definir uno nuevo con máximo 3–10 rutas.

### Scope: Antigravity governance
- `ANTIGRAVITY.md`
- `.antigravity/**`
- `Estructura.md`

### Scope: Backend core (cross-cutting)
- `apps/api/src/common/**`
- `apps/api/src/shared/**`

### Scope: Backend Prisma/DB
- `apps/api/prisma/**`

### Scope: Backend módulo (ejemplo genérico)
- `apps/api/src/modules/<modulo>/**`
- (opcional) `apps/api/src/shared/**` si se extraen utilidades para evitar duplicidad

### Scope: Frontend core
- `apps/web/src/app/core/**`
- `apps/web/src/app/services/**`

### Scope: Frontend feature (ejemplo genérico)
- `apps/web/src/app/features/<feature>/**`

---

## Dónde se extrae “lo compartido” (anti-duplicación)
- Backend: `apps/api/src/shared/**`
- Cross-app: `packages/**` (si aplica)

---

## Cómo mantener este archivo actualizado (manual y seguro)
- Solo actualizar cuando:
  - Se agregue una carpeta nueva de primer nivel.
  - Se cree un módulo nuevo importante.
  - Se defina un nuevo “scope canónico”.
- Prohibido volver a pegar un `tree` completo del repo dentro de este archivo.

| Scope                      | Rutas permitidas (máx. 3–10)                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------ |
| scope:governance           | ANTIGRAVITY.md · .antigravity/** · Estructura.md​                                                            |
| scope:api-core             | apps/api/src/common/** · apps/api/src/shared/** · apps/api/src/lib/** · Estructura.md​                      |
| scope:api-prisma           | apps/api/prisma/** · Estructura.md​                                                                           |
| scope:api-auth             | apps/api/src/modules/auth/** · (si toca guards/shared) apps/api/src/common/** · Estructura.md​              |
| scope:api-admin            | apps/api/src/modules/admin/** · (si toca shared) apps/api/src/shared/** · Estructura.md​                    |
| scope:api-ordenes          | apps/api/src/modules/ordenes/** · (si toca mappers comunes) apps/api/src/shared/** · Estructura.md​         |
| scope:api-ejecucion        | apps/api/src/modules/ejecucion/** · (si toca entidades/VO compartidos) apps/api/src/shared/** · Estructura.md​ |
| scope:api-evidencias       | apps/api/src/modules/evidencias/** · apps/api/src/shared/** · Estructura.md​                                |
| scope:api-kits             | apps/api/src/modules/kits/** · apps/api/src/shared/** · Estructura.md​                                      |
| scope:api-checklists       | apps/api/src/modules/checklists/** · apps/api/src/shared/** · Estructura.md​                                |
| scope:web-core             | apps/web/src/app/core/** · apps/web/src/app/services/** · apps/web/src/app/shared/** · Estructura.md​       |
| scope:web-features-ordenes | apps/web/src/app/features/ordenes/** · (si toca APIs) apps/web/src/app/core/api/** · Estructura.md​         |
