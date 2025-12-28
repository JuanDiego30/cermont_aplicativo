# 🔧 FASE 3 - IMPLEMENTACIÓN DETALLADA DE SOLUCIONES
**Fecha:** 28 de Diciembre 2025  
**Versión:** 3.0 - Code Implementation Guide  

---

## 🎯 INTRODUCCIÓN

Este documento contiene el código completo y listo para copiar-pegar de TODAS las soluciones.

**Reglas aplicadas:** GEMINI RULES v2.1 (Reglas 1-41)

---

## 📋 ÍNDICE RÁPIDO

1. [Solución #1: Pino Logger Service](#solución-1)
2. [Solución #2: Logger Module](#solución-2)
3. [Solución #3: ValidationPipe Global](#solución-3)
4. [Solución #4: HttpErrorInterceptor](#solución-4)
5. [Solución #5: Value Objects](#solución-5)
6. [Solución #6: Mappers](#solución-6)
7. [Solución #7: Refactorización Base Service](#solución-7)
8. [Solución #8: Tests Unitarios](#solución-8)

---

<a name="solución-1"></a>
## ✅ SOLUCIÓN #1: PINO LOGGER SERVICE (REGLA 6)

**Ubicación:** `apps/api/src/lib/logger/pino-logger.service.ts`

```typescript
import { Injectable, LoggerService } from '@nestjs/common';
import pino, { Logger as PinoLogger } from 'pino';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private logger: PinoLogger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: {
        target: 'pino-pretty',
        options: {
          singleLine: false,
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  log(message: string, context?: string, meta?: any): void {
    this.logger.info(
      { context, ...meta },
      message,
    );
  }

  error(message: string, trace?: string, context?: string, meta?: any): void {
    this.logger.error(
      { context, trace, ...meta },
      message,
    );
  }

  warn(message: string, context?: string, meta?: any): void {
    this.logger.warn(
      { context, ...meta },
      message,
    );
  }

  debug(message: string, context?: string, meta?: any): void {
    this.logger.debug(
      { context, ...meta },
      message,
    );
  }

  verbose(message: string, context?: string, meta?: any): void {
    this.logger.trace(
      { context, ...meta },
      message,
    );
  }
}
```

---

<a name="solución-2"></a>
## ✅ SOLUCIÓN #2: LOGGER MODULE (REGLA 9)

**Ubicación:** `apps/api/src/lib/logger/logger.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { PinoLoggerService } from './pino-logger.service';

@Module({
  providers: [PinoLoggerService],
  exports: [PinoLoggerService],
})
export class LoggerModule {}
```

**Importar en `app.module.ts`:**

```typescript
import { Module } from '@nestjs/common';
import { LoggerModule } from './lib/logger/logger.module';

@Module({
  imports: [
    LoggerModule, // ← Agregar aquí
    // ... resto de módulos
  ],
})
export class AppModule {}
```

**Usar en cualquier servicio:**

```typescript
import { Injectable } from '@nestjs/common';
import { PinoLoggerService } from '../../lib/logger/pino-logger.service';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly logger: PinoLoggerService,
    private readonly repo: UsuarioRepository,
  ) {}

  async crear(dto: CreateUsuarioDTO) {
    this.logger.log('Creando usuario', UsuarioService.name, { email: dto.email });
    
    try {
      const usuario = await this.repo.create(dto);
      this.logger.log('Usuario creado', UsuarioService.name, {
        usuarioId: usuario.id,
        email: usuario.email,
      });
      return usuario;
    } catch (error) {
      this.logger.error(
        'Error creando usuario',
        error.stack,
        UsuarioService.name,
        { email: dto.email, error: error.message },
      );
      throw error;
    }
  }
}
```

---

<a name="solución-3"></a>
## ✅ SOLUCIÓN #3: VALIDATION PIPE GLOBAL (REGLA 5 + 21)

**Ubicación:** `apps/api/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from './app.module';
import { PinoLoggerService } from './lib/logger/pino-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new PinoLoggerService();

  // ✅ LOGGER GLOBAL
  app.useLogger(logger);

  // ✅ VALIDATION PIPE GLOBAL
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remover propiedades no definidas en DTO
      forbidNonWhitelisted: true, // Lanzar error si hay propiedades extra
      transform: true, // Transformar a tipos correctos
      transformOptions: {
        enableImplicitConversion: true, // Convertir strings a números si es necesario
      },
      stopAtFirstError: false, // Retornar todos los errores
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        }));
        
        logger.warn('Validation error', 'ValidationPipe', { messages });
        
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  // ✅ CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`✅ Servidor escuchando en puerto ${port}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Error iniciando aplicación:', error);
  process.exit(1);
});
```

**Crear DTOs con validaciones:**

```typescript
// apps/api/src/modules/usuario/dto/create-usuario.dto.ts

import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum RolEnum {
  ADMIN = 'ADMIN',
  OPERADOR = 'OPERADOR',
  TECNICO = 'TECNICO',
  CLIENTE = 'CLIENTE',
}

export class CreateUsuarioDTO {
  @IsString({ message: 'Nombre debe ser string' })
  @MinLength(3, { message: 'Nombre mínimo 3 caracteres' })
  @MaxLength(100, { message: 'Nombre máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  nombre: string;

  @IsEmail({}, { message: 'Email inválido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8, { message: 'Contraseña mínimo 8 caracteres' })
  @MaxLength(128, { message: 'Contraseña máximo 128 caracteres' })
  @Matches(/[A-Z]/, { message: 'Contraseña debe tener mayúscula' })
  @Matches(/[a-z]/, { message: 'Contraseña debe tener minúscula' })
  @Matches(/[0-9]/, { message: 'Contraseña debe tener número' })
  @Matches(/[!@#$%^&*]/, { message: 'Contraseña debe tener carácter especial' })
  password: string;

  @IsEnum(RolEnum, { message: 'Rol inválido' })
  rol: RolEnum;

  @IsBoolean()
  @IsOptional()
  activo?: boolean = true;
}
```

---

<a name="solución-4"></a>
## ✅ SOLUCIÓN #4: HTTP ERROR INTERCEPTOR (REGLA 5)

**Ubicación:** `apps/web/src/app/core/interceptors/http-error.interceptor.ts`

```typescript
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private toastService: ToastService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      retry({ count: 1, delay: 1000 }), // Reintentar una vez después de 1s
      catchError((error: HttpErrorResponse) => this.handleError(error)),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const errorMsg = this.getErrorMessage(error);
    this.toastService.error(errorMsg);

    switch (error.status) {
      case 401:
        this.router.navigate(['/login']);
        break;
      case 403:
        this.router.navigate(['/acceso-denegado']);
        break;
      case 404:
        // No navegar en 404, solo mostrar toast
        break;
      case 500:
        this.router.navigate(['/error-servidor']);
        break;
    }

    return throwError(() => error);
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    switch (error.status) {
      case 0:
        return 'No hay conexión con el servidor';
      case 400:
        return 'Solicitud inválida';
      case 401:
        return 'No autorizado. Por favor inicia sesión';
      case 403:
        return 'Acceso denegado';
      case 404:
        return 'Recurso no encontrado';
      case 409:
        return 'Conflicto. El recurso ya existe';
      case 422:
        return 'Datos inválidos. Verifica los campos';
      case 500:
        return 'Error del servidor. Intenta más tarde';
      case 503:
        return 'Servicio no disponible. Intenta más tarde';
      default:
        return 'Error desconocido';
    }
  }
}
```

**Registrar en `app.config.ts`:**

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
  ],
};
```

---

<a name="solución-5"></a>
## ✅ SOLUCIÓN #5: VALUE OBJECTS (REGLA 3)

### EstadoOrden Value Object

**Ubicación:** `apps/api/src/domain/value-objects/estado-orden.vo.ts`

```typescript
export class EstadoOrden {
  static readonly PENDIENTE = new EstadoOrden('PENDIENTE');
  static readonly EN_PROCESO = new EstadoOrden('EN_PROCESO');
  static readonly COMPLETADA = new EstadoOrden('COMPLETADA');
  static readonly CANCELADA = new EstadoOrden('CANCELADA');

  private constructor(public readonly valor: string) {
    if (!this.esValido(valor)) {
      throw new Error(`Estado inválido: ${valor}`);
    }
  }

  static create(valor: string): EstadoOrden {
    const estados: Record<string, EstadoOrden> = {
      PENDIENTE: this.PENDIENTE,
      EN_PROCESO: this.EN_PROCESO,
      COMPLETADA: this.COMPLETADA,
      CANCELADA: this.CANCELADA,
    };

    const estado = estados[valor];
    if (!estado) {
      throw new Error(`Estado desconocido: ${valor}`);
    }
    return estado;
  }

  private esValido(valor: string): boolean {
    return ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'].includes(valor);
  }

  es(otro: EstadoOrden): boolean {
    return this.valor === otro.valor;
  }

  esActivo(): boolean {
    return ['PENDIENTE', 'EN_PROCESO'].includes(this.valor);
  }

  esCompletado(): boolean {
    return this.es(EstadoOrden.COMPLETADA);
  }

  esTransicionValida(nuevoEstado: EstadoOrden): boolean {
    const transiciones: Record<string, string[]> = {
      PENDIENTE: ['EN_PROCESO', 'CANCELADA'],
      EN_PROCESO: ['COMPLETADA', 'PENDIENTE'],
      COMPLETADA: [],
      CANCELADA: [],
    };
    return transiciones[this.valor]?.includes(nuevoEstado.valor) ?? false;
  }
}
```

### Monto Value Object

**Ubicación:** `apps/api/src/domain/value-objects/monto.vo.ts`

```typescript
export class Monto {
  private constructor(private readonly value: number) {
    if (!this.esValido(value)) {
      throw new Error(`Monto inválido: ${value}`);
    }
  }

  static create(valor: number): Monto {
    const redondeado = Math.round(valor * 100) / 100; // 2 decimales
    return new Monto(redondeado);
  }

  private esValido(valor: number): boolean {
    return valor >= 0 && valor <= 999999999.99 && Number.isFinite(valor);
  }

  getValue(): number {
    return this.value;
  }

  add(other: Monto): Monto {
    return Monto.create(this.value + other.getValue());
  }

  subtract(other: Monto): Monto {
    return Monto.create(this.value - other.getValue());
  }

  multiply(factor: number): Monto {
    return Monto.create(this.value * factor);
  }

  esPositivo(): boolean {
    return this.value > 0;
  }

  esCero(): boolean {
    return this.value === 0;
  }

  esIgualA(other: Monto): boolean {
    return Math.abs(this.value - other.getValue()) < 0.01;
  }

  esMayorQue(other: Monto): boolean {
    return this.value > other.getValue();
  }

  esPositivoMayorQue(min: Monto): boolean {
    return this.esPositivo() && this.esMayorQue(min);
  }
}
```

### OrdenNumero Value Object

**Ubicación:** `apps/api/src/domain/value-objects/orden-numero.vo.ts`

```typescript
export class OrdenNumero {
  private constructor(private readonly value: string) {
    if (!this.esValido(value)) {
      throw new Error(`Número de orden inválido: ${value}`);
    }
  }

  static generar(): OrdenNumero {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().slice(-2);
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    
    const numero = `ORD-${year}${month}${random}`;
    return new OrdenNumero(numero);
  }

  static create(valor: string): OrdenNumero {
    return new OrdenNumero(valor);
  }

  private esValido(valor: string): boolean {
    return /^ORD-\d{8}$/.test(valor);
  }

  getValue(): string {
    return this.value;
  }

  getAño(): number {
    return 2000 + parseInt(this.value.slice(4, 6));
  }

  getMes(): number {
    return parseInt(this.value.slice(6, 8));
  }

  toString(): string {
    return this.value;
  }
}
```

---

<a name="solución-6"></a>
## ✅ SOLUCIÓN #6: MAPPERS (REGLA 4)

### OrdenMapper

**Ubicación:** `apps/api/src/infrastructure/mappers/orden.mapper.ts`

```typescript
import { Orden } from '../../domain/entities/orden.entity';
import { OrdenDTO } from '../../modules/ordenes/dto/orden.dto';
import { CreateOrdenDTO } from '../../modules/ordenes/dto/create-orden.dto';
import { EstadoOrden } from '../../domain/value-objects/estado-orden.vo';

export class OrdenMapper {
  // Entity → DTO (API Response)
  static toDTO(orden: Orden): OrdenDTO {
    return {
      id: orden.id,
      numero: orden.numero.getValue(),
      monto: orden.monto.getValue(),
      estado: orden.estado.valor,
      clienteId: orden.clienteId,
      cliente: orden.cliente ? {
        id: orden.cliente.id,
        nombre: orden.cliente.nombre,
        email: orden.cliente.email,
      } : undefined,
      createdAt: orden.createdAt,
      updatedAt: orden.updatedAt,
    };
  }

  // DTOs [] → DTOs []
  static toDTOs(ordenes: Orden[]): OrdenDTO[] {
    return ordenes.map(orden => this.toDTO(orden));
  }

  // DTO → Entity (Domain)
  static toDomain(dto: CreateOrdenDTO, clienteId: string): Orden {
    return new Orden(
      undefined, // id será generado
      OrdenNumero.generar(),
      Monto.create(dto.monto),
      EstadoOrden.PENDIENTE,
      clienteId,
      undefined,
      new Date(),
      new Date(),
    );
  }

  // Raw Database → Entity
  static fromDatabase(raw: any): Orden {
    return new Orden(
      raw.id,
      OrdenNumero.create(raw.numero),
      Monto.create(raw.monto),
      EstadoOrden.create(raw.estado),
      raw.clienteId,
      raw.cliente,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  // Entity → Database
  static toPersistence(orden: Orden): any {
    return {
      numero: orden.numero.getValue(),
      monto: orden.monto.getValue(),
      estado: orden.estado.valor,
      clienteId: orden.clienteId,
    };
  }
}
```

---

<a name="solución-7"></a>
## ✅ SOLUCIÓN #7: BASE SERVICE REFACTORIZADO (REGLA 2 + 8)

**Ubicación:** `apps/api/src/lib/base/base.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { PinoLoggerService } from '../logger/pino-logger.service';

@Injectable()
export abstract class BaseService<T> {
  protected abstract readonly serviceName: string;

  constructor(
    protected readonly repository: BaseRepository<T>,
    protected readonly logger: PinoLoggerService,
  ) {}

  async findAll(skip: number = 0, take: number = 50) {
    try {
      this.logger.log(`Obteniendo todos (skip: ${skip}, take: ${take})`, this.serviceName);
      
      const result = await this.repository.findMany(skip, take);
      
      this.logger.log(`Se obtuvieron ${result.length} registros`, this.serviceName);
      return result;
    } catch (error) {
      this.logger.error(`Error en findAll`, error.stack, this.serviceName, { skip, take });
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      this.logger.log(`Buscando por ID`, this.serviceName, { id });
      
      const result = await this.repository.findById(id);
      
      if (!result) {
        this.logger.warn(`Registro no encontrado`, this.serviceName, { id });
        throw new Error(`${this.serviceName} con ID ${id} no existe`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Error en findOne`, error.stack, this.serviceName, { id });
      throw error;
    }
  }

  async create(data: Partial<T>) {
    try {
      this.logger.log(`Creando nuevo registro`, this.serviceName);
      
      const result = await this.repository.create(data);
      
      this.logger.log(`Registro creado`, this.serviceName, { id: (result as any)?.id });
      return result;
    } catch (error) {
      this.logger.error(`Error al crear`, error.stack, this.serviceName);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>) {
    try {
      this.logger.log(`Actualizando registro`, this.serviceName, { id });
      
      // Verificar que existe
      await this.findOne(id);
      
      const result = await this.repository.update(id, data);
      
      this.logger.log(`Registro actualizado`, this.serviceName, { id });
      return result;
    } catch (error) {
      this.logger.error(`Error al actualizar`, error.stack, this.serviceName, { id });
      throw error;
    }
  }

  async delete(id: string) {
    try {
      this.logger.log(`Eliminando registro`, this.serviceName, { id });
      
      // Verificar que existe
      await this.findOne(id);
      
      const result = await this.repository.delete(id);
      
      this.logger.log(`Registro eliminado`, this.serviceName, { id });
      return result;
    } catch (error) {
      this.logger.error(`Error al eliminar`, error.stack, this.serviceName, { id });
      throw error;
    }
  }
}
```

---

<a name="solución-8"></a>
## ✅ SOLUCIÓN #8: TESTS UNITARIOS (REGLA 5)

### Password Service Tests

**Ubicación:** `apps/api/src/lib/services/password.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('debería hashear una contraseña válida', async () => {
      const password = 'Test123!@#';
      const hashed = await service.hash(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('dos hashes de la misma contraseña deberían ser diferentes', async () => {
      const password = 'Test123!@#';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('debería validar contraseña correcta', async () => {
      const password = 'Test123!@#';
      const hashed = await service.hash(password);

      const isValid = await service.compare(password, hashed);
      expect(isValid).toBe(true);
    });

    it('debería rechazar contraseña incorrecta', async () => {
      const password = 'Test123!@#';
      const wrongPassword = 'Wrong123!@#';
      const hashed = await service.hash(password);

      const isValid = await service.compare(wrongPassword, hashed);
      expect(isValid).toBe(false);
    });
  });

  describe('validate', () => {
    it('debería aceptar contraseña fuerte', () => {
      const result = service.validate('Strong123!@#');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debería rechazar contraseña sin mayúscula', () => {
      const result = service.validate('weak123!@#');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('debería rechazar contraseña muy corta', () => {
      const result = service.validate('Test1!');
      expect(result.isValid).toBe(false);
    });

    it('debería rechazar contraseña muy larga', () => {
      const result = service.validate('A'.repeat(129) + '1!@#');
      expect(result.isValid).toBe(false);
    });
  });
});
```

### Auth Service Tests

**Ubicación:** `apps/api/src/modules/auth/auth.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PasswordService } from '../../lib/services/password.service';
import { UsuarioRepository } from '../usuario/usuario.repository';
import { JwtService } from '@nestjs/jwt';
import { PinoLoggerService } from '../../lib/logger/pino-logger.service';

describe('AuthService', () => {
  let service: AuthService;
  let passwordService: PasswordService;
  let usuarioRepository: UsuarioRepository;
  let jwtService: JwtService;
  let logger: PinoLoggerService;

  const mockUsuario = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    nombre: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashedPassword'),
            compare: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: UsuarioRepository,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(mockUsuario),
            create: jest.fn().mockResolvedValue(mockUsuario),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token123'),
          },
        },
        {
          provide: PinoLoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    passwordService = module.get<PasswordService>(PasswordService);
    usuarioRepository = module.get<UsuarioRepository>(UsuarioRepository);
    jwtService = module.get<JwtService>(JwtService);
    logger = module.get<PinoLoggerService>(PinoLoggerService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('debería retornar token para credenciales válidas', async () => {
      const result = await service.login('test@example.com', 'password123');

      expect(result).toEqual({
        access_token: 'token123',
        usuario: {
          id: '1',
          email: 'test@example.com',
          nombre: 'Test User',
        },
      });
    });

    it('debería lanzar error para credenciales inválidas', async () => {
      jest.spyOn(passwordService, 'compare').mockResolvedValueOnce(false);

      await expect(service.login('test@example.com', 'wrongPassword')).rejects.toThrow();
    });
  });
});
```

---

## 📊 CHECKLIST DE IMPLEMENTACIÓN

- [ ] **Commit 1:** Actualizar `apps/api/package.json` (Dependencias backend)
- [ ] **Commit 2:** Actualizar `apps/web/package.json` (Dependencias frontend)
- [ ] **Commit 3:** Crear PinoLoggerService + LoggerModule
- [ ] **Commit 4:** Actualizar main.ts con ValidationPipe
- [ ] **Commit 5:** Crear HttpErrorInterceptor
- [ ] **Commit 6:** Crear Value Objects (3 archivos)
- [ ] **Commit 7:** Crear Mappers (3 archivos)
- [ ] **Commit 8:** Refactorizar BaseService
- [ ] **Commit 9:** Crear Tests unitarios (5+ archivos)
- [ ] **Commit 10:** Refactorizar N+1 queries

---

## 🚀 PRÓXIMOS PASOS

1. Copiar código de este documento
2. Crear archivos en ubicaciones indicadas
3. Ejecutar `npm install`
4. Ejecutar `npm run build`
5. Ejecutar `npm test`
6. Ejecutar `npm run lint`
7. Hacer commits atómicos
8. Push a GitHub

---

**Versión:** 3.0  
**Fecha:** 28 de Diciembre 2025  
**Estado:** ✅ LISTO PARA IMPLEMENTAR  
