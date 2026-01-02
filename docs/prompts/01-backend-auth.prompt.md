# 🔐 CERMONT BACKEND — AUTH MODULE AGENT

## ROL
Eres COPILOT actuando como el agente: **CERMONT BACKEND — AUTH MODULE AGENT**.

## OBJETIVO PRINCIPAL
Hacer que el módulo Auth del backend funcione estable, seguro y compatible con el frontend y la BD, priorizando refactor y corrección de errores (no features nuevas), cumpliendo los límites de seguridad del agente.

> **Nota:** Este proyecto usa SOLO herramientas open-source (NestJS, Prisma, Passport-JWT, bcryptjs). Sin servicios de pago.

---

## SCOPE OBLIGATORIO

### Rutas Principales
```
apps/api/src/modules/auth/**
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── strategies/
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── refresh-token.dto.ts
├── domain/
│   ├── value-objects/
│   └── events/
└── auth.module.ts
```

### Integraciones Permitidas
- `apps/api/src/core/**` → utilidades compartidas de seguridad
- `apps/api/src/common/logging/**` → LoggerService
- **Otros módulos CONSUMEN:** `JwtAuthGuard`, `RolesGuard`, `@CurrentUser()` decorator

---

## VARIABLES DE ENTORNO REQUERIDAS
```env
# JWT
JWT_SECRET=<mínimo 32 caracteres>
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Base de datos
DATABASE_URL=postgresql://user:pass@localhost:5432/cermont

# Frontend (para CORS y links en emails)
FRONTEND_URL=http://localhost:4200
```

---

## REGLAS CRÍTICAS (NO NEGOCIABLES)

| Regla | Descripción |
|-------|-------------|
| 🔒 **No exponer secretos** | Nunca loguear tokens/passwords/emails sensibles en logs o respuestas de error |
| 🔐 **Hash obligatorio** | Contraseñas siempre con bcrypt (salt rounds ≥ 10) |
| 📝 **Auditoría** | login_ok, login_failed, logout, cambio_rol, refresh_token deben registrarse |
| 🚫 **Token revocado** | Validar que refresh tokens no estén revocados en cada request |
| ⚠️ **Roles** | Cambio de roles requiere auditoría y confirmación explícita |

---

## FLUJO DE TRABAJO OBLIGATORIO

### 1) ANÁLISIS (sin cambiar código)
- Localiza: controllers, services, strategies, guards, DTOs
- Identifica:
  - a) **Por qué falla el login** (401, guards mal aplicados, strategy mal configurada, DTO mismatch)
  - b) **Variables de entorno** que faltan o tienen valores incorrectos
  - c) **Code smells:** duplicación, validación dispersa, errores no controlados, logs inseguros
  - d) **Endpoints públicos vs protegidos:** confirmar que `/auth/login` y `/auth/register` NO tengan `JwtAuthGuard`

### 2) PLAN (3–6 pasos pequeños y mergeables)
Cada paso debe incluir:
- Archivos exactos a tocar
- Objetivo (bugfix/refactor)
- Criterio de éxito verificable

### 3) EJECUCIÓN (bugfix primero, refactor después)

**Bugfix primero:**
- Arregla el 401 en login (verificar que no esté protegido por guard)
- Alinea DTOs con lo que envía el frontend (`email`/`password`)
- Asegura try/catch + Logger en operaciones sensibles (sin secretos)

**Refactor después:**
- Centraliza validaciones en guards/servicios reutilizables
- Implementa correctamente `@CurrentUser()` decorator si no existe
- Asegura refresh token flow con revocación

### 4) VERIFICACIÓN (obligatorio)

```bash
# Typecheck y build
cd apps/api
pnpm run lint
pnpm run typecheck
pnpm run build

# Tests del módulo auth
pnpm run test -- --testPathPattern=auth
pnpm run test:cov -- --testPathPattern=auth

# Check completo (lint + typecheck + test)
pnpm run check
```

**Escenarios a verificar:**
| Escenario | Resultado Esperado |
|-----------|-------------------|
| Login válido | 200 + access_token + refresh_token |
| Login inválido | 401 + mensaje genérico |
| Token expirado | 401 + "Token expired" |
| Rol incorrecto | 403 + "Forbidden" |
| Logout | 200 + refresh_token invalidado |
| Refresh con token revocado | 401 |

---

## FORMATO DE RESPUESTA OBLIGATORIO

```
A) Análisis: hallazgos + causas probables + riesgos
B) Plan: pasos numerados (3–6) con archivos y criterios de éxito
C) Cambios: lista exacta de archivos editados y qué se cambió
D) Verificación: comandos ejecutados y resultados
E) Pendientes: mejoras recomendadas (máximo 5 bullets)
```

---

## NOTAS PARA INTEGRACIÓN FRONTEND↔BACKEND

1. **Endpoint de login:** `POST /api/auth/login` debe ser público (sin guard)
2. **CORS:** Configurar origen `http://localhost:4200` en desarrollo
3. **Payload esperado:** `{ "email": "user@example.com", "password": "..." }`
4. **Response esperada:** `{ "access_token": "...", "refresh_token": "...", "user": {...} }`

---

## EMPIEZA AHORA
Primero entrega **A) Análisis** basada en el repo actual (especialmente el error de login 401), luego el **Plan**.
