# 📧 CERMONT BACKEND EMAILS AGENT

**ID:** 08
**Responsabilidad:** Envío de correos transaccionales, colas de trabajo (BullMQ), templates HTML
**Reglas:** Core + Type Safety
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-03

---

## 🎯 OBJETIVO
Gestionar comunicaciones asíncronas fiables mediante colas, asegurando entregabilidad y tipado en los trabajos de background.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Research 2026-01-03)

### ✅ Violaciones Críticas de Type Safety
Los puntos críticos de `any` en cola y envío quedaron resueltos.

| Archivo | Línea | Violación | Solución |
|---------|-------|-----------|----------|
| `notifications/email/email-queue.service.ts` | — | `let Queue/Worker/QueueEvents: any` y props `| any` | ✅ Resuelto: constructores tipados + payload tipado + callbacks `unknown` |
| `notifications/email/email.service.ts` | — | `info as any` (resultado de Nodemailer) | ✅ Resuelto: extracción de `messageId/accepted/rejected` con guards (sin `any`) |

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND EMAILS AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/notifications/**
   - CORREGIR TIPOS BULLMQ (Prioridad 1)
   - Revisar configuración SMTP/Provider
   - Validar diseño de templates HTML

2. PLAN: 3-4 pasos (incluyendo fix de tipos)

3. IMPLEMENTACIÓN: Colas robustas y tipadas

4. VERIFICACIÓN: pnpm --filter @cermont/api run test -- --testPathPattern=notifications
```

---

## 📋 PUNTOS CLAVE

1. **Procesamiento Asíncrono**
   - El envío de email NO debe bloquear el request HTTP. Siempre usar Queue.
   - Configurar retries (backoff exponencial) para fallos de red.

2. **Tipado de Jobs**
   - Definir interfaz `EmailJobData` (to, subject, template, variables).
   - La Queue y el Worker deben usar este genérico.

3. **Templates**
   - Usar motor de plantillas (Handlebars, EJS) o HTML raw bien estructurado.
   - Diseño responsive básico.

---

## 🔍 QUÉ ANALIZAR Y CORREGIR

1. **Fix de Tipos (Prioridad 1)**
   ```typescript
   // Nota: BullMQ es opcional en este repo (fallback mock si no hay Redis).
   // Objetivo: eliminar `any` y mantener un contrato tipado para payload/opts.
   type EmailJobData = { email: SendEmailInput };
   ```

2. **Dead Letter Queue (DLQ)**
   - ¿A dónde van los emails que fallan definitivamente?
   - Implementar monitoreo básico de fallos.

---

## ✅ CHECKLIST DE ENTREGA

- [x] **Tipado estricto de BullMQ (Queue, Worker, Job)**
- [ ] Procesamiento asíncrono verificado
- [ ] Retries configurados
- [ ] Templates HTML probados
- [ ] Provider SMTP configurado (env vars)

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
