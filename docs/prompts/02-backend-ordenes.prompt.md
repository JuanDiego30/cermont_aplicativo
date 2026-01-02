# 📦 CERMONT BACKEND ÓRDENES AGENT

**Responsabilidad:** Máquina de estados, historial, cálculos, webhooks  
**Reglas:** 11-20  
**Patrón:** SIN PREGUNTAS  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND ÓRDENES AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/ordenes/**
   - Máquina de estados (11 estados verificados)
   - Historial, webhooks, cálculos
   - Validaciones antes de cambios
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=ordenes
```

---

## 📋 REGLAS 11-20 APLICABLES

| Regla | Descripción | Verificar |
|-------|-------------|-----------|
| 11 | Máquina estados DRAFT→...→CLOSED | ✓ Transiciones válidas |
| 12 | Historial en order_history | ✓ Tabla con cambios |
| 13 | Validar totales pre-confirmar | ✓ SUM(items) == total |
| 14 | No editar orden confirmada | ✓ Guard en update |
| 15 | Costos en backend | ✓ Cálculos en NestJS |
| 16 | Webhook con idempotencia | ✓ Idempotency key |
| 17 | Cancelar DRAFT/PENDING | ✓ Guard en cancel |
| 18 | Email confirmación+recibo | ✓ Nodemailer |
| 19 | Impresión con QR | ✓ QR library |
| 20 | Reportes (filtros) | ✓ Query filters |

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Estados (Regla 11)**
   - ¿Estados: DRAFT → PENDING → CONFIRMED → SHIPPED → DELIVERED → CLOSED?
   - ¿Transiciones validadas?
   - ¿No hay saltos inválidos?

2. **Historial (Regla 12)**
   - ¿Tabla order_history existe?
   - ¿Registra: usuario, timestamp, estado_anterior, estado_nuevo?
   - ¿No se pierden cambios?

3. **Validaciones (Regla 13)**
   - Antes de CONFIRMED, ¿se suma items?
   - ¿Total_items * precio == total_order?
   - ¿Descuentos incluidos?

4. **Regla 14: No editar confirmada**
   - ¿Status === CONFIRMED bloquea update?
   - ¿Error 403 si intenta?

5. **Cálculos (Regla 15)**
   - Subtotal, impuestos, descuentos, envío = ¿en backend?
   - ¿Frontend SOLO muestra?

6. **Webhooks (Regla 16)**
   - ¿Se envía a carrier (DHL, FedEx)?
   - ¿Idempotency key en request?
   - ¿Retry logic si falla?

7. **Cancela (Regla 17)**
   - ¿Status DRAFT → permite cancel?
   - ¿Status PENDING → permite cancel?
   - ¿Status CONFIRMED+ → NO cancel?

8. **Emails (Regla 18)**
   - ¿Email confirmación con PDF?
   - ¿Email tracking cuando shipped?

9. **QR (Regla 19)**
   - ¿Printable con QR?
   - ¿Contiene order_id en QR?

10. **Reportes (Regla 20)**
    - ¿Filtros: date range, status, customer?
    - ¿Export CSV/PDF?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] 6 estados máquina: DRAFT, PENDING, CONFIRMED, SHIPPED, DELIVERED, CLOSED
- [ ] order_history registra TODOS cambios
- [ ] Validación de totales pre-CONFIRMED
- [ ] Status CONFIRMED bloquea edición
- [ ] Cálculos (subtotal, impuestos, descuento, envío) en backend
- [ ] Webhook a carrier con idempotencia
- [ ] Cancela solo en DRAFT/PENDING
- [ ] Email confirmación + tracking
- [ ] Impresión con QR order_id
- [ ] Reportes con filtros

---

## 🧪 VERIFICACIÓN

```bash
cd apps/api

# Tests órdenes
pnpm run test -- --testPathPattern=ordenes

# Esperado: >80% cobertura

# Verificar máquina estados
grep -r "DRAFT\|PENDING\|CONFIRMED\|SHIPPED" src/modules/ordenes/

# Esperado: Todos los estados presentes

# Verificar cálculos
grep -r "calculateTotal\|subtotal\|discount" src/modules/ordenes/

# Esperado: Funciones presentes en backend

# Verificar webhooks
grep -r "webhook\|carrier\|idempotency" src/modules/ordenes/

# Esperado: Implementación encontrada
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
