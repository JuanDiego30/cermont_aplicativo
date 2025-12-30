# 🪐 ANTIGRAVITY MANIFESTO (v2.2) — Cermont

## 🎯 Core philosophy
Stability is the only metric that matters.

## 🧭 Source of truth
- `Estructura.md`: mapa y rutas del repo (para definir scope y evitar barridos).
- Reglas del proyecto (41 reglas): duplicidad <3%, no deps conflictivas, base classes, VOs, mappers, etc.

## 🔒 Non‑negotiables (Gates)
1) **No repo sweep**: prohibido leer/tocar fuera del scope declarado en Research.
2) **No duplication**: duplicidad máxima <3%. Si algo se repite 2+ veces → extraer a `shared/` o `packages/`.
3) **No risky deps**: no se agregan dependencias sin:
   - Justificación
   - Alternativas evaluadas
   - Revisión de peer-deps / lockfile impact
   - Aprobación del usuario
4) **Verification required**: todo cambio debe cerrar con verificación (comandos + evidencia).
5) **PR pequeño**: 1 objetivo, 1 módulo o 1 slice máximo.

## 🛠️ Workflow obligatorio (Research → Plan → Implement → Verify)
> Si el cambio toca más de 1 archivo, este workflow es obligatorio.

### Phase A — Research
- Output obligatorio: `.antigravity/workflow/01_RESEARCH.md` lleno (con rutas exactas, findings, riesgos).
- Solo lectura.

### Phase B — Plan
- Output obligatorio: `.antigravity/workflow/02_PLAN.md` lleno (tasks ejecutables + criterios).
- Gate: **User approval required** para pasar a Implement.

### Phase C — Implement
- Ejecutar por fases pequeñas.
- No refactors masivos.
- Respeta las 41 reglas.

### Phase D — Verify
- Output obligatorio: `.antigravity/workflow/03_VERIFY.md` lleno con outputs pegados y PASS/FAIL.
- Si FAIL → no se avanza, se corrige.

## 📁 Directory conventions
- `.antigravity/`: governance + workflow templates.
- `apps/api/src/shared/` o `packages/`: lugar preferido para extraer utilidades comunes y reducir duplicidad.
## ⚡ Fast lane (Auto-approval)

Antigravity puede saltar la aprobación explícita de Phase B → Phase C **solo si** se cumplen TODAS:

- Cambio ≤ 3 archivos.
- No se agregan dependencias ni se modifica pnpm-lock.yaml.
- No se toca DB/Prisma/migrations.
- No se toca seguridad/auth.
- No hay repo sweep (solo rutas declaradas).
- El cambio es: docs, stubs/enlaces, fixes de lint/test, o correcciones pequeñas y localizadas.

Si se cumple Fast lane:
- Puede pasar directo a Implement y Verify.
Si NO se cumple:
- Mantener “User approval required”.

