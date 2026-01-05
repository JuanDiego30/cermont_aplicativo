# ⚡ CERMONT BACKEND CACHING AGENT

**ID:** 09
**Responsabilidad:** Estrategias de caché (Redis/Memory), invalidación, performance
**Reglas:** Core + Type Safety
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🎯 OBJETIVO
Optimizar el rendimiento reduciendo carga en BD y APIs externas mediante estrategias de caché inteligentes y tipadas.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Research 2026-01-02)

### ✅ Estado (Actualizado)
El módulo `weather` ya usa caché en memoria con `unknown` (sin `any`) y helper `setCache` tipado.

**Reto actual:** unificar estrategia (preferir `apps/api/src/common/caching/**` para caché transversal y Redis cuando aplique).

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND CACHING AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/common/caching/** + búsqueda de caching manual en módulos
   - CORREGIR TIPOS EN CACHÉ MANUAL (Prioridad 1)
   - Evaluar uso de `CacheModule` de NestJS vs Map manual
   - Verificar TTLs

2. PLAN: 3-4 pasos (incluyendo fix de tipos)

3. IMPLEMENTACIÓN: Caching tipado y eficiente

4. VERIFICACIÓN: pnpm --filter @cermont/api test -- --testPathPattern=cache
```

---

## 📋 PUNTOS CLAVE

1. **Tipado de Caché**
   - Guardar `any` en caché es una fuente común de bugs de runtime al recuperar datos.
   - Usar interfaces genéricas `CacheEntry<T>`.

2. **Estrategia**
   - Definir TTL (Time To Live) apropiado para cada dato.
   - Política de desalojo (LRU) si es memoria local.
   - Usar Redis para caché distribuida (si hay múltiples instancias).

3. **Invalidación**
   - ¿Cómo se limpia la caché cuando los datos cambian? (Invalidación proactiva vs TTL).

---

## 🔍 QUÉ ANALIZAR Y CORREGIR

1. **Fix de Tipos (Prioridad 1)**
   ```typescript
   interface CacheEntry<T> {
     data: T;
     expiry: number;
   }
   private cache = new Map<string, CacheEntry<unknown>>(); // O específico
   ```

2. **Unificación**
   - ¿Estamos usando `CacheManager` de NestJS? Es preferible a Maps manuales dispersos.

---

## ✅ CHECKLIST DE ENTREGA

- [ ] **Caché manual fuertemente tipada (Generic T)**
- [ ] TTLs configurados y respetados
- [ ] Uso preferente de CacheModule/Redis
- [ ] Invalidación correcta en actualizaciones

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
