# docs/adr/ADR-001-stack-inmutable.md

## ADR-001: Stack Tecnológico Inmutable

**Estado:** Aceptado

**Contexto:**
El sistema CERMONT requiere un stack tecnológico que soporte operación offline en campo,
validación declarativa de datos, despliegue en VPS autogestionado y desarrollo iterativo
rápido. Las alternativas evaluadas incluían NestJS (sobre-ingeniería para el alcance),
Prisma/PostgreSQL (sin soporte nativo de documentos JSON), NextAuth (dependencia externa),
y pnpm/yarn (complejidad adicional de tooling).

**Decisión:**
Stack definido como inmutable en `docs/REGLAS_DESARROLLO_CERMONT.md`:

- **Backend:** Express 5.2.1 (no NestJS)
- **Base de datos:** MongoDB + Mongoose 9 (no Prisma/PostgreSQL)
- **Validación:** Zod 4.x (no Joi/Yup)
- **Frontend:** Next.js 16 App Router (no Vite/CRA)
- **Auth:** JWT + Zustand auth store (no NextAuth/Auth.js)
- **HTTP client:** apiClient wrapper (no Axios directo)
- **Package manager:** npm (no pnpm/yarn)
- **Despliegue:** VPS con Docker + PM2 + Nginx (no Vercel exclusivo)

**Consecuencias:**
- Positivas: Stack maduro, bien conocido, sin dependencias externas de plataforma
- Positivas: MongoDB permite esquemas flexibles para formatos operativos variables
- Positivas: Zod 4 provee type-safety estricto sin runtime overhead significativo
- Negativas: Migrar de Express a otro framework requeriría refactor completo
- Negativas: MongoDB requiere más cuidado en índices y agregaciones que PostgreSQL

**Referencias:**
- `docs/REGLAS_DESARROLLO_CERMONT.md` (Sección 2: Stack)
- `.sisyphus/plans/cermont_documento_metodologia_modular_contract_first.md`
