# 📊 CERMONT BACKEND LOGGING AGENT

**Responsabilidad:** Logging seguro (Regla 6), structured logs, niveles
**Reglas:** 6 (CRÍTICA: sin secretos)
**Patrón:** SIN PREGUNTAS
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND LOGGING AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/**
   - Regla 6: NUNCA loguear password, token, secret, apiKey
   - Structured logging (JSON), niveles (error/warn/info/debug)
   - Rotación de logs, almacenamiento

2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test && grep -r "password\|token\|secret" logs/
```

---

## 📋 REGLA 6 APLICABLE

| Regla | Descripción | Verificar |
|-------|-------------|-----------|
| 6 | NUNCA loguear secretos | ✓ grep -r "password\|token\|secret\|apiKey" |

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **Regla 6 (CRÍTICA)**
   - ¿Hay logs con password? (MAL)
   - ¿Hay logs con JWT token? (MAL)
   - ¿Hay logs con API keys? (MAL)
   - ¿Sanitizar antes de loguear? (BIEN)

2. **Logger**
   - ¿Winston o Pino?
   - ¿JSON format?
   - ¿Níveis: error, warn, info, debug, trace?

3. **Context**
   - ¿requestId único?
   - ¿userId?
   - ¿timestamp?
   - ¿módulo/función?

4. **Sensibles**
   - ¿Usuario? ✓ Log user_id (no nombre)
   - ¿Email? ✓ Log domain (user@domain.com → domain.com)
   - ¿Dirección? ✓ Log sin detalles
   - ¿Tarjeta? ✓ Last 4 digits solo

5. **Almacenamiento**
   - ¿Archivo local /var/log/?
   - ¿Rotación diaria?
   - ¿Retención 30 días?
   - ¿Permisos 0600?

6. **Niveles**
   - Error: fallos críticos
   - Warn: situaciones anómalas
   - Info: eventos importantes
   - Debug: desarrollo solo

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] Winston o Pino configurado
- [ ] Regla 6: 0 secretos en logs
- [ ] Sanitizar sensitivos antes de loguear
- [ ] Structured JSON logging
- [ ] RequestId único en context
- [ ] Niveles: error, warn, info, debug
- [ ] Rotación diaria de logs
- [ ] Retención 30 días
- [ ] Permisos de archivos 0600

---

## 🧪 VERIFICACIÓN

```bash
cd apps/api

# Tests logging
pnpm run test -- --testPathPattern=logging

# CRÍTICO: Buscar secretos (Regla 6)
grep -ri "password\|token\|secret\|apikey\|jwt\|bearer" src/ | grep -i "log\|console" | grep -v ".spec.ts" | grep -v "//"

# Esperado: 0 líneas (sin match)

# Verificar Winston/Pino
grep -r "winston\|pino" src/ | head -3

# Esperado: Logger presente

# Verificar sanitización
grep -r "sanitize\|redact\|mask" src/

# Esperado: Funciones de sanitización presente

# Probar logs en acción
pnpm run dev &
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrongpass"}'

# Ver logs
tail -50 logs/*.log | grep -i "login\|auth"

# Esperado: Email visible, password NO visible
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**

---

##  ESTADO ACTUAL (Research 2026-01-02)

### Verificado
- LoggerService existe en common/logging
- Sanitization para secrets (sanitize.ts)
- Structured JSON logging
- 0 console.log en codebase

### Sin violaciones criticas - Logging bien implementado
