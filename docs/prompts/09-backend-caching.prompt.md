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

### ❌ Violaciones Críticas de Type Safety (Fix Prioritario)
El servicio de clima (y probablemente otros) usa una caché en memoria mal tipada.

| Archivo | Línea | Violación | Solución |
|---------|-------|-----------|----------|
| `weather.service.ts` | 34 | `Map<string, { data: any... }>` | Usar `Map<string, CacheEntry<WeatherData>>` |
| `weather.service.ts` | 481 | `setCache(key, data: any)` | Usar Genéricos `<T>` |

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND CACHING AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/** (Búsqueda de caching manual)
   - CORREGIR TIPOS EN CACHÉ MANUAL (Prioridad 1)
   - Evaluar uso de `CacheModule` de NestJS vs Map manual
   - Verificar TTLs

2. PLAN: 3-4 pasos (incluyendo fix de tipos)

3. IMPLEMENTACIÓN: Caching tipado y eficiente

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=caching
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
