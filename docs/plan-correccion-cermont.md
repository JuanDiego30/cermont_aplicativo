# PLAN DETALLADO DE CORRECCIÓN Y REFACTORIZACIÓN - CERMONT APLICATIVO

## 📋 ÍNDICE DEL PLAN DE CORRECCIÓN

1. [Análisis Crítico Identificado](#análisis-crítico)
2. [Correcciones Backend (NestJS)](#correcciones-backend)
3. [Correcciones Frontend (Angular)](#correcciones-frontend)
4. [Integración Frontend-Backend](#integración-frontend-backend)
5. [Paleta de Colores Profesional](#paleta-colores)
6. [Estructura y Mejoras UI/UX](#estructura-ui-ux)
7. [Plan de Implementación Fase a Fase](#plan-implementacion)

---

## 🔴 ANÁLISIS CRÍTICO IDENTIFICADO

### PROBLEMA 1: Frontend Angular con Mocks y Plantilla TailAdmin No Integrada
**Severidad:** CRÍTICA
**Descripción:** El frontend utiliza una plantilla de ejemplo (TailAdmin) con datos mock que NO consume realmente el backend NestJS.

**Ubicación:** `apps/web/src`
**Síntomas:**
- Los dashboards muestran datos estáticos
- No hay servicios HTTP configurados para consumir APIs
- Componentes no tienen RxJS observables conectados a endpoints reales
- NgModule no tiene HttpClientModule importado correctamente

**Impacto:** La aplicación es completamente no funcional end-to-end

---

### PROBLEMA 2: Backend NestJS sin Validación Exhaustiva
**Severidad:** ALTA
**Descripción:** El módulo API carece de validación robusta de DTOs y tiene errores de manejo de excepciones.

**Ubicación:** `apps/api/src/modules`
**Síntomas:**
- DTOs incompletos o inexistentes
- Falta de pipes de validación global
- Manejo de errores inconsistente
- Falta de documentación OpenAPI en controladores

---

### PROBLEMA 3: Base de Datos y Prisma sin Migraciones Correctas
**Severidad:** ALTA
**Descripción:** El schema de Prisma no está completamente optimizado y faltan índices.

**Ubicación:** `apps/api/prisma/schema.prisma`
**Síntomas:**
- Relaciones incompletas entre entidades
- Falta de índices compuestos para búsquedas comunes
- Sin validaciones a nivel de schema
- Timestamps no sincronizados correctamente

---

### PROBLEMA 4: Ausencia de Configuración de Estilos Coherente
**Severidad:** MEDIA
**Descripción:** Tailwind CSS no está correctamente configurado con paleta de colores personalizada.

**Ubicación:** `apps/web/tailwind.config.ts` (no existe o está incompleto)
**Síntomas:**
- Sin paleta de colores consistente
- No hay tokens de diseño
- Componentes usan colores ad-hoc
- Sin dark mode configurado

---

### PROBLEMA 5: Falta de Autenticación JWT Global
**Severidad:** ALTA
**Descripción:** La autenticación JWT no está correctamente integrada entre frontend y backend.

**Ubicación:** Backend: `apps/api/src/common/guards` Frontend: `apps/web/src/app/core`
**Síntomas:**
- Sin guard global de autenticación
- Sin interceptor de JWT en frontend
- Sin refresh token logic
- Sin logout y limpieza de tokens

---

---

## 🔧 CORRECCIONES BACKEND (NestJS)

### CORRECCIÓN 1: Crear DTOs Validados Completos

**Archivo:** `apps/api/src/modules/orders/dtos/create-order.dto.ts`

```typescript
// ❌ ESTADO ACTUAL (INCORRECTO O INEXISTENTE)
// El archivo no existe o está vacío

// ✅ CÓDIGO CORRECCIÓN

import { IsUUID, IsString, IsEnum, IsOptional, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export enum ServiceType {
  MAINTENANCE = 'maintenance',
  INSTALLATION = 'installation',
  REPAIR = 'repair',
  INSPECTION = 'inspection',
  EMERGENCY = 'emergency'
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'ID del cliente',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID('4')
  clientId: string;

  @ApiProperty({
    description: 'Tipo de servicio',
    enum: ServiceType
  })
  @IsEnum(ServiceType)
  serviceType: ServiceType;

  @ApiProperty({
    description: 'Descripción del trabajo',
    minLength: 10,
    maxLength: 500
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'ID de ubicación',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  @IsOptional()
  @IsUUID('4')
  locationId?: string;

  @ApiPropertyOptional({
    description: 'Fecha programada',
    format: 'date'
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({
    description: 'Horas estimadas',
    minimum: 0.5,
    maximum: 160
  })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(160)
  estimatedHours?: number;

  @ApiPropertyOptional({
    description: 'ID del usuario asignado'
  })
  @IsOptional()
  @IsUUID('4')
  assignedTo?: string;
}

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['draft', 'pending', 'inprogress', 'completed', 'closed', 'cancelled'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(160)
  actualHours?: number;
}
```

**Línea a Agregar en:** `apps/api/src/modules/orders/orders.module.ts` (línea ~15)

```typescript
import { CreateOrderDto, UpdateOrderDto } from './dtos/create-order.dto';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  // Exportar DTOs para otros módulos
})
export class OrdersModule {}
```

---

### CORRECCIÓN 2: Implementar Guard Global de Autenticación

**Archivo:** `apps/api/src/common/guards/jwt-auth.guard.ts`

```typescript
// ❌ ESTADO ACTUAL
// Archivo inexistente o incomplete

// ✅ CÓDIGO CORRECCIÓN

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('No autorizado. Por favor inicia sesión.');
    }
    return user;
  }
}
```

**Archivo:** `apps/api/src/modules/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario no autorizado o inactivo');
    }

    return {
      userId: payload.sub,
      email: user.email,
      role: user.role,
    };
  }
}
```

**Archivo:** `apps/api/src/app.module.ts` - Línea ~30 (Agregar a imports)

```typescript
// ✅ AGREGAR ESTO EN IMPORTS
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';

@Module({
  imports: [
    // ... otros imports
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    // ... resto
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
```

---

### CORRECCIÓN 3: Implementar Validación Global de DTOs

**Archivo:** `apps/api/src/main.ts` - Reemplazar línea ~25

```typescript
// ❌ CÓDIGO ACTUAL (INCOMPLETO)
// app.useGlobalPipes(new ValidationPipe());

// ✅ CÓDIGO CORRECCIÓN
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global mejorada
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove undefined properties
      forbidNonWhitelisted: true, // Error on unknown properties
      transform: true, // Transform to DTO class
      transformOptions: {
        enableImplicitConversion: true,
      },
      errorHttpStatusCode: 400,
    }),
  );

  // CORS configurado correctamente
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Compresión
  app.use(compression());

  // Helmet para seguridad
  app.use(helmet());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Cermont API')
    .setDescription('API para gestión de órdenes de trabajo')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
```

---

### CORRECCIÓN 4: Crear Controlador de Órdenes con Decoradores Swagger

**Archivo:** `apps/api/src/modules/orders/orders.controller.ts`

```typescript
// ✅ CÓDIGO CORRECCIÓN COMPLETA

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dtos/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Order } from '@prisma/client';

@ApiTags('Órdenes de Trabajo')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva orden de trabajo',
    description: 'Crea una nueva orden de trabajo con los datos proporcionados',
  })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: any
  ) {
    try {
      return await this.ordersService.create(
        createOrderDto,
        req.user.userId
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Listar órdenes de trabajo',
    description: 'Retorna lista paginada de órdenes',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Registros por página',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrar por estado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes',
    type: [Order],
  })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string
  ) {
    return await this.ordersService.findAll({
      page: Number(page),
      limit: Number(limit),
      status,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener una orden específica',
    description: 'Retorna los detalles de una orden por su ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID de la orden',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la orden',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Orden no encontrada',
  })
  async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar una orden',
    description: 'Actualiza los datos de una orden existente',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'UUID de la orden',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Orden no encontrada',
  })
  async updateOrder(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto
  ) {
    return await this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar una orden',
    description: 'Marca una orden como cancelada',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Orden eliminada',
  })
  async deleteOrder(@Param('id') id: string) {
    await this.ordersService.delete(id);
  }
}
```

---

### CORRECCIÓN 5: Mejorar Schema de Prisma

**Archivo:** `apps/api/prisma/schema.prisma` - Línea ~1

```prisma
// ❌ ESTADO ACTUAL (INCOMPLETO)
// Relaciones incompletas, sin índices compuestos

// ✅ CÓDIGO CORRECCIÓN

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ===== USUARIOS =====
model User {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email     String   @unique
  passwordHash String
  firstName String
  lastName  String
  role      UserRole @default(OPERARIO)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relaciones
  ordersCreated Order[] @relation("createdBy")
  ordersAssigned Order[] @relation("assignedTo")
  evidences Evidence[] @relation("capturedBy")
  auditLogs AuditLog[] @relation("byUser")
  refreshTokens RefreshToken[]

  // Índices
  @@index([email])
  @@index([role])
}

// ===== ÓRDENES =====
model Order {
  id           String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderNumber  String      @unique
  status       OrderStatus @default(DRAFT)
  
  // Relaciones
  clientId     String      @db.Uuid
  client       Client      @relation(fields: [clientId], references: [id], onDelete: Cascade)
  
  locationId   String?     @db.Uuid
  location     Location?   @relation(fields: [locationId], references: [id])
  
  createdById  String      @db.Uuid
  createdBy    User        @relation("createdBy", fields: [createdById], references: [id])
  
  assignedToId String?     @db.Uuid
  assignedTo   User?       @relation("assignedTo", fields: [assignedToId], references: [id])

  // Datos
  serviceType  String      @default("maintenance")
  description  String
  scheduledDate DateTime?
  startedAt    DateTime?
  completedAt  DateTime?
  closedAt     DateTime?
  
  estimatedHours Decimal   @db.Decimal(5, 2)
  actualHours    Decimal?  @db.Decimal(5, 2)
  totalCost      Decimal?  @db.Decimal(12, 2)
  
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  // Relaciones
  workPlans    WorkPlan[]
  evidence     Evidence[]
  materials    Material[]
  checklist    Checklist?

  // Índices para búsquedas comunes
  @@index([clientId])
  @@index([status])
  @@index([assignedToId])
  @@index([createdAt])
  @@index([createdById])
  @@unique([orderNumber])
}

// ===== CLIENTES =====
model Client {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name          String
  contractNumber String? @unique
  contactInfo   String?
  email         String?  @unique
  phone         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  orders Order[]

  @@index([email])
}

// ===== UBICACIONES =====
model Location {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String
  fieldName   String?
  coordinates String? // GeoJSON format
  latitude    Decimal? @db.Decimal(10, 8)
  longitude   Decimal? @db.Decimal(11, 8)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orders Order[]

  @@index([fieldName])
}

// ===== PLANES DE TRABAJO =====
model WorkPlan {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId         String   @db.Uuid
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  description     String
  estimatedHours  Decimal  @db.Decimal(5, 2)
  actualHours     Decimal? @db.Decimal(5, 2)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([orderId])
}

// ===== EVIDENCIAS FOTOGRÁFICAS =====
model Evidence {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId     String   @db.Uuid
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  filepath    String
  fileType    String // 'image/jpeg', 'image/png', etc
  fileSize    Int?
  
  gpsLatitude  Decimal? @db.Decimal(10, 8)
  gpsLongitude Decimal? @db.Decimal(11, 8)
  
  capturedAt  DateTime
  capturedById String @db.Uuid
  capturedBy  User    @relation("capturedBy", fields: [capturedById], references: [id])
  
  description String?
  isSynced    Boolean  @default(false)
  
  createdAt   DateTime @default(now())

  @@index([orderId])
  @@index([capturedAt])
}

// ===== MATERIALES =====
model Material {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId   String   @db.Uuid
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  itemCode  String
  quantity  Decimal  @db.Decimal(10, 3)
  unitCost  Decimal  @db.Decimal(10, 2)
  
  createdAt DateTime @default(now())

  @@index([orderId])
}

// ===== CHECKLIST DE SEGURIDAD =====
model Checklist {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId     String   @unique @db.Uuid
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  items       String[] // JSON array of checklist items
  completedAt DateTime?
  signedByUser String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([orderId])
}

// ===== LOGS DE AUDITORÍA =====
model AuditLog {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation("byUser", fields: [userId], references: [id])
  
  action    String   // 'CREATE', 'UPDATE', 'DELETE'
  entityType String  // 'Order', 'Evidence', etc
  entityId  String   @db.Uuid
  
  oldValue  Json?
  newValue  Json?
  
  ipAddress String?
  userAgent String?
  
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}

// ===== TOKENS DE REFRESCO =====
model RefreshToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  tokenHash String   @unique
  expiresAt DateTime
  
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
}

// ===== ENUMS =====
enum UserRole {
  OPERARIO
  SUPERVISOR
  ADMIN
  GERENCIA
}

enum OrderStatus {
  DRAFT
  PENDING
  INPROGRESS
  COMPLETED
  CLOSED
  CANCELLED
}
```

---

---

## 🎨 CORRECCIONES FRONTEND (ANGULAR)

### CORRECCIÓN 1: Crear Servicio HTTP para Órdenes

**Archivo:** `apps/web/src/app/services/orders.service.ts` (CREAR NUEVO)

```typescript
// ✅ CÓDIGO NUEVO

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  status: 'draft' | 'pending' | 'inprogress' | 'completed' | 'closed' | 'cancelled';
  serviceType: string;
  description: string;
  assignedTo?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/orders`;
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las órdenes con paginación y filtros
   */
  getOrders(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Observable<PaginatedOrders> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (status) {
      params = params.set('status', status);
    }

    return this.http
      .get<PaginatedOrders>(this.apiUrl, { params })
      .pipe(
        tap((response) => {
          this.ordersSubject.next(response.data);
        })
      );
  }

  /**
   * Obtener una orden por ID
   */
  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nueva orden
   */
  createOrder(order: Partial<Order>): Observable<Order> {
    return this.http
      .post<Order>(this.apiUrl, order)
      .pipe(
        tap((newOrder) => {
          const currentOrders = this.ordersSubject.value;
          this.ordersSubject.next([...currentOrders, newOrder]);
        })
      );
  }

  /**
   * Actualizar orden existente
   */
  updateOrder(id: string, order: Partial<Order>): Observable<Order> {
    return this.http
      .put<Order>(`${this.apiUrl}/${id}`, order)
      .pipe(
        tap((updatedOrder) => {
          const currentOrders = this.ordersSubject.value;
          const index = currentOrders.findIndex((o) => o.id === id);
          if (index > -1) {
            currentOrders[index] = updatedOrder;
            this.ordersSubject.next([...currentOrders]);
          }
        })
      );
  }

  /**
   * Eliminar una orden
   */
  deleteOrder(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const currentOrders = this.ordersSubject.value.filter((o) => o.id !== id);
          this.ordersSubject.next(currentOrders);
        })
      );
  }

  /**
   * Obtener órdenes por estado
   */
  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.getOrders(1, 100, status).pipe(
      map((response) => response.data)
    );
  }
}
```

---

### CORRECCIÓN 2: Crear Interceptor JWT

**Archivo:** `apps/web/src/app/core/http/auth.interceptor.ts` (CREAR NUEVO)

```typescript
// ✅ CÓDIGO NUEVO

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Agregar token JWT si existe
    const token = this.authService.getToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.access_token);
          return next.handle(this.addToken(request, response.access_token));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => {
          return next.handle(this.addToken(request, token));
        })
      );
    }
  }
}
```

---

### CORRECCIÓN 3: Crear AuthService Completo

**Archivo:** `apps/web/src/app/core/services/auth.service.ts` (CREAR/ACTUALIZAR)

```typescript
// ✅ CÓDIGO CORRECCIÓN

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Obtener usuario actual
   */
  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Login
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.setTokens(response.access_token, response.refresh_token);
          this.currentUserSubject.next(response.user);
          this.saveUserToStorage(response.user);
        })
      );
  }

  /**
   * Logout
   */
  logout(): void {
    // Opcionalmente, notificar al backend
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    
    // Limpiar almacenamiento local
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  /**
   * Refrescar token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((response) => {
          this.setTokens(response.access_token, response.refresh_token);
        })
      );
  }

  /**
   * Obtener token de acceso
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obtener refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Guardar tokens
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Guardar usuario en almacenamiento
   */
  private saveUserToStorage(user: any): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  /**
   * Obtener usuario del almacenamiento
   */
  private getUserFromStorage(): any {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Registrarse
   */
  register(data: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap((response) => {
          this.setTokens(response.access_token, response.refresh_token);
          this.currentUserSubject.next(response.user);
          this.saveUserToStorage(response.user);
        })
      );
  }
}
```

---

### CORRECCIÓN 4: Configurar Tailwind con Paleta de Colores Profesional

**Archivo:** `apps/web/tailwind.config.ts` (CREAR/REEMPLAZAR)

```typescript
// ✅ CÓDIGO CORRECCIÓN COMPLETA

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{html,ts,tsx}',
    './src/app/**/*.{html,ts,tsx}',
  ],
  
  theme: {
    extend: {
      colors: {
        // Paleta Primaria - Teal Profesional
        'primary': {
          '50': '#f0fdfa',
          '100': '#d1faf6',
          '200': '#a3f4ed',
          '300': '#69eae1',
          '400': '#2dd4cf', // Color Principal
          '500': '#14b8a6',
          '600': '#0d9488',
          '700': '#0f766e',
          '800': '#155e59',
          '900': '#134e4a',
        },

        // Paleta Secundaria - Slate Gris Profesional
        'secondary': {
          '50': '#f8fafc',
          '100': '#f1f5f9',
          '200': '#e2e8f0',
          '300': '#cbd5e1',
          '400': '#94a3b8',
          '500': '#64748b',
          '600': '#475569',
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
        },

        // Paleta Acentuada - Naranja para acciones
        'accent': {
          '50': '#fff7ed',
          '100': '#ffedd5',
          '200': '#fed7aa',
          '300': '#fdba74',
          '400': '#fb923c',
          '500': '#f97316', // Naranja Cálido
          '600': '#ea580c',
          '700': '#c2410c',
          '800': '#92400e',
          '900': '#78350f',
        },

        // Estados
        'success': {
          '50': '#f0fdf4',
          '500': '#22c55e',
          '600': '#16a34a',
          '700': '#15803d',
        },

        'warning': {
          '50': '#fffbeb',
          '500': '#eab308',
          '600': '#ca8a04',
          '700': '#a16207',
        },

        'danger': {
          '50': '#fef2f2',
          '500': '#ef4444',
          '600': '#dc2626',
          '700': '#b91c1c',
        },

        'info': {
          '50': '#f0f9ff',
          '500': '#3b82f6',
          '600': '#2563eb',
          '700': '#1d4ed8',
        },

        // Neutral - Para backgrounds
        'neutral': {
          '50': '#fafafa',
          '100': '#f5f5f5',
          '200': '#e5e5e5',
          '300': '#d4d4d4',
          '400': '#a3a3a3',
          '500': '#737373',
          '600': '#525252',
          '700': '#404040',
          '800': '#262626',
          '900': '#171717',
        },
      },

      backgroundColor: {
        'surface': 'var(--color-surface, #ffffff)',
        'overlay': 'rgba(0, 0, 0, 0.5)',
      },

      textColor: {
        'primary': 'var(--color-text-primary, #0f172a)',
        'secondary': 'var(--color-text-secondary, #64748b)',
        'muted': 'var(--color-text-muted, #94a3b8)',
      },

      borderColor: {
        'DEFAULT': 'var(--color-border, #e2e8f0)',
      },

      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },

      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'hover': '0 10px 20px 0 rgba(20, 184, 166, 0.1)',
      },

      spacing: {
        '0.5': '0.125rem',
        '1.5': '0.375rem',
        '2.5': '0.625rem',
        '3.5': '0.875rem',
      },

      borderRadius: {
        'sm': '0.375rem',
        'base': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1)',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },

  plugins: [],

  // Dark mode
  darkMode: 'class',
};

export default config;
```

---

### CORRECCIÓN 5: Crear Componente de Órdenes conectado al Backend

**Archivo:** `apps/web/src/app/components/orders/orders-list.component.ts` (CREAR)

```typescript
// ✅ CÓDIGO NUEVO

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersService, Order, PaginatedOrders } from '../../services/orders.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto py-8 px-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-primary-900">Órdenes de Trabajo</h1>
        <button
          class="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition"
        >
          Nueva Orden
        </button>
      </div>

      <!-- Filtros -->
      <div class="mb-6 flex gap-4">
        <select
          class="border border-gray-300 rounded-lg px-4 py-2"
          (change)="onStatusChange($event)"
        >
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="pending">Pendiente</option>
          <option value="inprogress">En Progreso</option>
          <option value="completed">Completada</option>
          <option value="closed">Cerrada</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      <!-- Tabla de órdenes -->
      <div *ngIf="orders$ | async as orders; else loading" class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                # Orden
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Descripción
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Fecha Creación
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              *ngFor="let order of orders"
              class="hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4 text-sm font-medium text-primary-600">
                {{ order.orderNumber }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ order.clientId }}
              </td>
              <td class="px-6 py-4 text-sm">
                <span [ngClass]="getStatusClass(order.status)">
                  {{ order.status | titlecase }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ order.description | slice: 0: 50 }}...
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ order.createdAt | date: 'short' }}
              </td>
              <td class="px-6 py-4 text-sm space-x-2">
                <button
                  class="text-primary-600 hover:text-primary-900"
                  routerLink="['/orders', order.id]"
                >
                  Ver
                </button>
                <button
                  class="text-blue-600 hover:text-blue-900"
                  (click)="editOrder(order)"
                >
                  Editar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #loading>
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [],
})
export class OrdersListComponent implements OnInit, OnDestroy {
  orders$: Observable<Order[]>;
  private destroy$ = new Subject<void>();
  private selectedStatus: string | undefined;

  constructor(private ordersService: OrdersService) {
    this.orders$ = this.ordersService.orders$;
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.ordersService
      .getOrders(1, 10, this.selectedStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onStatusChange(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value || undefined;
    this.loadOrders();
  }

  editOrder(order: Order): void {
    // Navegar a edición
    console.log('Editar orden:', order);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      draft: 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold',
      pending: 'px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold',
      inprogress: 'px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold',
      completed: 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold',
      closed: 'px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-semibold',
      cancelled: 'px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold',
    };
    return classes[status] || classes['draft'];
  }
}
```

---

### CORRECCIÓN 6: Configurar Módulo Principal con HttpClientModule

**Archivo:** `apps/web/src/app/app.module.ts` o `apps/web/src/main.ts` (Actualizar)

```typescript
// ✅ CÓDIGO CORRECCIÓN

import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS, withXsrfConfiguration } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthInterceptor } from './app/core/http/auth.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      // Agregar interceptor de autenticación
      withXsrfConfiguration({
        cookieName: 'XSRF-TOKEN',
        headerName: 'X-XSRF-TOKEN',
      })
    ),
    // Registrar interceptor manualmente
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
```

---

---

## 🔗 INTEGRACIÓN FRONTEND-BACKEND

### CORRECCIÓN: Crear Environment Configuration

**Archivo:** `apps/web/src/environments/environment.ts` (CREAR)

```typescript
// ✅ CÓDIGO NUEVO

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
```

**Archivo:** `apps/web/src/environments/environment.prod.ts` (CREAR)

```typescript
// ✅ CÓDIGO NUEVO

export const environment = {
  production: true,
  apiUrl: 'https://api.cermont.com/api', // URL real en producción
};
```

---

### CORRECCIÓN: Configurar CORS en NestJS

**Archivo:** `apps/api/src/main.ts` - Línea ~20 (Ya incluida en corrección anterior)

---

---

## 🎨 PALETA DE COLORES PROFESIONAL

Basada en el análisis del logo y sector petrolero de CERMONT:

### Paleta Principal

```
Primario (Teal Profesional):
  - #14b8a6 (Color Principal) - Confianza, tecnología
  - #0d9488 (Hover) - Acción secundaria
  - #0f766e (Activo) - Estados activos

Secundario (Gris Profesional):
  - #475569 (Texto Principal) - Legibilidad
  - #64748b (Texto Secundario) - Jerarquía
  - #cbd5e1 (Bordes) - Delimitación

Acentuada (Naranja):
  - #f97316 (Acciones) - Llamadas a la acción
  - #ea580c (Hover) - Interactividad

Estados:
  - Verde: #22c55e (Éxito)
  - Rojo: #ef4444 (Error)
  - Amarillo: #eab308 (Advertencia)
  - Azul: #3b82f6 (Info)
```

### Aplicación en Componentes

```css
/* Botones Primarios */
.btn-primary {
  @apply bg-primary-500 text-white hover:bg-primary-600 transition-colors;
}

/* Botones Secundarios */
.btn-secondary {
  @apply border-2 border-primary-500 text-primary-500 hover:bg-primary-50;
}

/* Cards */
.card {
  @apply bg-white border border-gray-200 shadow-sm hover:shadow-md rounded-lg;
}

/* Headers */
h1 {
  @apply text-primary-900 font-bold;
}

/* Status Badges */
.status-active {
  @apply bg-green-100 text-green-800;
}

.status-pending {
  @apply bg-yellow-100 text-yellow-800;
}

.status-failed {
  @apply bg-red-100 text-red-800;
}
```

---

---

## 📐 ESTRUCTURA Y MEJORAS UI/UX

### Componentes Angular a Crear/Mejorar

1. **Dashboard**
   - KPIs en tiempo real (órdenes completadas, en progreso)
   - Gráficos con AmCharts5
   - Widgets de estado

2. **Órdenes**
   - Listado con tabla responsiva
   - Filtros por estado, cliente, fecha
   - CRUD completo

3. **Detalles de Orden**
   - Información completa
   - Timeline de estados
   - Evidencias adjuntas
   - Materiales utilizados

4. **Formulario Crear Orden**
   - Validación en tiempo real
   - Autocompletado de clientes
   - Selección de ubicación con mapa

5. **Reportes**
   - Gráficos de productividad
   - Exportación a PDF
   - Filtros temporales

---

---

## 📅 PLAN DE IMPLEMENTACIÓN FASE A FASE

### FASE 1: Configuración Base (Semana 1)

**Tareas:**
1. ✅ Crear DTOs y validación en backend
2. ✅ Configurar Tailwind con paleta de colores
3. ✅ Crear AuthService y AuthInterceptor
4. ✅ Crear OrdersService
5. ✅ Configurar HttpClientModule

**Comandos:**

```bash
# Backend
cd apps/api
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend
cd apps/web
npm install
npm run dev
```

### FASE 2: Integración API (Semana 2)

**Tareas:**
1. ✅ Implementar Guards JWT en backend
2. ✅ Crear endpoint /auth/login, /auth/refresh
3. ✅ Crear endpoints CRUD de órdenes
4. ✅ Crear componente de login
5. ✅ Crear componente listado órdenes

### FASE 3: Dashboard y Reportes (Semana 3)

**Tareas:**
1. ✅ Crear dashboard con KPIs
2. ✅ Integrar AmCharts5 para gráficos
3. ✅ Crear módulo de reportes
4. ✅ Implementar exportación a PDF

### FASE 4: Testing y Optimización (Semana 4)

**Tareas:**
1. ✅ Pruebas unitarias backend
2. ✅ Pruebas e2e
3. ✅ Optimización de rendimiento
4. ✅ Deploy a producción

---

## 🚀 PRÓXIMOS PASOS

1. **Implementar las correcciones en orden** (Fase 1 → Fase 4)
2. **Ejecutar migraciones de base de datos**
3. **Crear usuarios de prueba**
4. **Validar integración frontend-backend**
5. **Realizar pruebas de carga**
6. **Documentar endpoints en Swagger**

---

**Documento preparado para Juan Diego Arévalo - Proyecto CERMONT**
**Fecha: Diciembre 2025**
