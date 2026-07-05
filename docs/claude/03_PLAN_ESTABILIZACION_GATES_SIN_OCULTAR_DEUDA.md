# 03 — Plan de estabilización de gates sin ocultar deuda

## Diagnóstico actual según log

`npm run typecheck` pasa en todos los workspaces. El pipeline falla en `npm run lint` dentro de `@cermont/shared-types`.

Errores visibles:

1. `packages/shared-types/src/schemas/evidence-collection.schema.ts` requiere formato Biome en el tipo `EvidenceCollectionByEntityParams`.
2. `packages/shared-types/src/schemas/index.ts` requiere organizar exports/imports con Biome.

Esto es una falla de formato/organización, no necesariamente una falla funcional. Pero NO debe usarse para declarar que el producto quedó bien. Primero se corrige esta deuda técnica mínima y luego se continúa con pruebas funcionales.

## Orden de corrección

### Paso 1 — Crear rama o commit de seguridad

```bash
git status --short
git diff --stat
```

No continuar si hay cambios no entendidos.

### Paso 2 — Corregir formato con Biome

Preferido:

```bash
npx @biomejs/biome check --write packages/shared-types/src/schemas/evidence-collection.schema.ts packages/shared-types/src/schemas/index.ts
```

Luego revisar diff:

```bash
git diff -- packages/shared-types/src/schemas/evidence-collection.schema.ts packages/shared-types/src/schemas/index.ts
```

### Paso 3 — Ejecutar lint del workspace afectado

```bash
npm run lint -w @cermont/shared-types
```

### Paso 4 — Ejecutar gates completos

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run verify
```

## Si fallan tests de contratos

No actualizar snapshot automáticamente.

Primero responder:

```text
¿Qué schema cambió?
¿Qué endpoint o pantalla consume ese contrato?
¿El cambio es intencional por lógica de negocio?
¿Existe migración o nota en contract-migrations.json?
¿Hay test funcional que demuestre el nuevo comportamiento?
```

Solo después actualizar snapshot.

## Si falla build

Clasificar:

- Error frontend Next.js.
- Error backend TypeScript.
- Error de export en packages.
- Error de import circular.
- Error por API contract mismatch.

No silenciar con `any`.

## Si falla test funcional

Corregir lógica. No cambiar test salvo que el test esté probando un comportamiento anterior que el nuevo contrato reemplazó formalmente.

## Criterio de aceptación

No basta con gates verdes.

Debe existir además:

```text
.sisyphus/notepads/post-implementation/business-qa-report.md
```

con pruebas de los 14 pasos, documentos dinámicos, formularios, evidencias, cierre y costos.
