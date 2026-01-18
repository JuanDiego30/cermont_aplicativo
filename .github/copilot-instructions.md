# Copilot instructions

## Arquitectura y estructura del monorepo

- Monorepo con pnpm + Turborepo: frontend Angular y backend NestJS. Ver [README.md](README.md).
- Paquetes principales:
  - frontend/ (Angular 21 + Tailwind v4).
  - backend/ (NestJS + Prisma + CQRS).
  - packages/shared-types/ (tipos/DTOs compartidos consumidos por frontend y backend: `@cermont/shared-types`).
- Backend usa una capa común con Clean Architecture en [backend/src/shared/README.md](backend/src/shared/README.md): utilidades, DTOs, guards, filters, pipes, errores y decoradores centralizados.

## Flujos y comandos críticos (root)

- Instalar: `pnpm install`.
- Desarrollo paralelo: `pnpm dev` (turbo run dev --parallel).
- Build monorepo: `pnpm build`.
- Test/lint/typecheck: `pnpm test`, `pnpm lint`, `pnpm typecheck`.
- Formato: `pnpm format`.
- Turbo cache y tasks configurados en [turbo.json](turbo.json) (inputs/outputs relevantes para build/test/lint).

## Backend (NestJS) – patrones locales

- Scripts en [backend/package.json](backend/package.json): `pnpm --filter @cermont/backend dev`, `build`, `test`.
- Prisma: `prisma:generate` se ejecuta antes de build/test. Migrations con `prisma:migrate`.
- Respuestas API estandarizadas con `ApiResponses` (ver ejemplos en [backend/src/shared/README.md](backend/src/shared/README.md)).
- Validación frecuente con Zod y `ZodValidationPipe`.
- Seguridad: guards `JwtAuthGuard` y `RolesGuard`, decoradores `@Roles`, `@CurrentUser`, `@Public`.
- Tipado estricto: evitar `any`, usar los tipos del common layer y `@cermont/shared-types`.

## Frontend (Angular) – patrones locales

- Estructura principal en [frontend/README.md](frontend/README.md): `core/`, `shared/`, `features/`, `pages/`.
- Tech stack: Angular 21, RxJS, Tailwind v4. Mantener patterns actuales de módulos/feature areas.
- Autenticación JWT + refresh tokens; integra con backend según rutas existentes.

## Integraciones y configuración

- Variables de entorno se documentan en [.env.example](.env.example) (DB, JWT, frontend URL, rate limit).
- `@cermont/shared-types` se consume desde ambos lados; al cambiarlo, reconstruir el paquete.

## Convenciones para cambios

- Preferir imports del common layer vía `@/common` en backend (ver ejemplos en [backend/src/shared/README.md](backend/src/shared/README.md)).
- No inventar nuevas capas; extender módulos existentes en backend y feature areas en frontend.
- Si agregas endpoints, usa los helpers de respuesta y documentación Swagger del common layer.
