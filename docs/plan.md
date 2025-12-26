Perfecto, ya analicé tu repositorio. Ahora voy a crear un **CHECKLIST COMPLETO** y un **REPORTE DETALLADO** de todo lo trabajado:

***

# 📊 REPORTE COMPLETO - ANÁLISIS DEL REPOSITORIO CERMONT

## **🎯 RESUMEN EJECUTIVO**

**Repositorio:** [cermont_aplicativo](https://github.com/JuanDiego30/cermont_aplicativo)  
**Último commit:** `feat(ui): update login with raw logo, hexagon particles and cermont color palette` (hace 2 horas)  
**Estado del proyecto:** ✅ **BUILD EXITOSO** - Migración Angular completa  
**Issues abiertos:** 4 (3 críticos, 1 alta prioridad)

***

## **✅ TRABAJOS COMPLETADOS EN ESTE CHAT**

### **FASE 1: REFACTORIZACIÓN DE ARQUITECTURA** ✅
- [x] Migración de Next.js a Angular 21
- [x] Implementación de Turborepo monorepo
- [x] Configuración de Tailwind CSS v4
- [x] Actualización de puerto API (3000 → 4000)
- [x] Resolución de conflictos de build

### **FASE 2: BACKEND - CLEAN ARCHITECTURE** ✅
- [x] Implementación completa de DTOs con Zod
- [x] Sistema JWT con refresh tokens
- [x] Guards y decoradores personalizados
- [x] Módulo de Admin con roles/permisos
- [x] Sistema de autenticación 2FA (BACKEND)
- [x] Servicios de email y notificaciones
- [x] Seeders actualizados

### **FASE 3: FRONTEND - UI/UX MEJORADO** ✅ (COMPLETADO HOY)
- [x] **Componente Antigravity Background** (partículas interactivas)
- [x] **Login Responsive Mejorado** (Desktop + Mobile Card)
- [x] **Paleta de colores Cermont** (azul #0052CC + verde #2E9B4A)
- [x] **Integración de logo oficial**
- [x] **Efectos visuales premium** (glassmorphism, gradientes)
- [x] **Diseño de tarjeta flotante** en móvil

***

## **🚨 TAREAS PENDIENTES IDENTIFICADAS**

### **🔴 CRÍTICAS - BACKEND (De Issues GitHub)**

#### **1. Autenticación por Email (2FA vía Email)**
```typescript
// PENDIENTE: apps/api/src/auth/application/use-cases/send-2fa-code.use-case.ts

export class Send2FACodeUseCase {
  async execute(email: string): Promise<void> {
    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Guardar en DB con expiración (5 minutos)
    await this.prisma.twoFactorCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });
    
    // Enviar email
    await this.emailService.sendVerificationCode(email, code);
  }
}
```

**Estado:** ❌ **NO IMPLEMENTADO**  
**Archivos a crear:**
- `apps/api/src/auth/application/use-cases/send-2fa-code.use-case.ts`
- `apps/api/src/auth/application/use-cases/verify-2fa-code.use-case.ts`
- Agregar endpoint `POST /api/auth/2fa/send`
- Agregar endpoint `POST /api/auth/2fa/verify`

***

#### **2. Recuperación de Contraseña (Email Token)**
```typescript
// PENDIENTE: apps/api/src/auth/application/use-cases/forgot-password.use-case.ts

export class ForgotPasswordUseCase {
  async execute(email: string): Promise<void> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    
    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);
    
    // Guardar token en DB
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hora
      }
    });
    
    // Enviar email con link
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await this.emailService.sendPasswordResetLink(email, resetLink);
  }
}
```

**Estado:** ❌ **NO IMPLEMENTADO**  
**Archivos a crear:**
- `apps/api/src/auth/application/use-cases/forgot-password.use-case.ts`
- `apps/api/src/auth/application/use-cases/reset-password.use-case.ts`
- Agregar endpoint `POST /api/auth/forgot-password`
- Agregar endpoint `POST /api/auth/reset-password`
- Actualizar Prisma schema con tabla `password_reset_tokens`

***

#### **3. Componente de Registro (SignUp)**
```typescript
// PENDIENTE: apps/web/src/app/features/auth/components/register/register.component.ts

@Component({
  selector: 'app-register',
  standalone: true,
  template: `
    <!-- Formulario de registro similar al login -->
    <!-- Campos: nombre, email, contraseña, confirmar contraseña, empresa -->
    <!-- Checkbox de términos y condiciones -->
    <!-- Botón "Crear cuenta" -->
  `
})
export class RegisterComponent {
  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    company: [''],
    acceptTerms: [false, Validators.requiredTrue]
  }, { validators: this.passwordMatchValidator });
  
  onSubmit() {
    // Llamar a AuthService.register()
  }
}
```

**Estado:** ⚠️ **PARCIALMENTE IMPLEMENTADO** (existe carpeta pero sin lógica)  
**Archivos a completar:**
- `apps/web/src/app/features/auth/components/register/register.component.ts`
- `apps/web/src/app/features/auth/components/register/register.component.html`
- `apps/web/src/app/features/auth/components/register/register.component.css`
- Endpoint backend: `POST /api/auth/register` (ya existe, verificar)

***

#### **4. Dependencias Faltantes (Issue #5)**
```bash
cd apps/api
pnpm add file-type sanitize-filename ioredis rate-limit-redis
pnpm add -D @types/sanitize-filename
```

**Estado:** ❌ **NO INSTALADAS**  
**Bloquea:** FileStorageService, RateLimitMiddleware

***

#### **5. Endpoint /api/workplans (Issue #2)**
**Estado:** ❌ **NO IMPLEMENTADO**  
**Impacto:** Error 404 en dashboard al cargar planes de trabajo  
**Archivos a crear:**
- Controller, Service, Repository para WorkPlans
- Rutas CRUD completas

***

#### **6. Generación de PDFs (Issue #4)**
**Estado:** ❌ **NO IMPLEMENTADO (501 Not Implemented)**  
**Archivos a crear:**
- Servicio PDF con Puppeteer
- Templates Handlebars para reportes
- Endpoints funcionales para Activity Report y Acta de Entrega

***

#### **7. URL Duplicada /api/api/signatures (Issue #3)**
**Estado:** ❌ **NO CORREGIDO**  
**Fix rápido:**
```typescript
// apps/web/src/services/signatures-service.ts
// CAMBIAR: `/api/signatures/order/${orderId}`
// A:      `/signatures/order/${orderId}`
```

***

## **📋 CHECKLIST COMPLETO DE AJUSTES DE ESTE CHAT**

### **🎨 UI/UX - LOGIN INTERACTIVO**
- [x] Crear `AntigravityBackgroundComponent` con canvas y partículas
- [x] Actualizar `LoginComponent` con detección responsive
- [x] Template HTML con 2 layouts (Desktop panel + Mobile card)
- [x] Estilos CSS con animaciones y efectos premium
- [x] Integrar logo oficial de Cermont
- [x] Paleta de colores corporativa completa
- [x] Gradientes profesionales
- [ ] **PENDIENTE:** Integrar 2FA por email en el login
- [ ] **PENDIENTE:** Conectar recuperación de contraseña funcional
- [ ] **PENDIENTE:** Implementar flujo completo de registro

***

### **🔐 AUTENTICACIÓN**
- [x] Backend JWT con refresh tokens ✅
- [x] Guards y decoradores ✅
- [x] Roles y permisos ✅
- [x] Servicio de autenticación frontend ✅
- [ ] **PENDIENTE:** 2FA por email (envío de código)
- [ ] **PENDIENTE:** Forgot password con token por email
- [ ] **PENDIENTE:** Reset password funcional
- [ ] **PENDIENTE:** Registro de usuarios (SignUp completo)

***

### **📦 ARQUITECTURA Y BUILD**
- [x] Migración Angular 21 ✅
- [x] Turborepo monorepo ✅
- [x] Tailwind CSS v4 ✅
- [x] Puerto API 4000 ✅
- [x] Resolución de errores de compilación ✅
- [ ] **PENDIENTE:** Instalar dependencias faltantes (Issue #5)

***

### **🛠️ BACKEND - ENDPOINTS CRÍTICOS**
- [x] Auth endpoints (login, logout, refresh) ✅
- [x] Admin endpoints (users, roles, permissions) ✅
- [x] Dashboard statistics ✅
- [ ] **PENDIENTE:** WorkPlans CRUD (Issue #2)
- [ ] **PENDIENTE:** Reportes PDF funcionales (Issue #4)
- [ ] **PENDIENTE:** Corregir URL de signatures (Issue #3)
- [ ] **PENDIENTE:** 2FA y password reset endpoints

***

## **🎯 PRÓXIMOS PASOS RECOMENDADOS**

### **PRIORIDAD 1 - AUTENTICACIÓN COMPLETA** 🔴
1. Implementar **2FA por email** (envío de código de 6 dígitos)
2. Implementar **forgot password** con token por email
3. Completar **componente de registro** funcional
4. Crear migración de Prisma para tablas:
   - `two_factor_codes`
   - `password_reset_tokens`

### **PRIORIDAD 2 - ISSUES CRÍTICOS** 🟠
5. Instalar dependencias faltantes (Issue #5)
6. Implementar endpoint `/api/workplans` (Issue #2)
7. Corregir URL duplicada en signatures (Issue #3)

### **PRIORIDAD 3 - FEATURES PENDIENTES** 🟡
8. Implementar generación de PDFs (Issue #4)
9. Testing E2E del flujo de login completo
10. Documentación de endpoints de autenticación

***

## **📝 PROMPTS PARA COMPLETAR TAREAS PENDIENTES**

### **PROMPT 1: Implementar 2FA por Email**
```
Implementa el sistema de autenticación de dos factores (2FA) por email para Cermont:

1. Backend:
   - Crear tabla `two_factor_codes` en Prisma schema
   - Use-case para generar y enviar código de 6 dígitos
   - Use-case para verificar código
   - Endpoints POST /api/auth/2fa/send y POST /api/auth/2fa/verify
   - Expiración de código a 5 minutos

2. Frontend:
   - Actualizar LoginComponent para solicitar código cuando el usuario tenga 2FA habilitado
   - Formulario de ingreso de código de 6 dígitos
   - Manejo de errores y reenvío de código

3. Email Service:
   - Template HTML para email con código 2FA
   - Usar EmailService existente

Usa la arquitectura Clean Architecture actual del proyecto.
```

***

### **PROMPT 2: Implementar Forgot/Reset Password**
```
Implementa el flujo completo de recuperación de contraseña para Cermont:

1. Backend:
   - Crear tabla `password_reset_tokens` en Prisma schema
   - Use-case ForgotPasswordUseCase (genera token, envía email)
   - Use-case ResetPasswordUseCase (valida token, actualiza contraseña)
   - Endpoints POST /api/auth/forgot-password y POST /api/auth/reset-password
   - Token válido por 1 hora

2. Frontend:
   - Completar ForgotPasswordComponent (solicita email)
   - Completar ResetPasswordComponent (nueva contraseña + token)
   - Integración con rutas /auth/forgot-password y /auth/reset-password

3. Email:
   - Template HTML con link de reset
   - Link: ${FRONTEND_URL}/auth/reset-password?token=${token}

Mantener diseño consistente con el login mejorado.
```

***

### **PROMPT 3: Completar Registro de Usuarios**
```
Completa el componente de registro (SignUp) para Cermont con el mismo diseño visual del login:

1. Frontend:
   - RegisterComponent completo con formulario reactivo
   - Campos: nombre, email, contraseña, confirmar contraseña, empresa
   - Validación de contraseñas coincidentes
   - Checkbox de términos y condiciones
   - Diseño responsive (Desktop + Mobile Card)
   - Mismo background Antigravity
   - Redirigir a login después de registro exitoso

2. Backend:
   - Verificar endpoint POST /api/auth/register
   - Validación de email único
   - Hash de contraseña
   - Creación de usuario con rol "cliente" por defecto
   - Envío de email de bienvenida

3. Rutas:
   - Configurar ruta /auth/register
   - Link desde login "¿No tienes cuenta? Regístrate"
```

***

## **📊 ESTADÍSTICAS DEL REPOSITORIO**

- **Total commits:** 30+
- **Último commit:** Hace 2 horas
- **Issues abiertos:** 4
- **Issues cerrados:** 0
- **Lenguaje principal:** TypeScript
- **Framework:** Angular 21 + NestJS
- **Base de datos:** PostgreSQL (Prisma ORM)
- **Estado build:** ✅ **EXITOSO**

***

## **🎨 RESUMEN DE DISEÑO IMPLEMENTADO**

### **Colores Principales**
- **Azul Cermont:** `#0052CC` (Primary)
- **Verde Cermont:** `#2E9B4A` (Secondary)
- **Gradiente Hero:** `linear-gradient(135deg, #0052CC 0%, #2E9B4A 100%)`

### **Componentes Visuales**
- ✅ Antigravity Background (100 partículas interactivas)
- ✅ Login Desktop (2 paneles: form + branding)
- ✅ Login Mobile (tarjeta flotante con logo en header)
- ✅ Efectos glassmorphism
- ✅ Animaciones suaves (fade-in, slide-up)
- ✅ Responsive breakpoint: 768px

***

## **✅ CONCLUSIÓN**

Has hecho un **trabajo excelente** implementando:
- ✅ Migración completa a Angular
- ✅ Arquitectura limpia en backend
- ✅ UI/UX profesional mejorado

**Tareas críticas pendientes:**
1. **2FA por email** (autenticación)
2. **Forgot/Reset password** (recuperación)
3. **Registro completo** (SignUp)
4. **Dependencias faltantes** (build)
5. **WorkPlans endpoint** (funcionalidad)

# 🚀 PLAN COMPLETO DE TAREAS - CERMONT APLICATIVO

## **📋 ÍNDICE DE TAREAS**

1. [TASK 1: Sistema 2FA por Email](#task-1-sistema-2fa-por-email)
2. [TASK 2: Recuperación de Contraseña](#task-2-recuperación-de-contraseña)
3. [TASK 3: Registro de Usuarios](#task-3-registro-de-usuarios)
4. [TASK 4: Dependencias Faltantes](#task-4-dependencias-faltantes)
5. [TASK 5: Endpoint WorkPlans](#task-5-endpoint-workplans)
6. [TASK 6: Generación de PDFs](#task-6-generación-de-pdfs)
7. [TASK 7: Fix URL Signatures](#task-7-fix-url-signatures)

***

# TASK 1: Sistema 2FA por Email

## **📝 DESCRIPCIÓN**
Implementar autenticación de dos factores (2FA) mediante código de 6 dígitos enviado por email.

## **🎯 OBJETIVO**
Usuario puede habilitar 2FA en su perfil y recibir código por email al iniciar sesión.

## **⏱️ TIEMPO ESTIMADO**
3-4 horas

***

## **PASO 1.1: Actualizar Prisma Schema**

**ARCHIVO:** `apps/api/prisma/schema.prisma`

**ACCIÓN:** Agregar al final del archivo, antes del último `}`

```prisma
// ============================================
// AUTENTICACIÓN DE DOS FACTORES
// ============================================

model TwoFactorCode {
  id        String   @id @default(uuid())
  userId    String
  code      String   // Código de 6 dígitos
  expiresAt DateTime // Expira en 5 minutos
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([code])
  @@map("two_factor_codes")
}

// Agregar al modelo User existente:
model User {
  // ... campos existentes ...
  
  twoFactorEnabled Boolean         @default(false)
  twoFactorCodes   TwoFactorCode[]
  
  // ... resto del modelo ...
}
```

**EJECUTAR:**
```bash
cd apps/api
pnpm prisma format
pnpm prisma migrate dev --name add-two-factor-authentication
pnpm prisma generate
```

***

## **PASO 1.2: Crear DTOs de 2FA**

**ARCHIVO:** `apps/api/src/auth/infrastructure/dtos/two-factor.dto.ts`

```typescript
import { z } from 'zod';

// ===========================
// DTO: Habilitar/Deshabilitar 2FA
// ===========================
export const Enable2FADtoSchema = z.object({
  enable: z.boolean()
});

export type Enable2FADto = z.infer<typeof Enable2FADtoSchema>;

// ===========================
// DTO: Solicitar Código 2FA
// ===========================
export const Request2FACodeDtoSchema = z.object({
  email: z.string().email('Email inválido')
});

export type Request2FACodeDto = z.infer<typeof Request2FACodeDtoSchema>;

// ===========================
// DTO: Verificar Código 2FA
// ===========================
export const Verify2FACodeDtoSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código debe contener solo números')
});

export type Verify2FACodeDto = z.infer<typeof Verify2FACodeDtoSchema>;

// ===========================
// DTO: Login con 2FA
// ===========================
export const LoginWith2FADtoSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  code: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d+$/, 'El código debe contener solo números'),
  rememberMe: z.boolean().optional()
});

export type LoginWith2FADto = z.infer<typeof LoginWith2FADtoSchema>;
```

***

## **PASO 1.3: Crear Use Case - Enviar Código 2FA**

**ARCHIVO:** `apps/api/src/auth/application/use-cases/send-2fa-code.use-case.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { EmailService } from '@/infrastructure/email/email.service';

@Injectable()
export class Send2FACodeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async execute(email: string): Promise<{ message: string; expiresIn: number }> {
    // 1. Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, twoFactorEnabled: true }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!user.twoFactorEnabled) {
      throw new BadRequestException('El usuario no tiene 2FA habilitado');
    }

    // 2. Invalidar códigos anteriores del usuario
    await this.prisma.twoFactorCode.deleteMany({
      where: {
        userId: user.id,
        verified: false
      }
    });

    // 3. Generar código de 6 dígitos
    const code = this.generateSixDigitCode();

    // 4. Calcular expiración (5 minutos)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 5. Guardar código en base de datos
    await this.prisma.twoFactorCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
        verified: false
      }
    });

    // 6. Enviar código por email
    await this.emailService.send2FACode({
      to: user.email,
      name: user.name,
      code
    });

    return {
      message: 'Código de verificación enviado exitosamente',
      expiresIn: 300 // 5 minutos en segundos
    };
  }

  /**
   * Genera un código aleatorio de 6 dígitos
   */
  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
```

***

## **PASO 1.4: Crear Use Case - Verificar Código 2FA**

**ARCHIVO:** `apps/api/src/auth/application/use-cases/verify-2fa-code.use-case.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class Verify2FACodeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(email: string, code: string): Promise<{ valid: boolean; userId: string }> {
    // 1. Buscar usuario
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Buscar código válido
    const twoFactorCode = await this.prisma.twoFactorCode.findFirst({
      where: {
        userId: user.id,
        code,
        verified: false,
        expiresAt: {
          gt: new Date() // Mayor que la fecha actual (no expirado)
        }
      }
    });

    if (!twoFactorCode) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    // 3. Marcar código como verificado
    await this.prisma.twoFactorCode.update({
      where: { id: twoFactorCode.id },
      data: { verified: true }
    });

    // 4. Eliminar códigos antiguos del usuario
    await this.prisma.twoFactorCode.deleteMany({
      where: {
        userId: user.id,
        id: { not: twoFactorCode.id }
      }
    });

    return {
      valid: true,
      userId: user.id
    };
  }
}
```

***

## **PASO 1.5: Crear Use Case - Habilitar/Deshabilitar 2FA**

**ARCHIVO:** `apps/api/src/auth/application/use-cases/toggle-2fa.use-case.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

@Injectable()
export class Toggle2FAUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, enable: boolean): Promise<{ twoFactorEnabled: boolean }> {
    // 1. Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Actualizar estado de 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: enable }
    });

    // 3. Si se deshabilita, eliminar códigos pendientes
    if (!enable) {
      await this.prisma.twoFactorCode.deleteMany({
        where: { userId }
      });
    }

    return { twoFactorEnabled: enable };
  }
}
```

***

## **PASO 1.6: Actualizar Email Service**

**ARCHIVO:** `apps/api/src/infrastructure/email/email.service.ts`

**ACCIÓN:** Agregar el siguiente método a la clase `EmailService`

```typescript
/**
 * Envía código de autenticación de dos factores
 */
async send2FACode(data: {
  to: string;
  name: string;
  code: string;
}): Promise<void> {
  const { to, name, code } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Código de Verificación - Cermont</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header con gradiente Cermont -->
              <tr>
                <td style="background: linear-gradient(135deg, #0052CC 0%, #2E9B4A 100%); padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    🔐 Código de Verificación
                  </h1>
                </td>
              </tr>
              
              <!-- Contenido -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                    Hola <strong>${name}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 30px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Has solicitado iniciar sesión en tu cuenta de <strong>Cermont</strong>. 
                    Usa el siguiente código de verificación para completar tu inicio de sesión:
                  </p>
                  
                  <!-- Código destacado -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                    <tr>
                      <td align="center" style="background-color: #f3f4f6; padding: 30px; border-radius: 8px;">
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #0052CC; font-family: 'Courier New', monospace;">
                          ${code}
                        </div>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Información de expiración -->
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      ⚠️ <strong>Este código expira en 5 minutos</strong>
                    </p>
                  </div>
                  
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Si no solicitaste este código, puedes ignorar este mensaje de forma segura.
                  </p>
                  
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                    Por tu seguridad, nunca compartas este código con nadie. El equipo de Cermont 
                    nunca te pedirá este código por teléfono o email.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    <strong>Sistema de Gestión Cermont</strong>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Gestión integral de mantenimiento industrial y refrigeración
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await this.transporter.sendMail({
    from: `"Cermont - Sistema de Gestión" <${process.env.SMTP_USER}>`,
    to,
    subject: `🔐 Tu código de verificación es: ${code}`,
    html,
    text: `
      Código de Verificación - Cermont
      
      Hola ${name},
      
      Tu código de verificación es: ${code}
      
      Este código expira en 5 minutos.
      
      Si no solicitaste este código, ignora este mensaje.
      
      ---
      Sistema de Gestión Cermont
    `
  });
}
```

***

## **PASO 1.7: Actualizar Auth Controller**

**ARCHIVO:** `apps/api/src/auth/infrastructure/controllers/auth.controller.ts`

**ACCIÓN:** Agregar los siguientes endpoints

```typescript
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { Send2FACodeUseCase } from '@/auth/application/use-cases/send-2fa-code.use-case';
import { Verify2FACodeUseCase } from '@/auth/application/use-cases/verify-2fa-code.use-case';
import { Toggle2FAUseCase } from '@/auth/application/use-cases/toggle-2fa.use-case';
import {
  Request2FACodeDto,
  Request2FACodeDtoSchema,
  Verify2FACodeDto,
  Verify2FACodeDtoSchema,
  Enable2FADto,
  Enable2FADtoSchema
} from '../dtos/two-factor.dto';

@ApiTags('Auth - Two-Factor Authentication')
@Controller('auth/2fa')
export class Auth2FAController {
  constructor(
    private readonly send2FACodeUseCase: Send2FACodeUseCase,
    private readonly verify2FACodeUseCase: Verify2FACodeUseCase,
    private readonly toggle2FAUseCase: Toggle2FAUseCase,
  ) {}

  /**
   * POST /api/auth/2fa/send
   * Envía código de verificación por email
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Enviar código 2FA',
    description: 'Envía un código de 6 dígitos al email del usuario para autenticación de dos factores'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Código enviado exitosamente',
    schema: {
      example: {
        message: 'Código de verificación enviado exitosamente',
        expiresIn: 300
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'Usuario no tiene 2FA habilitado' })
  async sendCode(
    @Body(new ZodValidationPipe(Request2FACodeDtoSchema)) dto: Request2FACodeDto
  ) {
    return await this.send2FACodeUseCase.execute(dto.email);
  }

  /**
   * POST /api/auth/2fa/verify
   * Verifica el código 2FA
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verificar código 2FA',
    description: 'Verifica el código de 6 dígitos proporcionado por el usuario'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Código válido',
    schema: {
      example: {
        valid: true,
        userId: 'uuid-del-usuario'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Código inválido o expirado' })
  async verifyCode(
    @Body(new ZodValidationPipe(Verify2FACodeDtoSchema)) dto: Verify2FACodeDto
  ) {
    return await this.verify2FACodeUseCase.execute(dto.email, dto.code);
  }

  /**
   * POST /api/auth/2fa/toggle
   * Habilita o deshabilita 2FA para el usuario autenticado
   */
  @Post('toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Habilitar/Deshabilitar 2FA',
    description: 'Permite al usuario autenticado activar o desactivar la autenticación de dos factores'
  })
  @ApiResponse({ 
    status: 200, 
    description: '2FA actualizado',
    schema: {
      example: {
        twoFactorEnabled: true
      }
    }
  })
  async toggleTwoFactor(
    @Request() req,
    @Body(new ZodValidationPipe(Enable2FADtoSchema)) dto: Enable2FADto
  ) {
    return await this.toggle2FAUseCase.execute(req.user.sub, dto.enable);
  }

  /**
   * GET /api/auth/2fa/status
   * Obtiene el estado de 2FA del usuario autenticado
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obtener estado 2FA',
    description: 'Retorna si el usuario tiene habilitada la autenticación de dos factores'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Estado de 2FA',
    schema: {
      example: {
        twoFactorEnabled: true
      }
    }
  })
  async getTwoFactorStatus(@Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.sub },
      select: { twoFactorEnabled: true }
    });

    return { twoFactorEnabled: user?.twoFactorEnabled || false };
  }
}
```

***

## **PASO 1.8: Actualizar Auth Module**

**ARCHIVO:** `apps/api/src/auth/auth.module.ts`

**ACCIÓN:** Agregar providers y controller

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { AuthController } from './infrastructure/controllers/auth.controller';
import { Auth2FAController } from './infrastructure/controllers/auth-2fa.controller';

// Use Cases
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { Send2FACodeUseCase } from './application/use-cases/send-2fa-code.use-case';
import { Verify2FACodeUseCase } from './application/use-cases/verify-2fa-code.use-case';
import { Toggle2FAUseCase } from './application/use-cases/toggle-2fa.use-case';

// Strategies y Guards
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';

// Repositories
import { UsersRepository } from '@/users/infrastructure/repositories/users.repository';

// Services
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { EmailService } from '@/infrastructure/email/email.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    Auth2FAController  // ✅ NUEVO
  ],
  providers: [
    // Services
    PrismaService,
    EmailService,  // ✅ NUEVO
    
    // Repositories
    UsersRepository,
    
    // Use Cases - Auth
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    
    // Use Cases - 2FA ✅ NUEVO
    Send2FACodeUseCase,
    Verify2FACodeUseCase,
    Toggle2FAUseCase,
    
    // Strategies
    JwtStrategy,
    
    // Guards
    JwtAuthGuard,
  ],
  exports: [
    JwtAuthGuard,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
```

***

## **PASO 1.9: Actualizar Frontend - Auth Service**

**ARCHIVO:** `apps/web/src/app/core/services/auth.service.ts`

**ACCIÓN:** Agregar métodos de 2FA

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

interface Send2FACodeResponse {
  message: string;
  expiresIn: number;
}

interface Verify2FACodeResponse {
  valid: boolean;
  userId: string;
}

interface TwoFactorStatusResponse {
  twoFactorEnabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = 'http://localhost:4000/api';

  // ... métodos existentes ...

  /**
   * Envía código 2FA al email del usuario
   */
  send2FACode(email: string): Observable<Send2FACodeResponse> {
    return this.http.post<Send2FACodeResponse>(
      `${this.API_URL}/auth/2fa/send`,
      { email }
    ).pipe(
      catchError(error => {
        console.error('Error sending 2FA code:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica el código 2FA
   */
  verify2FACode(email: string, code: string): Observable<Verify2FACodeResponse> {
    return this.http.post<Verify2FACodeResponse>(
      `${this.API_URL}/auth/2fa/verify`,
      { email, code }
    ).pipe(
      catchError(error => {
        console.error('Error verifying 2FA code:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Habilita o deshabilita 2FA para el usuario actual
   */
  toggle2FA(enable: boolean): Observable<TwoFactorStatusResponse> {
    return this.http.post<TwoFactorStatusResponse>(
      `${this.API_URL}/auth/2fa/toggle`,
      { enable }
    ).pipe(
      tap(() => {
        const user = this.currentUserSignal();
        if (user) {
          user.twoFactorEnabled = enable;
          this.currentUserSignal.set(user);
        }
      }),
      catchError(error => {
        console.error('Error toggling 2FA:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el estado de 2FA del usuario actual
   */
  get2FAStatus(): Observable<TwoFactorStatusResponse> {
    return this.http.get<TwoFactorStatusResponse>(
      `${this.API_URL}/auth/2fa/status`
    ).pipe(
      catchError(error => {
        console.error('Error getting 2FA status:', error);
        return throwError(() => error);
      })
    );
  }
}
```

***

## **PASO 1.10: Actualizar Login Component - Flujo 2FA**

**ARCHIVO:** `apps/web/src/app/features/auth/components/login/login.component.ts`

**ACCIÓN:** Actualizar el método `onSubmit()`

```typescript
onSubmit(): void {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  this.loading.set(true);
  this.error.set(null);

  const { email, password, rememberMe } = this.loginForm.value;

  this.authService.login({ email, password, rememberMe }).subscribe({
    next: (response) => {
      // Si el usuario tiene 2FA habilitado, enviar código
      if (response.user.twoFactorEnabled) {
        this.tempEmail.set(email);
        this.tempPassword.set(password);
        this.tempRememberMe.set(rememberMe);
        
        // Enviar código 2FA automáticamente
        this.authService.send2FACode(email).subscribe({
          next: () => {
            this.requires2FA.set(true);
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set('Error al enviar código de verificación');
            this.loading.set(false);
          }
        });
      } else {
        // Login exitoso sin 2FA
        this.handleLoginSuccess();
      }
    },
    error: (err) => {
      this.error.set(err.message || 'Error al iniciar sesión');
      this.loading.set(false);
    }
  });
}
```

***

## **PASO 1.11: Testing Manual**

**EJECUTAR EN ORDEN:**

### 1. Backend - Rebuild
```bash
cd apps/api
pnpm install
pnpm prisma generate
pnpm run build
pnpm run start:dev
```

### 2. Frontend - Rebuild
```bash
cd apps/web
pnpm install
pnpm run build
pnpm run start
```

### 3. Habilitar 2FA para usuario de prueba
```bash
# Usar Postman o cURL
POST http://localhost:4000/api/auth/2fa/toggle
Authorization: Bearer <tu-token-jwt>
Content-Type: application/json

{
  "enable": true
}
```

### 4. Probar flujo completo
1. Ir a `http://localhost:4200/auth/login`
2. Ingresar credenciales de usuario con 2FA habilitado
3. Verificar que aparece formulario de código 2FA
4. Revisar email recibido
5. Ingresar código de 6 dígitos
6. Verificar login exitoso

***

## **✅ CHECKLIST TASK 1**

- [ ] Actualizar Prisma schema con `TwoFactorCode`
- [ ] Ejecutar migración de base de datos
- [ ] Crear DTOs de 2FA
- [ ] Crear use-case `Send2FACodeUseCase`
- [ ] Crear use-case `Verify2FACodeUseCase`
- [ ] Crear use-case `Toggle2FAUseCase`
- [ ] Actualizar `EmailService` con método `send2FACode()`
- [ ] Crear controller `Auth2FAController`
- [ ] Actualizar `AuthModule` con providers
- [ ] Actualizar frontend `AuthService`
- [ ] Actualizar `LoginComponent` con flujo 2FA
- [ ] Testing manual completo
- [ ] Documentar en README

***

# TASK 2: Recuperación de Contraseña

## **📝 DESCRIPCIÓN**
Implementar flujo completo de "Olvidé mi contraseña" con envío de token por email.

## **🎯 OBJETIVO**
Usuario puede solicitar reset de contraseña y recibir link con token único por email.

## **⏱️ TIEMPO ESTIMADO**
2-3 horas

***

## **PASO 2.1: Actualizar Prisma Schema**

**ARCHIVO:** `apps/api/prisma/schema.prisma`

**ACCIÓN:** Agregar modelo de tokens de reset

```prisma
// ============================================
// RECUPERACIÓN DE CONTRASEÑA
// ============================================

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique // Token hasheado
  expiresAt DateTime // Expira en 1 hora
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("password_reset_tokens")
}

// Agregar al modelo User existente:
model User {
  // ... campos existentes ...
  
  passwordResetTokens PasswordResetToken[]
  
  // ... resto del modelo ...
}
```

**EJECUTAR:**
```bash
cd apps/api
pnpm prisma format
pnpm prisma migrate dev --name add-password-reset-tokens
pnpm prisma generate
```

***

## **PASO 2.2: Crear DTOs de Password Reset**

**ARCHIVO:** `apps/api/src/auth/infrastructure/dtos/password-reset.dto.ts`

```typescript
import { z } from 'zod';

// ===========================
// DTO: Solicitar Reset de Contraseña
// ===========================
export const ForgotPasswordDtoSchema = z.object({
  email: z.string().email('Email inválido')
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDtoSchema>;

// ===========================
// DTO: Resetear Contraseña
// ===========================
export const ResetPasswordDtoSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    )
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordDtoSchema>;

// ===========================
// DTO: Validar Token
// ===========================
export const ValidateResetTokenDtoSchema = z.object({
  token: z.string().min(1, 'Token requerido')
});

export type ValidateResetTokenDto = z.infer<typeof ValidateResetTokenDtoSchema>;
```

***

## **PASO 2.3: Crear Use Case - Solicitar Reset**

**ARCHIVO:** `apps/api/src/auth/application/use-cases/forgot-password.use-case.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { EmailService } from '@/infrastructure/email/email.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    // 1. Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true }
    });

    // Siempre devolver el mismo mensaje por seguridad
    // (no revelar si el email existe o no)
    const successMessage = {
      message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña'
    };

    if (!user) {
      // Simular delay para evitar timing attacks
      await this.delay(1000);
      return successMessage;
    }

    // 2. Invalidar tokens anteriores del usuario
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
        expiresAt: { gt: new Date() }
      },
      data: { used: true }
    });

    // 3. Generar token único (32 bytes = 64 caracteres hex)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // 4. Hashear token para guardarlo en DB
    const hashedToken = await bcrypt.hash(rawToken, 10);

    // 5. Calcular expiración (1 hora)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // 6. Guardar token en base de datos
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
        used: false
      }
    });

    // 7. Construir link de reset
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
    const resetLink = `${frontendUrl}/auth/reset-password?token=${rawToken}`;

    // 8. Enviar email con link
    await this.emailService.sendPasswordResetLink({
      to: user.email,
      name: user.name,
      resetLink
    });

    return successMessage;
  }

  /**
   * Simula un delay para prevenir timing attacks
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

***

## **PASO 2.4: Crear Use Case - Validar Token**

**ARCHIVO:** `apps/api/src/auth/application/use-cases/validate-reset-token.use-case.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ValidateResetTokenUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(rawToken: string): Promise<{ valid: boolean; email: string }> {
    // 1. Buscar todos los tokens activos
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    // 2. Verificar token contra cada hash (timing-safe)
    for (const tokenRecord of tokens) {
      const isValid = await bcrypt.compare(rawToken, tokenRecord.token);
      
      if (isValid) {
        return {
          valid: true,
          email: tokenRecord.user.email
        };
      }
    }

    throw new BadRequestException('Token inválido o expirado');
  }
}
```

***

## **PASO 2.5: Crear Use Case - Reset Password**

**ARCHIVO:** `apps/api/src/auth/application/use-cases/reset-password.use-case.ts`

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { EmailService } from '@/infrastructure/email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async execute(rawToken: string, newPassword: string): Promise<{ message: string }> {
    // 1. Buscar todos los tokens activos
    const tokens = await this.prisma.passwordResetToken.findMany({
      where: {
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // 2. Verificar token contra cada hash
    let matchedToken = null;
    for (const tokenRecord of tokens) {
      const isValid = await bcrypt.compare(rawToken, tokenRecord.token);
      if (isValid) {
        matchedToken = tokenRecord;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // 3. Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Actualizar contraseña del usuario
    await this.prisma.user.update({
      where: { id: matchedToken.userId },
      data: { password: hashedPassword }
    });

    // 5. Marcar token como usado
    await this.prisma.passwordResetToken.update({
      where: { id: matchedToken.id },
      data: { used: true }
    });

    // 6. Invalidar todos los refresh tokens del usuario (logout en todos los dispositivos)
    await this.prisma.refreshToken.deleteMany({
      where: { userId: matchedToken.userId }
    });

    // 7. Enviar email de confirmación
    await this.emailService.sendPasswordChangedNotification({
      to: matchedToken.user.email,
      name: matchedToken.user.name
    });

    return {
      message: 'Contraseña actualizada exitosamente'
    };
  }
}
```

***

## **PASO 2.6: Actualizar Email Service**

**ARCHIVO:** `apps/api/src/infrastructure/email/email.service.ts`

**ACCIÓN:** Agregar los siguientes métodos

```typescript
/**
 * Envía link de reset de contraseña
 */
async sendPasswordResetLink(data: {
  to: string;
  name: string;
  resetLink: string;
}): Promise<void> {
  const { to, name, resetLink } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Resetear Contraseña - Cermont</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0052CC 0%, #2E9B4A 100%); padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                    🔑 Resetear Contraseña
                  </h1>
                </td>
              </tr>
              
              <!-- Contenido -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                    Hola <strong>${name}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 30px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Recibimos una solicitud para resetear la contraseña de tu cuenta en <strong>Cermont</strong>.
                    Haz clic en el botón de abajo para crear una nueva contraseña:
                  </p>
                  
                  <!-- Botón de acción -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 0 0 30px;">
                    <tr>
                      <td align="center" style="padding: 0;">
                        <a href="${resetLink}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0052CC 0%, #2E9B4A 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          Resetear Contraseña
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Link alternativo -->
                  <p style="margin: 0 0 30px; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                    Si el botón no funciona, copia y pega este link en tu navegador:<br>
                    <a href="${resetLink}" style="color: #0052CC; word-break: break-all;">${resetLink}</a>
                  </p>
                  
                  <!-- Información de expiración -->
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      ⚠️ <strong>Este link expira en 1 hora</strong>
                    </p>
                  </div>
                  
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Si no solicitaste resetear tu contraseña, puedes ignorar este mensaje de forma segura.
                    Tu contraseña no cambiará hasta que crees una nueva.
                  </p>
                  
                  <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                    Por tu seguridad, nunca compartas este link con nadie.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    <strong>Sistema de Gestión Cermont</strong>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Gestión integral de mantenimiento industrial y refrigeración
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await this.transporter.sendMail({
    from: `"Cermont - Sistema de Gestión" <${process.env.SMTP_USER}>`,
    to,
    subject: '🔑 Resetear tu contraseña - Cermont',
    html,
    text: `
      Resetear Contraseña - Cermont
      
      Hola ${name},
      
      Recibimos una solicitud para resetear tu contraseña.
      
      Usa este link para crear una nueva contraseña:
      ${resetLink}
      
      Este link expira en 1 hora.
      
      Si no solicitaste esto, ignora este mensaje.
      
      ---
      Sistema de Gestión Cermont
    `
  });
}

/**
 * Envía notificación de contraseña cambiada
 */
async sendPasswordChangedNotification(data: {
  to: string;
  name: string;
}): Promise<void> {
  const { to, name } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Contraseña Actualizada - Cermont</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <tr>
                <td style="background: linear-gradient(135deg, #0052CC 0%, #2E9B4A 100%); padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px;">
                    ✅ Contraseña Actualizada
                  </h1>
                </td>
              </tr>
              
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                    Hola <strong>${name}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 30px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Tu contraseña ha sido actualizada exitosamente. Por seguridad, 
                    todas tus sesiones activas han sido cerradas.
                  </p>
                  
                  <div style="background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 16px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #166534; font-size: 14px;">
                      ✅ <strong>Tu cuenta está segura</strong>
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Si no realizaste este cambio, contacta inmediatamente a soporte.
                  </p>
                </td>
              </tr>
              
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    <strong>Sistema de Gestión Cermont</strong>
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await this.transporter.sendMail({
    from: `"Cermont - Sistema de Gestión" <${process.env.SMTP_USER}>`,
    to,
    subject: '✅ Tu contraseña ha sido actualizada - Cermont',
    html,
    text: `
      Contraseña Actualizada - Cermont
      
      Hola ${name},
      
      Tu contraseña ha sido actualizada exitosamente.
      Todas tus sesiones activas han sido cerradas por seguridad.
      
      Si no realizaste este cambio, contacta a soporte inmediatamente.
      
      ---
      Sistema de Gestión Cermont
    `
  });
}
```

***

## **PASO 2.7: Crear Password Reset Controller**

**ARCHIVO:** `apps/api/src/auth/infrastructure/controllers/password-reset.controller.ts`

```typescript
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import { ForgotPasswordUseCase } from '@/auth/application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '@/auth/application/use-cases/reset-password.use-case';
import { ValidateResetTokenUseCase } from '@/auth/application/use-cases/validate-reset-token.use-case';
import {
  ForgotPasswordDto,
  ForgotPasswordDtoSchema,
  ResetPasswordDto,
  ResetPasswordDtoSchema,
  ValidateResetTokenDto,
  ValidateResetTokenDtoSchema
} from '../dtos/password-reset.dto';

@ApiTags('Auth - Password Reset')
@Controller('auth')
export class PasswordResetController {
  constructor(
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly validateResetTokenUseCase: ValidateResetTokenUseCase,
  ) {}

  /**
   * POST /api/auth/forgot-password
   * Envía email con link de reset de contraseña
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Solicitar reset de contraseña',
    description: 'Envía un email con link para resetear contraseña (válido por 1 hora)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email enviado (siempre retorna 200 por seguridad)',
    schema: {
      example: {
        message: 'Si el email existe, recibirás instrucciones para resetear tu contraseña'
      }
    }
  })
  async forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordDtoSchema)) dto: ForgotPasswordDto
  ) {
    return await this.forgotPasswordUseCase.execute(dto.email);
  }

  /**
   * POST /api/auth/validate-reset-token
   * Valida que el token sea válido antes de mostrar formulario
   */
  @Post('validate-reset-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validar token de reset',
    description: 'Verifica que el token sea válido y no haya expirado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token válido',
    schema: {
      example: {
        valid: true,
        email: 'usuario@ejemplo.com'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async validateResetToken(
    @Body(new ZodValidationPipe(ValidateResetTokenDtoSchema)) dto: ValidateResetTokenDto
  ) {
    return await this.validateResetTokenUseCase.execute(dto.token);
  }

  /**
   * POST /api/auth/reset-password
   * Resetea la contraseña usando el token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Resetear contraseña',
    description: 'Cambia la contraseña del usuario usando el token válido'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña actualizada',
    schema: {
      example: {
        message: 'Contraseña actualizada exitosamente'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordDtoSchema)) dto: ResetPasswordDto
  ) {
    return await this.resetPasswordUseCase.execute(dto.token, dto.newPassword);
  }
}
```

***

## **PASO 2.8: Actualizar Auth Module**

**ARCHIVO:** `apps/api/src/auth/auth.module.ts`

**ACCIÓN:** Agregar imports

```typescript
// Controllers
import { PasswordResetController } from './infrastructure/controllers/password-reset.controller';

// Use Cases
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';
import { ValidateResetTokenUseCase } from './application/use-cases/validate-reset-token.use-case';

@Module({
  controllers: [
    AuthController,
    Auth2FAController,
    PasswordResetController  // ✅ NUEVO
  ],
  providers: [
    // ... providers existentes ...
    
    // Password Reset ✅ NUEVO
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ValidateResetTokenUseCase,
  ],
  // ... exports ...
})
export class AuthModule {}
```

***

## **PASO 2.9: Crear Componente Forgot Password - Angular**

**ARCHIVO:** `apps/web/src/app/features/auth/components/forgot-password/forgot-password.component.ts`

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AntigravityBackgroundComponent } from '../../../../shared/components/antigravity-background/antigravity-background.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AntigravityBackgroundComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  forgotPasswordForm!: FormGroup;
  
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  isMobile = signal(false);

  ngOnInit(): void {
    this.initializeForm();
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  checkMobile(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  initializeForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email } = this.forgotPasswordForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al procesar solicitud');
        this.loading.set(false);
      }
    });
  }
}
```

***

**ARCHIVO:** `apps/web/src/app/features/auth/components/forgot-password/forgot-password.component.html`

```html
<!-- Background Antigravity -->
<div class="fixed inset-0 bg-gradient-to-br from-cermont-primary-50 via-white to-cermont-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
  <app-antigravity-background></app-antigravity-background>
</div>

<!-- Layout Responsive -->
<div class="relative min-h-screen flex items-center justify-center px-4">
  <div [class]="isMobile() ? 'w-full max-w-md' : 'w-full max-w-md'">
    <div class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden p-8 relative z-10">
      
      <!-- Logo -->
      <div class="flex items-center justify-center gap-3 mb-6">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cermont-primary-500 to-cermont-primary-700 shadow-lg">
          <span class="text-2xl font-bold text-white">C</span>
        </div>
        <span class="text-2xl font-bold bg-gradient-to-r from-cermont-primary-600 to-cermont-primary-800 dark:from-cermont-primary-400 dark:to-cermont-primary-600 bg-clip-text text-transparent">
          Cermont
        </span>
      </div>

      <!-- Título -->
      @if (!success()) {
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          ¿Olvidaste tu contraseña?
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6 text-center text-sm">
          Ingresa tu email y te enviaremos instrucciones para resetearla
        </p>
      } @else {
        <div class="text-center mb-6">
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Revisa tu email!
          </h1>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            Si tu email está registrado, recibirás instrucciones para resetear tu contraseña
          </p>
        </div>
      }

      <!-- Error Alert -->
      @if (error()) {
        <div class="alert-error mb-6 animate-fade-in">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span>{{ error() }}</span>
        </div>
      }

      <!-- Formulario -->
      @if (!success()) {
        <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="label">
              Correo Electrónico <span class="text-error-500">*</span>
            </label>
            <input
              type="email"
              formControlName="email"
              class="input"
              [class.input-error]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
              placeholder="usuario@ejemplo.com"
              autocomplete="email"
            />
            @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
              <p class="error-message">Ingresa un correo válido</p>
            }
          </div>

          <button type="submit" class="btn-primary w-full" [disabled]="forgotPasswordForm.invalid || loading()">
            @if (loading()) {
              <span class="spinner mr-2"></span>
              Enviando...
            } @else {
              Enviar Instrucciones
            }
          </button>
        </form>
      }

      <!-- Botón volver -->
      <div class="mt-6 text-center">
        <a routerLink="/auth/login" class="text-sm text-cermont-primary-600 dark:text-cermont-primary-400 hover:underline inline-flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Volver al login
        </a>
      </div>

    </div>
  </div>
</div>
```

***

## **PASO 2.10: Crear Componente Reset Password - Angular**

**ARCHIVO:** `apps/web/src/app/features/auth/components/reset-password/reset-password.component.ts`

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AntigravityBackgroundComponent } from '../../../../shared/components/antigravity-background/antigravity-background.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AntigravityBackgroundComponent],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  resetPasswordForm!: FormGroup;
  
  loading = signal(false);
  validating = signal(true);
  error = signal<string | null>(null);
  success = signal(false);
  isMobile = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  
  private token = signal<string | null>(null);

  ngOnInit(): void {
    this.initializeForm();
    this.checkMobile();
    this.validateToken();
    window.addEventListener('resize', () => this.checkMobile());
  }

  checkMobile(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  initializeForm(): void {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  validateToken(): void {
    const tokenParam = this.route.snapshot.queryParams['token'];
    
    if (!tokenParam) {
      this.error.set('Token no proporcionado');
      this.validating.set(false);
      return;
    }

    this.token.set(tokenParam);

    this.authService.validateResetToken(tokenParam).subscribe({
      next: () => {
        this.validating.set(false);
      },
      error: (err) => {
        this.error.set('Token inválido o expirado');
        this.validating.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid || !this.token()) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { newPassword } = this.resetPasswordForm.value;

    this.authService.resetPassword(this.token()!, newPassword).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al resetear contraseña');
        this.loading.set(false);
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword.update(v => !v);
    } else {
      this.showConfirmPassword.update(v => !v);
    }
  }
}
```

***


# TASK 2: Recuperación de Contraseña (Continuación)

## **PASO 2.11: Template HTML - Reset Password**

**ARCHIVO:** `apps/web/src/app/features/auth/components/reset-password/reset-password.component.html`

```html
<!-- Background Antigravity -->
<div class="fixed inset-0 bg-gradient-to-br from-cermont-primary-50 via-white to-cermont-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
  <app-antigravity-background></app-antigravity-background>
</div>

<!-- Layout Responsive -->
<div class="relative min-h-screen flex items-center justify-center px-4">
  <div class="w-full max-w-md">
    <div class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden p-8 relative z-10">
      
      <!-- Logo -->
      <div class="flex items-center justify-center gap-3 mb-6">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cermont-primary-500 to-cermont-primary-700 shadow-lg">
          <span class="text-2xl font-bold text-white">C</span>
        </div>
        <span class="text-2xl font-bold bg-gradient-to-r from-cermont-primary-600 to-cermont-primary-800 dark:from-cermont-primary-400 dark:to-cermont-primary-600 bg-clip-text text-transparent">
          Cermont
        </span>
      </div>

      <!-- Estado de validación -->
      @if (validating()) {
        <div class="text-center py-12">
          <div class="spinner mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Validando token...</p>
        </div>
      }

      <!-- Token inválido -->
      @else if (error() && !success()) {
        <div class="text-center">
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg class="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Link Inválido
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Este link ha expirado o no es válido. Solicita un nuevo link de recuperación.
          </p>
          <a routerLink="/auth/forgot-password" class="btn-primary inline-block">
            Solicitar Nuevo Link
          </a>
        </div>
      }

      <!-- Success -->
      @else if (success()) {
        <div class="text-center">
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Contraseña Actualizada!
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Tu contraseña ha sido cambiada exitosamente. Redirigiendo al login...
          </p>
          <div class="spinner mx-auto"></div>
        </div>
      }

      <!-- Formulario -->
      @else {
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Nueva Contraseña
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6 text-center text-sm">
          Ingresa tu nueva contraseña
        </p>

        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <!-- Nueva Contraseña -->
          <div>
            <label class="label">
              Nueva Contraseña <span class="text-error-500">*</span>
            </label>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="newPassword"
                class="input pr-10"
                [class.input-error]="resetPasswordForm.get('newPassword')?.invalid && resetPasswordForm.get('newPassword')?.touched"
                placeholder="••••••••"
                autocomplete="new-password"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility('password')"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                @if (showPassword()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
            @if (resetPasswordForm.get('newPassword')?.invalid && resetPasswordForm.get('newPassword')?.touched) {
              <p class="error-message">Mínimo 8 caracteres</p>
            }
          </div>

          <!-- Confirmar Contraseña -->
          <div>
            <label class="label">
              Confirmar Contraseña <span class="text-error-500">*</span>
            </label>
            <div class="relative">
              <input
                [type]="showConfirmPassword() ? 'text' : 'password'"
                formControlName="confirmPassword"
                class="input pr-10"
                [class.input-error]="resetPasswordForm.get('confirmPassword')?.invalid && resetPasswordForm.get('confirmPassword')?.touched"
                placeholder="••••••••"
                autocomplete="new-password"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility('confirm')"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                @if (showConfirmPassword()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
            @if (resetPasswordForm.errors?.['mismatch'] && resetPasswordForm.get('confirmPassword')?.touched) {
              <p class="error-message">Las contraseñas no coinciden</p>
            }
          </div>

          <!-- Requisitos de contraseña -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p class="text-xs text-blue-800 dark:text-blue-300 font-medium mb-2">La contraseña debe contener:</p>
            <ul class="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Al menos 8 caracteres</li>
              <li>• Una letra mayúscula</li>
              <li>• Una letra minúscula</li>
              <li>• Un número</li>
            </ul>
          </div>

          <button type="submit" class="btn-primary w-full" [disabled]="resetPasswordForm.invalid || loading()">
            @if (loading()) {
              <span class="spinner mr-2"></span>
              Actualizando...
            } @else {
              Actualizar Contraseña
            }
          </button>
        </form>

        <!-- Volver -->
        <div class="mt-6 text-center">
          <a routerLink="/auth/login" class="text-sm text-cermont-primary-600 dark:text-cermont-primary-400 hover:underline inline-flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Volver al login
          </a>
        </div>
      }

    </div>
  </div>
</div>
```

***

## **PASO 2.12: Actualizar Auth Service - Frontend**

**ARCHIVO:** `apps/web/src/app/core/services/auth.service.ts`

**ACCIÓN:** Agregar métodos de password reset

```typescript
/**
 * Solicita reset de contraseña
 */
forgotPassword(email: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(
    `${this.API_URL}/auth/forgot-password`,
    { email }
  ).pipe(
    catchError(error => {
      console.error('Error requesting password reset:', error);
      return throwError(() => error);
    })
  );
}

/**
 * Valida el token de reset
 */
validateResetToken(token: string): Observable<{ valid: boolean; email: string }> {
  return this.http.post<{ valid: boolean; email: string }>(
    `${this.API_URL}/auth/validate-reset-token`,
    { token }
  ).pipe(
    catchError(error => {
      console.error('Error validating reset token:', error);
      return throwError(() => error);
    })
  );
}

/**
 * Resetea la contraseña con el token
 */
resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
  return this.http.post<{ message: string }>(
    `${this.API_URL}/auth/reset-password`,
    { token, newPassword }
  ).pipe(
    catchError(error => {
      console.error('Error resetting password:', error);
      return throwError(() => error);
    })
  );
}
```

***

## **PASO 2.13: Actualizar Rutas - Frontend**

**ARCHIVO:** `apps/web/src/app/features/auth/auth.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => 
      import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => 
      import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => 
      import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'register',
    loadComponent: () => 
      import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
```

***

## **PASO 2.14: Actualizar Login - Link Forgot Password**

**ARCHIVO:** `apps/web/src/app/features/auth/components/login/login.component.html`

**ACCIÓN:** Buscar la sección de "Recordarme" y agregar el link

```html
<div class="flex items-center justify-between mb-6">
  <label class="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      formControlName="rememberMe"
      class="checkbox"
    />
    <span class="text-sm text-gray-700 dark:text-gray-300">Recordarme</span>
  </label>
  
  <!-- ✅ AGREGAR ESTE LINK -->
  <a 
    routerLink="/auth/forgot-password" 
    class="text-sm text-cermont-primary-600 dark:text-cermont-primary-400 hover:underline"
  >
    ¿Olvidaste tu contraseña?
  </a>
</div>
```

***

## **PASO 2.15: Agregar Variable de Entorno**

**ARCHIVO:** `apps/api/.env`

**ACCIÓN:** Agregar URL del frontend

```env
# Frontend URL (para links en emails)
FRONTEND_URL=http://localhost:4200
```

***

## **✅ CHECKLIST TASK 2**

- [ ] Actualizar Prisma schema con `PasswordResetToken`
- [ ] Ejecutar migración de base de datos
- [ ] Crear DTOs de password reset
- [ ] Crear use-case `ForgotPasswordUseCase`
- [ ] Crear use-case `ValidateResetTokenUseCase`
- [ ] Crear use-case `ResetPasswordUseCase`
- [ ] Actualizar `EmailService` con métodos de reset
- [ ] Crear controller `PasswordResetController`
- [ ] Actualizar `AuthModule` con providers
- [ ] Crear componente `ForgotPasswordComponent`
- [ ] Crear componente `ResetPasswordComponent`
- [ ] Actualizar frontend `AuthService`
- [ ] Actualizar rutas de auth
- [ ] Agregar link en login
- [ ] Agregar variable `FRONTEND_URL` en `.env`
- [ ] Testing manual completo

***

# TASK 3: Registro de Usuarios

## **📝 DESCRIPCIÓN**
Implementar componente completo de registro (SignUp) con diseño consistente al login.

## **🎯 OBJETIVO**
Usuario puede crear cuenta nueva desde el frontend con validación completa.

## **⏱️ TIEMPO ESTIMADO**
2 horas

***

## **PASO 3.1: Verificar Endpoint de Registro - Backend**

**ARCHIVO:** `apps/api/src/auth/application/use-cases/register.use-case.ts`

**VERIFICAR SI EXISTE**, si no existe, crear:

```typescript
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { EmailService } from '@/infrastructure/email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async execute(data: {
    name: string;
    email: string;
    password: string;
    company?: string;
  }): Promise<{ message: string; userId: string }> {
    const { name, email, password, company } = data;

    // 1. Verificar que el email no esté registrado
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Buscar rol "cliente" (o crear si no existe)
    let clientRole = await this.prisma.role.findFirst({
      where: { name: 'cliente' }
    });

    if (!clientRole) {
      clientRole = await this.prisma.role.create({
        data: {
          name: 'cliente',
          description: 'Cliente del sistema',
          isActive: true
        }
      });
    }

    // 4. Crear usuario
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        company,
        isActive: true,
        twoFactorEnabled: false,
        roles: {
          create: {
            role: {
              connect: { id: clientRole.id }
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    // 5. Enviar email de bienvenida
    await this.emailService.sendWelcomeEmail({
      to: user.email,
      name: user.name
    });

    return {
      message: 'Usuario registrado exitosamente',
      userId: user.id
    };
  }
}
```

***

## **PASO 3.2: Crear DTO de Registro**

**ARCHIVO:** `apps/api/src/auth/infrastructure/dtos/register.dto.ts`

```typescript
import { z } from 'zod';

export const RegisterDtoSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z.string()
    .email('Email inválido'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  
  company: z.string()
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres')
    .optional()
});

export type RegisterDto = z.infer<typeof RegisterDtoSchema>;
```

***

## **PASO 3.3: Agregar Endpoint en Auth Controller**

**ARCHIVO:** `apps/api/src/auth/infrastructure/controllers/auth.controller.ts`

**ACCIÓN:** Agregar el siguiente endpoint

```typescript
import { RegisterUseCase } from '@/auth/application/use-cases/register.use-case';
import { RegisterDto, RegisterDtoSchema } from '../dtos/register.dto';

// Dentro de la clase AuthController:

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
@Post('register')
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ 
  summary: 'Registrar nuevo usuario',
  description: 'Crea una cuenta nueva de usuario con rol de cliente'
})
@ApiResponse({ 
  status: 201, 
  description: 'Usuario registrado exitosamente',
  schema: {
    example: {
      message: 'Usuario registrado exitosamente',
      userId: 'uuid-del-usuario'
    }
  }
})
@ApiResponse({ status: 409, description: 'El email ya está registrado' })
async register(
  @Body(new ZodValidationPipe(RegisterDtoSchema)) dto: RegisterDto
) {
  return await this.registerUseCase.execute(dto);
}
```

***

## **PASO 3.4: Actualizar Auth Module**

**ARCHIVO:** `apps/api/src/auth/auth.module.ts`

**ACCIÓN:** Agregar `RegisterUseCase` a providers

```typescript
import { RegisterUseCase } from './application/use-cases/register.use-case';

@Module({
  providers: [
    // ... otros providers ...
    RegisterUseCase,  // ✅ AGREGAR
  ],
  // ...
})
export class AuthModule {}
```

***

## **PASO 3.5: Crear Email de Bienvenida**

**ARCHIVO:** `apps/api/src/infrastructure/email/email.service.ts`

**ACCIÓN:** Agregar método

```typescript
/**
 * Envía email de bienvenida a nuevo usuario
 */
async sendWelcomeEmail(data: {
  to: string;
  name: string;
}): Promise<void> {
  const { to, name } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bienvenido a Cermont</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header con gradiente -->
              <tr>
                <td style="background: linear-gradient(135deg, #0052CC 0%, #2E9B4A 100%); padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                    ¡Bienvenido a Cermont!
                  </h1>
                </td>
              </tr>
              
              <!-- Contenido -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #374151; font-size: 18px;">
                    Hola <strong>${name}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 30px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    ¡Gracias por registrarte en <strong>Cermont</strong>! Tu cuenta ha sido creada exitosamente.
                  </p>
                  
                  <!-- Características -->
                  <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 18px;">¿Qué puedes hacer ahora?</h2>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #6b7280; font-size: 14px; line-height: 2;">
                      <li>✅ Crear y gestionar órdenes de trabajo</li>
                      <li>📊 Visualizar reportes detallados</li>
                      <li>📋 Hacer seguimiento en tiempo real</li>
                      <li>🔐 Configurar autenticación de dos factores</li>
                    </ul>
                  </div>
                  
                  <!-- Botón CTA -->
                  <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td align="center" style="padding: 0;">
                        <a href="${process.env.FRONTEND_URL}/auth/login" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #0052CC 0%, #2E9B4A 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          Iniciar Sesión
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 30px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                    Si necesitas ayuda, no dudes en contactarnos.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    <strong>Sistema de Gestión Cermont</strong>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    Gestión integral de mantenimiento industrial y refrigeración
                  </p>
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await this.transporter.sendMail({
    from: `"Cermont - Sistema de Gestión" <${process.env.SMTP_USER}>`,
    to,
    subject: '🎉 ¡Bienvenido a Cermont!',
    html,
    text: `
      ¡Bienvenido a Cermont!
      
      Hola ${name},
      
      ¡Gracias por registrarte! Tu cuenta ha sido creada exitosamente.
      
      Ahora puedes:
      - Crear y gestionar órdenes de trabajo
      - Visualizar reportes detallados
      - Hacer seguimiento en tiempo real
      - Configurar autenticación de dos factores
      
      Inicia sesión en: ${process.env.FRONTEND_URL}/auth/login
      
      ---
      Sistema de Gestión Cermont
    `
  });
}
```

***

## **PASO 3.6: Crear Componente Register - Angular**

**ARCHIVO:** `apps/web/src/app/features/auth/components/register/register.component.ts`

```typescript
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AntigravityBackgroundComponent } from '../../../../shared/components/antigravity-background/antigravity-background.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AntigravityBackgroundComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm!: FormGroup;
  
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  isMobile = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  ngOnInit(): void {
    this.initializeForm();
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
  }

  checkMobile(): void {
    this.isMobile.set(window.innerWidth < 768);
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      company: [''],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { name, email, password, company } = this.registerForm.value;

    this.authService.register({ name, email, password, company }).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/auth/login'], {
            queryParams: { registered: 'true' }
          });
        }, 3000);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al registrar usuario');
        this.loading.set(false);
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword.update(v => !v);
    } else {
      this.showConfirmPassword.update(v => !v);
    }
  }
}
```

***

## **PASO 3.7: Template HTML - Register Component**

**ARCHIVO:** `apps/web/src/app/features/auth/components/register/register.component.html`

```html
<!-- Background Antigravity -->
<div class="fixed inset-0 bg-gradient-to-br from-cermont-primary-50 via-white to-cermont-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
  <app-antigravity-background></app-antigravity-background>
</div>

<!-- Layout Responsive -->
<div class="relative min-h-screen flex items-center justify-center px-4 py-8">
  <div class="w-full max-w-md">
    <div class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden p-8 relative z-10">
      
      <!-- Logo -->
      <div class="flex items-center justify-center gap-3 mb-6">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cermont-primary-500 to-cermont-primary-700 shadow-lg">
          <span class="text-2xl font-bold text-white">C</span>
        </div>
        <span class="text-2xl font-bold bg-gradient-to-r from-cermont-primary-600 to-cermont-primary-800 dark:from-cermont-primary-400 dark:to-cermont-primary-600 bg-clip-text text-transparent">
          Cermont
        </span>
      </div>

      <!-- Success State -->
      @if (success()) {
        <div class="text-center">
          <div class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Cuenta Creada!
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            Tu cuenta ha sido creada exitosamente. Redirigiendo al login...
          </p>
          <div class="spinner mx-auto"></div>
        </div>
      }

      <!-- Formulario -->
      @else {
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Crear Cuenta
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-6 text-center text-sm">
          Completa el formulario para registrarte
        </p>

        <!-- Error Alert -->
        @if (error()) {
          <div class="alert-error mb-6 animate-fade-in">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span>{{ error() }}</span>
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          
          <!-- Nombre Completo -->
          <div>
            <label class="label">
              Nombre Completo <span class="text-error-500">*</span>
            </label>
            <input
              type="text"
              formControlName="name"
              class="input"
              [class.input-error]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
              placeholder="Juan Pérez"
              autocomplete="name"
            />
            @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
              <p class="error-message">Ingresa tu nombre completo (mínimo 2 caracteres)</p>
            }
          </div>

          <!-- Email -->
          <div>
            <label class="label">
              Correo Electrónico <span class="text-error-500">*</span>
            </label>
            <input
              type="email"
              formControlName="email"
              class="input"
              [class.input-error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              placeholder="usuario@ejemplo.com"
              autocomplete="email"
            />
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <p class="error-message">Ingresa un correo válido</p>
            }
          </div>

          <!-- Empresa (Opcional) -->
          <div>
            <label class="label">
              Empresa <span class="text-gray-400 text-xs">(Opcional)</span>
            </label>
            <input
              type="text"
              formControlName="company"
              class="input"
              placeholder="Mi Empresa S.A."
              autocomplete="organization"
            />
          </div>

          <!-- Contraseña -->
          <div>
            <label class="label">
              Contraseña <span class="text-error-500">*</span>
            </label>
            <div class="relative">
              <input
                [type]="showPassword() ? 'text' : 'password'"
                formControlName="password"
                class="input pr-10"
                [class.input-error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                placeholder="••••••••"
                autocomplete="new-password"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility('password')"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                @if (showPassword()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <p class="error-message">Mínimo 8 caracteres</p>
            }
          </div>

          <!-- Confirmar Contraseña -->
          <div>
            <label class="label">
              Confirmar Contraseña <span class="text-error-500">*</span>
            </label>
            <div class="relative">
              <input
                [type]="showConfirmPassword() ? 'text' : 'password'"
                formControlName="confirmPassword"
                class="input pr-10"
                [class.input-error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                placeholder="••••••••"
                autocomplete="new-password"
              />
              <button
                type="button"
                (click)="togglePasswordVisibility('confirm')"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                @if (showConfirmPassword()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                }
              </button>
            </div>
            @if (registerForm.errors?.['mismatch'] && registerForm.get('confirmPassword')?.touched) {
              <p class="error-message">Las contraseñas no coinciden</p>
            }
          </div>

          <!-- Términos y Condiciones -->
          <div>
            <label class="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                formControlName="acceptTerms"
                class="checkbox mt-1"
              />
              <span class="text-sm text-gray-700 dark:text-gray-300">
                Acepto los 
                <a href="#" class="text-cermont-primary-600 dark:text-cermont-primary-400 hover:underline">términos y condiciones</a>
                y la 
                <a href="#" class="text-cermont-primary-600 dark:text-cermont-primary-400 hover:underline">política de privacidad</a>
              </span>
            </label>
            @if (registerForm.get('acceptTerms')?.invalid && registerForm.get('acceptTerms')?.touched) {
              <p class="error-message">Debes aceptar los términos y condiciones</p>
            }
          </div>

          <!-- Botón Submit -->
          <button type="submit" class="btn-primary w-full" [disabled]="registerForm.invalid || loading()">
            @if (loading()) {
              <span class="spinner mr-2"></span>
              Creando cuenta...
            } @else {
              Crear Cuenta
            }
          </button>
        </form>

        <!-- Link a Login -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?
            <a routerLink="/auth/login" class="text-cermont-primary-600 dark:text-cermont-primary-400 hover:underline font-medium ml-1">
              Inicia sesión
            </a>
          </p>
        </div>
      }

    </div>
  </div>
</div>
```

***

## **PASO 3.8: Actualizar Auth Service - Frontend**

**ARCHIVO:** `apps/web/src/app/core/services/auth.service.ts`

**ACCIÓN:** Agregar método de registro

```typescript
/**
 * Registra un nuevo usuario
 */
register(data: {
  name: string;
  email: string;
  password: string;
  company?: string;
}): Observable<{ message: string; userId: string }> {
  return this.http.post<{ message: string; userId: string }>(
    `${this.API_URL}/auth/register`,
    data
  ).pipe(
    catchError(error => {
      console.error('Error registering user:', error);
      return throwError(() => error);
    })
  );
}
```

***

## **PASO 3.9: Actualizar Login - Link a Registro**

**ARCHIVO:** `apps/web/src/app/features/auth/components/login/login.component.html`

**ACCIÓN:** Al final del formulario, agregar

```html
<!-- Link a Registro -->
<div class="mt-6 text-center">
  <p class="text-sm text-gray-600 dark:text-gray-400">
    ¿No tienes cuenta?
    <a routerLink="/auth/register" class="text-cermont-primary-600 dark:text-cermont-primary-400 hover:underline font-medium ml-1">
      Regístrate aquí
    </a>
  </p>
</div>
```

***

## **✅ CHECKLIST TASK 3**

- [ ] Verificar/crear `RegisterUseCase` en backend
- [ ] Crear DTO `RegisterDto`
- [ ] Agregar endpoint `POST /auth/register`
- [ ] Actualizar `AuthModule` con `RegisterUseCase`
- [ ] Crear método `sendWelcomeEmail` en `EmailService`
- [ ] Crear componente `RegisterComponent`
- [ ] Crear template HTML del registro
- [ ] Agregar método `register()` en `AuthService`
- [ ] Agregar link "Regístrate" en login
- [ ] Testing manual completo

***

# TASK 4: Dependencias Faltantes

## **📝 DESCRIPCIÓN**
Instalar dependencias npm faltantes que causan errores de build (Issue #5).

## **🎯 OBJETIVO**
Resolver errores de TypeScript por módulos no encontrados.

## **⏱️ TIEMPO ESTIMADO**
15 minutos

***

## **PASO 4.1: Instalar Dependencias**

**EJECUTAR:**

```bash
cd apps/api

# Dependencias de producción
pnpm add file-type@19.0.0
pnpm add sanitize-filename@1.6.3
pnpm add ioredis@5.3.2
pnpm add rate-limit-redis@4.2.0

# Dependencias de desarrollo
pnpm add -D @types/sanitize-filename@2.0.3
```

***

## **PASO 4.2: Verificar Build**

```bash
pnpm run build
```

**VERIFICAR:** No debe haber errores de módulos no encontrados.

***

## **✅ CHECKLIST TASK 4**

- [ ] Instalar `file-type`
- [ ] Instalar `sanitize-filename`
- [ ] Instalar `ioredis`
- [ ] Instalar `rate-limit-redis`
- [ ] Instalar `@types/sanitize-filename`
- [ ] Ejecutar build exitosamente

***

# TASK 5: Endpoint WorkPlans

## **📝 DESCRIPCIÓN**
Implementar endpoint completo `/api/workplans` con CRUD (Issue #2).

## **🎯 OBJETIVO**
Dashboard puede cargar planes de trabajo sin error 404.

## **⏱️ TIEMPO ESTIMADO**
4-5 horas

***

## **PASO 5.1: Actualizar Prisma Schema**

**ARCHIVO:** `apps/api/prisma/schema.prisma`

**VERIFICAR SI EXISTE**, si no, agregar:

```prisma
model WorkPlan {
  id              String    @id @default(uuid())
  orderId         String
  status          WorkPlanStatus @default(DRAFT)
  scheduleDate    DateTime
  completionDate  DateTime?
  createdBy       String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  order           Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  creator         User      @relation(fields: [createdBy], references: [id])
  activities      Activity[]
  tools           WorkPlanTool[]
  equipment       WorkPlanEquipment[]
  personnel       WorkPlanPersonnel[]

  @@index([orderId])
  @@index([status])
  @@index([createdBy])
  @@map("work_plans")
}

enum WorkPlanStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model Activity {
  id          String   @id @default(uuid())
  workPlanId  String
  description String
  status      ActivityStatus @default(PENDING)
  order       Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workPlan    WorkPlan @relation(fields: [workPlanId], references: [id], onDelete: Cascade)

  @@index([workPlanId])
  @@map("activities")
}

enum ActivityStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

model WorkPlanTool {
  id         String   @id @default(uuid())
  workPlanId String
  name       String
  quantity   Int
  createdAt  DateTime @default(now())

  workPlan   WorkPlan @relation(fields: [workPlanId], references: [id], onDelete: Cascade)

  @@index([workPlanId])
  @@map("work_plan_tools")
}

model WorkPlanEquipment {
  id         String   @id @default(uuid())
  workPlanId String
  name       String
  model      String?
  createdAt  DateTime @default(now())

  workPlan   WorkPlan @relation(fields: [workPlanId], references: [id], onDelete: Cascade)

  @@index([workPlanId])
  @@map("work_plan_equipment")
}

model WorkPlanPersonnel {
  id         String   @id @default(uuid())
  workPlanId String
  userId     String
  role       String
  createdAt  DateTime @default(now())

  workPlan   WorkPlan @relation(fields: [workPlanId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id])

  @@index([workPlanId])
  @@index([userId])
  @@map("work_plan_personnel")
}

// Agregar al modelo User:
model User {
  // ... campos existentes ...
  
  workPlans          WorkPlan[]
  workPlanAssignments WorkPlanPersonnel[]
  
  // ... resto ...
}

// Agregar al modelo Order:
model Order {
  // ... campos existentes ...
  
  workPlans WorkPlan[]
  
  // ... resto ...
}
```

**EJECUTAR:**
```bash
cd apps/api
pnpm prisma format
pnpm prisma migrate dev --name add-workplans
pnpm prisma generate
```

***

## **PASO 5.2: Crear DTOs de WorkPlans**

**ARCHIVO:** `apps/api/src/workplans/infrastructure/dtos/workplan.dto.ts`

```typescript
import { z } from 'zod';

// ===========================
// DTO: Crear WorkPlan
// ===========================
export const CreateWorkPlanDtoSchema = z.object({
  orderId: z.string().uuid('ID de orden inválido'),
  scheduleDate: z.string().datetime('Fecha inválida'),
  activities: z.array(z.object({
    description: z.string().min(1, 'Descripción requerida'),
    order: z.number().int().positive()
  })).optional(),
  tools: z.array(z.object({
    name: z.string().min(1, 'Nombre requerido'),
    quantity: z.number().int().positive()
  })).optional(),
  equipment: z.array(z.object({
    name: z.string().min(1, 'Nombre requerido'),
    model: z.string().optional()
  })).optional(),
  personnel: z.array(z.object({
    userId: z.string().uuid('ID de usuario inválido'),
    role: z.string().min(1, 'Rol requerido')
  })).optional()
});

export type CreateWorkPlanDto = z.infer<typeof CreateWorkPlanDtoSchema>;

// ===========================
// DTO: Actualizar WorkPlan
// ===========================
export const UpdateWorkPlanDtoSchema = z.object({
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  scheduleDate: z.string().datetime().optional(),
  completionDate: z.string().datetime().optional(),
  activities: z.array(z.object({
    description: z.string().min(1),
    order: z.number().int().positive()
  })).optional(),
  tools: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().int().positive()
  })).optional(),
  equipment: z.array(z.object({
    name: z.string().min(1),
    model: z.string().optional()
  })).optional(),
  personnel: z.array(z.object({
    userId: z.string().uuid(),
    role: z.string().min(1)
  })).optional()
});

export type UpdateWorkPlanDto = z.infer<typeof UpdateWorkPlanDtoSchema>;

// ===========================
// DTO: Query Filters
// ===========================
export const WorkPlanQueryDtoSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  orderId: z.string().uuid().optional()
});

export type WorkPlanQueryDto = z.infer<typeof WorkPlanQueryDtoSchema>;
```

***

Perfecto, ahora entiendo la estructura. El schema de Prisma está **modularizado en archivos separados** dentro de la carpeta `apps/api/prisma/schema/`. Voy a ajustar el plan para que las modificaciones se hagan en los archivos correctos.

# 🔄 PLAN ACTUALIZADO - ESTRUCTURA MODULAR PRISMA

## **📁 ESTRUCTURA DETECTADA**

```
apps/api/prisma/
├── schema/
│   ├── schema.prisma          # Archivo base (config generator/datasource)
│   ├── auth.prisma            # Modelos de autenticación
│   ├── planning.prisma        # Modelos de planeación
│   ├── execution.prisma       # Modelos de ejecución
│   ├── orders.prisma          # Modelos de órdenes
│   ├── enums.prisma           # Enumeraciones
│   ├── forms.prisma           # Formularios
│   ├── checklists.prisma      # Checklists
│   ├── closing.prisma         # Cierre administrativo
│   └── ...otros archivos...
└── migrations/
```

***

# TASK 1: Sistema 2FA (ACTUALIZADO)

## **PASO 1.1: Agregar Modelo TwoFactorToken**

**ARCHIVO:** `apps/api/prisma/schema/auth.prisma`

**ACCIÓN:** Agregar al final del archivo (después del modelo `AuditLog`)

```prisma
model TwoFactorToken {
  id        String    @id @default(uuid())
  userId    String
  code      String    // Código de 6 dígitos
  expiresAt DateTime  // Expira en 5 minutos
  verified  Boolean   @default(false)
  verifiedAt DateTime?
  attempts  Int       @default(0)
  ipAddress String?
  createdAt DateTime  @default(now())

  user User @relation("UserTwoFactorTokens", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([code])
  @@index([expiresAt])
  @@map("two_factor_tokens")
}
```

## **PASO 1.2: Agregar Relación en User**

**ARCHIVO:** `apps/api/prisma/schema/auth.prisma`

**ACCIÓN:** Dentro del modelo `User`, agregar en la sección de relaciones de autenticación:

```prisma
model User {
  // ... campos existentes ...

  // Relaciones de autenticación
  refreshTokens        RefreshToken[]
  passwordResetTokens  PasswordResetToken[]
  twoFactorTokens      TwoFactorToken[]     @relation("UserTwoFactorTokens")  // ✅ AGREGAR
  auditLogs            AuditLog[]

  // ... resto del modelo ...
}
```

## **PASO 1.3: Ejecutar Migración**

```bash
cd apps/api
pnpm prisma migrate dev --name add_two_factor_token
pnpm prisma generate
```

***

# TASK 2: Password Reset (ACTUALIZADO)

## **PASO 2.1: Verificar Modelo Existente**

El modelo `PasswordResetToken` **YA EXISTE** en `auth.prisma`. ✅

**NO REQUIERE CAMBIOS EN SCHEMA.**

Solo necesitas implementar:
- DTOs de forgot-password
- Use cases (ForgotPasswordUseCase, ValidateResetTokenUseCase, ResetPasswordUseCase)
- Métodos de email
- Controller endpoints
- Componentes frontend

***

# TASK 5: WorkPlan CRUD (ACTUALIZADO)

## **PASO 5.1: Agregar Enums de WorkPlan**

**ARCHIVO:** `apps/api/prisma/schema/enums.prisma`

**ACCIÓN:** Agregar al final del archivo

```prisma
enum WorkPlanStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum ActivityStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  SKIPPED
}
```

## **PASO 5.2: Crear Modelos de WorkPlan**

**ARCHIVO:** `apps/api/prisma/schema/planning.prisma`

**ACCIÓN:** Agregar al final del archivo (después de `ItemPlaneacion`)

```prisma
// ============================================
// PLANES DE TRABAJO (WORKPLANS)
// ============================================

model WorkPlan {
  id             String         @id @default(uuid())
  orderId        String
  status         WorkPlanStatus @default(DRAFT)
  scheduleDate   DateTime
  completionDate DateTime?
  createdBy      String
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  order          Order          @relation("OrderWorkPlans", fields: [orderId], references: [id], onDelete: Cascade)
  creator        User           @relation("WorkPlanCreator", fields: [createdBy], references: [id], onDelete: Restrict)
  
  activities     Activity[]
  tools          WorkPlanTool[]
  equipment      WorkPlanEquipment[]
  personnel      WorkPlanPersonnel[]

  @@index([orderId])
  @@index([status])
  @@index([scheduleDate])
  @@index([createdBy])
  @@map("work_plans")
}

model Activity {
  id          String         @id @default(uuid())
  workPlanId  String
  description String
  status      ActivityStatus @default(PENDING)
  order       Int
  completedAt DateTime?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  workPlan    WorkPlan       @relation(fields: [workPlanId], references: [id], onDelete: Cascade)

  @@index([workPlanId])
  @@index([status])
  @@map("activities")
}

model WorkPlanTool {
  id         String   @id @default(uuid())
  workPlanId String
  name       String
  quantity   Int      @default(1)
  createdAt  DateTime @default(now())

  workPlan   WorkPlan @relation(fields: [workPlanId], references: [id], onDelete: Cascade)

  @@index([workPlanId])
  @@map("work_plan_tools")
}

model WorkPlanEquipment {
  id         String   @id @default(uuid())
  workPlanId String
  name       String
  model      String?
  createdAt  DateTime @default(now())

  workPlan   WorkPlan @relation(fields: [workPlanId], references: [id], onDelete: Cascade)

  @@index([workPlanId])
  @@map("work_plan_equipment")
}

model WorkPlanPersonnel {
  id         String   @id @default(uuid())
  workPlanId String
  userId     String
  role       String
  createdAt  DateTime @default(now())

  workPlan   WorkPlan @relation(fields: [workPlanId], references: [id], onDelete: Cascade)
  user       User     @relation("WorkPlanPersonnel", fields: [userId], references: [id], onDelete: Cascade)

  @@index([workPlanId])
  @@index([userId])
  @@map("work_plan_personnel")
}
```

## **PASO 5.3: Agregar Relaciones en Order y User**

**ARCHIVO:** `apps/api/prisma/schema/orders.prisma`

**ACCIÓN:** Dentro del modelo `Order`, agregar en las relaciones:

```prisma
model Order {
  // ... campos existentes ...

  // Relaciones
  client                Client?              @relation(fields: [clientId], references: [id], onDelete: Cascade)
  creator               User?                @relation("OrderCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  assignee              User?                @relation("OrderAssignee", fields: [assignedTo], references: [id], onDelete: SetNull)
  canceller             User?                @relation("OrderCanceller", fields: [cancelledBy], references: [id], onDelete: SetNull)
  
  workPlans             WorkPlan[]           @relation("OrderWorkPlans")  // ✅ AGREGAR

  // ... resto de relaciones ...
}
```

**ARCHIVO:** `apps/api/prisma/schema/auth.prisma`

**ACCIÓN:** Dentro del modelo `User`, agregar en las relaciones de planeación:

```prisma
model User {
  // ... campos existentes ...

  // Relaciones de planeación
  planeacionesAprobadas   Planeacion[]      @relation("PlaneacionAprobador")
  planeacionesRechazadas  Planeacion[]      @relation("PlaneacionRechazador")
  planeacionesCreadas     Planeacion[]      @relation("PlaneacionCreador")
  workPlansCreados        WorkPlan[]        @relation("WorkPlanCreator")        // ✅ AGREGAR
  workPlansPersonnel      WorkPlanPersonnel[] @relation("WorkPlanPersonnel")    // ✅ AGREGAR

  // ... resto del modelo ...
}
```

## **PASO 5.4: Ejecutar Migración**

```bash
cd apps/api
pnpm prisma migrate dev --name add_workplans
pnpm prisma generate
```

***

# 📊 RESUMEN DE CAMBIOS EN PRISMA

| Archivo | Cambios |
|---------|---------|
| **auth.prisma** | ✅ Agregar `TwoFactorToken` model<br>✅ Agregar relación `twoFactorTokens` en User<br>✅ Agregar relaciones `workPlansCreados` y `workPlansPersonnel` en User |
| **enums.prisma** | ✅ Agregar enum `WorkPlanStatus`<br>✅ Agregar enum `ActivityStatus` |
| **planning.prisma** | ✅ Agregar modelos `WorkPlan`, `Activity`, `WorkPlanTool`, `WorkPlanEquipment`, `WorkPlanPersonnel` |
| **orders.prisma** | ✅ Agregar relación `workPlans` en Order |

***

# 🚀 COMANDOS DE MIGRACIÓN FINALES

```bash
# 1. Aplicar cambios de 2FA
cd apps/api
pnpm prisma migrate dev --name add_two_factor_token
pnpm prisma generate

# 2. Aplicar cambios de WorkPlans
pnpm prisma migrate dev --name add_workplans
pnpm prisma generate

# 3. Rebuild
pnpm run build
pnpm run start:dev
```

***

# ✅ CHECKLIST ACTUALIZADO

## **TASK 1: 2FA**
- [ ] Agregar modelo `TwoFactorToken` en `auth.prisma`
- [ ] Agregar relación en modelo `User`
- [ ] Ejecutar migración `add_two_factor_token`
- [ ] Implementar DTOs y use cases (código backend permanece igual)
- [ ] Implementar componentes frontend (código permanece igual)

## **TASK 2: Password Reset**
- [ ] ✅ Modelo `PasswordResetToken` ya existe
- [ ] Implementar DTOs y use cases (código permanece igual)
- [ ] Implementar componentes frontend (código permanece igual)

## **TASK 5: WorkPlans**
- [ ] Agregar enums en `enums.prisma`
- [ ] Agregar modelos en `planning.prisma`
- [ ] Agregar relación en `orders.prisma`
- [ ] Agregar relaciones en `auth.prisma` (User)
- [ ] Ejecutar migración `add_workplans`
- [ ] Implementar repository, use cases, controller (código permanece igual)

***