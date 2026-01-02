# 💾 CERMONT BACKEND CACHING AGENT

**Responsabilidad:** Caching in-memory (@nestjs/cache-manager)  
**Patrón:** SIN PREGUNTAS  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND CACHING AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/common/caching/**
   - TTL correcto, invalidación en mutaciones
   - No cachear secretos
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=cache
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **TTL**
   - ¿Los caches tienen TTL razonable (1-24 horas)?
   - ¿Thumbnails cachean por 7 días?

2. **Invalidación**
   - ¿Al actualizar un recurso, se invalida su caché?
   - ¿Al deletear, se invalida?

3. **Secretos**
   - ¿Hay JWT, passwords, tokens en caché? (NO DEBERÍA)

4. **Hit/Miss**
   - ¿Los logs registran cache hit/miss?
   - ¿Se puede monitorear efectividad?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] @nestjs/cache-manager instalado
- [ ] TTL configurado por tipo de dato
- [ ] Invalidación en CREATE/UPDATE/DELETE
- [ ] Sin secretos cacheados
- [ ] Logs de hit/miss
- [ ] Tests de cache

---

## 🧪 VERIFICACIÓN

```bash
cd apps/api && pnpm run test -- --testPathPattern=cache

# Verificar cache-manager
grep -r "@nestjs/cache-manager\|@UseInterceptors.*Cache" src/

# Esperado: Decoradores de cache presente

# Verificar TTL
grep -r "ttl.*3600\|ttl.*86400" src/

# Esperado: TTL values presentes
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
