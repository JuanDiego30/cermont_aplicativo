# 📐 02_PLAN - Plan de Acción Priorizado (2025-01-07)

## PR-SEC-001: Seguridad - Eliminar Secretos (CRÍTICO)

### Objetivo
Eliminar secretos del código, rotar credenciales y prevenir futuras exposiciones.

### 🛡️ User approval gate
> No se agregan dependencias ni se cambian contratos API. Solo eliminación de secretos hardcodeados.

### Tasks (ejecutables y medibles)

#### Task 1 — Eliminar fallbacks hardcodeados
- Archivos:
  - `apps/api/prisma/verify-stats.ts`
  - `apps/api/seed-test-user.ts`
  - `apps/api/test-db.ts`
- Cambios exactos:
  - Reemplazar `process.env.DATABASE_URL || 'postgresql://postgres:admin@...'` por:
    ```typescript
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required');
    }
    const connectionString = process.env.DATABASE_URL;
    ```
- Criterio de aceptación:
  - `rg "postgres:admin" --type ts --type js` devuelve 0 resultados
  - Scripts funcionan cuando DATABASE_URL está seteado

#### Task 2 — Eliminar passwords en código y logs
- Archivos:
  - `apps/api/prisma/seed_root.ts`
  - `apps/api/seed-test-user.ts`
- Cambios exactos:
  - `seed_root.ts:23`: Mover `passwordRaw = 'Cermont2025!'` a `process.env.SEED_ADMIN_PASSWORD`
  - `seed_root.ts:50`: Eliminar console.log que muestra password
  - `seed-test-user.ts:19`: Mover `bcrypt.hash('admin123', ...)` a `process.env.SEED_TEST_PASSWORD`
  - `seed-test-user.ts:44`: Eliminar console.log que muestra password
- Criterio de aceptación:
  - `rg -i "password.*=.*['\"]" --type ts --type js` no encuentra passwords en código
  - Seeds funcionan con variables de entorno

#### Task 3 — Actualizar .env.example
- Archivos:
  - `apps/api/.env.example`
- Cambios exactos:
  - Agregar variables: `SEED_ADMIN_PASSWORD`, `SEED_TEST_PASSWORD`
  - Actualizar comments con instrucciones claras
- Criterio de aceptación:
  - Todos los secretos requeridos están documentados en .env.example

## PR-DASH-001: Dashboard Real (ALTA)

### Objetivo
Conectar el frontend del dashboard con el backend para mostrar datos reales.

### 🛡️ User approval gate
> No se cambian contratos API. Se agrega nuevo endpoint en backend y se actualiza frontend para consumirlo.

### Tasks (ejecutables y medibles)

#### Task 1 — Backend: Endpoint `/api/dashboard/stats`
- Archivos:
  - `apps/api/src/modules/dashboard/application/use-cases/get-dashboard-stats.use-case.ts` (crear)
  - `apps/api/src/modules/dashboard/infrastructure/controllers/dashboard.controller.ts` (actualizar)
- Cambios exactos:
  - Crear use case que consulta Prisma para contar órdenes por estado
  - Calcular métricas: eficiencia, tiempo promedio, órdenes por mes
  - Retornar top 5 órdenes recientes
  - Agregar endpoint `GET /stats` con `@UseGuards(JwtAuthGuard)`
- Criterio de aceptación:
  - `curl http://localhost:4000/api/dashboard/stats` retorna JSON válido con datos reales
  - Endpoint funciona con diferentes roles (ADMIN, TECNICO)

#### Task 2 — Frontend: Conectar con API
- Archivos:
  - `apps/web/src/app/core/api/dashboard.api.ts` (actualizar/crear)
  - `apps/web/src/app/features/dashboard/components/dashboard-main/dashboard-main.component.ts` (actualizar)
  - `apps/web/src/app/features/dashboard/components/dashboard-main/dashboard-main.component.html` (actualizar)
- Cambios exactos:
  - Agregar método `getStats()` en `DashboardApi`
  - Reemplazar datos mock en componente por llamada a API
  - Agregar estados de loading/error con signals
  - Actualizar template para mostrar datos reales
- Criterio de aceptación:
  - Dashboard muestra datos reales del backend al hacer login
  - Estados de loading/error funcionan correctamente

#### Task 3 — Limpiar rutas del menú
- Archivos:
  - `apps/web/src/app/shared/layout/app-sidebar/app-sidebar.component.ts`
- Cambios exactos:
  - Eliminar items legacy: "Forms", "Tables", "Pages"
  - Eliminar duplicados de "Calendario", "User Profile"
  - Validar que todas las rutas existan en `app.routes.ts`
- Criterio de aceptación:
  - Todas las rutas del menú son funcionales (no 404)
  - Menú no tiene items del template original

## Política de dependencias
- Nueva dependencia: NO para ambas PRs
- Motivo: Ya existen todas las dependencias necesarias

## Verificación (comandos)
- `pnpm run lint`
- `pnpm -C apps/api run typecheck`
- `pnpm run test`
- `pnpm run duplication`
- `pnpm run build`

## Rollback plan
- PR-SEC-001: Revertir commits que modifican archivos con secretos
- PR-DASH-001: Revertir cambios en dashboard component y controller

## Orden de Implementación
1. PR-SEC-001 (Crítico, 0-1h)
2. PR-DASH-001 (Alta, 1-2h)

