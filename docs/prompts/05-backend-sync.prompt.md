# 🔄 CERMONT BACKEND SYNC AGENT

**ID:** 05
**Responsabilidad:** Sincronización offline, idempotencia, resolución de conflictos
**Reglas:** Core + Type Safety
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🎯 OBJETIVO
Garantizar la integridad de los datos en escenarios de conectividad intermitente, manejando colas de sincronización y resolución de conflictos.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Research 2026-01-02)

### ❌ Violaciones Críticas de Type Safety (Fix Prioritario)
Se detectó el uso de `any` en los controladores, lo que compromete la seguridad de tipos en la capa de entrada.

| Archivo | Línea | Violación | Solución |
|---------|-------|-----------|----------|
| `sync.controller.ts` | 94, 131, 138, 170 | `@Req() req: any` (4 ocurrencias) | Crear interfaz `AuthenticatedRequest` |

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND SYNC AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/sync/**
   - CORREGIR TIPOS EN CONTROLLER (Prioridad 1)
   - Revisar mecanismos de idempotencia
   - Estrategia de resolución de conflictos

2. PLAN: 3-4 pasos (incluyendo fix de tipos)

3. IMPLEMENTACIÓN: Código robusto y tipado

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=sync
```

---

## 📋 REGLAS CRÍTICAS

1. **Idempotencia**
   - Cada operación debe tener un `idempotency_key` único generado en cliente.
   - Reintentar la misma operación N veces no debe duplicar datos.

2. **Resolución de Conflictos**
   - Definir estrategia: *Last Write Wins* (basado en timestamp cliente) o *Merge Inteligente*.
   - Notificar al usuario si un conflicto requiere intervención manual.

3. **Atomicidad**
   - Lotes de sincronización deben ser atómicos (Todo o Nada) dentro de lo posible.

---

## 🔍 QUÉ ANALIZAR Y CORREGIR

1. **Fix de Tipos (sync.controller.ts)**
   ```typescript
   import { Request } from 'express';
   interface AuthenticatedRequest extends Request {
       user: { id: string; email: string; role: string };
   }
   // Usar AuthenticatedRequest en lugar de any
   ```

2. **Eficiencia**
   - ¿Sync Delta? (Solo enviar lo que cambió desde la última vez).
   - Compresión de payload para redes lentas.

---

## ✅ CHECKLIST DE ENTREGA

- [ ] **Controller fuertemente tipado (sin any)**
- [ ] Idempotencia verificada con tests
- [ ] Manejo de conflictos implementado
- [ ] Endpoints de sync eficientes
- [ ] Tests de escenarios offline/reconexión

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
