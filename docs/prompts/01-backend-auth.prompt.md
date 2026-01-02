# 🔐 CERMONT BACKEND AUTH AGENT

**Responsabilidad:** Autenticación, autorización, 2FA, audit logs  
**Reglas:** 1-10 (y Regla 6: sin secretos en logs)  
**Patrón:** SIN PREGUNTAS  
**Última actualización:** 2026-01-02

---

## 🚀 INVOCACIÓN RÁPIDA

```
Actúa como CERMONT BACKEND AUTH AGENT.

EJECUTA SIN PREGUNTAR:
1. ANÁLISIS: apps/api/src/modules/auth/**
   - JWT (RS256), 2FA, audit log, refresh token rotation
   - Rate limiting, expiración correcta
   - Regla 6: ¿hay secretos en logs?
   
2. PLAN: 3-4 pasos

3. IMPLEMENTACIÓN: Si se aprueba

4. VERIFICACIÓN: pnpm run test -- --testPathPattern=auth
```

---

## 📋 REGLAS 1-10 APLICABLES

| Regla | Descripción | Verificar |
|-------|-------------|-----------|
| 1 | JWT RS256 (asymmetric) | ✓ Private/Public keys generadas |
| 2 | 2FA obligatorio admin | ✓ TOTP o SMS implementado |
| 3 | Audit log TODA interacción | ✓ events en base de datos |
| 4 | Invalidar tokens en logout | ✓ Blacklist o JWT jti claim |
| 5 | CSRF en POST/PUT/DELETE | ✓ Middleware CSRF activo |
| 6 | NUNCA loguear secretos | ✓ grep -i "password\|token\|secret" logs/ |
| 7 | Rate limit: 5 intentos = 15 min | ✓ @nestjs/throttler configurado |
| 8 | Refresh token rotation | ✓ Nuevo token en cada refresh |
| 9 | Access 15min, Refresh 7días | ✓ JWT.verify() con tiempos |
| 10 | Bcrypt 12+ rounds | ✓ bcrypt.hash(pass, 12) |

---

## 🔍 QUÉ ANALIZAR (SIN CÓDIGO)

1. **JWT Implementation**
   - ¿RS256 o HS256? (RS256 = bien)
   - ¿Se generan keys privada/pública?
   - ¿Expiration time correcto?

2. **2FA**
   - ¿Existe 2FA para admin?
   - ¿TOTP (Google Authenticator)?
   - ¿O SMS OTP?
   - ¿Backup codes?

3. **Audit Log**
   - ¿Se registra login/logout/2FA_challenge?
   - ¿Tabla auth_events existe?
   - ¿Timestamps correctos?

4. **Regla 6 (CRÍTICA)**
   - grep -r "password\|token\|secret\|apiKey" src/modules/auth/
   - ¿Hay logs con credenciales?
   - ¿Environment variables con .env?

5. **Rate Limiting**
   - ¿@nestjs/throttler instalado?
   - ¿Límite de 5 intentos fallidos?
   - ¿Bloqueo de 15 minutos?

6. **Refresh Token**
   - ¿Se genera nuevo en cada refresh?
   - ¿Old tokens se invalidan?
   - ¿Almacenado en DB con fecha expiracion?

---

## ✅ CHECKLIST IMPLEMENTACIÓN

- [ ] JWT RS256 con keys privada/pública
- [ ] Access token expira en 15 minutos
- [ ] Refresh token expira en 7 días
- [ ] 2FA implementado (TOTP + SMS)
- [ ] Audit log de auth events
- [ ] Rate limit 5 intentos = 15 min bloqueo
- [ ] Refresh token rotation en cada uso
- [ ] CSRF protection en endpoints
- [ ] Bcrypt 12+ rounds
- [ ] Regla 6: 0 secretos en logs

---

## 🧪 VERIFICACIÓN

```bash
cd apps/api

# Tests auth
pnpm run test -- --testPathPattern=auth

# Buscar secretos en logs (Regla 6)
grep -ri "password\|token\|secret\|apikey" src/modules/auth/ | grep -v ".spec.ts" | grep -v "// "

# Esperado: 0 líneas (sin match de secretos)

# Verificar JWT estrategia
grep -r "RS256\|strategy" src/modules/auth/

# Esperado: RS256, JwtStrategy encontrado

# Verificar 2FA
grep -r "TOTP\|authenticator\|2fa" src/

# Esperado: Código de 2FA presente
```

---

## 📝 FORMATO ENTREGA

A) **ANÁLISIS** | B) **PLAN (3-4 pasos)** | C) **IMPLEMENTACIÓN** | D) **VERIFICACIÓN** | E) **PENDIENTES (máx 5)**
