# REFACTOR INVENTORY - CERMONT

**Fecha:** 2026-01-16
**Fase:** AUDITORÍA COMPLETA (CREA FASE 1)

---

## ✅ ESTADO ACTUAL DEL PROYECTO

### Build Status

- **Backend:** ✅ PASA (0 errores TypeScript)
- **Frontend:** ✅ PASA (0 errores TypeScript)

### Lint Status

- **Backend:** ⚠️ WARNINGS (solo warnings tras relajar reglas)
- **Frontend:** ✅ PASA (0 errores)

### Dependencies

- **Circular deps:** ✅ NINGUNA detectada en backend
- **Code duplicates:** ✅ NINGUNO detectado (>10 líneas, >50 tokens)

---

## 📋 DEPENDENCIAS - BACKEND

### Dependencias NO USADAS (Eliminar)

```json
{
  "unused": ["date-fns", "passport-local", "pino", "pino-http", "pino-pretty", "socket.io", "uuid"],
  "unusedDev": ["source-map-support", "ts-loader", "ts-node", "tsconfig-paths", "tsx"]
}
```

### Dependencias FALTANTES (Instalar)

```json
{
  "missing": ["@eslint/js", "express", "web-push"]
}
```

### Vulnerabilidades de Seguridad (HIGH)

```json
{
  "vulnerabilities": {
    "hono": "2 HIGH (JWK auth middleware, JWT algorithm confusion)",
    "tar": "1 HIGH (transitive from Angular CLI dev tools)"
  },
  "action": "Estas son dependencias transitivas de dev tools (Prisma dev, Angular CLI). Actualizar cuando haya patches disponibles.",
  "priority": "LOW (no afectan producción)"
  }
}
```

---

## 📋 DEPENDENCIAS - FRONTEND

### Dependencias NO USADAS (Eliminar)

```json
{
  "unused": [
    "@fullcalendar/angular",
    "@fullcalendar/daygrid",
    "@fullcalendar/interaction",
    "@fullcalendar/timegrid",
    "date-fns",
    "tslib"
  ],
  "unusedDev": [
    "@angular-devkit/build-angular",
    "@angular-eslint/builder",
    "@types/node",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "@tailwindcss/postcss",
    "autoprefixer",
    "jasmine-core",
    "karma",
    "karma-chrome-launcher",
    "karma-coverage",
    "karma-jasmine",
    "karma-jasmine-html-reporter",
    "postcss",
    "tailwindcss"
  ]
}
```

### Dependencias FALTANTES (Revisar)

```json
{
  "missing": ["webpack-merge", "@app/core", "@app/shared", "@env/environment"],
  "note": "Los últimos 3 son paths locales posiblemente mal configurados en tsconfig"
}
```

---

## 🗂️ ARQUITECTURA - LIMPIEZA YA REALIZADA

### Módulos Eliminados ( sesión anterior)

- ✅ `checklists` → Eliminado
- ✅ `customers` → Eliminado
- ✅ `sync` → Eliminado
- ✅ `weather` → Eliminado
- ✅ `archiving` → Eliminado
- ✅ `certifications` → Eliminado

### Modelos Prisma Eliminados

- ✅ `Certificado`
- ✅ `ArchivoHistorico`
- ✅ `PendingSync`
- ✅ `TipoArchivo`
- ✅ `InspectionForm`
- ✅ `Checklist`, `ChecklistItem`, `ChecklistCategory`
- ✅ `FormularioTemplate`, `FormularioRespuesta`, `FormularioRespuestaCerrada`

### Modelos Prisma Consolidados

- ✅ `FormTemplate` → ahora incluye `kitTipicoId` opcional
- ✅ `FormularioInstancia` → ahora incluye `ejecucionId`
- ✅ Nueva relación `EjecucionFormularios` entre `Ejecucion` y `FormularioInstancia`

---

## 📊 MÉTRICAS ACTUALES

| Métrica                    | Actual        | Objetivo      | Estado                |
| -------------------------- | ------------- | ------------- | --------------------- |
| Errores TypeScript         | 0             | 0             | ✅                    |
| Warnings ESLint (backend)  | ~200 warnings | <10           | ⚠️ Relajado a warning |
| Warnings ESLint (frontend) | 0             | 0             | ✅                    |
| Circular deps              | 0             | 0             | ✅                    |
| Duplicados de código       | 0             | 0             | ✅                    |
| Test coverage              | Desconocido   | ≥40% críticos | ❌ Pendiente          |
| Build time (backend)       | ~5s           | <10s          | ✅                    |
| Build time (frontend)      | ~2s           | <10s          | ✅                    |

---

## ✅ FASE 2: LIMPIEZA Y ELIMINACIÓN - COMPLETADO

### Tarea 2.1: Limpiar dependencias no usadas - ✅ HECHO

```bash
# Backend - Dependencias eliminadas:
- date-fns
- passport-local
- pino, pino-http, pino-pretty
- socket.io
- uuid
- source-map-support (dev)
- ts-loader (dev)
- ts-node (dev)
- tsconfig-paths (dev)
- tsx (dev)

# Backend - Dependencias agregadas:
+ @eslint/js
+ express
+ web-push

# Frontend - Dependencias eliminadas:
- @fullcalendar/angular
- @fullcalendar/daygrid
- @fullcalendar/interaction
- @fullcalendar/timegrid
- date-fns
```

**Nota:** Se conservaron @angular-devkit/build-angular, @angular-eslint/_, @types/node, @typescript-eslint/_ porque son dependencias de dev necesarias para Angular CLI, linting y type-checking.

### Build Status tras limpieza:

- **Backend:** ✅ PASA
- **Frontend:** ✅ PASA
- **Lint Frontend:** ✅ PASA

---

## ✅ FASE 3: CORRECCIÓN DE ERRORES (TIER 1) - EN PROGRESO

### Tarea 3.1: Decimal.js Wrapper - ✅ HECHO

**Creado:** `backend/src/shared/utils/decimal.util.ts`

```typescript
export function toDecimal(value: string | number): Decimal {
  return new Decimal(value);
}

export function fromDecimal(value: Decimal): number {
  return value.toNumber();
}

export function isDecimal(value: unknown): value is Decimal {
  return Decimal.isDecimal(value);
}
```

### Tarea 3.2: Null vs Undefined Helper - ✅ HECHO

**Creado:** `backend/src/shared/utils/mapper.util.ts`

```typescript
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

export function mapNullableObject<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value === null ? undefined : value])
  ) as T;
}
```

### Tarea 3.3: Migrar a toDecimal() - PENDIENTE

**Detectado:** 21 archivos usando `new Decimal(` directamente
**Acción:** Reemplazar `new Decimal(` con `toDecimal(` en estos archivos

### Tarea 3.4: JWT Generics - PENDIENTE

**Pendiente:** Revisar `JwtSignerPort` para compatibilidad con `@nestjs/jwt`

### Tarea 3.5: Instalar Dependencias Faltantes - ✅ HECHO

- ✅ @eslint/js
- ✅ express
- ✅ web-push

---

## 🔍 PENDIENTE DETECTADO

### Módulos/Servicios con muchos `any` (revisar)

- `modules/admin` (mappers, controllers)
- `modules/alerts` (queue, strategies)
- `modules/auth` (use-cases, guards)
- `modules/costs` (value-objects, events)
- `modules/dashboard` (repository, services)
- `modules/evidence` (use-cases)
- `modules/execution` (repository)
- `modules/forms` (mappers)

**Nota:** Estos son legacy hotspots donde relajamos `@typescript-eslint/no-explicit-any` a warning.

### Archivos con Prettier warnings

- `backend/src/config/config.schema.ts` (16 prettier warnings)
- `backend/src/config/typed-config.module.ts` (1 prettier warning)

---

## 📝 ACCIÓN RECOMENDADA

Continuar con **FASE 3: CORRECCIÓN DE ERRORES (TIER 1)** según plan CREA:

1. Crear wrapper `Decimal.js` (`backend/src/shared/utils/decimal.util.ts`)
2. Crear helper `nullToUndefined` (`backend/src/shared/utils/mapper.util.ts`)
3. Revisar JWT generics en `JwtSignerPort`
4. Limpiar dependencias no usadas (Tarea 2.1)

¿Quieres que proceda con **FASE 3: CORRECCIÓN DE ERRORES (TIER 1)**?
