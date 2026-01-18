# 🔍 Análisis de Hallazgos - Auditoría Inicial

## Resumen Ejecutivo

La auditoría inicial del monorepo cermont_aplicativo ha identificado un hallazgo principal y se necesita completar otros chequeos.

---

## 1️⃣ HALLAZGO CRÍTICO: API Coherence

### Estado: ❌ BLOQUEANTE (en información, no en build)

### Problema Identificado

```
Backend Routes:    154 encontradas
Frontend Calls:    41 escaneadas
Inconsistencias:   41 detectadas
```

### Patrones Detectados

El script encontró que **todas** las llamadas del Frontend tienen la forma:

```
/api/:param/...
/api/:param/:param/...
```

**Causa Probable:**
Las rutas del Frontend están siendo normalizadas por el script. Esto ocurre porque:

1. Las URLs tienen parámetros dinámicos (`:id`, `:userId`, etc.)
2. El script normaliza parámetros a `:param`
3. El Backend tiene rutas específicas (ej: `/api/auth/login`)
4. No hay coincidencia exacta

### Rutas Afectadas (Primeras 15)

```
❌ /api/:param/:param              → frontend/src/app/services/ordenes.service.ts:97
❌ /api/:param/change-password     → frontend/src/app/core/services/user.service.ts:54
❌ /api/:param/profile             → frontend/src/app/core/services/user.service.ts:64
❌ /api/:param/avatar              → frontend/src/app/core/services/upload.service.ts:27
❌ /api/:param/register            → frontend/src/app/core/services/auth.service.ts:82
❌ /api/:param/login               → frontend/src/app/core/services/auth.service.ts:96
❌ /api/:param/forgot-password     → frontend/src/app/core/services/auth.service.ts:122
❌ /api/:param/reset-password      → frontend/src/app/core/services/auth.service.ts:131
❌ /api/:param/2fa/enable          → frontend/src/app/core/services/auth.service.ts:140
❌ /api/:param/2fa/verify          → frontend/src/app/core/services/auth.service.ts:149
❌ /api/:param/2fa/disable         → frontend/src/app/core/services/auth.service.ts:167
❌ /api/:param/refresh             → frontend/src/app/core/services/auth.service.ts:194
❌ /api/:param/users               → frontend/src/app/core/services/admin.service.ts:38
❌ /api/:param/users/:param        → frontend/src/app/core/services/admin.service.ts:47
❌ /api/:param/users/:param/role   → frontend/src/app/core/services/admin.service.ts:74
```

### Análisis Root Cause

El problema es en **cómo se extrae URLs** del Frontend. El script detecta:

```typescript
// Ejemplo real en frontend
this.http.post('/api/auth/login', ...)           // ✅ Correcta
fetch('/api/users/${userId}/profile', ...)      // ❌ Detectada como /api/:param/:param
```

### Soluciones Posibles

**Opción A: Corregir el Script** (Recomendado)

- Mejorar regex para detectar strings literales vs variables
- Usar AST parser en lugar de regex
- Ignorar URLs con `${}` o expresiones de template

**Opción B: Revisar el Frontend Manualmente**

- Verificar que `frontend/src/app/*/services/*.service.ts` tengan URLs correctas
- Confirmar que todas las llamadas hacen match con Backend

**Opción C: Deshabilitar Verificación**

- Comentar el step en el workflow (no recomendado)

### Recomendación

✅ **Opción A es la mejor.** El script necesita mejoras:

1. Detectar solo strings literales: `/api/...`
2. Ignorar template strings: `/api/${variable}`
3. Mapear servicios a rutas reales

---

## 2️⃣ HALLAZGO: ESLint Error (Bloquea Lint)

### Estado: ❌ BLOQUEANTE (impide que lint funcione)

### Problema

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'globals'
imported from backend/eslint.config.mjs
```

### Causa

El archivo `backend/eslint.config.mjs` intenta importar:

```javascript
import globals from 'globals'; // ← Falta instalar
```

### Solución

```bash
cd backend
pnpm add -D globals
```

**Pero:** Hay un bloqueo de proceso. Solución alternativa:

```bash
pnpm store prune
pnpm install
```

---

## 3️⃣ HALLAZGOS PENDIENTES

Los siguientes chequeos no se han completado:

- ⏳ **Linting** - Bloqueado por ESLint error
- ⏳ **Type Checking** - No ejecutado
- ⏳ **Build** - No ejecutado
- ⏳ **Tests** - No ejecutado
- ⏳ **Code Duplication** - No ejecutado
- ⏳ **Security Audit** - No ejecutado

---

## 🛠️ Plan de Remediación

### Paso 1: Resolver ESLint (INMEDIATO)

```bash
# Instalar dependencia
cd backend
pnpm add -D globals

# Verificar que lint funciona
pnpm run lint
```

**Si persiste el error:**

```bash
rm -rf node_modules backend/node_modules
pnpm install
```

### Paso 2: Ejecutar Auditoría Completa (DESPUÉS)

```bash
pnpm run audit:full
```

### Paso 3: Mejorar Script de Coherencia API (LATER)

Editar `scripts/audit/check-api-consistency.js`:

```javascript
// Mejor detección de URLs
const urlPattern =
  /(?:this\.http|fetch|axios)\.(get|post|put|delete|patch)\s*(?:<[^>]*>)?\s*\(\s*['"`]([^'"`${}]+)['"`]/gi;
```

### Paso 4: Revisar Hallazgos

Una vez que lint, typecheck, build y tests pasen, analizar:

- Qué rutas tienen inconsistencias reales
- Qué son falsos positivos
- Actuar en consecuencia

---

## 📊 Matriz de Severidad

| Hallazgo                                | Severidad | Bloqueante | Acción                      |
| --------------------------------------- | --------- | ---------- | --------------------------- |
| API Coherence (false positives)         | 🟡 MEDIUM | No         | Revisar/mejorar script      |
| ESLint package 'globals'                | 🔴 HIGH   | Sí         | Instalar dependencia        |
| Pending checks (lint, typecheck, build) | 🟡 MEDIUM | No         | Ejecutar auditoría completa |

---

## ✅ Próximos Pasos

1. **Ahora:** `cd backend && pnpm add -D globals`
2. **Luego:** `pnpm run audit:full`
3. **Revisar:** `cat docs/AUDIT_REPORT.md`
4. **Documentar:** Agregar a `docs/KNOWN_ISSUES.md`

---

**Documento generado:** 16 de enero de 2026  
**Próxima auditoría:** Automática en cada `git push`
