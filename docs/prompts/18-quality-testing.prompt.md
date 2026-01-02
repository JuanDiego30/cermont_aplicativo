# 🧪 CERMONT QUALITY TESTING AGENT

**Responsabilidad:** Tests, cobertura, calidad de código
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT QUALITY TESTING AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: Apps/api y apps/web
   - Cobertura de tests (métricas)
   - Módulos críticos sin tests

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test:cov
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Cobertura General**
   - ¿Cobertura global >70%?
   - ¿Auth >80%?
   - ¿Órdenes >75%?
   - ¿Evidencias >75%?

2. **Módulos Críticos**
   - Auth module: >80% (seguridad)
   - Órdenes (máquina de estados): >80%
   - Evidencias: >75%
   - Sync: >70%

3. **Frontend**
   - Componentes shared: >70%
   - Interceptors: >80%
   - Guards: >80%

4. **Tests Faltantes**
   - Casos edge
   - Errores
   - Integración

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Cobertura global >70%
- [ ] Auth >80%
- [ ] Órdenes >80%
- [ ] Evidencias >75%
- [ ] Tests de integración (E2E)
- [ ] SonarQube o similar (opcional)

---

## 🧪 VERIFICACIÓN

```bash
# Backend coverage
cd apps/api && pnpm run test:cov

# Esperado: >70% overall

# Frontend coverage
cd apps/web && pnpm run test:cov

# Esperado: >70% overall

# Ver reporte HTML
open coverage/apps/api/index.html
open coverage/apps/web/index.html

# Esperado: HTML con detalle por archivo

# Módulos críticos
pnpm run test:cov -- --testPathPattern=auth

# Esperado: >80% para auth

pnpm run test:cov -- --testPathPattern=ordenes

# Esperado: >80% para órdenes

# E2E tests (opcional)
pnpm run e2e

# Esperado: Tests E2E pasando
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**

---

##  ESTADO ACTUAL (Research 2026-01-02)

### Verificado
- Tests en Auth module (12 archivos)
- Tests en PDF module (5 use cases)
- Jest configurado

### Pendiente
- Revisar coverage total del proyecto
- E2E tests (ver prompt 22)
