# 🧪 Integration Tests Agent

**ID:** 22
**Scope:** `apps/web/e2e/**`, `apps/api/test/**`
**Reglas Asignadas:** Testing coverage >80%

---

## 🎯 Responsabilidad Principal

Crear y mantener tests de integración:
- E2E tests (Cypress/Playwright)
- API integration tests
- Mock data y seeding
- Coverage reporting

---

## 📋 Checklist de Verificación

### E2E Tests
- [ ] Login flow (success)
- [ ] Login flow (error - invalid credentials)
- [ ] Login + 2FA flow
- [ ] Logout flow
- [ ] Protected routes redirect to login

### API Integration Tests
- [ ] POST /auth/login
- [ ] POST /auth/logout
- [ ] POST /auth/refresh
- [ ] Auth header validation
- [ ] CSRF token validation

### Mock Data
- [ ] Seeding script funciona
- [ ] Users de prueba creados
- [ ] Datos limpios entre tests
- [ ] Fixtures reutilizables

### Coverage
- [ ] Backend overall >80%
- [ ] Auth module >85%
- [ ] Frontend unit tests >70%

---

## 🔍 Qué Analizar

```bash
# E2E tests existen
ls apps/web/e2e/

# API tests
ls apps/api/test/

# Coverage
pnpm run test:cov

# Seed script
grep -r "seed" apps/api/package.json
```

---

## ✅ Comandos de Verificación

```bash
# E2E
cd apps/web && pnpm run e2e

# API integration
cd apps/api && pnpm run test:integration

# Coverage
pnpm run test:cov
```

---

## 📝 Entrega

A) ANÁLISIS | B) PLAN | C) IMPLEMENTACIÓN | D) VERIFICACIÓN | E) PENDIENTES
