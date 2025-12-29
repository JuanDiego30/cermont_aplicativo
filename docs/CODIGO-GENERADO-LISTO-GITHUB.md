# 📁 ARCHIVOS DE CÓDIGO GENERADOS - LISTOS PARA GITHUB

## 1️⃣ BaseRepository (Archivo 1 de 8)

**Ubicación:** `apps/api/src/lib/base/base.repository.ts`

```typescript
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

export interface IBaseRepository<T> {
  findMany(skip?: number, take?: number, where?: any, include?: any): Promise<T[]>;
  findById(id: string, include?: any): Promise<T | null>;
  create(data: any, include?: any): Promise<T>;
  update(id: string, data: any, include?: any): Promise<T>;
  delete(id: string): Promise<T>;
  count(where?: any): Promise<number>;
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
  protected abstract modelName: string;

  abstract findMany(skip?: number, take?: number, where?: any, include?: any): Promise<T[]>;
  abstract findById(id: string, include?: any): Promise<T | null>;
  abstract create(data: any, include?: any): Promise<T>;
  abstract update(id: string, data: any, include?: any): Promise<T>;
  abstract delete(id: string): Promise<T>;
  abstract count(where?: any): Promise<number>;

  protected validateId(id: string): void {
    if (!id || id.trim() === '') {
      throw new BadRequestException('ID is required');
    }
  }

  protected validateData(data: any): void {
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Data cannot be empty');
    }
  }
}
```

---

## 2️⃣ BaseService (Archivo 2 de 8)

**Ubicación:** `apps/api/src/lib/base/base.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { LoggerService } from '@/lib/logging/logger.service';

export interface IPaginationQuery {
  skip?: number;
  take?: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
}

@Injectable()
export abstract class BaseService<T> {
  protected readonly logger: LoggerService;
  protected abstract repository: BaseRepository<T>;

  constructor() {
    this.logger = new LoggerService();
  }

  async findAll(
    query?: IPaginationQuery,
    where?: any,
    include?: any,
  ): Promise<IPaginatedResponse<T>> {
    const skip = query?.skip || 0;
    const take = query?.take || 10;

    try {
      const [data, total] = await Promise.all([
        this.repository.findMany(skip, take, where, include),
        this.repository.count(where),
      ]);

      return {
        data,
        total,
        skip,
        take,
        hasMore: skip + take < total,
      };
    } catch (error) {
      this.logger.error(`Error finding all ${this.constructor.name}`, error as any);
      throw error;
    }
  }

  async findOne(id: string, include?: any): Promise<T> {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    try {
      const item = await this.repository.findById(id, include);
      if (!item) {
        throw new NotFoundException(`${this.constructor.name} not found`);
      }
      return item;
    } catch (error) {
      this.logger.error(`Error finding ${this.constructor.name} by id`, error as any);
      throw error;
    }
  }

  async create(data: any, include?: any): Promise<T> {
    if (!data) {
      throw new BadRequestException('Data is required');
    }

    try {
      const created = await this.repository.create(data, include);
      this.logger.log(`${this.constructor.name} created successfully`);
      return created;
    } catch (error) {
      this.logger.error(`Error creating ${this.constructor.name}`, error as any);
      throw error;
    }
  }

  async update(id: string, data: any, include?: any): Promise<T> {
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    if (!data || Object.keys(data).length === 0) {
      throw new BadRequestException('Data cannot be empty');
    }

    try {
      // Verify exists first
      await this.findOne(id);
      const updated = await this.repository.update(id, data, include);
      this.logger.log(`${this.constructor.name} updated successfully`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating ${this.constructor.name}`, error as any);
      throw error;
    }
  }

  async delete(id: string): Promise<T> {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    try {
      // Verify exists first
      await this.findOne(id);
      const deleted = await this.repository.delete(id);
      this.logger.log(`${this.constructor.name} deleted successfully`);
      return deleted;
    } catch (error) {
      this.logger.error(`Error deleting ${this.constructor.name}`, error as any);
      throw error;
    }
  }
}
```

---

## 3️⃣ LoggerService (Archivo 3 de 8)

**Ubicación:** `apps/api/src/lib/logging/logger.service.ts`

```typescript
import { Injectable, Logger, LogLevel } from '@nestjs/common';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: any;
  trace?: string;
}

@Injectable()
export class LoggerService extends Logger {
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  constructor(context = 'CermontApp') {
    super(context);
  }

  log(message: string, context?: string, metadata?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'log',
      message,
      context: context || this.context,
      metadata,
    };
    this.addToHistory(logEntry);
    super.log(message, context || this.context);
  }

  error(message: string, trace?: string, context?: string): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context: context || this.context,
      trace,
    };
    this.addToHistory(logEntry);
    super.error(message, trace, context || this.context);
  }

  warn(message: string, context?: string): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context: context || this.context,
    };
    this.addToHistory(logEntry);
    super.warn(message, context || this.context);
  }

  debug(message: string, context?: string, metadata?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context: context || this.context,
      metadata,
    };
    this.addToHistory(logEntry);
    super.debug(message, context || this.context);
  }

  verbose(message: string, context?: string): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'verbose',
      message,
      context: context || this.context,
    };
    this.addToHistory(logEntry);
    super.verbose(message, context || this.context);
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  getHistory(limit = 100): LogEntry[] {
    return this.logHistory.slice(-limit);
  }

  clearHistory(): void {
    this.logHistory = [];
  }
}
```

---

## 4️⃣ GlobalExceptionFilter (Archivo 4 de 8)

**Ubicación:** `apps/api/src/lib/shared/filters/global-exception.filter.ts`

```typescript
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { LoggerService } from '@/lib/logging/logger.service';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string;
  method: string;
}

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const errObj = exceptionResponse as any;
        message = errObj.message || message;
        if (Array.isArray(errObj.message)) {
          message = errObj.message[0];
        }
        details = errObj.details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      // Log stack trace for debugging
      this.logger.error(
        `Unhandled ${exception.constructor.name}`,
        exception.stack,
        'GlobalExceptionFilter',
      );
    } else {
      this.logger.error(
        'Unknown exception',
        String(exception),
        'GlobalExceptionFilter',
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.path,
      method: request.method,
      message,
    };

    // Only include details if in development
    if (process.env.NODE_ENV === 'development' && details) {
      (errorResponse as any).details = details;
    }

    // Log the error
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.path} - ${status}`,
        JSON.stringify(errorResponse),
        'GlobalExceptionFilter',
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.path} - ${status}`,
        'GlobalExceptionFilter',
      );
    }

    response.status(status).json(errorResponse);
  }
}
```

---

## 5️⃣ UserMapper (Archivo 5 de 8)

**Ubicación:** `apps/api/src/modules/auth/application/mappers/user.mapper.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UserMapper {
  /**
   * Convierte DTO a objeto Prisma persistible
   */
  toPersistence(dto: any): Partial<User> {
    return {
      email: dto.email,
      name: dto.name,
      phone: dto.phone || null,
      password: dto.password,
      role: dto.role,
      status: dto.status,
    };
  }

  /**
   * Convierte User de BD a DTO seguro
   */
  toDTO(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      role: user.role as any,
      status: user.status as any,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Convierte lista de Users a DTOs
   */
  toDTOList(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toDTO(user));
  }

  /**
   * Convierte User con relaciones a DTO extendido
   */
  toDTOWithRelations(user: User & { ordenes?: any[] }): UserResponseDto & { ordenes?: any[] } {
    return {
      ...this.toDTO(user),
      ordenes: user.ordenes,
    };
  }
}
```

---

## 6️⃣ LoginDTO Validado (Archivo 6 de 8)

**Ubicación:** `apps/api/src/modules/auth/application/dto/login.dto.ts`

```typescript
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString({ message: 'Password debe ser texto' })
  @MinLength(8, { message: 'Password mínimo 8 caracteres' })
  @MaxLength(100, { message: 'Password máximo 100 caracteres' })
  @IsNotEmpty({ message: 'Password es requerido' })
  password: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Email debe ser válido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email: string;

  @IsString({ message: 'Password debe ser texto' })
  @MinLength(8, { message: 'Password mínimo 8 caracteres' })
  @MaxLength(100, { message: 'Password máximo 100 caracteres' })
  @Matches(/[A-Z]/, { message: 'Password debe contener mayúscula' })
  @Matches(/[0-9]/, { message: 'Password debe contener número' })
  @IsNotEmpty({ message: 'Password es requerido' })
  password: string;

  @IsString({ message: 'Name debe ser texto' })
  @MinLength(3, { message: 'Name mínimo 3 caracteres' })
  @IsNotEmpty({ message: 'Name es requerido' })
  name: string;

  @IsString({ message: 'Phone debe ser texto' })
  @Matches(/^\+?[0-9\s\-\(\)]{10,}$/, { message: 'Phone inválido' })
  phone?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'TECNICO' | 'CLIENTE' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 7️⃣ Prisma Schema Optimizado (Archivo 7 de 8)

**Ubicación:** `apps/api/prisma/schema.prisma` (Sección de includes)

```prisma
// AGREGAR A MODELO EXISTENTE:

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  phone         String?
  password      String
  role          Role      @default(USER)
  status        UserStatus @default(ACTIVE)
  
  // Relaciones
  ordenes       Orden[]   @relation("OrdenTecnico")
  ordenesCliente Orden[]  @relation("OrdenCliente")
  ejecuciones   Ejecucion[]
  checklists    Checklist[]
  certificaciones Certificacion[]
  
  // Audit fields
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  
  @@index([email])
  @@index([status])
  @@index([role])
}

model Orden {
  id            String    @id @default(cuid())
  numero        String    @unique
  
  // Foreign keys
  tecnicoId     String
  tecnico       User      @relation("OrdenTecnico", fields: [tecnicoId], references: [id])
  
  clienteId     String
  cliente       User      @relation("OrdenCliente", fields: [clienteId], references: [id])
  
  // Relaciones
  ejecuciones   Ejecucion[] @relation("OrdenEjecuciones")
  checklists    Checklist[] @relation("OrdenChecklists")
  cierre        CierreAdministrativo?
  
  // Audit fields
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?
  
  @@index([tecnicoId])
  @@index([clienteId])
  @@index([numero])
}

// IMPORTANTE: Usar include/select en queries:
/*
  findMany({
    include: {
      tecnico: true,      // ← ESTO EVITA N+1
      cliente: true,
      ejecuciones: true,
      checklists: true,
    }
  })
*/
```

---

## 8️⃣ Main.ts Integración (Archivo 8 de 8)

**Ubicación:** `apps/api/src/main.ts` (Actualizar)

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './lib/shared/filters/global-exception.filter';
import { LoggerService } from './lib/logging/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new LoggerService('Bootstrap');

  // ✅ Registrar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Remover propiedades no mapeadas
      forbidNonWhitelisted: true, // Rechazar props no mapeadas
      transform: true,           // Transformar tipos
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
    }),
  );

  // ✅ Registrar exception filter global
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // ✅ Habilitar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // ✅ Establecer prefijo global
  app.setGlobalPrefix('api');

  const port = process.env.API_PORT || 4000;
  await app.listen(port);

  logger.log(`🚀 Cermont API running on http://localhost:${port}/api`, 'Bootstrap');
  logger.log(`📊 Environment: ${process.env.NODE_ENV}`, 'Bootstrap');
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
```

---

## 📊 RESUMEN DE ARCHIVOS

| # | Archivo | Tipo | Líneas | Implementa |
|---|---------|------|--------|-----------|
| 1 | BaseRepository | Abstract | 35 | REGLA 2 |
| 2 | BaseService | Abstract | 95 | REGLA 2 |
| 3 | LoggerService | Injectable | 75 | REGLA 6 |
| 4 | GlobalExceptionFilter | Filter | 80 | REGLA 5 |
| 5 | UserMapper | Mapper | 45 | REGLA 4 |
| 6 | LoginDTO | DTO | 45 | REGLA 5 |
| 7 | Schema.prisma | Config | 40 | REGLA 10 |
| 8 | Main.ts | Entry | 40 | Integración |
| **TOTAL** | - | - | **455** | - |

