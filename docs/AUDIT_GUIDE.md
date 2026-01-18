# 📊 Guía de Auditoría Automática

## Descripción

El sistema de auditoría automática analiza automáticamente tu monorepo fullstack (Angular 21 + NestJS) para detectar:

- ✅ **Errores de compilación y tipado**
- ✅ **Problemas de linting** (estilo de código)
- ✅ **Fallos en tests**
- ✅ **Vulnerabilidades de seguridad**
- ✅ **Código duplicado**
- ✅ **Inconsistencias entre Frontend y Backend**
- ✅ **Dependencias outdated**

---

## 🚀 Uso Local

### Auditoría Completa

```bash
pnpm run audit:full
```

Ejecuta:

1. `pnpm run lint` - Lint en backend y frontend
2. `pnpm exec jscpd` - Detecta código duplicado
3. `node scripts/audit/check-api-consistency.js` - Verifica coherencia API
4. `pnpm audit --prod` - Auditoría de seguridad
5. `node scripts/generate-audit-report.mjs` - Genera reporte consolidado en `docs/AUDIT_REPORT.md`

### Auditoría Local (sin generar reporte)

```bash
pnpm run audit:local
```

### Generar Reporte Solo

```bash
pnpm run audit:report
```

Genera `docs/AUDIT_REPORT.md` a partir de los logs en la carpeta `audit/`

---

## 🤖 Uso en GitHub Actions

El workflow se ejecuta automáticamente en:

- **Push a `main` o `master`** - Auditoría completa
- **Pull Requests** - Auditoría + comentario con reporte
- **Manual** - Click en "Run workflow" en la pestaña Actions
- **Programado** - Cada domingo a las 2 AM UTC

### Acceder al Reporte

1. Ve a **GitHub → Actions**
2. Busca el workflow "Quality & Security Audit Report"
3. Haz click en la ejecución
4. Descarga los artifacts:
   - `audit-logs/` - Logs crudos de cada herramienta
   - `audit-report/AUDIT_REPORT.md` - Reporte consolidado

### En Pull Requests

Automáticamente se publica un comentario con el resumen del reporte.

---

## 📂 Estructura de Archivos

```
cermont_aplicativo/
├── scripts/
│   ├── audit/
│   │   └── check-api-consistency.js    # Valida coherencia API
│   └── generate-audit-report.mjs       # Genera reporte Markdown
├── audit/                              # Carpeta generada con logs
│   ├── lint-backend.log
│   ├── lint-frontend.log
│   ├── typecheck-backend.log
│   ├── typecheck-frontend.log
│   ├── build-backend.log
│   ├── build-frontend.log
│   ├── test-backend.log
│   ├── test-frontend.log
│   ├── api-consistency.log
│   ├── security-audit.log
│   ├── duplication.log
│   ├── outdated.log
│   ├── api-consistency-report.json     # Report structured
│   └── jscpd-report.html              # Duplication visual
├── docs/
│   └── AUDIT_REPORT.md                 # Reporte consolidado
└── .github/workflows/
    ├── quality-audit-report.yml        # GitHub Action principal
    └── ci.yml                          # CI/CD existente
```

---

## 🔍 Qué Verifica Cada Script

### check-api-consistency.js

**Función:** Detecta si el Frontend llama a rutas HTTP que no existen en el Backend.

**Busca:**

- Decoradores `@Controller()` y `@Get/@Post/@Put/@Delete/@Patch` en Backend
- Llamadas a `http.get/post/put/delete`, `fetch()`, `axios.*` en Frontend

**Genera:**

- Log en consola con errores encontrados
- `audit/api-consistency-report.json` con datos estructurados

**Ejemplo de error:**

```
Frontend llama a: /api/nonexistent-route
Backend no tiene: /api/nonexistent-route
Ubicación: frontend/src/app/services/example.service.ts:42
```

**Acción:**

- Crear la ruta en Backend O
- Actualizar la llamada en Frontend

---

### generate-audit-report.mjs

**Función:** Consolida todos los logs y genera un reporte Markdown profesional.

**Lee:**

- Logs de lint, typecheck, tests, build, security
- Reports JSON de coherencia API

**Genera:**

- `docs/AUDIT_REPORT.md` con:
  - Información del commit (SHA, branch, author)
  - Versiones de Node/pnpm
  - Resumen de status por módulo
  - Secciones detalladas de cada verificación
  - Lista de acciones pendientes
  - Comandos para reproducir localmente

---

## 🛠️ Troubleshooting

### El workflow falla en GitHub pero funciona localmente

**Causa:** Diferencias de ambiente (Node version, cache, permisos)

**Solución:**

```bash
# Simular ambiente de GitHub
rm -rf node_modules .turbo
pnpm install --frozen-lockfile
pnpm run audit:full
```

### No se genera audit-report

**Causa:** El script de generación necesita logs previos

**Solución:**

```bash
# Asegúrate de tener la carpeta audit/
mkdir -p audit

# Ejecuta auditoría primero
pnpm run audit:local

# Luego genera el reporte
pnpm run audit:report
```

### API Coherence check falla con falsos positivos

**Causa:** Rutas dinámicas, imports circulares, o rutas que usan variables

**Solución:**

- El script es heurístico; revisa manualmente si las alertas son reales
- En GitHub Actions, este paso tiene `continue-on-error: true` (no bloquea)

---

## 📋 Checklist Pre-Commit

Antes de hacer `git push`:

```bash
# 1. Lint local
pnpm run lint

# 2. Type check
pnpm run typecheck

# 3. Compilación
pnpm run build

# 4. Tests (si aplica)
pnpm run test

# 5. Auditoría completa
pnpm run audit:full

# 6. Revisar reporte
cat docs/AUDIT_REPORT.md
```

---

## 🎯 Interpretación del Reporte

### Tabla de Resumen

| Status     | Significado                   | Acción                  |
| ---------- | ----------------------------- | ----------------------- |
| ✅ PASS    | No hay errores                | Proceder                |
| ❌ FAIL    | Hay errores bloqueantes       | Corregir antes de merge |
| 🟡 WARN    | Advertencias (no bloqueantes) | Revisar y considerar    |
| ⏳ PENDING | Herramienta aún no ejecutada  | Ejecutar manualmente    |

### Secciones Importantes

1. **Environment** - Confirma que corres con Node 20.x
2. **Summary** - Tabla rápida de status
3. **Detailed Results** - Cada verificación con logs
4. **Action Items** - Priorización de fixes

---

## 📞 Preguntas Frecuentes

**P: ¿Con qué frecuencia se ejecuta?**  
R: En cada `git push` a `main`/`master`, en PRs, o manualmente desde Actions.

**P: ¿Bloquea el merge en GitHub?**  
R: No por defecto. Pero puedes configurar branch protection rules para requerirlo.

**P: ¿Puedo deshabilitar alguna verificación?**  
R: Sí, edita `.github/workflows/quality-audit-report.yml` y comenta/cambia steps.

**P: ¿Dónde veo los logs completos?**  
R: En `audit-logs` artifact del workflow en GitHub Actions.

**P: ¿Se almacenan los artifacts?**  
R: Sí, por 30 días (configurable en el workflow).

---

## 🔗 Proximos Pasos

1. ✅ Haz `git add` y `git commit` de los cambios
2. ✅ Haz `git push` para trigger el workflow
3. ✅ Ve a GitHub Actions para ver la ejecución
4. ✅ Descarga los artifacts y revisa `AUDIT_REPORT.md`
5. ✅ Soluciona issues encontradas
6. ✅ Repite auditoría hasta que todo esté ✅

---

**Última actualización:** 2025-01-16  
**Versión:** 1.0.0  
**Mantenedor:** Backend Team
