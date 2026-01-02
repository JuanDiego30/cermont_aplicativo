# 💌 CERMONT BACKEND EMAILS AGENT

**Responsabilidad:** Notificaciones por email (SMTP local)
**Restricción:** OSS only - NO SendGrid, AWS SES, Twilio
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND EMAILS AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/notifications/**
   - SMTP config (Nodemailer local)
   - Reintentos, manejo de errores
   - NO servicios pagos

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=emails
```

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **SMTP Local**
   - ¿Se usa Nodemailer?
   - ¿Configurado para SMTP local (Mailpit, Postfix)?
   - ¿NO hay SendGrid, SES, Twilio?

2. **Configuración**
   - ¿Variables en .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS?
   - ¿Sin secretos hardcodeados?

3. **Reintentos**
   - ¿Hay lógica de reintento (máx 3 intentos)?
   - ¿Backoff exponencial?

4. **Plantillas**
   - ¿Existen plantillas de email (HTML)?
   - ¿Variables interpoladas correctamente?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Nodemailer con SMTP local
- [ ] Configuración en .env (no hardcoded)
- [ ] 3 reintentos con backoff
- [ ] Plantillas HTML para cada email
- [ ] Tests de envío
- [ ] CERO dependencias de servicios pagos

---

## 🧪 VERIFICACIÓN

```bash
cd apps/api && pnpm run test -- --testPathPattern=emails

# Buscar servicios pagos
grep -r "SendGrid\|AWS.SES\|Twilio\|Firebase\|mailgun" src/

# Esperado: 0 ocurrencias

# Verificar Nodemailer
grep -r "nodemailer\|SMTP" src/modules/notifications/

# Esperado: Nodemailer presente

# Verificar plantillas
ls -la src/modules/notifications/templates/ | grep -i ".html\|.hbs"

# Esperado: Al menos 3 plantillas (confirmation, tracking, etc)
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
