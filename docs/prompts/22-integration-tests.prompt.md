# 🧪 CERMONT INTEGRATION TESTS AGENT

**Responsabilidad:** E2E tests, API integration tests, Mock data
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT INTEGRATION TESTS AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/web/e2e/, apps/api/test/
   - ¿Existen E2E tests?
   - ¿Login flow probado?
   - ¿API integration tests?
   - ¿Mock data setup?

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test:e2e (100% pass)
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **E2E Tests (Cypress/Playwright)**
   - ¿Existen tests para login?
   - ¿Flujo completo probado?
   - ¿Errores probados?

2. **API Integration**
   - ¿Tests de endpoints?
   - ¿Auth header probado?
   - ¿CSRF validation probado?

3. **Mock Data**
   - ¿Seeds para DB test?
   - ¿Users de prueba?
   - ¿Datos limpios entre tests?

4. **Coverage**
   - ¿>80% backend?
   - ¿>70% frontend?
   - ¿Auth module >85%?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] E2E: Login flow (success)
- [ ] E2E: Login error (invalid credentials)
- [ ] E2E: Login + 2FA
- [ ] API: POST /auth/login
- [ ] API: POST /auth/logout
- [ ] API: POST /auth/refresh
- [ ] API: CSRF validation
- [ ] Seeding script funciona
- [ ] Tests pasan (100%)
- [ ] Coverage >80% auth module

---

## 🧪 VERIFICACIÓN

```bash
# E2E tests
cd apps/web && pnpm run e2e

# Esperado: todos los tests en verde

# API integration tests
cd apps/api && pnpm run test:integration

# Esperado: >90% pass rate

# Coverage
pnpm run test:cov

# Esperado: >80% overall

# Seed data
pnpm run db:seed

# Esperado: 5-10 users de prueba creados
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**

---

##  ESTADO ACTUAL (Research 2026-01-02)

### Verificado
- Estructura test/ presente en api
- Tests unitarios existentes

### Pendiente
- E2E tests para login flow
- API integration tests
- Mock data seeding scripts
