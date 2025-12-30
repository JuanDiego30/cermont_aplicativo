# 🧪 Phase A: Research (PR00.4)

## Objetivo
Estabilizar pipeline local (lint + test) sin romper el dominio actual.

## Scope permitido
- `apps/web/**`
- `apps/api/**` (Tests y VOs específicos)
- `angular.json`, `package.json`

## Hallazgos

### 1. Web Linting (`apps/web`)
- **Estado Current**: `ng lint` script existe, pero `angular.json` no tiene target `lint`.
- **Faltantes**: Paquetes de `angular-eslint`, config `.eslintrc.json`, target en `architect`.

### 2. Web Testing (`apps/web`)
- **Estado Current**: Fallo TS18003 (No inputs found) porque no hay archivos `.spec.ts` en `src/`.
- **Config**: Karma configurado correctamente en `angular.json`.
- **Script**: `ng test` corre en modo watch por defecto.

### 3. API Value Objects (`apps/api/src/shared/value-objects`)
- **Monto**:
    - Impl: Lanza error si negativo.
    - Test: Intenta crear negativo y usar `isNegativo()`. **Conflicto**.
    - Fix: Test debe esperar throw.
- **OrdenNumero**:
    - Impl: Valida regex antes inicializar. Si entra minúscula, falla regex.
    - Test: Espera `ord-123` funcione (normalize).
    - Fix: `toUpperCase()` antes de regex.
- **OrdenEstado** (Shared vs Domain):
    - Domain VO (`orden-estado.vo.ts`) usa lowercase.
    - Shared VO (`index.ts`) usa UPPERCASE.
    - Tests (`value-objects.spec.ts`) validan Shared/UPPERCASE.
    - User Instruction: Alinear transiciones.

## Decisiones
- Crear `apps/web/src/dummy.spec.ts` para desbloquear tests web.
- Configurar ESLint minimal en Web.
- Corregir lógica de VOs y Tests en API.
