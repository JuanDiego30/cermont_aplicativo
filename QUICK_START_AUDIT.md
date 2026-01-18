# 🚀 INICIO RÁPIDO - Sistema de Auditoría

## ⚡ Comandos Esenciales

### 1. Verificar Configuración

```bash
node scripts/verify-audit-setup.js
```

**Output esperado:** 15/15 verificaciones ✅

### 2. Ejecutar Auditoría Local

```bash
pnpm run audit:full
```

**Ejecuta:**

- Linting (backend + frontend)
- Duplicación de código (JSCPD)
- Coherencia API (Backend vs Frontend)
- Auditoría de seguridad

**Genera:**

- Logs en `audit/` folder
- Reporte en `docs/AUDIT_REPORT.md`

### 3. Ver Reporte

```bash
cat docs/AUDIT_REPORT.md
```

---

## 🔄 Flujo de Trabajo

### Antes de hacer `git push`

```bash
# 1. Verificar setup
node scripts/verify-audit-setup.js

# 2. Auditoría completa
pnpm run audit:full

# 3. Revisar reporte
cat docs/AUDIT_REPORT.md

# 4. Si todo está OK, hacer commit y push
git add .
git commit -m "chore: resolve audit issues"
git push origin main
```

### En GitHub (Automático)

1. Workflow ejecuta automáticamente en `git push`
2. Ve a **Actions** → "Quality & Security Audit Report"
3. Espera ~3-5 minutos
4. Descarga artifacts:
   - `audit-logs/` - Todos los logs crudos
   - `audit-report/AUDIT_REPORT.md` - Reporte consolidado
5. Si es PR, verás un comentario con el resumen

---

## 📊 ¿Qué Verifica?

| Verificación  | Comando                                       | Log                       |
| ------------- | --------------------------------------------- | ------------------------- |
| Linting       | `pnpm run lint`                               | audit/lint-\*.log         |
| Type Check    | `pnpm run typecheck`                          | audit/typecheck-\*.log    |
| Build         | `pnpm run build`                              | audit/build-\*.log        |
| Tests         | `pnpm run test`                               | audit/test-\*.log         |
| Duplicación   | `jscpd`                                       | audit/duplication.log     |
| API Coherence | `node scripts/audit/check-api-consistency.js` | audit/api-consistency.log |
| Seguridad     | `pnpm audit --prod`                           | audit/security-audit.log  |
| Outdated      | `pnpm outdated`                               | audit/outdated.log        |

---

## 🎯 Primeros Pasos

### Paso 1: Verificación

```bash
node scripts/verify-audit-setup.js
```

### Paso 2: Prueba Local

```bash
# Ejecutar solo coherencia API (rápido, ~1 segundo)
node scripts/audit/check-api-consistency.js

# Generar reporte (basado en logs existentes)
pnpm run audit:report
```

### Paso 3: Auditoría Completa

```bash
# Ejecutar todo (toma 2-5 minutos)
pnpm run audit:full
```

### Paso 4: Revisar Resultados

```bash
# Ver reporte consolidado
cat docs/AUDIT_REPORT.md

# Ver logs específicos
cat audit/api-consistency.log
cat audit/lint-backend.log
```

### Paso 5: Hacer Commit

```bash
git add .
git commit -m "chore: setup automated auditing"
git push origin main
```

---

## 📖 Documentación Detallada

- **Guía Completa:** [docs/AUDIT_GUIDE.md](docs/AUDIT_GUIDE.md)
- **Resumen Implementación:** [AUDIT_SETUP_SUMMARY.md](AUDIT_SETUP_SUMMARY.md)
- **Diagrama del Sistema:** [AUDIT_SYSTEM_DIAGRAM.md](AUDIT_SYSTEM_DIAGRAM.md)
- **Reporte Actual:** [docs/AUDIT_REPORT.md](docs/AUDIT_REPORT.md)

---

## 🔧 Comandos Disponibles

```bash
# Scripts en package.json
pnpm run audit:local        # Auditoría local (sin generar reporte)
pnpm run audit:report       # Generar solo reporte
pnpm run audit:full         # Auditoría completa (local + reporte)

# Scripts individuales
node scripts/verify-audit-setup.js                    # Verificar setup
node scripts/audit/check-api-consistency.js           # API coherence
node scripts/generate-audit-report.mjs                # Generar reporte

# Turbo (ejecuta en todos los workspaces)
pnpm run lint               # ESLint
pnpm run typecheck          # TypeScript
pnpm run test               # Tests
pnpm run build              # Build

# pnpm
pnpm audit --prod           # Auditoría de seguridad
pnpm outdated               # Dependencias outdated
pnpm exec jscpd             # Duplicación de código
```

---

## 🎓 Primeros Hallazgos

Después de ejecutar la auditoría inicial:

```
✅ API Coherence: 154 rutas en Backend vs 41 llamadas en Frontend
   ⚠️  41 inconsistencias detectadas (requiere revisión manual)

⏳ Otros verificadores: Aguardando ejecución manual
```

**Causa de inconsistencias:** Frontend usa parámetros dinámicos normalizados (`:param`) que se normalizar necesitan.

---

## ❓ Troubleshooting

### "Script not found"

```bash
# Verificar que glob está instalado
pnpm add -D glob

# Reinstalar dependencias
rm -rf node_modules
pnpm install
```

### "Command not found: jscpd"

```bash
# Ejecutar con pnpm exec
pnpm exec jscpd
```

### "No se generó reporte"

```bash
# Asegurar que existe carpeta audit/
mkdir -p audit

# Ejecutar auditoría primero
pnpm run audit:local

# Luego generar reporte
pnpm run audit:report
```

---

## 📞 Preguntas Frecuentes

**P: ¿Es obligatorio usar el sistema?**  
R: No, pero es recomendado antes de cada PR.

**P: ¿Bloquea el merge?**  
R: No por defecto. Puedes configurarlo en branch protection.

**P: ¿Cuánto tarda?**  
R: Auditoría local: 2-5 minutos. GitHub Actions: 3-7 minutos.

**P: ¿Dónde veo todos los detalles?**  
R: En `docs/AUDIT_REPORT.md` después de ejecutar o en artifacts de GitHub Actions.

---

## 🎯 Próximos Pasos

1. **Ahora:** Ejecuta `pnpm run audit:full`
2. **Luego:** Revisa `docs/AUDIT_REPORT.md`
3. **Después:** Haz commit con `git add . && git commit`
4. **Finally:** Haz `git push` y mira GitHub Actions

---

**¿Necesitas ayuda?**  
Lee la documentación completa en `docs/AUDIT_GUIDE.md`

**¿Quieres personalizar?**  
Edita `.github/workflows/quality-audit-report.yml` o `.jscpd.json`

---

**Sistema Listo:** ✅ 2026-01-16
