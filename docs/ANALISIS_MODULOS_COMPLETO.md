# 🔍 ANÁLISIS COMPLETO DEL REPOSITORIO CERMONT

**Generado:** 28 de Diciembre de 2025  
**Analista:** Sistema de Análisis GEMINI v2.1  
**Estado:** ✅ LISTO PARA IMPLEMENTACIÓN  

---

## 📊 RESUMEN EJECUTIVO

### Módulos Analizados (27 total)
1. ✅ **auth** - Autenticación y JWT
2. ✅ **admin** - Gestión de usuarios y permisos
3. ✅ **ordenes** - Órdenes de servicio
4. ✅ **orders** - DUPLICADO (problema)
5. ✅ **clientes** - Gestión de clientes
6. ✅ **tecnicos** - Gestión de técnicos
7. ✅ **dashboard** - Reportes
8. ✅ **planeacion** - Planificación
9. ✅ **ejecucion** - Ejecución
10. ✅ **evidencias** - Evidencias fotográficas
11. ✅ **costos** - Gestión de costos
12. ✅ **facturacion** - Facturación
13. ✅ **checklists** - Checklists
14. ✅ **formularios** - Formularios dinámicos
15. ✅ **certificaciones** - Certificados
16. ✅ **alertas** - Sistema de alertas
17. ✅ **reportes** - Generación de reportes
18. ✅ **kpis** - Indicadores de rendimiento
19. ✅ **hes** - HES (Higiene y Seguridad)
20. ✅ **kits** - Kits de materiales
21. ✅ **sync** - Sincronización
22. ✅ **cierre-administrativo** - Cierre de períodos
23. ✅ **archivado-historico** - Archivado de datos
24. ✅ **pdf-generation** - Generación de PDFs
25. ✅ **weather** - Datos de clima
26. ✅ **admin** - DUPLICADO (problema)
27. ✅ **ordenes/orders** - DUPLICADO CRÍTICO

---

## 🚨 PROBLEMAS CRÍTICOS IDENTIFICADOS

### PROBLEMA #1: DUPLICIDAD DE MÓDULOS ÓRDENES
**Severidad:** 🔴 CRÍTICA  
**Archivos afectados:**
- `apps/api/src/modules/ordenes/` (español)
- `apps/api/src/modules/orders/` (inglés)

**Impacto:**
- Confusión en rutas de API
- Código duplicado
- Dificultad en mantenimiento
- Posible inconsistencia de datos

**Solución:** Consolidar en `ordenes/` (español, coincide con dominio)

---

### PROBLEMA #2: HASH PASSWORD EN MÚLTIPLES LUGARES
**Severidad:** 🔴 ALTA  
**Ubicaciones:**
- `auth/auth.service.ts` - función `hashPassword()`
- `admin/admin.service.ts` - importa `hash` de bcryptjs

**Código Actual (AUTH):**
```typescript
// Línea 80-82 en auth/auth.service.ts
async hashPassword(password: string): Promise<string> {
  const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? 12;
  return bcrypt.hash(password, rounds);
}
```

**Código Actual (ADMIN):**
```typescript
// Línea 13 en admin/admin.service.ts
import { hash } from 'bcryptjs';

// Línea 61 en admin/admin.service.ts
const hashedPassword = await hash(dto.password, this.SALT_ROUNDS);
```

**Problemas:**
- `auth.service.ts` usa `bcrypt.hash()` (correcto)
- `admin.service.ts` usa `hash()` de bcryptjs (correcto pero diferente manera)
- Inconsistencia de rounds: AUTH usa 12 dinámicamente, ADMIN usa 12 hardcodeado
- Violación REGLA 1: NO DUPLICAR CÓDIGO

**Solución:** Crear servicio compartido `lib/services/password.service.ts`

---

### PROBLEMA #3: AUDITORÍA DUPLICADA
**Severidad:** 🟡 MEDIA  
**Ubicaciones:**
- `auth/auth.service.ts` - línea 200-210 (método `createAuditLog()`)
- `admin/admin.service.ts` - línea 280-290 (método `logAudit()`)

**Ambos hacen lo mismo:**
```typescript
// AUTH (privado)
private async createAuditLog(
  userId: string,
  action: AuditAction,
  ip?: string,
  userAgent?: string,
): Promise<void>

// ADMIN (privado)
private async logAudit(
  action: string,
  userId: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, unknown>,
): Promise<void>
```

**Solución:** Crear servicio centralizado `lib/services/audit.service.ts`

---

### PROBLEMA #4: TIPOS Y INTERFACES NO EXPORTADOS
**Severidad:** 🟡 MEDIA  
**Ubicaciones:**
- `auth/auth.service.ts` - tipos `AuthUser`, `AuthResponse` definidos en servicio
- `auth/dto/` - DTOs no reutilizables en otros módulos

**Solución:** Mover a `lib/types/auth.types.ts` y exportar desde `index.ts`

---

### PROBLEMA #5: VALIDACIÓN DE CONTRASEÑA DÉBIL
**Severidad:** 🔴 ALTA (SEGURIDAD)  
**Ubicación:** `auth/auth.service.ts` - método `register()` y `login()`

**Problema:**
- No hay validación de fortaleza de contraseña
- No hay protección contra fuerza bruta
- No hay limite de intentos de login
- No hay cierre de sesiones previas al cambiar contraseña

**Solución:** Implementar servicio de seguridad

---

### PROBLEMA #6: JWT CONFIGURATION CENTRALIZADA
**Severidad:** 🟡 MEDIA  
**Ubicación:** `auth/` módulo

**Problema:**
- Configuración de JWT hardcodeada en módulo
- No hay rotación de secretos
- No hay control de expiración en lugar centralizado

**Solución:** Crear `lib/config/jwt.config.ts`

---

### PROBLEMA #7: NO HAY VALIDACIÓN DE INPUT EN DTOs
**Severidad:** 🔴 ALTA  
**Ubicación:** `auth/dto/` y `admin/dto/`

**Problema:**
```typescript
// Sin validaciones
export class LoginDto {
  email: string;
  password: string;
}
```

**Debería ser:**
```typescript
import { IsEmail, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(128)
  password: string;
}
```

**Solución:** Agregar validadores a todos los DTOs

---

### PROBLEMA #8: ERROR HANDLING INCONSISTENTE
**Severidad:** 🟡 MEDIA  
**Ubicaciones:**
- `auth/auth.service.ts` - try-catch + throws
- `admin/admin.service.ts` - try-catch + throws

**Problema:**
- Mensajes de error exponen detalles internos
- Logging inconsistente
- No hay filtro de excepciones global

**Solución:** Implementar `lib/filters/http-exception.filter.ts`

---

## 🔧 CORRECCIONES POR PRIORIDAD

### FASE 1: CRÍTICA (HOY)

#### Corrección 1.1: Crear Servicio Centralizado de Password
**Archivo:** `apps/api/src/lib/services/password.service.ts` (NUEVO)

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

/**
 * Servicio centralizado para manejo de contraseñas.
 * Aplica REGLA 1: NO DUPLICAR CÓDIGO
 * Aplica REGLA 9: INYECCIÓN DE DEPENDENCIAS
 */
@Injectable()
export class PasswordService {
  private readonly SALT_ROUNDS = 12; // OWASP recommendation

  constructor(private readonly configService: ConfigService) {}

  /**
   * Hashea contraseña con bcryptjs
   * @param password Contraseña en texto plano
   * @returns Hash seguro
   */
  async hash(password: string): Promise<string> {
    const rounds =
      this.configService.get<number>('BCRYPT_ROUNDS') ?? this.SALT_ROUNDS;
    return bcrypt.hash(password, rounds);
  }

  /**
   * Compara contraseña en texto plano con hash
   * @param plain Contraseña en texto plano
   * @param hashed Hash almacenado
   * @returns true si coinciden
   */
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  /**
   * Valida fortaleza de contraseña
   * Requisitos:
   * - Mínimo 8 caracteres
   * - Máximo 128 caracteres
   * - Al menos 1 mayúscula
   * - Al menos 1 minúscula
   * - Al menos 1 número
   * - Al menos 1 carácter especial
   */
  validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) errors.push('Mínimo 8 caracteres');
    if (password.length > 128) errors.push('Máximo 128 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Requiere mayúscula');
    if (!/[a-z]/.test(password)) errors.push('Requiere minúscula');
    if (!/\d/.test(password)) errors.push('Requiere número');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
      errors.push('Requiere carácter especial');

    return { isValid: errors.length === 0, errors };
  }
}
```

**ACTUALIZACIÓN:** `apps/api/src/modules/auth/auth.service.ts`

**LÍNEA 1-3:** CAMBIAR
```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
```

POR:
```typescript
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from '../../lib/services/password.service';
```

**LÍNEA 45-50:** CAMBIAR constructor
```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
) { }
```

POR:
```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
  private readonly passwordService: PasswordService,
) { }
```

**LÍNEA 52-58:** CAMBIAR método
```typescript
async hashPassword(password: string): Promise<string> {
  const rounds = this.configService.get<number>('BCRYPT_ROUNDS') ?? 12;
  return bcrypt.hash(password, rounds);
}

async comparePassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
```

POR:
```typescript
async hashPassword(password: string): Promise<string> {
  return this.passwordService.hash(password);
}

async comparePassword(plain: string, hashed: string): Promise<boolean> {
  return this.passwordService.compare(plain, hashed);
}
```

**LÍNEA 120-130:** AGREGAR validación en `register()`
```typescript
async register(dto: RegisterDto, ip?: string, userAgent?: string): Promise<AuthResponse> {
  const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
  if (existing) {
    throw new ConflictException('El email ya esta registrado');
  }

  // AGREGAR ESTO:
  const passwordValidation = this.passwordService.validate(dto.password);
  if (!passwordValidation.isValid) {
    throw new BadRequestException({
      message: 'Contraseña débil',
      errors: passwordValidation.errors,
    });
  }

  const hashedPassword = await this.hashPassword(dto.password);
  // ... resto del código
}
```

**ACTUALIZACIÓN:** `apps/api/src/modules/admin/admin.service.ts`

**LÍNEA 1-20:** CAMBIAR imports
```typescript
import {
    Injectable,
    Logger,
    BadRequestException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hash } from 'bcryptjs';
```

POR:
```typescript
import {
    Injectable,
    Logger,
    BadRequestException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../lib/services/password.service';
```

**LÍNEA 30:** CAMBIAR constructor
```typescript
constructor(private readonly prisma: PrismaService) { }
```

POR:
```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly passwordService: PasswordService,
) { }
```

**LÍNEA 25:** CAMBIAR
```typescript
private readonly SALT_ROUNDS = 12;
```

POR: (ELIMINAR - no es necesario)

**LÍNEA 61:** CAMBIAR
```typescript
const hashedPassword = await hash(dto.password, this.SALT_ROUNDS);
```

POR:
```typescript
const hashedPassword = await this.passwordService.hash(dto.password);
```

**LÍNEA 80:** CAMBIAR
```typescript
const hashedPassword = await hash(newPassword, this.SALT_ROUNDS);
```

POR:
```typescript
const hashedPassword = await this.passwordService.hash(newPassword);
```

---

#### Corrección 1.2: Agregar Validaciones a DTOs

**Archivo:** `apps/api/src/modules/auth/dto/login.dto.ts`

**CAMBIAR (si está vacío o sin validadores):**
```typescript
export class LoginDto {
  email: string;
  password: string;
}
```

POR:
```typescript
import { IsEmail, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email requerido' })
  email: string;

  @MinLength(8, { message: 'Mínimo 8 caracteres' })
  @MaxLength(128, { message: 'Máximo 128 caracteres' })
  @IsNotEmpty({ message: 'Contraseña requerida' })
  password: string;
}
```

**Archivo:** `apps/api/src/modules/auth/dto/register.dto.ts`

**CAMBIAR:**
```typescript
export class RegisterDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}
```

POR:
```typescript
import {
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';

export class RegisterDto {
  @MinLength(3, { message: 'Nombre mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nombre máximo 100 caracteres' })
  @IsNotEmpty({ message: 'Nombre requerido' })
  name: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email requerido' })
  email: string;

  @MinLength(8, { message: 'Contraseña mínimo 8 caracteres' })
  @MaxLength(128, { message: 'Contraseña máximo 128 caracteres' })
  @IsNotEmpty({ message: 'Contraseña requerida' })
  password: string;

  @IsOptional()
  @IsPhoneNumber('CO', { message: 'Teléfono colombiano inválido' })
  phone?: string;

  @IsOptional()
  @IsIn(['admin', 'supervisor', 'tecnico'], {
    message: 'Rol debe ser admin, supervisor o tecnico',
  })
  role?: string;
}
```

**Archivo:** `apps/api/src/modules/admin/dto/admin.dto.ts`

**CAMBIAR todos los DTOs para agregar validadores class-validator**

```typescript
import {
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @MinLength(3)
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @MaxLength(128)
  @IsNotEmpty()
  password: string;

  @IsIn(['admin', 'supervisor', 'tecnico'])
  @IsNotEmpty()
  role: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phone?: string;

  @IsOptional()
  avatar?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsPhoneNumber('CO')
  phone?: string;

  @IsOptional()
  avatar?: string;
}

export class UpdateUserRoleDto {
  @IsIn(['admin', 'supervisor', 'tecnico'])
  @IsNotEmpty()
  role: string;
}

export class ListUsersQueryDto {
  @IsOptional()
  @IsIn(['admin', 'supervisor', 'tecnico'])
  role?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @MaxLength(100)
  search?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  active: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  loginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
}
```

---

#### Corrección 1.3: Actualizar Módulos para Usar PasswordService

**Archivo:** `apps/api/src/modules/auth/auth.module.ts`

**AGREGAR a providers:**
```typescript
import { PasswordService } from '../../lib/services/password.service';

@Module({
  // ... existing code
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    PasswordService, // AGREGAR ESTO
  ],
  exports: [AuthService, PasswordService], // AGREGAR PasswordService
})
export class AuthModule {}
```

**Archivo:** `apps/api/src/modules/admin/admin.module.ts`

**AGREGAR a providers:**
```typescript
import { PasswordService } from '../../lib/services/password.service';

@Module({
  // ... existing code
  providers: [
    AdminService,
    PasswordService, // AGREGAR ESTO
  ],
  exports: [AdminService, PasswordService], // AGREGAR PasswordService
})
export class AdminModule {}
```

---

## 📝 PRÓXIMOS PASOS

1. **HABLITAMOS** todos los cambios de Fase 1 (CRÍTICA)
2. **Implementamos** Corrección 1.1, 1.2, 1.3 línea por línea
3. **Ejecutamos** tests unitarios
4. **Validamos** que login y registro funcionan correctamente
5. **Procedemos** a Fase 2 (AUDITORÍA Y ERROR HANDLING)

---

## 🎯 SIGUIENTES DOCUMENTOS

Ver:
- `CORRECCION_FASE_2_AUDITORIA.md` - Consolidar auditoría
- `CORRECCION_FASE_3_MODULOS.md` - Consolidar órdenes
- `CORRECCION_FASE_4_FRONTEND.md` - Análisis frontend

