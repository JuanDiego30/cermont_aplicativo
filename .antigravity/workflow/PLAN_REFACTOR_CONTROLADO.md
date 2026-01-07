# PLAN DE REFACTORIZACIÓN CONTROLADO — CERMONT
## Fecha: 2026-01-06

---

## 🎯 OBJETIVO

Ejecutar refactors sistemáticos y controlados del repositorio Cermont, priorizando mejoras de arquitectura, type safety y mantenibilidad, asegurando que cada cambio sea pequeño, verificable y reversible.

---

## 📋 PRINCIPIOS

1. **PR pequeño:** 1 objetivo, 1 módulo, máximo 5 archivos
2. **Sin breaking changes:** Preservar contratos API/Frontend
3. **Verificación obligatoria:** `lint + typecheck + test + build` después de cada PR
4. **Rollback plan:** Git revert siempre disponible
5. **Sin nuevas dependencias:** Solo refactor de código existente

---

## 🟢 FASE 1: REFACTORES DE ARQUITECTURA (Sprint 1)
**Duración:** 2-3 días
**Prioridad:** Alta
**Objetivo:** Resolver DDD violations y type safety

---

### PR #1: Corregir DDD Violation — JWT Token VO
**Branch:** `fix/api-domain-jwt-token-ddd`
**Archivos:** 2
**Objetivo:** Eliminar dependencia de @nestjs/jwt desde domain layer

**Cambios:**
1. Mover lógica de generación de JWT a `infrastructure/services/jwt-generator.service.ts`
2. Crear puerto en `domain/ports/i-jwt-generator.service.ts`
3. `JwtTokenValueObject` ahora solo valida formato, no genera tokens
4. `LoginUseCase` inyecta `IJwtGenerator` y delega generación

**Archivos afectados:**
- `apps/api/src/modules/auth/domain/value-objects/jwt-token.vo.ts` (modificar)
- `apps/api/src/modules/auth/infrastructure/services/jwt-generator.service.ts` (crear)
- `apps/api/src/modules/auth/application/use-cases/login.use-case.ts` (modificar)

**Criterios de éxito:**
- ✅ `pnpm run lint` en @cermont/api pasa
- ✅ `pnpm run typecheck` en @cermont/api pasa
- ✅ Domain layer no importa NestJS/Prisma
- ✅ Tests de auth pasan

**Riesgo:** Bajo (solo refactor interno)

**Rollback:**
```bash
git revert HEAD
```

---

### PR #2: Corregir DDD Violation — Cost Calculator
**Branch:** `fix/api-domain-cost-calculator-ddd`
**Archivos:** 3
**Objetivo:** Eliminar dependencia de @nestjs/common desde domain layer

**Cambios:**
1. Mover `CostCalculatorService` a `application/services/cost-calculator.service.ts`
2. Crear puerto en `domain/ports/i-cost-calculator.service.ts`
3. `CostoEntity` usa VO para validación, no lógica de cálculo

**Archivos afectados:**
- `apps/api/src/modules/costos/domain/entities/costo.entity.ts` (modificar)
- `apps/api/src/modules/costos/domain/services/cost-calculator.service.ts` (mover a application/)
- `apps/api/src/modules/costos/application/services/cost-calculator.service.ts` (crear)
- `apps/api/src/modules/costos/domain/ports/i-cost-calculator.service.ts` (crear)

**Criterios de éxito:**
- ✅ `pnpm run lint` en @cermont/api pasa
- ✅ `pnpm run typecheck` en @cermont/api pasa
- ✅ Tests de costos pasan

**Riesgo:** Bajo (solo refactor interno)

**Rollback:**
```bash
git revert HEAD
```

---

### PR #3: Corregir DDD Violation — File Validator
**Branch:** `fix/api-domain-file-validator-ddd`
**Archivos:** 2
**Objetivo:** Eliminar dependencia de @nestjs/common desde domain layer

**Cambios:**
1. Mover `FileValidatorService` a `application/services/file-validator.service.ts`
2. Crear puerto en `domain/ports/i-file-validator.service.ts`
3. Domain VOs solo validan, no dependen de framework

**Archivos afectados:**
- `apps/api/src/modules/evidencias/domain/services/file-validator.service.ts` (mover a application/)
- `apps/api/src/modules/evidencias/application/services/file-validator.service.ts` (crear)
- `apps/api/src/modules/evidencias/domain/ports/i-file-validator.service.ts` (crear)

**Criterios de éxito:**
- ✅ `pnpm run lint` en @cermont/api pasa
- ✅ `pnpm run typecheck` en @cermont/api pasa
- ✅ Tests de evidencias pasan

**Riesgo:** Bajo (solo refactor interno)

**Rollback:**
```bash
git revert HEAD
```

---

### PR #4: Unificar DTOs en OrdenesController
**Branch:** `refactor/api-ordenes-dto-unification`
**Archivos:** 2
**Objetivo:** Eliminar type casts y unificar sistema de validación

**Cambios:**
1. Elegir Zod como sistema único (ya instalado)
2. Mover todas las validaciones ClassValidator a Zod
3. Eliminar type casts `as unknown as`
4. Usar `z.parse()` directamente en controller

**Archivos afectados:**
- `apps/api/src/modules/ordenes/infrastructure/controllers/ordenes.controller.ts` (modificar)
- `apps/api/src/modules/ordenes/application/dto/query-ordenes.dto.ts` (eliminar)
- `apps/api/src/modules/ordenes/application/dto/orden.dto.ts` (actualizar con Zod)

**Criterios de éxito:**
- ✅ `pnpm run lint` en @cermont/api pasa
- ✅ `pnpm run typecheck` en @cermont/api pasa
- ✅ No hay type casts en controller
- ✅ Solo Zod se usa para validación
- ✅ Tests de órdenes pasan

**Riesgo:** Medio (puede cambiar contratos de validación)

**Mitigación:**
- Mantener lógica de validación equivalente
- Teste exhaustivo de endpoints

**Rollback:**
```bash
git revert HEAD
```

---

### PR #5: Centralizar Validación en Value Objects
**Branch:** `refactor/api-auth-validation-vos`
**Archivos:** 3-4
**Objetivo:** Eliminar validación duplicada en controladores y use cases

**Cambios:**
1. Crear `EmailValueObject` con validación de formato
2. Crear `PasswordValueObject` con validación de complejidad
3. `AuthController` usa VOs para validar inputs
4. `LoginUseCase` recibe VOs ya validados
5. Eliminar validación duplicada en use case

**Archivos afectados:**
- `apps/api/src/modules/auth/domain/value-objects/email.vo.ts` (crear)
- `apps/api/src/modules/auth/domain/value-objects/password.vo.ts` (crear)
- `apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts` (modificar)
- `apps/api/src/modules/auth/application/use-cases/login.use-case.ts` (modificar)

**Criterios de éxito:**
- ✅ `pnpm run lint` en @cermont/api pasa
- ✅ `pnpm run typecheck` en @cermont/api pasa
- ✅ No hay validación duplicada
- ✅ VOs encapsulan toda la lógica de validación
- ✅ Tests de auth pasan

**Riesgo:** Bajo (solo refactor interno, contratos API no cambian)

**Rollback:**
```bash
git revert HEAD
```

---

### PR #6: Refactorizar LoginUseCase
**Branch:** `refactor/api-login-usecase-extraction`
**Archivos:** 1
**Objetivo:** Reducir complejidad ciclomática del método execute()

**Cambios:**
1. Extraer a métodos privados:
   - `validateCredentials(email: string, password: string): User`
   - `checkLockout(user: User): void`
   - `handle2FA(user: User): { requires2FA: boolean }`
   - `issueTokens(user: User): { accessToken, refreshToken }`
   - `logLoginAttempt(user: User, success: boolean): void`

2. `execute()` ahora orquesta llamadas a métodos privados
3. Método `execute()` reducido a < 80 líneas

**Archivos afectados:**
- `apps/api/src/modules/auth/application/use-cases/login.use-case.ts` (modificar)

**Criterios de éxito:**
- ✅ `pnpm run lint` en @cermont/api pasa
- ✅ `pnpm run typecheck` en @cermont/api pasa
- ✅ `execute()` tiene < 80 líneas
- ✅ Métodos privados tienen nombres claros
- ✅ Tests de login pasan

**Riesgo:** Bajo (solo refactor interno, comportamiento no cambia)

**Rollback:**
```bash
git revert HEAD
```

---

## 🟡 FASE 2: MEJORAS DE CALIDAD (Sprint 2)
**Duración:** 3-4 días
**Prioridad:** Media
**Objetivo:** Mejorar testing y documentación

---

### PR #7: Agregar Tests de Componentes Frontend
**Branch:** `feat/web-ordenes-component-tests`
**Archivos:** 3-4 nuevos `.spec.ts`
**Objetivo:** Cobertura de tests > 80% en componentes críticos

**Cambios:**
1. Crear `ordenes-list.component.spec.ts`
2. Crear `orden-form.component.spec.ts`
3. Crear `orden-detail.component.spec.ts`
4. Tests de:
   - Rendering básico
   - Interacción de usuario
   - Validación de formularios
   - Integración con servicios

**Archivos afectados:**
- `apps/web/src/app/features/ordenes/components/ordenes-list/ordenes-list.component.spec.ts` (crear)
- `apps/web/src/app/features/ordenes/components/orden-form/orden-form.component.spec.ts` (crear)
- `apps/web/src/app/features/ordenes/components/orden-detail/orden-detail.component.spec.ts` (crear)

**Criterios de éxito:**
- ✅ `ng test` pasa
- ✅ `ng test --code-coverage` muestra > 80% en componentes de órdenes
- ✅ Todos los tests pasan

**Riesgo:** Bajo (agregado de tests, no cambia código existente)

**Rollback:**
```bash
git revert HEAD
```

---

### PR #8: Mejorar Tests E2E
**Branch:** `fix/api-e2e-auth-real-login`
**Archivos:** 1
**Objetivo:** Tests E2E usan autenticación real, no tokens mock

**Cambios:**
1. `beforeAll()`: Crear usuario de test
2. `beforeAll()`: Login real y obtener token
3. Todos los tests usan token real
4. `afterAll()`: Cleanup de usuario de test

**Archivos afectados:**
- `apps/api/test/ordenes.e2e-spec.ts` (modificar)

**Criterios de éxito:**
- ✅ `pnpm run test:e2e` pasa
- ✅ Tests no usan tokens hardcodeados
- ✅ Tests prueban flujo de autenticación real

**Riesgo:** Bajo (mejora de tests, no cambia código existente)

**Rollback:**
```bash
git revert HEAD
```

---

### PR #9: Actualizar Documentación README
**Branch:** `docs/readme-quickstart-for-developers`
**Archivos:** 1
**Objetivo:** README tiene Quick Start completo para developers

**Cambios:**
1. Agregar sección "Quick Start for Developers"
2. Incluir comandos:
   - `pnpm install`
   - `pnpm run dev`
   - `pnpm run lint`
   - `pnpm run typecheck`
   - `pnpm run test`
   - `pnpm run build`
3. Agregar sección "Troubleshooting"
4. Agregar sección "Development Workflow"

**Archivos afectados:**
- `README.md` (modificar)

**Criterios de éxito:**
- ✅ README tiene Quick Start completo
- ✅ Comandos funcionan (verificado manualmente)
- ✅ Sección de troubleshooting clara

**Riesgo:** Ninguno (solo documentación)

**Rollback:**
```bash
git revert HEAD
```

---

## 🔵 FASE 3: OPTIMIZACIONES (Sprint 3)
**Duración:** 2-3 días
**Prioridad:** Baja
**Objetivo:** Performance y DevEx

---

### PR #10: Scripts de Utilidad para Test Data
**Branch:** `feat/api-test-data-generator-script`
**Archivos:** 2
**Objetivo:** Script para generar datos de test automáticamente

**Cambios:**
1. Crear `scripts/generate-test-data.ts`
2. Usar `@faker-js/faker` para datos realistas
3. Integrar con Prisma seed
4. Agregar comando en `package.json`: `pnpm run seed:test`

**Archivos afectados:**
- `apps/api/scripts/generate-test-data.ts` (crear)
- `apps/api/package.json` (modificar - agregar script)

**Criterios de éxito:**
- ✅ `pnpm run seed:test` genera datos de test
- ✅ Datos son realistas y variados
- ✅ Seed funciona con Prisma

**Riesgo:** Ninguno (agregado de herramienta, no cambia código existente)

**Rollback:**
```bash
git revert HEAD
```

---

### PR #11: Configuración de Debugging VSCode
**Branch:** `chore/vscode-debug-configs`
**Archivos:** 1
**Objetivo:** `.vscode/launch.json` con configs para debugging

**Cambios:**
1. Crear `.vscode/launch.json`
2. Agregar configs:
   - Debug Jest tests (API)
   - Debug E2E tests (API)
   - Debug Angular tests (Web)
   - Debug Angular app (Chrome)

**Archivos afectados:**
- `.vscode/launch.json` (crear)

**Criterios de éxito:**
- ✅ VSCode puede debugear Jest tests
- ✅ VSCode puede debugear E2E tests
- ✅ VSCode puede debugear Angular tests

**Riesgo:** Ninguno (agregado de config, no cambia código existente)

**Rollback:**
```bash
git revert HEAD
```

---

## 📊 RESUMEN DE PULL REQUESTS

| PR | Branch | Archivos | Objetivo | Prioridad | Riesgo | Tiempo |
|----|--------|-----------|-----------|-----------|---------|---------|
| #1 | fix/api-domain-jwt-token-ddd | 2-3 | Eliminar NestJS/JWT de domain | Alta | Bajo | 2-3h |
| #2 | fix/api-domain-cost-calculator-ddd | 3 | Eliminar NestJS/Common de domain | Alta | Bajo | 2-3h |
| #3 | fix/api-domain-file-validator-ddd | 2 | Eliminar NestJS/Common de domain | Alta | Bajo | 2-3h |
| #4 | refactor/api-ordenes-dto-unification | 2 | Unificar DTOs, eliminar type casts | Alta | Medio | 2-3h |
| #5 | refactor/api-auth-validation-vos | 3-4 | Centralizar validación en VOs | Alta | Bajo | 3-4h |
| #6 | refactor/api-login-usecase-extraction | 1 | Refactor LoginUseCase | Alta | Bajo | 2-3h |
| #7 | feat/web-ordenes-component-tests | 3-4 | Tests de componentes > 80% | Media | Bajo | 8-12h |
| #8 | fix/api-e2e-auth-real-login | 1 | Tests E2E con auth real | Media | Bajo | 3-4h |
| #9 | docs/readme-quickstart-for-developers | 1 | Documentación Quick Start | Media | Ninguno | 1-2h |
| #10 | feat/api-test-data-generator-script | 2 | Script de test data | Baja | Ninguno | 3-4h |
| #11 | chore/vscode-debug-configs | 1 | Configs de debugging | Baja | Ninguno | 1-2h |

**Total PRs:** 11
**Total Archivos:** ~25-30
**Tiempo total estimado:** 31-46 horas (~5-7 días)

---

## 🔄 PROCESO DE IMPLEMENTACIÓN

### Antes de cada PR:
1. ✅ Crear branch desde `main`: `git checkout -b <branch-name>`
2. ✅ Leer archivos afectados (usar `read` tool)
3. ✅ Comprender código existente
4. ✅ Planificar cambios (escribir en PR description)

### Durante la implementación:
1. ✅ Hacer cambios mínimos y enfocados
2. ✅ Mantener contratos API/Frontend inalterados
3. ✅ No agregar dependencias nuevas

### Después de cada PR:
1. ✅ Ejecutar `pnpm run lint` → must PASS
2. ✅ Ejecutar `pnpm run typecheck` → must PASS
3. ✅ Ejecutar `pnpm run test` → must PASS
4. ✅ Ejecutar `pnpm run build` → must PASS
5. ✅ Commit con mensaje claro: `[tipo] Descripción - alcance`
6. ✅ Push al branch
7. ✅ Crear PR en GitHub con:
   - Descripción del problema
   - Lista de cambios
   - Comandos ejecutados (lint, typecheck, test, build)
   - Capturas de pantalla si aplica UI

### Verificación final:
1. ✅ Code review manual
2. ✅ Tests automatizados pasan
3. ✅ No hay warnings de lint
4. ✅ TypeScript compila sin errores
5. ✅ Build exitoso

---

## ✅ CRITERIOS DE ÉXITO (Definition of Done)

### Cualitativos
- [ ] Arquitectura limpia sin DDD violations
- [ ] Type safety mejorado (sin type casts)
- [ ] Validación centralizada en VOs
- [ ] LoginUseCase refactorizado y legible
- [ ] Tests de componentes agregados
- [ ] Tests E2E mejorados
- [ ] Documentación actualizada
- [ ] Scripts de utilidad disponibles

### Cuantitativos
- [ ] DDD violations: 0 (actualmente 7)
- [ ] Type casts: 0 (actualmente 66)
- [ ] Validación duplicada: 0 (actualmente 2+ casos)
- [ ] LoginUseCase líneas: < 80 (actualmente ~180)
- [ ] Tests componentes: +3-4 nuevos archivos
- [ ] Tests E2E: auth real (actualmente token mock)
- [ ] README: +Quick Start section
- [ ] Scripts utilidad: +1 nuevo script
- [ ] Debug configs: +1 nuevo archivo

---

## 🚀 COMANDOS DE VERIFICACIÓN (obligatorios)

```bash
# Backend
cd apps/api
pnpm run lint      # Debe pasar sin errores
pnpm run typecheck  # Debe pasar sin errores
pnpm run test      # Debe pasar sin errores
pnpm run build     # Debe pasar sin errores

# Frontend
cd apps/web
pnpm run lint      # Debe pasar sin errores
pnpm run typecheck  # Debe pasar sin errores
ng test            # Debe pasar sin errores
pnpm run build     # Debe pasar sin errores

# Monorepo (root)
cd ../..
pnpm run lint      # Debe pasar sin errores
pnpm run typecheck  # Debe pasar sin errores
pnpm run test      # Debe pasar sin errores
pnpm run build     # Debe pasar sin errores
```

---

## 📋 CHECKLIST DE APROBACIÓN

### Para cada PR:
- [ ] Código limpio y sigue convenciones
- [ ] Lint: 0 errores, 0 warnings
- [ ] Typecheck: 0 errores
- [ ] Tests: pasan
- [ ] Build: exitoso
- [ ] Comentarios claros si aplica
- [ ] No hay breaking changes
- [ ] Contratos API/Frontend preservados

### Para FASE completa:
- [ ] Todos los PRs mergeados
- [ ] Tests de regresión pasan
- [ ] Documentación actualizada
- [ ] No hay deuda técnica agregada
- [ ] Métricas de calidad mejoradas

---

**Firma:**
_________________________
**Date:** 2026-01-06
**Status:** PLAN APROBADO ✅
