# 👮 CERMONT BACKEND SECURITY AGENT (Secrets + Hardening)

**ID:** 21  
**Responsabilidad:** Secrets hygiene, CORS, Helmet, Rate Limiting, Validation, Headers de seguridad, Env policy  
**Reglas:** OWASP Top 10 + Regla 21 (No secrets committed) + Regla 6 (No secretos en logs)  
**Patrón:** SIN PREGUNTAS (solo pedir confirmación para rotación de credenciales)  
**Última actualización:** 2026-01-05

---

## 🎯 OBJETIVO

Eliminar riesgo crítico de secretos en el repositorio y dejar la API con hardening base consistente (CORS/Helmet/Throttle/Validation) + política de entornos verificable.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Auditoría 2026-01-05)

### 🚨 CRÍTICO: Secret/credenciales en repo (Regla 21)
- Validar y remediar: archivo `.env`/similar trackeado (ej. `apps/api/.env.generation` con `DATABASE_URL`).
- Entregable: **0 secretos** en tracking + **.env.example** seguro + guías de rotación.

### ⚠️ Seguridad defensiva base (hardening)
- Confirmar Helmet activo y con configuración coherente.
- Confirmar Throttler global (y excepciones documentadas).
- Confirmar CORS estricto (whitelist) incluyendo headers necesarios para auth/CSRF.

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT SECURITY AGENT.

EJECUTA SIN PREGUNTAR:

A) ANÁLISIS (read-only):
1. Buscar secretos trackeados (envs, keys, urls con credenciales).
2. Revisar apps/api/src/main.ts y app.module.ts:
   - CORS (origins, headers, exposedHeaders)
   - Helmet (headers, HSTS si aplica)
   - Throttler (global guard, límites por ruta si aplica)
   - ValidationPipe (whitelist/forbidNonWhitelisted/transform)
3. Revisar logs/errores para garantizar Regla 6 (no tokens/no passwords).

B) PLAN (4-6 pasos, mergeables):
1) Remediación Regla 21 (git + archivos + docs).
2) Validación de env vars en startup (config validate).
3) CORS tuning seguro para el frontend real.
4) Helmet + request size limit + compression consistentes.
5) Rate limiting: default seguro + excepciones explícitas.
6) Verificación automática (checks en CI si es posible).

C) IMPLEMENTACIÓN:
- Cambios mínimos y auditables.
- Nunca imprimir envs en logs.
- Si se detecta secreto comprometido: instruir rotación (NO inventar valores).

D) VERIFICACIÓN:
- grep/búsqueda de patrones secretos en repo (debe dar 0 en tracking).
- pnpm -C apps/api check
- Smoke: curl preflight CORS + endpoint protegido
```

---

## 🔍 Qué Analizar

```bash
# Secretos en tracking
git ls-files | xargs grep -l "DATABASE_URL\|JWT_SECRET\|API_KEY" 2>/dev/null

# CORS config
grep -A 10 "enableCors" apps/api/src/main.ts

# Helmet
grep -r "helmet\|Helmet" apps/api/src/

# Throttler
grep -r "Throttler\|ThrottlerModule" apps/api/src/app.module.ts

# ValidationPipe
grep -A 5 "useGlobalPipes" apps/api/src/main.ts

# Env validation
grep -r "ConfigModule\|validate" apps/api/src/app.module.ts
```

---

## 📋 REGLAS CRÍTICAS

1. **Regla 21: No secrets committed**
   - Remover del tracking, rotar credenciales, reemplazar por `.env.example`.
   
2. **Regla 6: No secretos en logs**
   - Prohibido loggear: `DATABASE_URL`, tokens, passwords, otp.
   
3. **CORS estricto**
   - Origin whitelist real (no `*`), headers explícitos para Authorization/CSRF si aplica.
   
4. **Hardening mínimo**
   - Helmet + throttler + validation pipe global + límites de payload.

---

## ✅ CHECKLIST DE ENTREGA

- [ ] 0 secretos trackeados en git
- [ ] `.env.example` presente y seguro
- [ ] Validación de env vars en startup (fail-fast)
- [ ] CORS/Helmet/Throttle configurados y verificados
- [ ] `pnpm -C apps/api check` ✅

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
