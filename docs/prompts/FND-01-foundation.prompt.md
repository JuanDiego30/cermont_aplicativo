```md
# 🧱 CERMONT FOUNDATION (SPRINT 1) AGENT

**ID:** FND-01
**Responsabilidad:** Dejar el repo VERDE (tests), sacar secretos del repo, limpiar mediciones (jscpd), normalizar reglas base (console, env, node)
**Reglas:** Regla 21 (No secrets), Regla 5 (Testing verde), Regla 1 (No duplicación), Regla 6 (No console.*), Type-safety (“no any”)
**Patrón:** SIN PREGUNTAS (solo pedir confirmación si hay riesgo de borrar info sensible)
**Última actualización:** 2026-01-05

---

## 🎯 OBJETIVO
Convertir el repositorio en una base estable para refactor: **CI verde**, **sin secretos comprometidos**, y **métricas confiables** (duplicación real sin ruido).

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Auditoría 2026-01-05)

### 1) 🚨 Secret/credenciales en repo (CRÍTICO)
- Caso reportado: archivo trackeado `apps/api/.env.generation` con `DATABASE_URL` con credenciales.
- Acción: remover del tracking, rotar credenciales, reemplazar por `.env.example` seguro.

### 2) 🚨 Backend no está verde (CRÍTICO)
- Caso reportado: 1 test falla en Auth (`LoginUseCase` con 2FA).
- Acción: alinear lógica de login 2FA con expectativas del test (o ajustar test si la lógica es la correcta).

### 3) ⚠️ Duplicación >3% (ALTO)
- Caso reportado: jscpd ~6.35% con ruido por caches (`.angular/cache`) y ejemplos UI (`ui-example/**`).
- Acción: configurar ignore (jscpd) para medir solo código fuente real.

### 4) ⚠️ Regla 6 (console.*) (MEDIO)
- Caso reportado: `apps/api/test/setup.ts` con `console.log/warn`.
- Acción: centralizar logging de tests o condicionar por env, sin romper output útil.

### 5) ⚠️ Node no-LTS detectado (MEDIO)
- Caso reportado: ejecución en Node v25.x (odd).
- Acción: estandarizar a Node LTS (20/22) para dev + CI.

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT FOUNDATION (SPRINT 1) AGENT.

EJECUTA SIN PREGUNTAR:

A) ANÁLISIS (read-only):
1. Confirmar si `apps/api/.env.generation` está trackeado y si contiene credenciales.
2. Identificar el test exacto que falla en Auth y su causa (requires2FA undefined vs esperado).
3. Revisar configuración jscpd actual y rutas que inflan el reporte (caches/build/coverage/ui-example).
4. Buscar console.* en backend test setup y logger frontend (decidir excepciones).
5. Verificar constraints de Node (engines, CI, docs).

B) PLAN (4-6 pasos):
- Prioriza: seguridad (secrets) → tests verdes → métricas confiables → limpieza de reglas.

C) IMPLEMENTACIÓN (cambios mínimos, mergeables):
1) Seguridad:
   - Dejar `.env.example` y sacar `.env.generation` del repo (y/o gitignore).
2) Testing:
   - Fix del test roto de Auth (o lógica 2FA) con cambios mínimos y tipados.
3) Métricas:
   - Añadir ignore de jscpd para `.angular`, `dist`, `coverage`, `.turbo`, `node_modules`, etc.
4) Regla 6:
   - Eliminar/reemplazar console.* en setup de tests o gate por env.
5) Node:
   - Documentar/forzar Node LTS (README + engines + toolchain si aplica).

D) VERIFICACIÓN (obligatorio):
- `pnpm -C apps/api check`
- `pnpm -C apps/api test`
- `pnpm -C apps/web lint`
- `pnpm -C apps/web test`
- `pnpm duplication` (con ignore correcto)
```

---

## ✅ CHECKLIST DE ENTREGA (DEBE CUMPLIRSE TODO)
- [ ] No hay credenciales/secretos comprometidos en el repo (solo `.env.example`).
- [ ] `pnpm -C apps/api check` ✅ (verde).
- [ ] Métrica de duplicación recalculada sin caches/builds (target <3%).
- [ ] Regla 6 cumplida (sin `console.*` fuera del logger permitido).
- [ ] Node LTS definido como estándar para CI + dev.

---

## 📝 FORMATO RESPUESTA
A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
```
