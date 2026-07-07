# Documentacion de Configuracion Biome.js - Monorepo Clermont

## 1. Inventario de Workspaces

### 1.1 Workspace Principal (Root)
| Campo | Valor |
|-------|-------|
| Nombre | cermont-monorepo |
| Ubicacion | `./` |
| Package Manager | npm@10.9.4 |
| Node | >=22.20.0 |

### 1.2 Workspaces del Monorepo

| Workspace | Ubicacion | Tipo | Tecnologia Principal |
|-----------|-----------|------|----------------------|
| @cermont/config | `packages/config` | Paquete | Zod (validacion) |
| @cermont/domain | `packages/domain` | Paquete | Zod (RBAC) |
| @cermont/shared-types | `packages/shared-types` | Paquete | Zod (schemas) |
| backend | `apps/backend` | App | Express + Mongoose |
| frontend | `apps/frontend` | App | Next.js 16 |

### 1.3 Estado Actual de Biome.js

| Workspace | Scripts Biome | Estado |
|-----------|----------------|--------|
| @cermont/config | lint, lint:fix, format, format:fix | PENDIENTE |
| @cermont/domain | lint, lint:fix, format, format:fix | PENDIENTE |
| @cermont/shared-types | lint, lint:fix, format, format:fix | CONFIGURADO |
| backend | lint, lint:fix, format, format:fix | CONFIGURADO |
| frontend | lint, lint:fix, format, format:fix | CONFIGURADO |

## 2. Analisis de Duplicacion del Stack Tecnologico

### 2.1 Duplicacion Detectada

| Herramienta | Root | Workspace | Duplicado |
|------------|------|------------|-----------|
| ESLint | 10.2.0 | backend (10.1.0) | SI |
| ESLint | 10.2.0 | frontend (10.2.0) | SI |
| ESLint | 10.2.0 | shared-types (10.1.0) | SI |
| typescript-eslint | NO | backend (8.58.0) | SI |
| typescript-eslint | NO | shared-types (8.57.2) | SI |
| Biome.js | 2.4.11 | NO | UNICO |

### 2.2 Violaciones de Documentacion

| Violacion | Descripcion | Gravedad |
|-----------|------------|----------|
| ESLint coexiste con Biome | Ambas herramientas instalamdas | MEDIA |
| Configuraciones eslint.config.mjs duplicadas | 3 archivos de configuracion en workspaces | BAJA |

### 2.3 Recomendaciones de Correccion

1. **Remover ESLint despues de migracion completa:**
   ```bash
   npm uninstall eslint @typescript-eslint/eslint-plugin typescript-eslint
   ```

2. **Mantener ESLint temporalmente** durante el periodo de transicion:
   - Biome esta configurado para ejecutarse en lint-staged
   - ESLint puede ejecutarse manualmente para comparacion

## 3. Configuracion Propuesta de biome.json

### 3.1 Configuracion Base (Root)

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.11/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 80
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "all"
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noUselessTypeConstraint": "error"
      },
      "correctness": {
        "noUnusedVariables": "error"
      },
      "style": {
        "useConst": "error",
        "noNamespace": "error"
      }
    }
  },
  "overrides": [
    {
      "includes": ["apps/backend/**/*.ts"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "warn"
          }
        }
      }
    },
    {
      "includes": ["apps/frontend/**"],
      "linter": {
        "rules": {
          "suspicious": {
            "noExplicitAny": "off"
          }
        }
      }
    },
    {
      "includes": ["packages/"],
      "linter": {
        "rules": {
          "correctness": {
            "noUnusedVariables": "off"
          }
        }
      }
    }
  ],
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

### 3.2 Descripcion de Configuraciones por Workspace

| Workspace | Reglas Especificas |
|-----------|-------------------|
| backend | noExplicitAny: warn (mas flexible) |
| frontend | noExplicitAny: off (Next.js usa any) |
| shared-types | noUnusedVariables: off (exports) |
| domain | noUnusedVariables: off (exports) |
| config | noUnusedVariables: off (exports) |

## 4. Scripts CMD

### 4.1 setup-biome.cmd

**Purpose:** Configura Biome.js desde cero

**Usage:**
```cmd
cd C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\tooling
setup-biome.cmd
```

**Acciones:**
1. Instala @biomejs/biome como devDependency
2. Ejecuta `biome init` para crear biome.json
3. Agrega scripts lint/format a todos los workspaces
4. Actualiza lint-staged en root

### 4.2 migrate-eslint-prettier.cmd

**Purpose:** Migra configuraciones de ESLint/Prettier existentes

**Usage:**
```cmd
cd C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\tooling
migrate-eslint-prettier.cmd
```

**Acciones:**
1. Migra configuracion de eslint.config.mjs a biome.json
2. Migra configuracion de .prettierrc a biome.json
3. Genera reglas equivalentes de Biome

### 4.3 verify-biome.cmd

**Purpose:** Verifica la instalacion y configuracion de Biome

**Usage:**
```cmd
cd C:\Users\camil\Downloads\cermont_aplicativo\cermont_aplicativo\tooling
verify-biome.cmd
```

**Verificaciones:**
1. Version de Biome instalada
2. biome.json existe y es valido
3. Scripts en cada workspace
4. Duplicacion de herramientas

## 5. Plan de Verificacion

### 5.1 Comandos de Verificacion

| Paso | Comando | Salida Esperada |
|------|---------|----------------|
| 1 | `npx biome --version` | 2.4.11 |
| 2 | `npx biome check .` | Sin errores o lista de errores |
| 3 | `npx biome format .` | Archivos formateados o "Already formatted" |
| 4 | `npm run lint` | Turbo ejecuta lint en todos los workspaces |
| 5 | `npm run format` | Turbo ejecuta format en todos los workspaces |

### 5.2 Salidas Esperadas

** biome check . (exito):**
```
All checks passed!
```

** biome check . (con errores):**
```
src/file.ts:10:5 lint/correctness/noUnusedVariables ...
```

### 5.3 Verificacion en Produccion

Pasos para verificar en entorno de produccion:

1. **Ejecutar lint completo:**
   ```bash
   npm run lint
   ```

2. **Verificar que no hay errores de Biome:**
   - Salida debe terminar con exito
   - No debe haber errores de "Biome exited"

3. **Verificar formateo:**
   ```bash
   npm run format
   ```

4. **Verificar pre-commit:**
   - Hacer un commit de prueba
   - Verificar que lint-staged ejecuta biome

## 6. Resumen de Cambios

### 6.1 Cambios Realizados

| Cambio | Descripcion | Estado |
|--------|-------------|--------|
| Instalacion de Biome.js | @biomejs/biome@2.4.11 en root | COMPLETO |
| biome.json | Configuracion unificada en root | COMPLETO |
| Scripts en backend | lint, lint:fix, format, format:fix | COMPLETO |
| Scripts en frontend | lint, lint:fix, format, format:fix | COMPLETO |
| Scripts en shared-types | lint, lint:fix, format, format:fix | COMPLETO |
| Scripts en domain | lint, lint:fix, format, format:fix | COMPLETO |
| Scripts en config | lint, lint:fix, format, format:fix | COMPLETO |
| lint-staged | Actualizado a biome check --write | COMPLETO |

### 6.2 Archivos Creados/Modificados

| Archivo | Accion |
|---------|-------|
| biome.json | Modificado |
| tooling/setup-biome.cmd | Creado |
| tooling/migrate-eslint-prettier.cmd | Creado |
| tooling/verify-biome.cmd | Creado |
| apps/backend/package.json | Modificado |
| apps/frontend/package.json | Modificado |
| packages/shared-types/package.json | Modificado |
| packages/domain/package.json | Modificado |
| packages/config/package.json | Modificado |
| package.json (root) | Modificado |

## 7. Referencias

### 7.1 Guias Oficiales de Biome.js

- **Migracion de ESLint/Prettier:** https://biomejs.dev/guides/migrate-eslint-prettier/
- **Configuracion de Biome:** https://biomejs.dev/guides/configure-biome/
- **Documentacion General:** https://biomejs.dev/

### 7.2 Comandos Utililes

| Comando | Descripcion |
|---------|-------------|
| `npx biome init` | Inicializa configuracion |
| `npx biome check .` | Verifica lint y formato |
| `npx biome check --write .` | Corrige errores automaticamente |
| `npx biome format .` | Verifica formato |
| `npx biome format --write .` | Aplica formato |
| `npx biome migrate eslint` | Migra configuracion ESLint |
| `npx biome migrate prettier` | Migra configuracion Prettier |

## 8. Reporte de Incidencias

### 8.1 Incidencias Detectadas

| ID | Descripcion | Gravedad | Recomendacion |
|----|-------------|----------|---------------|
| INC-001 | ESLint coexiste con Biome | MEDIA | Remover despues de migracion |
| INC-002 | Configs eslint.config.mjs duplicadas | BAJA | Mantener hasta migracion completa |
| INC-003 | domain y config sin scripts de biome | ALTA | Agregar scripts (ya completado) |

### 8.2 Plan de Accion Correctiva

1. **Corto plazo (inmediato):**
   - Ejecutar setup-biome.cmd en todos los entornos
   - Verificar con verify-biome.cmd

2. **Medio plazo (1 semana):**
   - Ejecutar migrate-eslint-prettier.cmd
   - Verificar que lint pasa en todos los workspaces

3. **Largo plazo (2 semanas):**
   - Remover eslint de devDependencies
   - Eliminar archivos eslint.config.mjs

## 9. Evidencias de Implementacion

Para cada paso de verificacion, se deben guardar las siguientes evidencias:

1. **Captura de terminal** de `npx biome --version`
2. **Captura de terminal** de `npx biome check .`
3. **Captura de terminal** de `npm run lint`
4. **Contenido del archivo** biome.json
5. **Salida de verify-biome.cmd**

Estas evidencias deben almacenarse en la carpeta `tooling/evidencias/` con el formato:
- `evidencia-YYYY-MM-DD-HHMM-version.txt`
- `evidencia-YYYY-MM-DD-HHMM-check.txt`
- `evidencia-YYYY-MM-DD-HHMM-lint.txt`