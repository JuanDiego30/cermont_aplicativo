# 🔐 CERMONT BACKEND AUTH AGENT (Fix 2FA + Tests)

**ID:** 01  
**Responsabilidad:** Autenticación, autorización, 2FA, audit logs, estabilidad de tests de Auth  
**Reglas:** Regla 5 (Tests verdes), Regla 6 (CERO secretos en logs), Regla 8 (Token rotation), Type-safety (no `any`)  
**Patrón:** SIN PREGUNTAS  
**Última actualización:** 2026-01-05

---

## 🎯 OBJETIVO

Dejar **Auth 100% verde** (unit/integration) y alinear el flujo de **login + 2FA** para que la respuesta sea consistente, tipada y comprobable por tests.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Auditoría 2026-01-05)

### 🚨 Test roto en Auth (bloquea CI)
- Hay al menos 1 test de login/2FA fallando (contrato de `requires2FA` inconsistente).
- Se debe decidir UNA verdad:
  - **Opción A:** La lógica del UseCase es correcta → se corrige el test.
  - **Opción B:** El test describe el comportamiento esperado → se corrige el UseCase / DTO / mapper.

### ⚠️ Contratos incompletos / respuesta inestable
- `requires2FA` no puede ser opcional en respuestas que deban activar 2FA.
- Si el resultado es "requiere 2FA", debe existir un DTO explícito y estable.

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND AUTH AGENT.

EJECUTA SIN PREGUNTAR:

A) ANÁLISIS (solo lectura primero):
1. Revisar apps/api/src/modules/auth/** (use-cases, controllers, dto, domain services)
2. Ubicar el test que falla de LoginUseCase (escenario "admin sin twoFactorCode")
3. Comparar:
   - Expectativa del spec (requires2FA / envío de código)
   - Respuesta real del UseCase/Controller
4. Identificar dónde se rompe el contrato (DTO, mapper, retorno de UseCase, branch 2FA)
5. Verificar Regla 6: no loggear tokens, secrets, passwords, otp, etc.

B) PLAN (3–5 pasos):
- Paso 1: Alinear contrato DTO/Response para 2FA.
- Paso 2: Ajustar UseCase para cumplir contrato (o ajustar test si corresponde).
- Paso 3: Asegurar envío de código 2FA con dependencias mockeadas y verificables.
- Paso 4: Tipado estricto en errores y retornos (sin `any`).
- Paso 5: Consolidar verificación por comandos.

C) IMPLEMENTACIÓN (mínimo cambio mergeable):
- No meter features nuevas.
- Cambiar lo mínimo para que el flujo sea estable y testeable.

D) VERIFICACIÓN (obligatoria):
- pnpm -C apps/api test -- --testPathPattern=auth
- pnpm -C apps/api check
- grep -R "token\|secret\|password\|otp" apps/api/src/modules/auth (debe ser 0 en logs)
```

---

## 🔍 Qué Analizar

```bash
# Tests de Auth
pnpm -C apps/api test -- --testPathPattern=auth

# Estructura de Auth
ls -la apps/api/src/modules/auth/

# DTOs de login
grep -r "requires2FA\|TwoFactor" apps/api/src/modules/auth/

# Logs con secretos (prohibido)
grep -r "console\|logger\." apps/api/src/modules/auth/ | grep -i "token\|password\|secret"
```

---

## 📋 REGLAS CRÍTICAS A RESPETAR (Auth)

1. **Regla 5: Tests primero**
   - Si el comportamiento no está claro, el test debe describir el contrato final.
   
2. **Regla 6: CERO secretos**
   - Prohibido loggear: password, refresh token, access token, otp, secrets.
   
3. **2FA Admin**
   - Si el rol es admin: el login sin `twoFactorCode` debe retornar "requires2FA=true" (contrato estable) y disparar envío de código.
   
4. **Type-safety**
   - DTOs tipados, errores tipados, sin `any`.

---

## ✅ CHECKLIST DE ENTREGA

- [ ] Suite de Auth verde (unit/integration)
- [ ] Contrato `requires2FA` consistente y tipado
- [ ] Envío de 2FA verificable por tests (mocks/expectations)
- [ ] Logs limpios (sin secretos)
- [ ] `pnpm -C apps/api check` ✅

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
