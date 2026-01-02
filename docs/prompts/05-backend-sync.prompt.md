# 🔄 CERMONT BACKEND SYNC AGENT

**Responsabilidad:** Sincronización offline, idempotencia, conflictos
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND SYNC AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/sync/**
   - Queue de cambios offline, idempotencia
   - Conflictos (last-write-wins o merge)
   - Timestamps y versionado

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=sync
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Queue Offline**
   - ¿Frontend guarda cambios en IndexedDB?
   - ¿Sincroniza cuando online?
   - ¿No pierde datos?

2. **Idempotencia**
   - ¿Cada operación tiene idempotency_key?
   - ¿Si llega 2x, solo procesa 1x?
   - ¿DB.unique(idempotency_key)?

3. **Conflictos**
   - ¿Last-write-wins (timestamp)?
   - ¿Merge inteligente?
   - ¿Notificar usuario de conflicto?

4. **Versionado**
   - ¿Cada cambio incrementa version?
   - ¿vector clock o timestamp?
   - ¿Sync solo cambios desde version X?

5. **Bandwidth**
   - ¿Sync delta (no full dump)?
   - ¿Comprimir JSON?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Queue de cambios en IndexedDB
- [ ] Idempotency key en cada operación
- [ ] Conflictos resueltos (last-write-wins)
- [ ] Versionado en cambios
- [ ] Sync delta (no full)
- [ ] Manejo de errores de red

---

## 🧪 VERIFICACIÓN

```bash
cd apps/api

pnpm run test -- --testPathPattern=sync

# Verificar idempotencia
grep -r "idempotency\|idempotent" src/modules/sync/

# Esperado: Implementación presente

# Verificar conflictos
grep -r "conflict\|merge\|last.*write" src/modules/sync/

# Esperado: Resolución de conflictos
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
