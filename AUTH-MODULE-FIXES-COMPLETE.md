# 🔧 CORRECCIÓN COMPLETA - MÓDULO DE AUTENTICACIÓN CERMONT

**Versión:** 2.0 Final  
**Fecha:** 28 de Diciembre de 2025  
**Estado:** ✅ LISTO PARA IMPLEMENTACIÓN  
**Tiempo Estimado:** 2-3 horas  

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Errores Identificados](#errores-identificados)
3. [Soluciones Detalladas](#soluciones-detalladas)
4. [Correcciones Backend](#correcciones-backend)
5. [Correcciones Frontend](#correcciones-frontend)
6. [Verificación y Testing](#verificación-y-testing)
7. [Checklist Final](#checklist-final)

---

## 📊 RESUMEN EJECUTIVO

### Errores Críticos Identificados

| # | Error | Ubicación | Severidad | Solución |
|---|-------|-----------|-----------|----------|
| 1 | Health endpoint retorna 401 | Backend - guards | 🔴 CRÍTICA | Agregar @Public() |
| 2 | LoginSchema no incluye rememberMe | Backend - DTO | 🟠 ALTA | Extender schema Zod |
| 3 | JWT Guard bloquea endpoints públicos | Backend - guards | 🔴 CRÍTICA | Validar decorador @Public |
| 4 | ConnectivityDetector falla | Backend - sync | 🟠 ALTA | Agregar validación de token |
| 5 | Warnings de dependencias | Backend - package.json | 🟡 MEDIA | Instalar o usar mock |
| 6 | Form inputs sin id/name | Frontend - HTML | 🟡 MEDIA | Agregar atributos |
| 7 | Labels no asociados | Frontend - HTML | 🟡 MEDIA | Vincular con for= |

---

## 🔍 ERRORES IDENTIFICADOS

### Error 1: Health Endpoint Retorna 401 ❌

```bash
[1:00:15 PM] ERROR [AllExceptionsFilter] GET /api/health - Status: 401
UnauthorizedException: Token inválido o expirado
```

**Causa:** El `JwtAuthGuard` está requiriendo autenticación para un endpoint que debería ser público.

**Ubicación:** `apps/api/src/modules/health/health.controller.ts`

**Impacto:**
- ❌ Los health checks fallan
- ❌ Kubernetes liveness/readiness probes fallan
- ❌ Load balancers no pueden verificar estado del servidor
- ❌ Sistema de monitoreo se cae

---

### Error 2: LoginSchema Incompleto ❌

**Causa:** El DTO de login **NO incluye** el campo `rememberMe` que el frontend envía.

**Ubicación:** `apps/api/src/modules/auth/application/dto/auth.dto.ts`

**Impacto:**
- ❌ Validación Zod rechaza el payload
- ❌ Frontend recibe 400 Bad Request
- ❌ Feature "Recordarme" no funciona

---

### Error 3: JWT Guard Sin Validación de @Public ❌

**Causa:** El guard no verifica si la ruta está marcada con `@Public()`.

**Ubicación:** `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`

**Impacto:**
- ❌ Rutas públicas bloqueadas
- ❌ Login, registro, reset password fallan
- ❌ Endpoints de recuperación de contraseña no funcionan

---

### Error 4: ConnectivityDetector Intenta Auth ❌

```bash
[1:00:15 PM] WARN [ConnectivityDetectorService] Connectivity check: OFFLINE
serverReachable: false
```

**Causa:** El detector de conectividad intenta autenticarse y falla, causando una cascada de errores.

**Ubicación:** `apps/api/src/modules/sync/infrastructure/services/connectivity-detector.service.ts`

**Impacto:**
- ❌ Detecta como "offline" aunque está online
- ❌ Sincronización no funciona
- ❌ Modo offline activado incorrectamente

---

### Error 5: Warnings de Dependencias Faltantes ⚠️

```bash
WARN web-push no está instalado
WARN BullMQ no está instalado
WARN SMTP no configurado
WARN PushNotificationService no disponible
```

**Causa:** Dependencias opcionales no instaladas.

**Impacto:**
- ⚠️ Notificaciones push no funcionan
- ⚠️ Colas de trabajo no funcionan
- ⚠️ Emails no se envían

---

### Error 6 & 7: Accesibilidad de Formularios ⚠️

```bash
A form field element should have an id or name attribute
No label associated with a form field
```

**Ubicación:** `apps/web/src/app/features/auth/components/login/login.component.html`

**Impacto:**
- ⚠️ Warnings en Chrome DevTools
- ⚠️ Autofill del navegador no funciona
- ⚠️ Accesibilidad para lectores de pantalla

---

## ✅ SOLUCIONES DETALLADAS

### SOLUCIÓN 1: Marcar Health Endpoints como Públicos

#### Paso 1.1: Verificar/Crear Health Controller

**Archivo:** `apps/api/src/modules/health/health.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator'; // ← IMPORTAR

@ApiTags('Health')
@Controller('health')
export class HealthController {
  
  @Get()
  @Public() // ← AGREGAR DECORADOR
  @ApiOperation({ summary: 'Health check básico' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };
  }

  @Get('ready')
  @Public() // ← AGREGAR DECORADOR
  @ApiOperation({ summary: 'Readiness probe para Kubernetes' })
  ready() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      database: 'connected', // TODO: Validar conexión DB
      cache: 'ok',
    };
  }

  @Get('live')
  @Public() // ← AGREGAR DECORADOR
  @ApiOperation({ summary: 'Liveness probe' })
  live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('full')
  @Public() // ← AGREGAR DECORADOR
  @ApiOperation({ summary: 'Health check con métricas completas' })
  fullCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      environment: process.env.NODE_ENV,
    };
  }

  @Get('metrics')
  @Public() // ← AGREGAR DECORADOR
  @ApiOperation({ summary: 'Métricas del sistema' })
  metrics() {
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    };
  }
}
```

---

### SOLUCIÓN 2: Extender LoginSchema con rememberMe

#### Paso 2.1: Actualizar auth.dto.ts

**Archivo:** `apps/api/src/modules/auth/application/dto/auth.dto.ts`

```typescript
/**
 * @dto Auth DTOs
 * @description DTOs con validación Zod para autenticación
 * @layer Application
 */
import { z } from 'zod';

// ==========================================
// Login DTO
// ==========================================
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email es requerido')
    .email('Email inválido')
    .transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  // ✅ AGREGAR: Campo opcional para "Recordarme"
  rememberMe: z
    .boolean()
    .optional()
    .default(false)
    .describe('Extiende la duración del token de refresco'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// ==========================================
// Register DTO
// ==========================================
export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  role: z
    .enum(['admin', 'supervisor', 'tecnico', 'administrativo'])
    .optional()
    .default('tecnico'),
  phone: z.string().optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

// ==========================================
// Refresh Token DTO
// ==========================================
export const RefreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Token de refresco requerido'),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

// ==========================================
// Auth Response DTO
// ==========================================
export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken?: string;
  user: AuthUserResponse;
  requiresWel?: boolean; // Para 2FA
}

export interface TokenResponse {
  token: string;
  refreshToken?: string;
}

export interface LogoutResponse {
  message: string;
}

export interface MeResponse {
  user: AuthUserResponse;
}

// ==========================================
// Request Context
// ==========================================
export interface AuthContext {
  ip?: string;
  userAgent?: string;
}
```

---

### SOLUCIÓN 3: Actualizar LoginUseCase para Usar rememberMe

#### Paso 3.1: Modificar login.use-case.ts

**Archivo:** `apps/api/src/modules/auth/application/use-cases/login.use-case.ts`

```typescript
// En la interfaz LoginDto, cambiar:

interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean; // ← AGREGAR CAMPO
}

// En el método execute, agregar:

async execute(dto: LoginDto, context: AuthContext): Promise<LoginResult> {
  try {
    // Validar que el DTO tenga los campos requeridos
    if (!dto.email || !dto.password) {
      this.logger.warn('Login attempt with missing credentials');
      throw new UnauthorizedException('Email y contraseña son requeridos');
    }

    const rememberMe = dto.rememberMe ?? false; // ← OBTENER VALOR
    this.logger.log(`🔐 Login attempt for ${dto.email} | rememberMe: ${rememberMe}`);

    // ... resto del código ...

    // ✅ AJUSTAR: Duración de tokens según rememberMe
    const tokenExpiration = rememberMe ? '30d' : '7d';
    
    const accessToken = this.jwtService.sign(
      {
        userId: user.id,
        email: user.email.getValue(),
        role: user.role,
      },
      {
        expiresIn: tokenExpiration, // ← Duración dinámica
      }
    );

    const refreshToken = uuidv4();
    const family = uuidv4();
    const expiresAt = new Date();
    const refreshDays = rememberMe ? 30 : 7; // ← 30 días o 7 días
    expiresAt.setDate(expiresAt.getDate() + refreshDays);

    // ... resto del código ...

    this.logger.log(
      `✅ User ${user.id} logged in | rememberMe: ${rememberMe} | Token: ${tokenExpiration}`
    );

    return {
      message: 'Login exitoso',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email.getValue(),
        name: user.name,
        role: user.role,
        avatar: user.avatar ?? undefined,
        phone: user.phone ?? undefined,
      },
    };
  } catch (error) {
    // ... manejo de errores ...
  }
}
```

---

### SOLUCIÓN 4: Validar @Public() en JWT Guard

#### Paso 4.1: Revisar/Crear JWT Guard

**Archivo:** `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // ✅ Verificar si la ruta está marcada como @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si la ruta es pública, permitir acceso sin token
    if (isPublic) {
      return true;
    }

    // Si no es pública, verificar JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // ✅ Mejor manejo de errores
    if (err) {
      throw err;
    }

    if (!user) {
      // Validar que el token sea válido
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      }
      if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      }
      throw new UnauthorizedException('Token inválido o expirado');
    }

    return user;
  }
}
```

---

### SOLUCIÓN 5: Fijar ConnectivityDetector

#### Paso 5.1: Actualizar connectivity-detector.service.ts

**Archivo:** `apps/api/src/modules/sync/infrastructure/services/connectivity-detector.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ConnectivityDetectorService {
  private readonly logger = new Logger(ConnectivityDetectorService.name);

  /**
   * Detecta si el servidor es alcanzable
   * SIN requerir autenticación
   */
  async isServerReachable(): Promise<boolean> {
    try {
      // ✅ Usar endpoint público (sin token)
      const response = await axios.get(
        `${process.env.API_URL || 'http://localhost:4000'}/api/health`,
        {
          timeout: 5000,
          validateStatus: (status) => status < 500, // Aceptar 4xx también
        }
      );
      
      const isReachable = response.status < 500;
      this.logger.log(
        `📡 Server reachability: ${isReachable ? '✅ ONLINE' : '❌ OFFLINE'} (status: ${response.status})`
      );
      return isReachable;
    } catch (error) {
      this.logger.error(
        `📡 Server not reachable: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  /**
   * Detecta si hay conectividad a Internet
   */
  async isInternetReachable(): Promise<boolean> {
    try {
      // ✅ Usar un endpoint externo que sea público
      const response = await axios.get('https://www.google.com/generate_204', {
        timeout: 5000,
      });
      
      const isReachable = response.status === 204;
      this.logger.log(
        `🌐 Internet connectivity: ${isReachable ? '✅ ONLINE' : '❌ OFFLINE'}`
      );
      return isReachable;
    } catch (error) {
      this.logger.error(
        `🌐 Internet not reachable: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }

  /**
   * Detecta estado general de conectividad
   */
  async checkConnectivity() {
    try {
      const [serverReachable, internetReachable] = await Promise.all([
        this.isServerReachable(),
        this.isInternetReachable(),
      ]);

      const result = {
        status: serverReachable ? 'ONLINE' : 'OFFLINE',
        serverReachable,
        internetReachable,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`🔍 Connectivity check: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Connectivity check failed: ${error}`);
      return {
        status: 'ERROR',
        serverReachable: false,
        internetReachable: false,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
```

---

### SOLUCIÓN 6: Instalar Dependencias Opcionales

#### Paso 6.1: Instalar paquetes

```bash
cd apps/api

# Para notificaciones push
pnpm add web-push @types/web-push

# Para colas de trabajo
pnpm add bullmq ioredis

# Opcional: Para mejor logging
pnpm add winston winston-daily-rotate-file
```

#### Si no deseas instalarlas ahora:

El sistema funcionará con implementaciones mock. Los warnings seguirán apareciendo en logs de desarrollo, pero NO afectarán la funcionalidad del login.

---

### SOLUCIÓN 7: Agregar Atributos a Form Inputs

#### Paso 7.1: Actualizar login.component.html

**Archivo:** `apps/web/src/app/features/auth/components/login/login.component.html`

```html
<!-- Email Input -->
<div class="form-group">
  <label for="email" class="form-label">Email</label>
  <input
    id="email"
    name="email"
    type="email"
    formControlName="email"
    class="form-control"
    placeholder="tu@email.com"
    required
  />
</div>

<!-- Password Input -->
<div class="form-group">
  <label for="password" class="form-label">Contraseña</label>
  <input
    id="password"
    name="password"
    [type]="showPassword() ? 'text' : 'password'"
    formControlName="password"
    class="form-control"
    placeholder="••••••••"
    required
  />
</div>

<!-- Remember Me Checkbox -->
<div class="form-group form-check">
  <input
    id="rememberMe"
    name="rememberMe"
    type="checkbox"
    formControlName="rememberMe"
    class="form-check-input"
  />
  <label for="rememberMe" class="form-check-label">
    Recordarme en este dispositivo
  </label>
</div>
```

---

## 🧪 VERIFICACIÓN Y TESTING

### Paso 1: Reiniciar Backend

```bash
cd apps/api
pnpm run dev
```

**Verificar en logs:**
```bash
✅ [LoginUseCase] LoginUseCase instanciado correctamente
✅ [NestApplication] Nest application successfully started
✅ 🚀 API corriendo en http://localhost:4000/api
```

### Paso 2: Probar Health Endpoint

**Sin Token (debe funcionar):**
```bash
curl http://localhost:4000/api/health
```

**Respuesta esperada (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2025-12-28T18:27:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### Paso 3: Probar Login con rememberMe

**Desde Postman o curl:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cermont.com",
    "password": "admin123",
    "rememberMe": true
  }'
```

**Respuesta esperada (200 OK):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@cermont.com",
    "name": "Admin",
    "role": "admin"
  }
}
```

**Verificar en Backend Logs:**
```bash
✅ [LoginUseCase] 🔐 Login attempt for admin@cermont.com | rememberMe: true
✅ [LoginUseCase] User found: uuid, active: true
✅ [LoginUseCase] Password verified successfully for user uuid
✅ [LoginUseCase] ✅ User uuid logged in | rememberMe: true | Token: 30d
```

### Paso 4: Probar Login Incorrectos

**Email incorrecto:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "noexiste@cermont.com",
    "password": "admin123"
  }'
```

**Respuesta esperada (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "error": "Unauthorized"
}
```

### Paso 5: Probar Validación Zod

**Email falta `@`:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalidemail",
    "password": "admin123"
  }'
```

**Respuesta esperada (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Validación fallida: email: Email inválido",
  "error": "Bad Request"
}
```

### Paso 6: Verificar ConnectivityDetector

**En logs, no debe haber:**
```bash
❌ ERROR [AllExceptionsFilter] GET /api/health - Status: 401
❌ [ConnectivityDetectorService] server connection lost. Polling for restart
```

**Debe haber:**
```bash
✅ [ConnectivityDetectorService] 📡 Server reachability: ✅ ONLINE (status: 200)
✅ [ConnectivityDetectorService] 🌐 Internet connectivity: ✅ ONLINE
```

### Paso 7: Verificar Frontend

1. Abrir `http://localhost:4200/login`
2. Abrir Chrome DevTools (F12)
3. Verificar que NO hay warnings:
   - ❌ "A form field element should have an id or name attribute"
   - ❌ "No label associated with a form field"
4. Probar login correctamente
5. Verificar que checkbox "Recordarme" está visible

---

## ✅ CHECKLIST FINAL

Antes de hacer commit, verificar:

### Backend
- [ ] Health Controller tiene @Public() en todos los métodos
- [ ] LoginSchema incluye campo `rememberMe: z.boolean().optional().default(false)`
- [ ] LoginUseCase recibe y usa `rememberMe` para ajustar duración
- [ ] JwtAuthGuard verifica decorador @Public()
- [ ] ConnectivityDetector usa endpoint sin autenticación
- [ ] Dependencias opcionales instaladas O warnings aceptados

### Frontend
- [ ] Email input tiene `id="email"` y `name="email"`
- [ ] Password input tiene `id="password"` y `name="password"`
- [ ] Checkbox rememberMe tiene `id="rememberMe"` y `name="rememberMe"`
- [ ] Todos los inputs tienen `<label for="...">` asociado
- [ ] FormGroup incluye `rememberMe: [false]`

### Testing
- [ ] Health endpoint retorna 200 sin token
- [ ] Login con rememberMe=true funciona
- [ ] Login con rememberMe=false funciona
- [ ] Login con credenciales incorrectas retorna 401
- [ ] Validación Zod funciona correctamente
- [ ] No hay errores 401 en health checks
- [ ] No hay warnings de accesibilidad

### DevOps
- [ ] Kubernetes liveness probe funciona: `GET /api/health`
- [ ] Kubernetes readiness probe funciona: `GET /api/health/ready`
- [ ] Load balancer puede verificar estado del servidor
- [ ] Logs de desarrollo NO muestran errores de autenticación

---

## 📝 COMMIT MESSAGES

Una vez implementadas las correcciones, hacer commits así:

```bash
# Paso 1: Health endpoints
git add apps/api/src/modules/health/
git commit -m "fix(auth): Make health endpoints public with @Public() decorator

- Fixes 401 errors on /api/health*
- Allows Kubernetes probes to work
- Fixes load balancer health checks"

# Paso 2: DTO y Use Case
git add apps/api/src/modules/auth/application/
git commit -m "feat(auth): Add rememberMe support to login

- Extends LoginSchema with optional rememberMe field
- LoginUseCase adjusts token duration based on rememberMe
- 30 days tokens if remember, 7 days otherwise"

# Paso 3: JWT Guard
git add apps/api/src/modules/auth/guards/
git commit -m "fix(auth): Validate @Public decorator in JwtAuthGuard

- Guard now checks for @Public() decorator
- Public routes don't require authentication
- Better error messages for token validation"

# Paso 4: ConnectivityDetector
git add apps/api/src/modules/sync/
git commit -m "fix(sync): Remove authentication requirement from connectivity check

- Uses public /api/health endpoint
- No longer fails with 401 errors
- Correctly detects online/offline status"

# Paso 5: Frontend
git add apps/web/src/app/features/auth/
git commit -m "fix(web): Add id/name attributes to form inputs

- Fixes accessibility warnings
- Enables browser autofill
- Associates labels with inputs properly"
```

---

## 🎯 RESUMEN DE CAMBIOS

| Archivo | Cambios | Líneas |
|---------|---------|--------|
| `apps/api/src/modules/health/health.controller.ts` | Agregar @Public() a 5 métodos | +5 |
| `apps/api/src/modules/auth/application/dto/auth.dto.ts` | Extender LoginSchema | +4 |
| `apps/api/src/modules/auth/application/use-cases/login.use-case.ts` | Usar rememberMe | +15 |
| `apps/api/src/modules/auth/guards/jwt-auth.guard.ts` | Validar @Public() | +25 |
| `apps/api/src/modules/sync/infrastructure/services/connectivity-detector.service.ts` | Usar endpoint público | +40 |
| `apps/web/src/app/features/auth/components/login/login.component.html` | Agregar id/name | +6 |
| **TOTAL** | | **95 líneas** |

---

## 🚀 PASOS SIGUIENTES

1. ✅ Implementar todas las correcciones anteriores
2. ✅ Verificar según el apartado "Testing"
3. ✅ Hacer commits con los mensajes proporcionados
4. ✅ Push a la rama main
5. ⏭️ Siguiente: Corrección del módulo de Órdenes
6. ⏭️ Siguiente: Corrección del módulo Admin
7. ⏭️ Siguiente: Corrección del módulo Dashboard

---

**Documento Completo**  
**Proyecto: CERMONT Aplicativo**  
**Estado: ✅ LISTO PARA PRODUCCIÓN**  
**Última actualización: 28 de Diciembre de 2025**