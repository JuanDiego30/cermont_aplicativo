# 📋 Guía para el Equipo - Sistema de Auditoría

## Para Desarrolladores

### Antes de hacer PR/Commit

```bash
# 1. Verificar que auditoría está configurada
node scripts/verify-audit-setup.js

# 2. Ejecutar auditoría local
pnpm run audit:full

# 3. Revisar reporte
cat docs/AUDIT_REPORT.md

# 4. Si todo está bien, hacer commit
git add .
git commit -m "feat: implement feature XYZ"
git push origin feature/xyz
```

### Interpretar el Reporte

```
✅ OK        - Sin problemas
❌ FAIL      - Hay errores bloqueantes
🟡 WARN      - Advertencias (no bloquean)
⏳ PENDING   - No se ejecutó aún
```

### Errores Comunes

**"lint failed"**
→ Ejecutar `pnpm run lint:fix` y re-auditar

**"typecheck failed"**
→ Revisar `audit/typecheck-*.log` para ver qué tipos faltan

**"API coherence issues"**
→ Ver `docs/AUDIT_FINDINGS_ANALYSIS.md` para análisis detallado

---

## Para Code Reviewers

### En GitHub PR

El workflow ejecuta automáticamente y publica un comentario con:

- Tabla de status por módulo
- Número de errores/warnings
- Links a logs completos

**Revisar:**

1. ✅ Lint - Estilo de código
2. ✅ Type Check - Errores de tipos
3. ✅ Build - ¿Compila?
4. ✅ Tests - ¿Pasan tests?
5. ✅ API Coherence - ¿Endpoints existen?

### Criterios de Aprobación

Aprobar solo si:

- [ ] Lint: Sin errores (warnings OK)
- [ ] Type Check: Sin errores
- [ ] Build: Success
- [ ] Tests: Success o N/A
- [ ] API Coherence: OK o reviewed

---

## Para Líder Técnico / DevOps

### Configuración Inicial

```bash
# 1. Verificar setup
node scripts/verify-audit-setup.js

# 2. Ver reporte inicial
pnpm run audit:full
cat docs/AUDIT_REPORT.md

# 3. Resolver hallazgos críticos
cat docs/AUDIT_FINDINGS_ANALYSIS.md

# 4. Hacer commit de auditoría
git add . && git commit -m "chore: setup automated auditing system"
git push origin main
```

### Configuración en GitHub

**Recomendado:** Agregar branch protection rule:

```
Settings > Branches > Add Rule

Branch name: main
Required status checks:
  ✅ Quality & Security Audit Report
  ✅ (otros workflows)

Dismiss stale reviews: Checked
Require linear history: Checked
```

### Monitoreo Semanal

```bash
# Ver último reporte
cat docs/AUDIT_REPORT.md

# Ver histórico de artifacts
# GitHub → Actions → Quality & Security Audit Report
# (últimas 30 ejecuciones)

# Tendencias
# - ¿Aumentan los errores?
# - ¿Empeora la duplicación?
# - ¿Nuevas vulnerabilidades?
```

### Personalización

**Si necesitas cambiar horario:**

Edita `.github/workflows/quality-audit-report.yml`:

```yaml
schedule:
  - cron: '0 2 * * 0' # Cambiar este cron
```

Referencia: https://crontab.guru

**Si necesitas agregar más checks:**

Edita `.github/workflows/quality-audit-report.yml` y agrega un paso como:

```yaml
- name: 🔍 Custom Check
  run: |
    # Tu comando aquí
  continue-on-error: true
```

---

## Frecuente Asked Questions

### P: ¿Cuánto tarda la auditoría?

**R:**

- Local: 2-5 minutos (según specs de tu PC)
- GitHub: 3-7 minutos (según estado de repo)

### P: ¿Qué pasa si falla un check?

**R:**

- No bloquea otros checks
- Se reporta en el reporte
- Se publica en PR como comentario
- Revisor decide si es crítico

### P: ¿Puedo ignorar algunos errores?

**R:**
Depende:

- Lint warnings: Sí, pero no deberían ignorarse
- Type check: Deberían arreglarse
- Tests fail: Deberían arreglarse
- Security: Crítico, siempre arreglar
- API coherence: Revisar si es real o false positive

### P: ¿Cómo agrego una nueva herramienta de auditoría?

**R:**

1. Instalar herramienta: `pnpm add -D nombre`
2. Crear script en `scripts/audit/` si es necesario
3. Agregar step en `.github/workflows/quality-audit-report.yml`
4. Actualizar script generador para incluir en reporte

### P: ¿Qué hago si GitHub Actions falla pero local funciona?

**R:**
Probables causas:

1. Diferencia de versiones de Node
2. Caché diferente
3. Permisos del runner
4. Variables de ambiente

Solución:

```bash
# Simular env de GitHub
rm -rf node_modules .turbo
pnpm install --frozen-lockfile
pnpm run audit:full
```

---

## 📞 Contacto y Soporte

**Sistema de Auditoría:**

- Documentación: `docs/AUDIT_GUIDE.md`
- Hallazgos: `docs/AUDIT_FINDINGS_ANALYSIS.md`
- Setup: `AUDIT_SETUP_SUMMARY.md`

**Para reportar problemas:**

1. Verificar que setup es correcto: `node scripts/verify-audit-setup.js`
2. Revisar logs: `audit/` folder
3. Consultar análisis: `docs/AUDIT_FINDINGS_ANALYSIS.md`

---

## Próximos Pasos

- [ ] Todo el equipo lee esta guía
- [ ] Hacer primer commit con auditoría
- [ ] Ver ejecución en GitHub Actions
- [ ] Ajustar si es necesario
- [ ] Documentar hallazgos en issues
- [ ] Programar sesión de remediation si hay muchos

---

**Documento actualizado:** 16 de enero de 2026  
**Versión:** 1.0.0
