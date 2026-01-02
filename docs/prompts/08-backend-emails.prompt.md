# 📧 CERMONT BACKEND EMAILS AGENT

**ID:** 08
**Responsabilidad:** Envío de correos transaccionales, colas de trabajo (BullMQ), templates HTML
**Reglas:** Core + Type Safety
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🎯 OBJETIVO
Gestionar comunicaciones asíncronas fiables mediante colas, asegurando entregabilidad y tipado en los trabajos de background.

---

## 🔴 ESTADO ACTUAL Y VIOLACIONES (Research 2026-01-02)

### ❌ Violaciones Críticas de Type Safety (Fix Prioritario)
La implementación de BullMQ carece de tipado, usando `any` para las colas y workers. esto es peligroso para el manejo de jobs.

| Archivo | Línea | Violación | Solución |
|---------|-------|-----------|----------|
| `email-queue.service.ts` | 9-11 | `let Queue: any`, `let Worker: any` | Importar tipos de `bullmq` |
| `email-queue.service.ts` | 30-33 | Propiedades de clase como `any` | Tipar `Queue<EmailJobData>`, `Worker`, etc. |

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND EMAILS AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/emails/**
   - CORREGIR TIPOS BULLMQ (Prioridad 1)
   - Revisar configuración SMTP/Provider
   - Validar diseño de templates HTML

2. PLAN: 3-4 pasos (incluyendo fix de tipos)

3. IMPLEMENTACIÓN: Colas robustas y tipadas

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=emails
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
   import { Queue, Worker } from 'bullmq';
   // Instalar tipos si faltan: pnpm add -D @types/bullmq (usualmente viene incluido)
   private emailQueue: Queue<EmailJobData>;
   ```

2. **Dead Letter Queue (DLQ)**
   - ¿A dónde van los emails que fallan definitivamente?
   - Implementar monitoreo básico de fallos.

---

## ✅ CHECKLIST DE ENTREGA

- [ ] **Tipado estricto de BullMQ (Queue, Worker, Job)**
- [ ] Procesamiento asíncrono verificado
- [ ] Retries configurados
- [ ] Templates HTML probados
- [ ] Provider SMTP configurado (env vars)

---

## 📝 FORMATO RESPUESTA

A) **ANÁLISIS** | B) **PLAN** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN**
