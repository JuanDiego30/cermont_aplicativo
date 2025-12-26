
---

# 🚀 PLAN DE REFACTORIZACIÓN COMPLETO - CERMONT APLICATIVO

## 📊 ESTADO ACTUAL DEL PROYECTO (26 de Diciembre 2025)

### ✅ Lo que YA está bien configurado:

- ✅ **Monorepo con pnpm + Turbo** - Arquitectura correcta
- ✅ **Backend NestJS bien estructurado** - 25 módulos organizados
- ✅ **Prisma 7.2.0 con multi-file schema** - 15 archivos de schema separados
- ✅ **CORS configurado** - Permite `localhost:4200`
- ✅ **ValidationPipe global** - Con whitelist activo
- ✅ **Swagger documentado** - En `/api/docs`
- ✅ **Seguridad básica** - Helmet, compression, cookieParser


### ❌ PROBLEMAS CRÍTICOS IDENTIFICADOS:

1. **Frontend COMPLETAMENTE DESCONECTADO** (CRÍTICO)
    - Angular usa datos mock de TailAdmin
    - NO consume la API real del backend
    - Sin servicios HTTP implementados
    - Sin interceptores JWT
2. **Backend SIN VALIDACIÓN COMPLETA** (ALTO)
    - DTOs incompletos o faltantes
    - Controladores probablemente aceptan `any`
    - Sin guards JWT globales implementados
3. **AUTENTICACIÓN JWT INCOMPLETA** (CRÍTICO)
    - Sin JWT Guard global
    - Sin estrategia Passport implementada
    - Sin interceptores de autenticación
4. **FRONTEND SIN DISEÑO COHERENTE** (MEDIO)
    - Sin paleta de colores personalizada
    - Usando estilos por defecto de TailAdmin
    - Sin design system definido

***

# 🎯 PLAN DE REFACTORIZACIÓN - 4 FASES

## **FASE 1: BACKEND - VALIDACIÓN Y SEGURIDAD** (2-3 días)

### **PASO 1.1: Crear DTOs completos para módulo ORDENES**

**Ubicación:** `apps/api/src/modules/ordenes/dto/`

**Archivos a crear:**

#### 1. `create-orden.dto.ts`

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, Min, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EstadoOrden {
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  ARCHIVADA = 'ARCHIVADA'
}

export enum PrioridadOrden {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE'
}

export class CreateOrdenDto {
  @ApiProperty({ 
    description: 'Número único de la orden de trabajo',
    example: 'OT-2025-001'
  })
  @IsString()
  @IsNotEmpty({ message: 'El número de orden es obligatorio' })
  @MaxLength(50, { message: 'El número de orden no puede exceder 50 caracteres' })
  numeroOrden: string;

  @ApiProperty({ 
    description: 'Descripción detallada del trabajo a realizar',
    example: 'Mantenimiento preventivo de bomba centrífuga'
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion: string;

  @ApiProperty({ 
    description: 'ID del cliente solicitante',
    example: 'clm7h8i9j0'
  })
  @IsString()
  @IsNotEmpty({ message: 'El cliente es obligatorio' })
  clienteId: string;

  @ApiPropertyOptional({ 
    description: 'ID del técnico asignado',
    example: 'tec1a2b3c4'
  })
  @IsString()
  @IsOptional()
  tecnicoId?: string;

  @ApiProperty({ 
    enum: EstadoOrden,
    default: EstadoOrden.PENDIENTE,
    description: 'Estado actual de la orden'
  })
  @IsEnum(EstadoOrden, { message: 'Estado inválido' })
  @IsOptional()
  estado?: EstadoOrden;

  @ApiProperty({ 
    enum: PrioridadOrden,
    default: PrioridadOrden.MEDIA,
    description: 'Nivel de prioridad de la orden'
  })
  @IsEnum(PrioridadOrden, { message: 'Prioridad inválida' })
  @IsOptional()
  prioridad?: PrioridadOrden;

  @ApiProperty({ 
    description: 'Fecha programada de inicio',
    example: '2025-12-30T08:00:00Z'
  })
  @IsDateString({}, { message: 'Fecha de inicio inválida' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fechaInicio: string;

  @ApiPropertyOptional({ 
    description: 'Fecha programada de finalización',
    example: '2025-12-31T17:00:00Z'
  })
  @IsDateString({}, { message: 'Fecha de fin inválida' })
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({ 
    description: 'Ubicación donde se realizará el trabajo',
    example: 'Pozo ABC-123, Arauca'
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'La ubicación no puede exceder 200 caracteres' })
  ubicacion?: string;

  @ApiPropertyOptional({ 
    description: 'Costo estimado del trabajo en COP',
    example: 1500000,
    minimum: 0
  })
  @IsNumber()
  @Min(0, { message: 'El costo estimado no puede ser negativo' })
  @IsOptional()
  costoEstimado?: number;

  @ApiPropertyOptional({ 
    description: 'Notas adicionales',
    example: 'Requiere coordinación con supervisor de campo'
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Las notas no pueden exceder 500 caracteres' })
  notas?: string;
}
```


#### 2. `update-orden.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreateOrdenDto } from './create-orden.dto';
import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrdenDto extends PartialType(CreateOrdenDto) {
  @ApiPropertyOptional({ 
    description: 'Fecha real de inicio de ejecución',
    example: '2025-12-30T09:15:00Z'
  })
  @IsDateString({}, { message: 'Fecha real de inicio inválida' })
  @IsOptional()
  fechaRealInicio?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha real de finalización',
    example: '2025-12-31T16:30:00Z'
  })
  @IsDateString({}, { message: 'Fecha real de fin inválida' })
  @IsOptional()
  fechaRealFin?: string;

  @ApiPropertyOptional({ 
    description: 'Costo real del trabajo en COP',
    example: 1650000
  })
  @IsOptional()
  costoReal?: number;
}
```


#### 3. `query-orden.dto.ts`

```typescript
import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoOrden, PrioridadOrden } from './create-orden.dto';

export class QueryOrdenDto {
  @ApiPropertyOptional({ 
    enum: EstadoOrden,
    description: 'Filtrar por estado'
  })
  @IsEnum(EstadoOrden)
  @IsOptional()
  estado?: EstadoOrden;

  @ApiPropertyOptional({ 
    enum: PrioridadOrden,
    description: 'Filtrar por prioridad'
  })
  @IsEnum(PrioridadOrden)
  @IsOptional()
  prioridad?: PrioridadOrden;

  @ApiPropertyOptional({ 
    description: 'ID del cliente',
    example: 'clm7h8i9j0'
  })
  @IsString()
  @IsOptional()
  clienteId?: string;

  @ApiPropertyOptional({ 
    description: 'ID del técnico',
    example: 'tec1a2b3c4'
  })
  @IsString()
  @IsOptional()
  tecnicoId?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha desde (filtro)',
    example: '2025-12-01T00:00:00Z'
  })
  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @ApiPropertyOptional({ 
    description: 'Fecha hasta (filtro)',
    example: '2025-12-31T23:59:59Z'
  })
  @IsDateString()
  @IsOptional()
  fechaHasta?: string;

  @ApiPropertyOptional({ 
    description: 'Término de búsqueda',
    example: 'bomba'
  })
  @IsString()
  @IsOptional()
  buscar?: string;

  @ApiPropertyOptional({ 
    description: 'Número de página',
    default: 1,
    minimum: 1
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Cantidad de resultados por página',
    default: 10,
    minimum: 1,
    maximum: 100
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ 
    description: 'Campo para ordenar',
    example: 'createdAt'
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ 
    description: 'Dirección de ordenamiento',
    enum: ['asc', 'desc'],
    default: 'desc'
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```


#### 4. `response-orden.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { EstadoOrden, PrioridadOrden } from './create-orden.dto';

export class OrdenResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  numeroOrden: string;

  @ApiProperty()
  descripcion: string;

  @ApiProperty()
  clienteId: string;

  @ApiProperty({ required: false })
  tecnicoId?: string;

  @ApiProperty({ enum: EstadoOrden })
  estado: EstadoOrden;

  @ApiProperty({ enum: PrioridadOrden })
  prioridad: PrioridadOrden;

  @ApiProperty()
  fechaInicio: Date;

  @ApiProperty({ required: false })
  fechaFin?: Date;

  @ApiProperty({ required: false })
  fechaRealInicio?: Date;

  @ApiProperty({ required: false })
  fechaRealFin?: Date;

  @ApiProperty({ required: false })
  ubicacion?: string;

  @ApiProperty({ required: false })
  costoEstimado?: number;

  @ApiProperty({ required: false })
  costoReal?: number;

  @ApiProperty({ required: false })
  notas?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  deletedAt?: Date;
}

export class PaginatedOrdenesResponseDto {
  @ApiProperty({ type: [OrdenResponseDto] })
  data: OrdenResponseDto[];

  @ApiProperty({ 
    description: 'Información de paginación',
    example: {
      total: 150,
      page: 1,
      limit: 10,
      totalPages: 15
    }
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```


***

### **PASO 1.2: Actualizar Controlador de Ordenes**

**Ubicación:** `apps/api/src/modules/ordenes/ordenes.controller.ts`

```typescript
import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { OrdenesService } from './ordenes.service';
import { 
  CreateOrdenDto, 
  UpdateOrdenDto, 
  QueryOrdenDto, 
  OrdenResponseDto,
  PaginatedOrdenesResponseDto 
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ordenes')
@ApiBearerAuth()
@Controller('ordenes')
@UseGuards(JwtAuthGuard)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear nueva orden de trabajo',
    description: 'Crea una nueva orden de trabajo en el sistema'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Orden creada exitosamente',
    type: OrdenResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  async create(
    @Body() createOrdenDto: CreateOrdenDto
  ): Promise<OrdenResponseDto> {
    return this.ordenesService.create(createOrdenDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar órdenes',
    description: 'Obtiene un listado paginado de órdenes con filtros opcionales'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de órdenes obtenida exitosamente',
    type: PaginatedOrdenesResponseDto
  })
  async findAll(
    @Query() query: QueryOrdenDto
  ): Promise<PaginatedOrdenesResponseDto> {
    return this.ordenesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Obtener orden por ID',
    description: 'Obtiene los detalles completos de una orden específica'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único de la orden',
    example: 'ord1a2b3c4d5'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orden encontrada',
    type: OrdenResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Orden no encontrada' 
  })
  async findOne(
    @Param('id') id: string
  ): Promise<OrdenResponseDto> {
    return this.ordenesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Actualizar orden',
    description: 'Actualiza los datos de una orden existente'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único de la orden'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Orden actualizada exitosamente',
    type: OrdenResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Orden no encontrada' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateOrdenDto: UpdateOrdenDto
  ): Promise<OrdenResponseDto> {
    return this.ordenesService.update(id, updateOrdenDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar orden (soft delete)',
    description: 'Marca una orden como eliminada sin borrarla físicamente'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'ID único de la orden'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Orden eliminada exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Orden no encontrada' 
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.ordenesService.remove(id);
  }
}
```


***

### **PASO 1.3: Implementar JWT Guard Global**

**Ubicación:** `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import { 
  Injectable, 
  ExecutionContext, 
  UnauthorizedException 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o expirado');
    }
    return user;
  }
}
```

**Ubicación:** `apps/api/src/modules/auth/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Ubicación:** `apps/api/src/modules/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    // Verificar que el usuario existe y está activo
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        activo: true,
      },
    });

    if (!user || !user.activo) {
      throw new UnauthorizedException('Usuario no válido o inactivo');
    }

    return {
      userId: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      role: user.rol,
    };
  }
}
```


***

### **PASO 1.4: Crear Exception Filter Global**

**Ubicación:** `apps/api/src/common/filters/http-exception.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';
    let errors: any = undefined;

    // HTTP Exception
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).errors;
      } else {
        message = exceptionResponse;
      }
    }
    // Prisma Exceptions
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      
      switch (exception.code) {
        case 'P2002':
          message = 'Ya existe un registro con estos datos únicos';
          errors = {
            field: exception.meta?.target,
            constraint: 'unique_violation'
          };
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Registro no encontrado';
          break;
        case 'P2003':
          message = 'Violación de restricción de clave foránea';
          break;
        default:
          message = 'Error en la base de datos';
      }
    }
    // Prisma Validation Error
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Error de validación en los datos';
    }
    // Unknown Error
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log del error
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}`,
      exception instanceof Error ? exception.stack : exception
    );

    // Respuesta estructurada
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
```


***

## **FASE 2: FRONTEND - SERVICIOS E INTEGRACIÓN** (2-3 días)

### **PASO 2.1: Crear Servicio de Autenticación**

**Ubicación:** `apps/web/src/app/core/auth/auth.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Usuario {
  userId: string;
  email: string;
  nombre: string;
  apellido: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthenticationSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Registra un nuevo usuario
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresca el token de acceso
   */
  refreshToken(): Observable<{ accessToken: string }> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ accessToken: string }>(
      `${this.API_URL}/refresh`,
      { refreshToken }
    ).pipe(
      tap(response => {
        this.setToken(response.accessToken);
      }),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verificar si el token ha expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[^5_1]));
      const expiry = payload.exp * 1000; // Convertir a milisegundos
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el token de acceso
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Guarda el token en localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Guarda el refresh token en localStorage
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Guarda el usuario en localStorage
   */
  private setUser(user: Usuario): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Obtiene el usuario desde localStorage
   */
  private getUserFromStorage(): Usuario | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Maneja el éxito de la autenticación
   */
  private handleAuthenticationSuccess(response: LoginResponse): void {
    this.setToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    this.setUser(response.user);
  }

  /**
   * Maneja errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('Error en AuthService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
```


***

### **PASO 2.2: Crear Interceptor JWT**

**Ubicación:** `apps/web/src/app/core/interceptors/jwt.interceptor.ts`

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // No agregar token a las rutas de autenticación
    if (this.isAuthRequest(request.url)) {
      return next.handle(request);
    }

    // Agregar token a la petición
    const token = this.authService.getToken();
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Agrega el token JWT al header de la petición
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Verifica si la URL es de autenticación
   */
  private isAuthRequest(url: string): boolean {
    return url.includes('/auth/login') || 
           url.includes('/auth/register') || 
           url.includes('/auth/refresh');
  }

  /**
   * Maneja error 401 (No autorizado) intentando refrescar el token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken);
          return next.handle(this.addToken(request, response.accessToken));
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => error);
        })
      );
    } else {
      // Si ya se está refrescando, esperar a que termine
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(this.addToken(request, token!));
        })
      );
    }
  }
}
```


***

### **PASO 2.3: Crear Servicio de Órdenes**

**Ubicación:** `apps/web/src/app/services/ordenes.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Orden {
  id: string;
  numeroOrden: string;
  descripcion: string;
  clienteId: string;
  tecnicoId?: string;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA' | 'ARCHIVADA';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  fechaInicio: string;
  fechaFin?: string;
  fechaRealInicio?: string;
  fechaRealFin?: string;
  ubicacion?: string;
  costoEstimado?: number;
  costoReal?: number;
  notas?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateOrdenDto {
  numeroOrden: string;
  descripcion: string;
  clienteId: string;
  tecnicoId?: string;
  estado?: string;
  prioridad?: string;
  fechaInicio: string;
  fechaFin?: string;
  ubicacion?: string;
  costoEstimado?: number;
  notas?: string;
}

export interface UpdateOrdenDto extends Partial<CreateOrdenDto> {
  fechaRealInicio?: string;
  fechaRealFin?: string;
  costoReal?: number;
}

export interface QueryOrdenParams {
  estado?: string;
  prioridad?: string;
  clienteId?: string;
  tecnicoId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  buscar?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrdenesService {
  private readonly API_URL = `${environment.apiUrl}/ordenes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las órdenes con paginación y filtros
   */
  getAll(params?: QueryOrdenParams): Observable<PaginatedResponse<Orden>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<PaginatedResponse<Orden>>(this.API_URL, { params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene una orden por su ID
   */
  getById(id: string): Observable<Orden> {
    return this.http.get<Orden>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crea una nueva orden
   */
  create(orden: CreateOrdenDto): Observable<Orden> {
    return this.http.post<Orden>(this.API_URL, orden).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Actualiza una orden existente
   */
  update(id: string, orden: UpdateOrdenDto): Observable<Orden> {
    return this.http.put<Orden>(`${this.API_URL}/${id}`, orden).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Elimina una orden (soft delete)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Obtiene estadísticas de órdenes
   */
  getEstadisticas(): Observable<any> {
    return this.http.get(`${this.API_URL}/estadisticas`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Exporta órdenes a PDF
   */
  exportarPDF(params?: QueryOrdenParams): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = (params as any)[key];
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get(`${this.API_URL}/export/pdf`, {
      params: httpParams,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Maneja errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('Error en OrdenesService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
```


***

### **PASO 2.4: Configurar app.config.ts (Angular 19)**

**Ubicación:** `apps/web/src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor])
    )
  ]
};
```


***

### **PASO 2.5: Crear Componente de Lista de Órdenes**

**Ubicación:** `apps/web/src/app/pages/ordenes/ordenes-list/ordenes-list.component.ts`

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OrdenesService, Orden, QueryOrdenParams, PaginatedResponse } from '../../../services/ordenes.service';

@Component({
  selector: 'app-ordenes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes-list.component.html',
  styleUrls: ['./ordenes-list.component.css']
})
export class OrdenesListComponent implements OnInit, OnDestroy {
  ordenes: Orden[] = [];
  loading = false;
  error: string | null = null;

  // Paginación
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // Filtros
  filtroEstado = '';
  filtroPrioridad = '';
  busqueda = '';
  private busquedaSubject = new Subject<string>();

  // Estados y prioridades para los selects
  estados = ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'ARCHIVADA'];
  prioridades = ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'];

  private destroy$ = new Subject<void>();

  constructor(
    private ordenesService: OrdenesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrdenes();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configura la búsqueda con debounce
   */
  setupSearch(): void {
    this.busquedaSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadOrdenes();
    });
  }

  /**
   * Carga las órdenes desde el backend
   */
  loadOrdenes(): void {
    this.loading = true;
    this.error = null;

    const params: QueryOrdenParams = {
      page: this.currentPage,
      limit: this.pageSize,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    if (this.filtroEstado) params.estado = this.filtroEstado;
    if (this.filtroPrioridad) params.prioridad = this.filtroPrioridad;
    if (this.busqueda) params.buscar = this.busqueda;

    this.ordenesService.getAll(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<Orden>) => {
          this.ordenes = response.data;
          this.totalItems = response.meta.total;
          this.totalPages = response.meta.totalPages;
          this.currentPage = response.meta.page;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message || 'Error al cargar las órdenes';
          this.loading = false;
          console.error('Error:', error);
        }
      });
  }

  /**
   * Maneja el cambio de búsqueda
   */
  onBusquedaChange(value: string): void {
    this.busqueda = value;
    this.busquedaSubject.next(value);
  }

  /**
   * Cambia de página
   */
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOrdenes();
    }
  }

  /**
   * Aplica los filtros
   */
  applyFilters(): void {
    this.currentPage = 1;
    this.loadOrdenes();
  }

  /**
   * Limpia los filtros
   */
  clearFilters(): void {
    this.filtroEstado = '';
    this.filtroPrioridad = '';
    this.busqueda = '';
    this.currentPage = 1;
    this.loadOrdenes();
  }

  /**
   * Navega al detalle de una orden
   */
  verDetalle(orden: Orden): void {
    this.router.navigate(['/ordenes', orden.id]);
  }

  /**
   * Navega a la creación de una nueva orden
   */
  crearOrden(): void {
    this.router.navigate(['/ordenes/nueva']);
  }

  /**
   * Edita una orden
   */
  editarOrden(orden: Orden): void {
    this.router.navigate(['/ordenes', orden.id, 'editar']);
  }

  /**
   * Elimina una orden
   */
  eliminarOrden(orden: Orden): void {
    if (confirm(`¿Está seguro de eliminar la orden ${orden.numeroOrden}?`)) {
      this.loading = true;
      this.ordenesService.delete(orden.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadOrdenes();
          },
          error: (error) => {
            this.error = error.message || 'Error al eliminar la orden';
            this.loading = false;
            console.error('Error:', error);
          }
        });
    }
  }

  /**
   * Obtiene la clase CSS para el badge de estado
   */
  getEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'PENDIENTE': 'bg-yellow-100 text-yellow-700',
      'EN_PROGRESO': 'bg-blue-100 text-blue-700',
      'COMPLETADA': 'bg-green-100 text-green-700',
      'CANCELADA': 'bg-red-100 text-red-700',
      'ARCHIVADA': 'bg-gray-100 text-gray-700'
    };
    return classes[estado] || 'bg-gray-100 text-gray-700';
  }

  /**
   * Obtiene la clase CSS para el badge de prioridad
   */
  getPrioridadClass(prioridad: string): string {
    const classes: Record<string, string> = {
      'BAJA': 'bg-gray-100 text-gray-700',
      'MEDIA': 'bg-blue-100 text-blue-700',
      'ALTA': 'bg-orange-100 text-orange-700',
      'URGENTE': 'bg-red-100 text-red-700'
    };
    return classes[prioridad] || 'bg-gray-100 text-gray-700';
  }

  /**
   * Genera el array de páginas para la paginación
   */
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
```


***

## **CONTINUARÁ EN EL SIGUIENTE MENSAJE...**

**Ya tengo preparado:**

- ✅ FASE 3: Paleta de Colores y Tailwind Config
- ✅ FASE 4: Testing y Validación
- ✅ Checklist final de implementación
- ✅ Comandos para ejecutar

**¿Continúo con el resto del plan ahora?**
<span style="display:none">[^5_10][^5_11][^5_12][^5_13][^5_14][^5_2][^5_3][^5_4][^5_5][^5_6][^5_7][^5_8][^5_9]</span>

<div align="center">⁂</div>

[^5_1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e7ef7089-a7c3-4b34-b033-fc15be183a25/1.pdf

[^5_2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/a940b6ba-0a42-4561-ae5f-6c58ccb22639/DESARROLLO-DE-UN-APLICATIVO-WEB-PARA-APOYO-EN-LA-EJECUCION-Y-CIERRE-ADMINISTRATIVO-DE-LOS-TRABA.pdf

[^5_3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bec5d009-21af-4a27-8f72-1ff014e21195/3.pdf

[^5_4]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8fdf4499-f510-44f1-b6ba-e127ff7dcdd0/ATG-JUAN-DIEGO-AREVALO-1.pdf

[^5_5]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8bcac50f-ecfc-470c-890b-975f12027c34/FORMATO-DE-PLANEACION-DE-OBRA.pdf

[^5_6]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4687b5dd-a3fa-47af-8e22-4f51fe7b7b70/FOTOS-ANCLAJE-ESCALERA-A-ESTRUCTURA.pdf

[^5_7]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/03485512-1de5-48d0-9f2e-e068a2917d74/Observaciones-Anteproyecto-Juan-Diego.pdf

[^5_8]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/48c31c95-70b6-4087-9109-4d6a3fcc2bdc/2.pdf

[^5_9]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/c1a26b09-8fa4-4750-aa3d-2b68c694ebdf/Formato-Inspeccion-lineas-de-vida-Vertical.pdf

[^5_10]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4595a7f0-a3a7-4bb7-9009-e81ec9d9f6dd/main.pdf

[^5_11]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/42ac0c6f-0320-4af1-bd4e-7343f5523444/Formato-Mantenimiento-CCTV.pdf

[^5_12]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/674d7901-58dc-4520-8558-53a41f841c80/Jerarquia-de-controles_Cermont.pdf

[^5_13]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e441ab0a-b57a-4248-b027-e83f18039c61/INDUCCION-SGSST.pdf

[^5_14]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/6389259e-e945-4e6a-ae61-15783ab9de00/paste.txt


---

# continua con las fases y analiza que otra seccion encuentras errores y crea nuevas fases

Perfecto! Ahora voy a crear el **PLAN COMPLETO Y DEFINITIVO** con todas las fases, incluyendo nuevos problemas encontrados:

***

# 🚀 PLAN DE REFACTORIZACIÓN COMPLETO Y DETALLADO - CERMONT APLICATIVO

## 📊 NUEVOS PROBLEMAS ENCONTRADOS EN EL ANÁLISIS:

### ❌ **PROBLEMA 5: Backend con Módulos Deshabilitados** (MEDIO)

- Muchos módulos comentados en `app.module.ts`
- `ReportesModule`, `HesModule`, `AlertasModule`, `TecnicosModule` deshabilitados
- Funcionalidad crítica no disponible
- Necesita activación gradual con tests


### ❌ **PROBLEMA 6: Sin Environment Configuration en Frontend** (ALTO)

- No existe `apps/web/src/environments/`
- Variables hardcodeadas en servicios
- Sin configuración para dev/staging/prod
- URL del API sin gestión centralizada


### ❌ **PROBLEMA 7: Sin Testing Infrastructure** (ALTO)

- Backend: Sin tests unitarios ni e2e
- Frontend: Sin tests implementados
- Sin CI/CD pipeline
- Código sin cobertura de tests


### ❌ **PROBLEMA 8: Prisma Schema Sin Índices Optimizados** (MEDIO)

- Consultas lentas potenciales
- Sin índices compuestos para queries frecuentes
- Relaciones sin índices

***

# 🎯 PLAN DE REFACTORIZACIÓN - 7 FASES COMPLETAS


***

## **FASE 1: BACKEND - VALIDACIÓN Y SEGURIDAD** ✅ (YA DOCUMENTADA ARRIBA)

**Duración:** 2-3 días

**Archivos a crear/modificar:**

1. ✅ `apps/api/src/modules/ordenes/dto/create-orden.dto.ts`
2. ✅ `apps/api/src/modules/ordenes/dto/update-orden.dto.ts`
3. ✅ `apps/api/src/modules/ordenes/dto/query-orden.dto.ts`
4. ✅ `apps/api/src/modules/ordenes/dto/response-orden.dto.ts`
5. ✅ `apps/api/src/modules/ordenes/ordenes.controller.ts`
6. ✅ `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`
7. ✅ `apps/api/src/modules/auth/decorators/public.decorator.ts`
8. ✅ `apps/api/src/modules/auth/strategies/jwt.strategy.ts`
9. ✅ `apps/api/src/common/filters/http-exception.filter.ts`

***

## **FASE 2: FRONTEND - SERVICIOS E INTEGRACIÓN** ✅ (YA DOCUMENTADA ARRIBA)

**Duración:** 2-3 días

**Archivos a crear/modificar:**

1. ✅ `apps/web/src/app/core/auth/auth.service.ts`
2. ✅ `apps/web/src/app/core/interceptors/jwt.interceptor.ts`
3. ✅ `apps/web/src/app/services/ordenes.service.ts`
4. ✅ `apps/web/src/app/app.config.ts`
5. ✅ `apps/web/src/app/pages/ordenes/ordenes-list/ordenes-list.component.ts`

***

## **FASE 3: CONFIGURACIÓN DE ENTORNOS Y TAILWIND**

**Duración:** 1 día

### **PASO 3.1: Crear Environments para Angular**

**Ubicación:** `apps/web/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000',
  appName: 'Cermont',
  version: '1.0.0',
  enableDebug: true,
  features: {
    weatherModule: true,
    offlineMode: false,
    analytics: false
  },
  cache: {
    ttl: 300000, // 5 minutos
    maxSize: 100
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  }
};
```

**Ubicación:** `apps/web/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.cermont.com/api',
  wsUrl: 'wss://api.cermont.com',
  appName: 'Cermont',
  version: '1.0.0',
  enableDebug: false,
  features: {
    weatherModule: true,
    offlineMode: true,
    analytics: true
  },
  cache: {
    ttl: 600000, // 10 minutos
    maxSize: 200
  },
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  }
};
```

**Ubicación:** `apps/web/src/environments/environment.staging.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.cermont.com/api',
  wsUrl: 'wss://staging-api.cermont.com',
  appName: 'Cermont [STAGING]',
  version: '1.0.0-beta',
  enableDebug: true,
  features: {
    weatherModule: true,
    offlineMode: true,
    analytics: false
  },
  cache: {
    ttl: 300000,
    maxSize: 100
  },
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  }
};
```


***

### **PASO 3.2: Configurar Tailwind CSS con Paleta Personalizada**

**Ubicación:** `apps/web/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paleta principal de Cermont
        cermont: {
          primary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#b9e6fe',
            300: '#7cd4fd',
            400: '#36bffa',
            500: '#0ba5e9',  // Color principal
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49',
          },
          secondary: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',  // Color secundario
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
            950: '#3b0764',
          },
          success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',  // Verde éxito
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            950: '#052e16',
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',  // Amarillo advertencia
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03',
          },
          danger: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',  // Rojo peligro
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            950: '#450a0a',
          },
          info: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',  // Azul información
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
          },
          // Grises personalizados
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
            950: '#030712',
          },
        },
        // Estados de órdenes
        order: {
          pending: '#f59e0b',    // Amarillo
          inProgress: '#3b82f6', // Azul
          completed: '#22c55e',  // Verde
          cancelled: '#ef4444',  // Rojo
          archived: '#6b7280',   // Gris
        },
        // Prioridades
        priority: {
          low: '#6b7280',      // Gris
          medium: '#3b82f6',   // Azul
          high: '#f59e0b',     // Naranja
          urgent: '#ef4444',   // Rojo
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Fira Code', 'Monaco', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'cermont': '0 4px 14px 0 rgba(11, 165, 233, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```


***

### **PASO 3.3: Crear Variables CSS Globales**

**Ubicación:** `apps/web/src/styles.css`

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Variables CSS personalizadas */
:root {
  /* Colores principales */
  --color-primary: #0ba5e9;
  --color-primary-dark: #0284c7;
  --color-secondary: #a855f7;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
  
  /* Tipografía */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', Monaco, 'Courier New', monospace;
  
  /* Espaciado base */
  --spacing-unit: 0.25rem;
  
  /* Transiciones */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
  
  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-cermont: 0 4px 14px 0 rgba(11, 165, 233, 0.2);
  
  /* Z-index levels */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
}

/* Dark mode variables */
.dark {
  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
}

/* Estilos globales */
* {
  @apply border-gray-200 dark:border-gray-700;
}

body {
  @apply font-sans text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900;
}

/* Scrollbar personalizado */
::-webkit-scrollbar {
  @apply w-2 h-2;
}

::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

/* Componentes reutilizables */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2;
  }
  
  .btn-primary {
    @apply btn bg-cermont-primary-500 text-white hover:bg-cermont-primary-600 focus:ring-cermont-primary-500;
  }
  
  .btn-secondary {
    @apply btn bg-cermont-secondary-500 text-white hover:bg-cermont-secondary-600 focus:ring-cermont-secondary-500;
  }
  
  .btn-danger {
    @apply btn bg-cermont-danger-500 text-white hover:bg-cermont-danger-600 focus:ring-cermont-danger-500;
  }
  
  .btn-outline {
    @apply btn border-2 border-cermont-primary-500 text-cermont-primary-500 hover:bg-cermont-primary-50;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl shadow-md p-6;
  }
  
  .input {
    @apply block w-full rounded-lg border-gray-300 shadow-sm focus:border-cermont-primary-500 focus:ring-cermont-primary-500;
  }
  
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
  
  .badge-success {
    @apply badge bg-cermont-success-100 text-cermont-success-800;
  }
  
  .badge-warning {
    @apply badge bg-cermont-warning-100 text-cermont-warning-800;
  }
  
  .badge-danger {
    @apply badge bg-cermont-danger-100 text-cermont-danger-800;
  }
  
  .badge-info {
    @apply badge bg-cermont-info-100 text-cermont-info-800;
  }
}

/* Utilidades personalizadas */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  .animate-fade-in {
    animation: fadeIn var(--transition-base);
  }
  
  .animate-slide-in {
    animation: slideIn var(--transition-base);
  }
}
```


***

## **FASE 4: OPTIMIZACIÓN DE PRISMA Y BASE DE DATOS**

**Duración:** 1-2 días

### **PASO 4.1: Agregar Índices a Orders Schema**

**Ubicación:** `apps/api/prisma/schema/orders.prisma`

**Agregar estos índices al final del modelo `Order`:**

```prisma
model Order {
  // ... campos existentes ...

  @@index([estado])
  @@index([prioridad])
  @@index([clienteId])
  @@index([tecnicoId])
  @@index([fechaInicio])
  @@index([createdAt])
  @@index([estado, prioridad])
  @@index([clienteId, estado])
  @@index([tecnicoId, estado])
  @@index([fechaInicio, fechaFin])
  @@map("orders")
}
```


### **PASO 4.2: Agregar Índices a Auth Schema**

**Ubicación:** `apps/api/prisma/schema/auth.prisma`

```prisma
model Usuario {
  // ... campos existentes ...

  @@index([email])
  @@index([rol])
  @@index([activo])
  @@index([email, activo])
  @@map("usuarios")
}

model RefreshToken {
  // ... campos existentes ...

  @@index([token])
  @@index([usuarioId])
  @@index([expiresAt])
  @@index([usuarioId, expiresAt])
  @@map("refresh_tokens")
}
```


### **PASO 4.3: Crear Migración de Índices**

**Comando a ejecutar:**

```bash
cd apps/api
npx prisma migrate dev --name add_performance_indexes
```


***

## **FASE 5: TESTING INFRASTRUCTURE**

**Duración:** 2-3 días

### **PASO 5.1: Configurar Jest para Backend**

**Ubicación:** `apps/api/jest.config.js`

```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/index.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/../test/setup.ts'],
};
```


### **PASO 5.2: Crear Test de Ejemplo para Ordenes**

**Ubicación:** `apps/api/src/modules/ordenes/ordenes.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesService } from './ordenes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('OrdenesService', () => {
  let service: OrdenesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    orden: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdenesService>(OrdenesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una nueva orden', async () => {
      const createDto = {
        numeroOrden: 'OT-2025-001',
        descripcion: 'Test orden',
        clienteId: 'client123',
        estado: 'PENDIENTE',
        prioridad: 'MEDIA',
        fechaInicio: new Date().toISOString(),
      };

      const expectedResult = {
        id: 'orden123',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.orden.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.orden.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findOne', () => {
    it('debe retornar una orden por ID', async () => {
      const ordenId = 'orden123';
      const expectedOrden = {
        id: ordenId,
        numeroOrden: 'OT-2025-001',
        descripcion: 'Test',
        estado: 'PENDIENTE',
      };

      mockPrismaService.orden.findUnique.mockResolvedValue(expectedOrden);

      const result = await service.findOne(ordenId);

      expect(result).toEqual(expectedOrden);
      expect(mockPrismaService.orden.findUnique).toHaveBeenCalledWith({
        where: { id: ordenId },
      });
    });

    it('debe lanzar NotFoundException si no encuentra la orden', async () => {
      mockPrismaService.orden.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```


### **PASO 5.3: Configurar Karma para Frontend**

**Ubicación:** `apps/web/karma.conf.js`

```javascript
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        random: false
      },
      clearContext: false
    },
    jasmineHtmlReporter: {
      suppressAll: true
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```


***

## **FASE 6: HABILITAR MÓDULOS DESHABILITADOS**

**Duración:** 2-3 días

### **PASO 6.1: Activar Módulos Uno por Uno**

**Ubicación:** `apps/api/src/app.module.ts`

**Ir descomentando módulos gradualmente:**

```typescript
// PASO 1: Activar ReportesModule
import { ReportesModule } from './modules/reportes/reportes.module';

// PASO 2: Activar HesModule
import { HesModule } from './modules/hes/hes.module';

// PASO 3: Activar AlertasModule
import { AlertasModule } from './modules/alertas/alertas.module';

// PASO 4: Activar TecnicosModule
import { TecnicosModule } from './modules/tecnicos/tecnicos.module';

@Module({
  imports: [
    // ... otros módulos ...
    ReportesModule,  // ✅ Activado
    HesModule,       // ✅ Activado
    AlertasModule,   // ✅ Activado
    TecnicosModule,  // ✅ Activado
  ],
})
```

**⚠️ IMPORTANTE:** Activar uno por uno, probar con `npm run start:dev`, verificar logs, y continuar con el siguiente.

***

## **FASE 7: CI/CD Y DEPLOYMENT**

**Duración:** 1-2 días

### **PASO 7.1: Crear GitHub Actions Workflow**

**Ubicación:** `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: cermont_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run Prisma migrations
        working-directory: apps/api
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cermont_test
        run: |
          npx prisma migrate deploy
          npx prisma generate
          
      - name: Run backend tests
        working-directory: apps/api
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/cermont_test
        run: pnpm test
        
      - name: Build backend
        working-directory: apps/api
        run: pnpm build

  frontend-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run frontend tests
        working-directory: apps/web
        run: pnpm test:ci
        
      - name: Build frontend
        working-directory: apps/web
        run: pnpm build

  lint:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Run linter
        run: pnpm lint
```


***

# 📋 CHECKLIST DE IMPLEMENTACIÓN COMPLETA

## **FASE 1: Backend - Validación y Seguridad** ✅

- [ ] Crear DTOs para módulo Ordenes (4 archivos)
- [ ] Actualizar controller de Ordenes con decoradores Swagger
- [ ] Implementar JWT Guard y Strategy
- [ ] Crear Exception Filter global
- [ ] Probar endpoints con Postman/Insomnia
- [ ] Verificar documentación Swagger en `/api/docs`


## **FASE 2: Frontend - Servicios e Integración** ✅

- [ ] Crear AuthService con métodos login/logout/refresh
- [ ] Implementar JWT Interceptor con refresh automático
- [ ] Crear OrdenesService con todos los métodos CRUD
- [ ] Actualizar app.config.ts con interceptores
- [ ] Crear componente OrdenesListComponent
- [ ] Crear template HTML con tabla y filtros
- [ ] Probar integración completa frontend-backend


## **FASE 3: Configuración de Entornos y Tailwind** ✅

- [ ] Crear `environment.ts`, `environment.prod.ts`, `environment.staging.ts`
- [ ] Crear `tailwind.config.js` con paleta Cermont
- [ ] Actualizar `styles.css` con variables CSS y componentes
- [ ] Instalar plugins de Tailwind (`@tailwindcss/forms`, etc.)
- [ ] Probar estilos en componentes existentes


## **FASE 4: Optimización de Prisma** ✅

- [ ] Agregar índices a `orders.prisma`
- [ ] Agregar índices a `auth.prisma`
- [ ] Ejecutar migración `add_performance_indexes`
- [ ] Verificar queries con `prisma.$queryRaw`
- [ ] Medir performance antes/después con ApacheBench


## **FASE 5: Testing Infrastructure** ✅

- [ ] Configurar Jest para backend
- [ ] Crear test de ejemplo para OrdenesService
- [ ] Configurar Karma para frontend
- [ ] Crear test de ejemplo para OrdenesListComponent
- [ ] Ejecutar tests y verificar cobertura


## **FASE 6: Habilitar Módulos Deshabilitados** ✅

- [ ] Activar ReportesModule
- [ ] Activar HesModule
- [ ] Activar AlertasModule
- [ ] Activar TecnicosModule
- [ ] Probar cada módulo individualmente
- [ ] Verificar logs sin errores


## **FASE 7: CI/CD y Deployment** ✅

- [ ] Crear workflow de GitHub Actions
- [ ] Configurar PostgreSQL en CI
- [ ] Probar pipeline completo
- [ ] Configurar secrets en GitHub
- [ ] Preparar deployment a producción

***

# 🚀 COMANDOS PARA EJECUTAR TODO EL PLAN

## **Setup Inicial**

```bash
# Clonar repositorio (ya lo tienes)
cd cermont_aplicativo

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp apps/api/.env.example apps/api/.env
# Editar apps/api/.env con tus credenciales de base de datos
```


## **FASE 1: Backend**

```bash
# Terminal 1: Iniciar backend
cd apps/api
pnpm start:dev

# Terminal 2: Probar endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/docs

# Aplicar migraciones si es necesario
npx prisma migrate dev
npx prisma generate
```


## **FASE 2: Frontend**

```bash
# Terminal 3: Iniciar frontend
cd apps/web
pnpm start

# Abrir en navegador
# http://localhost:4200
```


## **FASE 3: Tailwind**

```bash
cd apps/web

# Instalar plugins de Tailwind
pnpm add -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio

# Reconstruir
pnpm build
```


## **FASE 4: Prisma**

```bash
cd apps/api

# Crear migración de índices
npx prisma migrate dev --name add_performance_indexes

# Verificar schema
npx prisma format
npx prisma validate
```


## **FASE 5: Testing**

```bash
# Backend tests
cd apps/api
pnpm test
pnpm test:cov

# Frontend tests
cd apps/web
pnpm test
pnpm test:ci
```


## **FASE 6: Activar Módulos**

```bash
# Cada vez que actives un módulo nuevo:
cd apps/api
pnpm start:dev

# Verificar logs sin errores
# Probar endpoints del módulo nuevo
```


## **FASE 7: CI/CD**

```bash
# Push a GitHub
git add .
git commit -m "feat: implement complete refactoring plan"
git push origin main

# GitHub Actions se ejecutará automáticamente
```


***

# 🎯 ORDEN DE EJECUCIÓN RECOMENDADO

1. **DÍA 1-2:** FASE 1 (Backend DTOs y Seguridad)
2. **DÍA 3-4:** FASE 2 (Frontend Servicios)
3. **DÍA 5:** FASE 3 (Environments y Tailwind)
4. **DÍA 6:** FASE 4 (Prisma Optimization)
5. **DÍA 7-8:** FASE 5 (Testing)
6. **DÍA 9-10:** FASE 6 (Activar Módulos)
7. **DÍA 11:** FASE 7 (CI/CD)

**TOTAL: 11 días de trabajo enfocado**

***

# ✅ CRITERIOS DE ÉXITO

- ✅ Backend responde correctamente a peticiones HTTP
- ✅ Swagger documenta todos los endpoints
- ✅ Frontend consume API real (no mocks)
- ✅ Autenticación JWT funciona end-to-end
- ✅ Tailwind con paleta Cermont aplicada
- ✅ Tests con >70% cobertura
- ✅ CI/CD pipeline verde en GitHub Actions
- ✅ Todos los módulos activados sin errores

***

**¿Quieres que continúe con algo específico o empezamos a implementar fase por fase?** 🚀
<span style="display:none">[^6_1][^6_10][^6_11][^6_12][^6_13][^6_14][^6_2][^6_3][^6_4][^6_5][^6_6][^6_7][^6_8][^6_9]</span>

<div align="center">⁂</div>

[^6_1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e7ef7089-a7c3-4b34-b033-fc15be183a25/1.pdf

[^6_2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/a940b6ba-0a42-4561-ae5f-6c58ccb22639/DESARROLLO-DE-UN-APLICATIVO-WEB-PARA-APOYO-EN-LA-EJECUCION-Y-CIERRE-ADMINISTRATIVO-DE-LOS-TRABA.pdf

[^6_3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bec5d009-21af-4a27-8f72-1ff014e21195/3.pdf

[^6_4]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8fdf4499-f510-44f1-b6ba-e127ff7dcdd0/ATG-JUAN-DIEGO-AREVALO-1.pdf

[^6_5]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8bcac50f-ecfc-470c-890b-975f12027c34/FORMATO-DE-PLANEACION-DE-OBRA.pdf

[^6_6]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4687b5dd-a3fa-47af-8e22-4f51fe7b7b70/FOTOS-ANCLAJE-ESCALERA-A-ESTRUCTURA.pdf

[^6_7]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/03485512-1de5-48d0-9f2e-e068a2917d74/Observaciones-Anteproyecto-Juan-Diego.pdf

[^6_8]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/48c31c95-70b6-4087-9109-4d6a3fcc2bdc/2.pdf

[^6_9]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/c1a26b09-8fa4-4750-aa3d-2b68c694ebdf/Formato-Inspeccion-lineas-de-vida-Vertical.pdf

[^6_10]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4595a7f0-a3a7-4bb7-9009-e81ec9d9f6dd/main.pdf

[^6_11]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/42ac0c6f-0320-4af1-bd4e-7343f5523444/Formato-Mantenimiento-CCTV.pdf

[^6_12]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/674d7901-58dc-4520-8558-53a41f841c80/Jerarquia-de-controles_Cermont.pdf

[^6_13]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e441ab0a-b57a-4248-b027-e83f18039c61/INDUCCION-SGSST.pdf

[^6_14]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/6389259e-e945-4e6a-ae61-15783ab9de00/paste.txt


---

# si quiere vamos trabajando modulo por modulo analiza el modulo tanto en el backend como en el frontend y vamos refactorizando modulo por modulo

Perfecto! Ahora tengo una vista completa. Déjame crear el **DOCUMENTO COMPLETO DE REFACTORIZACIÓN DEL MÓDULO AUTH**:

***

# 🔐 REFACTORIZACIÓN MÓDULO AUTH - ANÁLISIS COMPLETO

## 📊 ESTADO ACTUAL

### ✅ **LO QUE ESTÁ BIEN (Backend)**

1. ✅ Clean Architecture implementada (domain/application/infrastructure)
2. ✅ Use Cases bien separados (Login, Register, Refresh, Logout)
3. ✅ Zod para validación de DTOs
4. ✅ Refresh token con detección de reutilización
5. ✅ Auditoría de eventos de autenticación
6. ✅ Bcrypt para hash de contraseñas
7. ✅ JWT con Passport

### ✅ **LO QUE ESTÁ BIEN (Frontend)**

1. ✅ Signals de Angular 19 para estado reactivo
2. ✅ Servicio de auth con métodos básicos
3. ✅ Router injection moderno

### ❌ **PROBLEMAS CRÍTICOS ENCONTRADOS**

#### **Backend:**

1. ❌ **JWT Strategy no verifica usuario activo en cada request**
2. ❌ **Sin decorador @Public en rutas públicas**
3. ❌ **Guards no implementados globalmente**
4. ❌ **Sin rate limiting en endpoints de auth**
5. ❌ **Prisma schema User vs usuario (inconsistencia)**
6. ❌ **Sin validación de password strength**

#### **Frontend:**

1. ❌ **Sin environment variables - URL hardcodeada**
2. ❌ **Sin interceptor HTTP para agregar JWT**
3. ❌ **Sin manejo de refresh automático**
4. ❌ **Sin guards de ruta**
5. ❌ **Token no se valida al iniciar**
6. ❌ **Sin tipos TypeScript completos**

***

# 🚀 PLAN DE REFACTORIZACIÓN - MÓDULO AUTH

## **PASO 1: Backend - Corregir JWT Strategy**

**Archivo:** `apps/api/src/modules/auth/strategies/jwt.strategy.ts`

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    // CRÍTICO: Verificar que el usuario existe y está activo en CADA request
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        avatar: true,
        phone: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (!user.active) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Este objeto se adjunta a request.user
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    };
  }
}
```


***

## **PASO 2: Backend - Mejorar JWT Guard**

**Archivo:** `apps/api/src/modules/auth/guards/jwt-auth.guard.ts`

```typescript
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Verificar si la ruta está marcada como @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Proceder con validación JWT normal
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Si hay error o no hay usuario, lanzar excepción
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new UnauthorizedException('Token no proporcionado');
      }

      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado');
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      }

      throw err || new UnauthorizedException('Autenticación fallida');
    }

    return user;
  }
}
```


***

## **PASO 3: Backend - Crear Decorador @Public**

**Archivo:** `apps/api/src/common/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```


***

## **PASO 4: Backend - Activar Guard Globalmente**

**Archivo:** `apps/api/src/app.module.ts`

Agregar al array de `providers`:

```typescript
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  // ... imports ...
  providers: [
    // ... otros providers ...
    
    // JWT Guard global (todas las rutas protegidas por defecto)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```


***

## **PASO 5: Backend - Validar Password Strength**

**Archivo:** `apps/api/src/modules/auth/dto/register.dto.ts`

```typescript
import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

// Regex para password: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export const RegisterSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(1, 'Email es requerido'),
  
  password: z.string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .regex(
      PASSWORD_REGEX,
      'La contraseña debe contener al menos 1 mayúscula, 1 minúscula y 1 número'
    ),
  
  name: z.string()
    .min(2, 'El nombre debe tener mínimo 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  role: z.enum(['admin', 'supervisor', 'tecnico']).optional(),
  
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Número de teléfono inválido')
    .optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

// Para Swagger
export class RegisterDtoSwagger implements RegisterDto {
  @ApiProperty({ example: 'usuario@cermont.com' })
  email!: string;

  @ApiProperty({ 
    example: 'Password123',
    description: 'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número'
  })
  password!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name!: string;

  @ApiProperty({ enum: ['admin', 'supervisor', 'tecnico'], required: false })
  role?: 'admin' | 'supervisor' | 'tecnico';

  @ApiProperty({ example: '+573001234567', required: false })
  phone?: string;
}
```


***

## **PASO 6: Frontend - Crear Environments**

**Archivo:** `apps/web/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Cermont',
  version: '1.0.0',
  enableDebug: true,
};
```

**Archivo:** `apps/web/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.cermont.com/api',
  appName: 'Cermont',
  version: '1.0.0',
  enableDebug: false,
};
```


***

## **PASO 7: Frontend - Refactorizar AuthService Completo**

**Archivo:** `apps/web/src/app/core/services/auth.service.ts`

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'supervisor' | 'tecnico';
  phone?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  // Keys para localStorage
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  // Signals para estado reactivo
  private currentUserSignal = signal<User | null>(this.getUserFromStorage());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());

  // Subject para refresh token (evitar múltiples llamadas simultáneas)
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor() {
    // Al iniciar, validar token si existe
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      // Obtener perfil del usuario
      this.getMe().subscribe({
        error: () => this.logout() // Si falla, hacer logout
      });
    } else if (token) {
      // Token expirado, intentar refresh
      this.refreshToken().subscribe({
        error: () => this.logout()
      });
    }
  }

  /**
   * Login de usuario
   */
  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Registro de usuario
   */
  register(data: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Refrescar token de acceso
   */
  refreshToken(): Observable<{ token: string }> {
    if (this.isRefreshing) {
      // Si ya se está refrescando, esperar al resultado
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            return of({ token });
          }
          return throwError(() => new Error('Token refresh fallido'));
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.http.post<{ token: string }>(`${this.API_URL}/refresh`, {}).pipe(
      tap(response => {
        this.setToken(response.token);
        this.isRefreshing = false;
        this.refreshTokenSubject.next(response.token);
      }),
      catchError(err => {
        this.isRefreshing = false;
        this.logout();
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtener perfil del usuario actual
   */
  getMe(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap(user => {
        this.setUser(user);
        this.currentUserSignal.set(user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    // Llamar endpoint de logout (continuar aunque falle)
    this.http.post(`${this.API_URL}/logout`, {}).subscribe();

    // Limpiar estado local
    this.clearAuth();
    this.router.navigate(['/auth/signin']);
  }

  /**
   * Verificar si usuario tiene un rol específico
   */
  hasRole(roles: string | string[]): boolean {
    const user = this.currentUserSignal();
    if (!user) return false;

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  }

  /**
   * Obtener token de acceso
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Verificar si el token es válido (no expirado)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[^7_1]));
      const expiry = payload.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }

  /**
   * Guardar token en localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Guardar usuario en localStorage y signal
   */
  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  /**
   * Obtener usuario desde localStorage
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Manejar éxito de autenticación
   */
  private handleAuthSuccess(response: AuthResponse): void {
    this.setToken(response.token);
    this.setUser(response.user);
  }

  /**
   * Limpiar toda la información de autenticación
   */
  private clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error';

    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('Error en AuthService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
```


***

## **PASO 8: Frontend - Crear HTTP Interceptor**

**Archivo:** `apps/web/src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // No agregar token a rutas de autenticación
  if (
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  // Agregar token JWT al header
  const token = authService.getToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es error 401, intentar refresh del token
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(response => {
            // Reintentar la petición original con el nuevo token
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.token}`
              }
            });
            return next(clonedReq);
          }),
          catchError(refreshError => {
            // Si el refresh falla, hacer logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
```


***

## **PASO 9: Frontend - Crear Auth Guard**

**Archivo:** `apps/web/src/app/core/guards/auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL intentada para redirigir después del login
  router.navigate(['/auth/signin'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};
```

**Archivo:** `apps/web/src/app/core/guards/role.guard.ts`

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/signin']);
      return false;
    }

    if (authService.hasRole(allowedRoles)) {
      return true;
    }

    // Usuario autenticado pero sin rol adecuado
    router.navigate(['/unauthorized']);
    return false;
  };
};
```


***

## **PASO 10: Frontend - Configurar App Config**

**Archivo:** `apps/web/src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    )
  ]
};
```


***

## **PASO 11: Frontend - Aplicar Guards a Rutas**

**Archivo:** `apps/web/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Rutas protegidas
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  
  // Rutas solo para admin
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  
  // Redirect
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
```


***

# ✅ CHECKLIST DE IMPLEMENTACIÓN - MÓDULO AUTH

## **Backend**

- [ ] 1. Actualizar `jwt.strategy.ts` con validación de usuario activo
- [ ] 2. Mejorar `jwt-auth.guard.ts` con manejo de errores
- [ ] 3. Crear `@Public()` decorator
- [ ] 4. Activar JWT Guard globalmente en `app.module.ts`
- [ ] 5. Agregar validación de password strength en `register.dto.ts`
- [ ] 6. Probar endpoints en Postman:
    - [ ] POST `/api/auth/login`
    - [ ] POST `/api/auth/register`
    - [ ] POST `/api/auth/refresh`
    - [ ] GET `/api/auth/me` (requiere Bearer token)
    - [ ] POST `/api/auth/logout`


## **Frontend**

- [ ] 7. Crear `environment.ts` y `environment.prod.ts`
- [ ] 8. Refactorizar `auth.service.ts` completo
- [ ] 9. Crear `auth.interceptor.ts` funcional
- [ ] 10. Crear `auth.guard.ts` y `role.guard.ts`
- [ ] 11. Configurar interceptor en `app.config.ts`
- [ ] 12. Aplicar guards en `app.routes.ts`
- [ ] 13. Probar flujo completo:
    - [ ] Login exitoso
    - [ ] Login con credenciales incorrectas
    - [ ] Registro de usuario
    - [ ] Refresh automático de token
    - [ ] Navegación a ruta protegida sin login
    - [ ] Logout

***

# 🚀 COMANDOS PARA EJECUTAR

```bash
# Backend
cd apps/api
pnpm start:dev

# En otra terminal - Frontend
cd apps/web
pnpm start

# Probar en navegador
# http://localhost:4200
```


***

**¿Quieres que empecemos a implementar estos cambios paso a paso o prefieres que analice otro módulo primero?**

Puedo continuar con:

- 📦 **Módulo ORDENES** (CRUD completo)
- 📊 **Módulo DASHBOARD** (Estadísticas)
- 🛠️ **Módulo TECNICOS** (Gestión de técnicos)
- 📋 **Módulo PLANEACION** (Planeación de trabajos)
<span style="display:none">[^7_10][^7_11][^7_12][^7_13][^7_14][^7_2][^7_3][^7_4][^7_5][^7_6][^7_7][^7_8][^7_9]</span>

<div align="center">⁂</div>

[^7_1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e7ef7089-a7c3-4b34-b033-fc15be183a25/1.pdf

[^7_2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/a940b6ba-0a42-4561-ae5f-6c58ccb22639/DESARROLLO-DE-UN-APLICATIVO-WEB-PARA-APOYO-EN-LA-EJECUCION-Y-CIERRE-ADMINISTRATIVO-DE-LOS-TRABA.pdf

[^7_3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bec5d009-21af-4a27-8f72-1ff014e21195/3.pdf

[^7_4]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8fdf4499-f510-44f1-b6ba-e127ff7dcdd0/ATG-JUAN-DIEGO-AREVALO-1.pdf

[^7_5]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8bcac50f-ecfc-470c-890b-975f12027c34/FORMATO-DE-PLANEACION-DE-OBRA.pdf

[^7_6]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4687b5dd-a3fa-47af-8e22-4f51fe7b7b70/FOTOS-ANCLAJE-ESCALERA-A-ESTRUCTURA.pdf

[^7_7]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/03485512-1de5-48d0-9f2e-e068a2917d74/Observaciones-Anteproyecto-Juan-Diego.pdf

[^7_8]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/48c31c95-70b6-4087-9109-4d6a3fcc2bdc/2.pdf

[^7_9]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/c1a26b09-8fa4-4750-aa3d-2b68c694ebdf/Formato-Inspeccion-lineas-de-vida-Vertical.pdf

[^7_10]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4595a7f0-a3a7-4bb7-9009-e81ec9d9f6dd/main.pdf

[^7_11]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/42ac0c6f-0320-4af1-bd4e-7343f5523444/Formato-Mantenimiento-CCTV.pdf

[^7_12]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/674d7901-58dc-4520-8558-53a41f841c80/Jerarquia-de-controles_Cermont.pdf

[^7_13]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e441ab0a-b57a-4248-b027-e83f18039c61/INDUCCION-SGSST.pdf

[^7_14]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/6389259e-e945-4e6a-ae61-15783ab9de00/paste.txt


---

# si continua en orden los modulos de inicio a fin

Perfecto! Ahora tengo una visión completa. Déjame crear el documento de refactorización completo para el módulo ORDENES:

***

# 📦 REFACTORIZACIÓN MÓDULO ORDENES - ANÁLISIS COMPLETO

## 📊 ESTADO ACTUAL

### ✅ **LO QUE ESTÁ BIEN (Backend)**

1. ✅ Clean Architecture completa (domain/application/infrastructure)
2. ✅ Use Cases bien definidos (Create, Update, List, ChangeEstado, etc.)
3. ✅ DTOs con class-validator y Swagger
4. ✅ Controlador con documentación Swagger
5. ✅ Historial de cambios de estado
6. ✅ Sistema de 14 sub-estados para workflow detallado

### ✅ **LO QUE ESTÁ BIEN (Frontend)**

1. ✅ Servicio de ordenes creado
2. ✅ API layer separado
3. ✅ Tipos TypeScript definidos
4. ✅ Estructura modular (features/ordenes)

### ❌ **PROBLEMAS CRÍTICOS ENCONTRADOS**

#### **Backend:**

1. ❌ **Mezcla de Zod y class-validator** en DTOs (inconsistencia)
2. ❌ **Sin paginación eficiente** (puede ser lenta con muchas órdenes)
3. ❌ **Sin caché** para queries frecuentes
4. ❌ **Sin validación de transiciones de estado**
5. ❌ **Sin búsqueda full-text** en descripción/cliente
6. ❌ **Sin exportación a Excel/PDF**
7. ❌ **Sin websockets** para actualizaciones en tiempo real
8. ❌ **Sin soft delete** (borrado físico)

#### **Frontend:**

1. ❌ **Sin componentes creados** (solo servicios)
2. ❌ **Sin formularios reactivos**
3. ❌ **Sin tabla con filtros y ordenamiento**
4. ❌ **Sin vista de detalle de orden**
5. ❌ **Sin actualización en tiempo real**
6. ❌ **Sin validación visual de estados**
7. ❌ **Sin drag-and-drop** para cambio de estado (Kanban)

***

# 🚀 PLAN DE REFACTORIZACIÓN COMPLETO - MÓDULO ORDENES

## **PARTE 1: BACKEND - MEJORAS CRÍTICAS**

### **PASO 1.1: Unificar DTOs (class-validator)**

**Archivo:** `apps/api/src/modules/ordenes/application/dto/create-orden.dto.ts`

```typescript
import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsUUID, IsDateString, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum Prioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export class CreateOrdenDto {
  @ApiProperty({
    description: 'Descripción detallada del trabajo a realizar',
    example: 'Mantenimiento preventivo de transformador 500kVA',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  descripcion!: string;

  @ApiProperty({
    description: 'Nombre del cliente o empresa',
    example: 'Empresa Eléctrica del Norte S.A.',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200, { message: 'El nombre del cliente no puede exceder 200 caracteres' })
  cliente!: string;

  @ApiProperty({
    enum: Prioridad,
    description: 'Nivel de prioridad de la orden',
    example: Prioridad.ALTA,
    default: Prioridad.MEDIA,
  })
  @IsEnum(Prioridad, { message: 'Prioridad inválida. Valores permitidos: BAJA, MEDIA, ALTA, URGENTE' })
  prioridad!: Prioridad;

  @ApiPropertyOptional({
    description: 'Fecha estimada de finalización (ISO 8601)',
    example: '2025-01-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Fecha de finalización debe estar en formato ISO 8601' })
  fechaFinEstimada?: string;

  @ApiPropertyOptional({
    description: 'Presupuesto estimado en moneda local',
    example: 1500000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Presupuesto debe ser un número' })
  @Min(0, { message: 'Presupuesto no puede ser negativo' })
  @Type(() => Number)
  presupuestoEstimado?: number;

  @ApiPropertyOptional({
    description: 'UUID del técnico asignado',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID de técnico debe ser un UUID válido' })
  asignadoId?: string;

  @ApiPropertyOptional({
    description: 'Indica si requiere Hoja de Especificaciones de Seguridad (HES)',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'requiereHES debe ser un valor booleano' })
  requiereHES?: boolean;
}
```


***

### **PASO 1.2: Agregar Soft Delete**

**Archivo:** `apps/api/prisma/schema/orders.prisma`

**Agregar campos al modelo Order:**

```prisma
model Order {
  // ... campos existentes ...
  
  deletedAt     DateTime? @map("deleted_at")
  deletedBy     String?   @map("deleted_by")
  deleteReason  String?   @map("delete_reason")
  
  @@index([deletedAt])
  @@map("orders")
}
```

**Migración:**

```bash
cd apps/api
npx prisma migrate dev --name add_soft_delete_to_orders
```


***

### **PASO 1.3: Agregar Búsqueda Full-Text**

**Archivo:** `apps/api/src/modules/ordenes/infrastructure/persistence/ordenes.repository.ts`

```typescript
async findWithFullTextSearch(query: {
  searchTerm?: string;
  estado?: string;
  prioridad?: string;
  page: number;
  limit: number;
}): Promise<PaginatedResult<Order>> {
  const { searchTerm, estado, prioridad, page, limit } = query;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    deletedAt: null, // Excluir eliminados
    ...(estado && { estado }),
    ...(prioridad && { prioridad }),
    ...(searchTerm && {
      OR: [
        { numeroOrden: { contains: searchTerm, mode: 'insensitive' } },
        { descripcion: { contains: searchTerm, mode: 'insensitive' } },
        { cliente: { contains: searchTerm, mode: 'insensitive' } },
        { 
          tecnico: { 
            name: { contains: searchTerm, mode: 'insensitive' } 
          } 
        },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { prioridad: 'desc' }, // Urgente primero
        { createdAt: 'desc' },
      ],
      include: {
        tecnico: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    }),
    this.prisma.order.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}
```


***

### **PASO 1.4: Agregar Validación de Transiciones de Estado**

**Archivo:** `apps/api/src/modules/ordenes/domain/orden-state-machine.ts`

```typescript
import { BadRequestException } from '@nestjs/common';

export enum OrdenEstado {
  PENDIENTE = 'PENDIENTE',
  PLANEACION = 'PLANEACION',
  EJECUCION = 'EJECUCION',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

/**
 * Máquina de estados para validar transiciones de órdenes
 */
export class OrdenStateMachine {
  // Transiciones permitidas desde cada estado
  private static readonly TRANSITIONS: Record<OrdenEstado, OrdenEstado[]> = {
    [OrdenEstado.PENDIENTE]: [
      OrdenEstado.PLANEACION,
      OrdenEstado.CANCELADA,
    ],
    [OrdenEstado.PLANEACION]: [
      OrdenEstado.EJECUCION,
      OrdenEstado.PENDIENTE,
      OrdenEstado.CANCELADA,
    ],
    [OrdenEstado.EJECUCION]: [
      OrdenEstado.FINALIZADA,
      OrdenEstado.PLANEACION,
      OrdenEstado.CANCELADA,
    ],
    [OrdenEstado.FINALIZADA]: [
      // Estado terminal, solo puede reabrir a PENDIENTE en casos excepcionales
      OrdenEstado.PENDIENTE,
    ],
    [OrdenEstado.CANCELADA]: [
      // Puede reactivarse a PENDIENTE
      OrdenEstado.PENDIENTE,
    ],
  };

  // Transiciones que requieren motivo obligatorio
  private static readonly REQUIRES_REASON: OrdenEstado[] = [
    OrdenEstado.CANCELADA,
    OrdenEstado.FINALIZADA,
  ];

  /**
   * Valida si una transición de estado es permitida
   */
  static validateTransition(
    fromEstado: OrdenEstado,
    toEstado: OrdenEstado,
    motivo?: string,
  ): void {
    // Validar que la transición esté permitida
    const allowedTransitions = this.TRANSITIONS[fromEstado];
    
    if (!allowedTransitions.includes(toEstado)) {
      throw new BadRequestException(
        `No se puede cambiar de ${fromEstado} a ${toEstado}. ` +
        `Transiciones permitidas: ${allowedTransitions.join(', ')}`
      );
    }

    // Validar que tenga motivo si es requerido
    if (this.REQUIRES_REASON.includes(toEstado) && !motivo) {
      throw new BadRequestException(
        `El campo "motivo" es obligatorio al cambiar a estado ${toEstado}`
      );
    }
  }

  /**
   * Obtiene los estados permitidos desde un estado actual
   */
  static getAllowedTransitions(fromEstado: OrdenEstado): OrdenEstado[] {
    return this.TRANSITIONS[fromEstado] || [];
  }

  /**
   * Verifica si un estado requiere motivo
   */
  static requiresReason(estado: OrdenEstado): boolean {
    return this.REQUIRES_REASON.includes(estado);
  }
}
```

**Aplicar en el Use Case:**

**Archivo:** `apps/api/src/modules/ordenes/application/use-cases/change-orden-estado.use-case.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OrdenStateMachine, OrdenEstado } from '../../domain/orden-state-machine';
import { ChangeEstadoOrdenDto } from '../dto/change-estado-orden.dto';

@Injectable()
export class ChangeOrdenEstadoUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(ordenId: string, dto: ChangeEstadoOrdenDto) {
    // Obtener orden actual
    const orden = await this.prisma.order.findUnique({
      where: { id: ordenId, deletedAt: null },
    });

    if (!orden) {
      throw new NotFoundException(`Orden con ID ${ordenId} no encontrada`);
    }

    // Validar transición de estado
    OrdenStateMachine.validateTransition(
      orden.estado as OrdenEstado,
      dto.nuevoEstado as OrdenEstado,
      dto.motivo,
    );

    // Actualizar orden y crear registro en historial
    const [updatedOrden] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: ordenId },
        data: { estado: dto.nuevoEstado },
        include: { tecnico: true },
      }),
      this.prisma.orderStateHistory.create({
        data: {
          orderId: ordenId,
          estadoAnterior: orden.estado,
          estadoNuevo: dto.nuevoEstado,
          motivo: dto.motivo,
          changedById: dto.usuarioId || 'SYSTEM',
        },
      }),
    ]);

    return updatedOrden;
  }
}
```


***

## **PARTE 2: FRONTEND - COMPONENTES COMPLETOS**

### **PASO 2.1: Crear Modelos TypeScript**

**Archivo:** `apps/web/src/app/core/models/orden.model.ts`

```typescript
export enum OrdenEstado {
  PENDIENTE = 'PENDIENTE',
  PLANEACION = 'PLANEACION',
  EJECUCION = 'EJECUCION',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA',
}

export enum Prioridad {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export interface Orden {
  id: string;
  numeroOrden: string;
  descripcion: string;
  cliente: string;
  estado: OrdenEstado;
  prioridad: Prioridad;
  fechaInicio: string;
  fechaFin?: string | null;
  fechaFinEstimada?: string | null;
  presupuestoEstimado?: number | null;
  asignadoId?: string | null;
  requiereHES: boolean;
  tecnico?: TecnicoBasico | null;
  createdAt: string;
  updatedAt: string;
}

export interface TecnicoBasico {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface CreateOrdenDto {
  descripcion: string;
  cliente: string;
  prioridad: Prioridad;
  fechaFinEstimada?: string;
  presupuestoEstimado?: number;
  asignadoId?: string;
  requiereHES?: boolean;
}

export interface UpdateOrdenDto extends Partial<CreateOrdenDto> {}

export interface ChangeEstadoOrdenDto {
  nuevoEstado: OrdenEstado;
  motivo?: string;
}

export interface AsignarTecnicoOrdenDto {
  tecnicoId: string;
}

export interface ListOrdenesQuery {
  page?: number;
  limit?: number;
  estado?: OrdenEstado;
  prioridad?: Prioridad;
  cliente?: string;
  asignadoId?: string;
  searchTerm?: string;
}

export interface PaginatedOrdenes {
  items: Orden[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface HistorialEstado {
  id: string;
  orderId: string;
  estadoAnterior: OrdenEstado;
  estadoNuevo: OrdenEstado;
  motivo?: string | null;
  changedById: string;
  changedAt: string;
}

export interface OrdenesStats {
  total: number;
  porEstado: Record<OrdenEstado, number>;
  porPrioridad: Record<Prioridad, number>;
}
```


***

### **PASO 2.2: Crear Componente de Lista con Tabla**

**Archivo:** `apps/web/src/app/features/ordenes/components/ordenes-list/ordenes-list.component.ts`

```typescript
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../services/ordenes.service';
import { Orden, OrdenEstado, Prioridad, ListOrdenesQuery } from '../../../../core/models/orden.model';

@Component({
  selector: 'app-ordenes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './ordenes-list.component.html',
  styleUrls: ['./ordenes-list.component.css']
})
export class OrdenesListComponent implements OnInit {
  private readonly ordenesService = inject(OrdenesService);

  // Signals para estado
  ordenes = signal<Orden[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  
  // Paginación
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Filtros
  filtroEstado = signal<OrdenEstado | ''>('');
  filtroPrioridad = signal<Prioridad | ''>('');
  filtroCliente = signal('');
  searchTerm = signal('');

  // Enums para template
  readonly OrdenEstado = OrdenEstado;
  readonly Prioridad = Prioridad;

  // Opciones de estados y prioridades
  readonly estadosOptions = Object.values(OrdenEstado);
  readonly prioridadesOptions = Object.values(Prioridad);

  ngOnInit(): void {
    this.loadOrdenes();
  }

  loadOrdenes(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: ListOrdenesQuery = {
      page: this.currentPage(),
      limit: this.pageSize(),
      ...(this.filtroEstado() && { estado: this.filtroEstado() as OrdenEstado }),
      ...(this.filtroPrioridad() && { prioridad: this.filtroPrioridad() as Prioridad }),
      ...(this.filtroCliente() && { cliente: this.filtroCliente() }),
      ...(this.searchTerm() && { searchTerm: this.searchTerm() }),
    };

    this.ordenesService.list(query).subscribe({
      next: (response) => {
        this.ordenes.set(response.items);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar órdenes');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadOrdenes();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadOrdenes();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadOrdenes();
  }

  clearFilters(): void {
    this.filtroEstado.set('');
    this.filtroPrioridad.set('');
    this.filtroCliente.set('');
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadOrdenes();
  }

  getEstadoColor(estado: OrdenEstado): string {
    const colors: Record<OrdenEstado, string> = {
      [OrdenEstado.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
      [OrdenEstado.PLANEACION]: 'bg-blue-100 text-blue-800',
      [OrdenEstado.EJECUCION]: 'bg-purple-100 text-purple-800',
      [OrdenEstado.FINALIZADA]: 'bg-green-100 text-green-800',
      [OrdenEstado.CANCELADA]: 'bg-red-100 text-red-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  }

  getPrioridadColor(prioridad: Prioridad): string {
    const colors: Record<Prioridad, string> = {
      [Prioridad.BAJA]: 'bg-gray-100 text-gray-700',
      [Prioridad.MEDIA]: 'bg-blue-100 text-blue-700',
      [Prioridad.ALTA]: 'bg-orange-100 text-orange-700',
      [Prioridad.URGENTE]: 'bg-red-100 text-red-700',
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-700';
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
```


***

Este documento es MUY extenso. ¿Quieres que:

1. **Continue con el template HTML completo del componente?**
2. **Continúe con los componentes de crear/editar orden?**
3. **Pase al siguiente módulo (DASHBOARD, TECNICOS, etc.)?**

**¿Qué prefieres?** 🚀
<span style="display:none">[^8_1][^8_10][^8_11][^8_12][^8_13][^8_14][^8_2][^8_3][^8_4][^8_5][^8_6][^8_7][^8_8][^8_9]</span>

<div align="center">⁂</div>

[^8_1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e7ef7089-a7c3-4b34-b033-fc15be183a25/1.pdf

[^8_2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/a940b6ba-0a42-4561-ae5f-6c58ccb22639/DESARROLLO-DE-UN-APLICATIVO-WEB-PARA-APOYO-EN-LA-EJECUCION-Y-CIERRE-ADMINISTRATIVO-DE-LOS-TRABA.pdf

[^8_3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bec5d009-21af-4a27-8f72-1ff014e21195/3.pdf

[^8_4]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8fdf4499-f510-44f1-b6ba-e127ff7dcdd0/ATG-JUAN-DIEGO-AREVALO-1.pdf

[^8_5]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8bcac50f-ecfc-470c-890b-975f12027c34/FORMATO-DE-PLANEACION-DE-OBRA.pdf

[^8_6]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4687b5dd-a3fa-47af-8e22-4f51fe7b7b70/FOTOS-ANCLAJE-ESCALERA-A-ESTRUCTURA.pdf

[^8_7]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/03485512-1de5-48d0-9f2e-e068a2917d74/Observaciones-Anteproyecto-Juan-Diego.pdf

[^8_8]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/48c31c95-70b6-4087-9109-4d6a3fcc2bdc/2.pdf

[^8_9]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/c1a26b09-8fa4-4750-aa3d-2b68c694ebdf/Formato-Inspeccion-lineas-de-vida-Vertical.pdf

[^8_10]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4595a7f0-a3a7-4bb7-9009-e81ec9d9f6dd/main.pdf

[^8_11]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/42ac0c6f-0320-4af1-bd4e-7343f5523444/Formato-Mantenimiento-CCTV.pdf

[^8_12]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/674d7901-58dc-4520-8558-53a41f841c80/Jerarquia-de-controles_Cermont.pdf

[^8_13]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e441ab0a-b57a-4248-b027-e83f18039c61/INDUCCION-SGSST.pdf

[^8_14]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/6389259e-e945-4e6a-ae61-15783ab9de00/paste.txt


---

# 📦 REFACTORIZACIÓN MÓDULO ORDENES - CONTINUACIÓN


***

### **PASO 2.3: Template HTML del Componente de Lista**

**Archivo:** `apps/web/src/app/features/ordenes/components/ordenes-list/ordenes-list.component.html`

```html
<div class="container mx-auto px-4 py-6">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Órdenes de Trabajo</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Gestión de órdenes de mantenimiento</p>
    </div>
    <a 
      routerLink="/ordenes/nueva" 
      class="btn-primary inline-flex items-center"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      Nueva Orden
    </a>
  </div>

  <!-- Barra de búsqueda y filtros -->
  <div class="card mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <!-- Búsqueda general -->
      <div class="lg:col-span-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Buscar
        </label>
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (keyup.enter)="onSearch()"
            placeholder="Número de orden, cliente, descripción..."
            class="input pl-10"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Filtro por estado -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Estado
        </label>
        <select
          [(ngModel)]="filtroEstado"
          (change)="onFilterChange()"
          class="input"
        >
          <option value="">Todos</option>
          <option *ngFor="let estado of estadosOptions" [value]="estado">
            {{ estado }}
          </option>
        </select>
      </div>

      <!-- Filtro por prioridad -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Prioridad
        </label>
        <select
          [(ngModel)]="filtroPrioridad"
          (change)="onFilterChange()"
          class="input"
        >
          <option value="">Todas</option>
          <option *ngFor="let prioridad of prioridadesOptions" [value]="prioridad">
            {{ prioridad }}
          </option>
        </select>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-end gap-2">
        <button
          (click)="onSearch()"
          class="btn-primary flex-1"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Buscar
        </button>
        <button
          (click)="clearFilters()"
          class="btn-outline flex-1"
        >
          Limpiar
        </button>
      </div>
    </div>
  </div>

  <!-- Indicador de carga -->
  @if (loading()) {
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cermont-primary-500"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">Cargando órdenes...</span>
    </div>
  }

  <!-- Mensaje de error -->
  @if (error()) {
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <div>
          <h3 class="text-red-800 dark:text-red-200 font-medium">Error al cargar órdenes</h3>
          <p class="text-red-600 dark:text-red-400 text-sm">{{ error() }}</p>
        </div>
      </div>
    </div>
  }

  <!-- Tabla de órdenes -->
  @if (!loading() && !error()) {
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Orden
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Prioridad
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Técnico
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha Estimada
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Presupuesto
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            @for (orden of ordenes(); track orden.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <!-- Número de orden -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <a 
                      [routerLink]="['/ordenes', orden.id]"
                      class="text-sm font-medium text-cermont-primary-600 hover:text-cermont-primary-800 dark:text-cermont-primary-400"
                    >
                      {{ orden.numeroOrden }}
                    </a>
                    <span class="text-xs text-gray-500 dark:text-gray-400">
                      {{ formatDate(orden.createdAt) }}
                    </span>
                  </div>
                </td>

                <!-- Cliente -->
                <td class="px-6 py-4">
                  <div class="text-sm text-gray-900 dark:text-white font-medium">
                    {{ orden.cliente }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {{ orden.descripcion }}
                  </div>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="badge"
                    [ngClass]="getEstadoColor(orden.estado)"
                  >
                    {{ orden.estado }}
                  </span>
                </td>

                <!-- Prioridad -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="badge"
                    [ngClass]="getPrioridadColor(orden.prioridad)"
                  >
                    {{ orden.prioridad }}
                  </span>
                </td>

                <!-- Técnico -->
                <td class="px-6 py-4 whitespace-nowrap">
                  @if (orden.tecnico) {
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-8 w-8 bg-cermont-primary-100 dark:bg-cermont-primary-900 rounded-full flex items-center justify-center">
                        <span class="text-cermont-primary-600 dark:text-cermont-primary-400 font-medium text-sm">
                          {{ orden.tecnico.name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div class="ml-3">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ orden.tecnico.name }}
                        </div>
                      </div>
                    </div>
                  } @else {
                    <span class="text-sm text-gray-500 dark:text-gray-400 italic">Sin asignar</span>
                  }
                </td>

                <!-- Fecha estimada -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(orden.fechaFinEstimada) }}
                </td>

                <!-- Presupuesto -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                  {{ formatCurrency(orden.presupuestoEstimado) }}
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <a
                      [routerLink]="['/ordenes', orden.id]"
                      class="text-cermont-primary-600 hover:text-cermont-primary-900 dark:text-cermont-primary-400"
                      title="Ver detalles"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </a>
                    <a
                      [routerLink]="['/ordenes', orden.id, 'editar']"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      title="Editar"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">No se encontraron órdenes</p>
                    <p class="text-gray-400 dark:text-gray-500 text-sm">
                      Intenta ajustar los filtros o crear una nueva orden
                    </p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      @if (totalPages() > 1) {
        <div class="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                (click)="onPageChange(currentPage() - 1)"
                [disabled]="currentPage() === 1"
                class="btn-outline"
              >
                Anterior
              </button>
              <button
                (click)="onPageChange(currentPage() + 1)"
                [disabled]="currentPage() === totalPages()"
                class="btn-outline ml-3"
              >
                Siguiente
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando
                  <span class="font-medium">{{ (currentPage() - 1) * pageSize() + 1 }}</span>
                  a
                  <span class="font-medium">{{ Math.min(currentPage() * pageSize(), totalItems()) }}</span>
                  de
                  <span class="font-medium">{{ totalItems() }}</span>
                  resultados
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    (click)="onPageChange(currentPage() - 1)"
                    [disabled]="currentPage() === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>

                  @for (page of [].constructor(totalPages()); track $index) {
                    <button
                      (click)="onPageChange($index + 1)"
                      [class.bg-cermont-primary-500]="currentPage() === $index + 1"
                      [class.text-white]="currentPage() === $index + 1"
                      [class.border-cermont-primary-500]="currentPage() === $index + 1"
                      class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {{ $index + 1 }}
                    </button>
                  }

                  <button
                    (click)="onPageChange(currentPage() + 1)"
                    [disabled]="currentPage() === totalPages()"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  }
</div>
```


***

### **PASO 2.4: Estilos del Componente**

**Archivo:** `apps/web/src/app/features/ordenes/components/ordenes-list/ordenes-list.component.css`

```css
/* Utilidades para line-clamp (si no está en Tailwind) */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Transiciones suaves para hover */
tr {
  transition: background-color 150ms ease-in-out;
}

/* Animación de carga */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Estilos para badges */
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

/* Botones personalizados */
.btn-primary {
  @apply px-4 py-2 bg-cermont-primary-500 text-white rounded-lg font-medium 
         hover:bg-cermont-primary-600 focus:outline-none focus:ring-2 
         focus:ring-cermont-primary-500 focus:ring-offset-2 
         transition-colors duration-200;
}

.btn-outline {
  @apply px-4 py-2 border-2 border-cermont-primary-500 text-cermont-primary-500 
         rounded-lg font-medium hover:bg-cermont-primary-50 
         focus:outline-none focus:ring-2 focus:ring-cermont-primary-500 
         focus:ring-offset-2 transition-colors duration-200;
}

/* Input personalizado */
.input {
  @apply block w-full rounded-lg border-gray-300 dark:border-gray-600 
         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
         shadow-sm focus:border-cermont-primary-500 focus:ring-cermont-primary-500 
         transition-colors duration-200;
}

/* Card */
.card {
  @apply bg-white dark:bg-gray-800 rounded-xl shadow-md p-6;
}
```


***

### **PASO 2.5: Componente de Formulario (Crear/Editar)**

**Archivo:** `apps/web/src/app/features/ordenes/components/orden-form/orden-form.component.ts`

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OrdenesService } from '../../services/ordenes.service';
import { Prioridad } from '../../../../core/models/orden.model';

@Component({
  selector: 'app-orden-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './orden-form.component.html',
  styleUrls: ['./orden-form.component.css']
})
export class OrdenFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly ordenesService = inject(OrdenesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  ordenId: string | null = null;

  readonly Prioridad = Prioridad;
  readonly prioridadesOptions = Object.values(Prioridad);

  ngOnInit(): void {
    this.ordenId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.ordenId);

    this.initForm();

    if (this.isEditMode() && this.ordenId) {
      this.loadOrden(this.ordenId);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      descripcion: ['', [Validators.required, Validators.maxLength(1000)]],
      cliente: ['', [Validators.required, Validators.maxLength(200)]],
      prioridad: [Prioridad.MEDIA, Validators.required],
      fechaFinEstimada: [''],
      presupuestoEstimado: [null, [Validators.min(0)]],
      asignadoId: [''],
      requiereHES: [false],
    });
  }

  loadOrden(id: string): void {
    this.loading.set(true);
    this.ordenesService.getById(id).subscribe({
      next: (orden) => {
        this.form.patchValue({
          descripcion: orden.descripcion,
          cliente: orden.cliente,
          prioridad: orden.prioridad,
          fechaFinEstimada: orden.fechaFinEstimada ? 
            new Date(orden.fechaFinEstimada).toISOString().split('T')[^9_0] : '',
          presupuestoEstimado: orden.presupuestoEstimado,
          asignadoId: orden.asignadoId || '',
          requiereHES: orden.requiereHES,
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la orden');
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.value;
    const dto = {
      ...formValue,
      presupuestoEstimado: formValue.presupuestoEstimado ? 
        Number(formValue.presupuestoEstimado) : null,
      fechaFinEstimada: formValue.fechaFinEstimada || null,
      asignadoId: formValue.asignadoId || null,
    };

    const request$ = this.isEditMode() && this.ordenId
      ? this.ordenesService.update(this.ordenId, dto)
      : this.ordenesService.create(dto);

    request$.subscribe({
      next: (orden) => {
        this.router.navigate(['/ordenes', orden.id]);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al guardar la orden');
        this.loading.set(false);
      }
    });
  }

  onCancel(): void {
    if (this.isEditMode() && this.ordenId) {
      this.router.navigate(['/ordenes', this.ordenId]);
    } else {
      this.router.navigate(['/ordenes']);
    }
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'Este campo es requerido';
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['min']) return `El valor mínimo es ${errors['min'].min}`;

    return 'Campo inválido';
  }
}
```


***

### **PASO 2.6: Template del Formulario**

**Archivo:** `apps/web/src/app/features/ordenes/components/orden-form/orden-form.component.html`

```html
<div class="container mx-auto px-4 py-6 max-w-4xl">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
      {{ isEditMode() ? 'Editar Orden' : 'Nueva Orden de Trabajo' }}
    </h1>
    <p class="text-gray-600 dark:text-gray-400 mt-1">
      {{ isEditMode() ? 'Actualiza la información de la orden' : 'Completa el formulario para crear una nueva orden' }}
    </p>
  </div>

  <!-- Mensaje de error -->
  @if (error()) {
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-red-800 dark:text-red-200">{{ error() }}</p>
      </div>
    </div>
  }

  <!-- Formulario -->
  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card">
    <div class="space-y-6">
      <!-- Descripción -->
      <div>
        <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción del trabajo <span class="text-red-500">*</span>
        </label>
        <textarea
          id="descripcion"
          formControlName="descripcion"
          rows="4"
          class="input"
          [class.border-red-500]="hasError('descripcion', 'required') || hasError('descripcion', 'maxlength')"
          placeholder="Describe detalladamente el trabajo a realizar..."
        ></textarea>
        @if (hasError('descripcion', 'required') || hasError('descripcion', 'maxlength')) {
          <p class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ getErrorMessage('descripcion') }}
          </p>
        }
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ form.get('descripcion')?.value?.length || 0 }} / 1000 caracteres
        </p>
      </div>

      <!-- Cliente -->
      <div>
        <label for="cliente" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cliente <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="cliente"
          formControlName="cliente"
          class="input"
          [class.border-red-500]="hasError('cliente', 'required') || hasError('cliente', 'maxlength')"
          placeholder="Nombre del cliente o empresa"
        />
        @if (hasError('cliente', 'required') || hasError('cliente', 'maxlength')) {
          <p class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ getErrorMessage('cliente') }}
          </p>
        }
      </div>

      <!-- Grid de 2 columnas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Prioridad -->
        <div>
          <label for="prioridad" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prioridad <span class="text-red-500">*</span>
          </label>
          <select
            id="prioridad"
            formControlName="prioridad"
            class="input"
          >
            <option *ngFor="let prioridad of prioridadesOptions" [value]="prioridad">
              {{ prioridad }}
            </option>
          </select>
        </div>

        <!-- Fecha estimada de finalización -->
        <div>
          <label for="fechaFinEstimada" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha estimada de finalización
          </label>
          <input
            type="date"
            id="fechaFinEstimada"
            formControlName="fechaFinEstimada"
            class="input"
          />
        </div>
      </div>

      <!-- Grid de 2 columnas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Presupuesto estimado -->
        <div>
          <label for="presupuestoEstimado" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Presupuesto estimado (COP)
          </label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">$</span>
            <input
              type="number"
              id="presupuestoEstimado"
              formControlName="presupuestoEstimado"
              class="input pl-8"
              [class.border-red-500]="hasError('presupuestoEstimado', 'min')"
              placeholder="0"
              min="0"
              step="1000"
            />
          </div>
          @if (hasError('presupuestoEstimado', 'min')) {
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ getErrorMessage('presupuestoEstimado') }}
            </p>
          }
        </div>

        <!-- Técnico asignado (opcional por ahora) -->
        <div>
          <label for="asignadoId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Técnico asignado
          </label>
          <input
            type="text"
            id="asignadoId"
            formControlName="asignadoId"
            class="input"
            placeholder="UUID del técnico (opcional)"
          />
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Puedes asignar un técnico más tarde desde la vista de detalle
          </p>
        </div>
      </div>

      <!-- Requiere HES -->
      <div class="flex items-start">
        <div class="flex items-center h-5">
          <input
            id="requiereHES"
            type="checkbox"
            formControlName="requiereHES"
            class="w-4 h-4 text-cermont-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-cermont-primary-500 dark:focus:ring-cermont-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div class="ml-3 text-sm">
          <label for="requiereHES" class="font-medium text-gray-700 dark:text-gray-300">
            Requiere Hoja de Especificaciones de Seguridad (HES)
          </label>
          <p class="text-gray-500 dark:text-gray-400">
            Marca esta casilla si el trabajo requiere documentación de seguridad adicional
          </p>
        </div>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        (click)="onCancel()"
        [disabled]="loading()"
        class="btn-outline"
      >
        Cancelar
      </button>
      <button
        type="submit"
        [disabled]="loading() || form.invalid"
        class="btn-primary"
      >
        @if (loading()) {
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Guardando...
        } @else {
          {{ isEditMode() ? 'Actualizar Orden' : 'Crear Orden' }}
        }
      </button>
    </div>
  </form>
</div>
```


***

## **RESUMEN DE ARCHIVOS CREADOS PARA MÓDULO ORDENES**

### **Backend (8 archivos):**

1. ✅ `create-orden.dto.ts` - DTO con class-validator
2. ✅ `orders.prisma` - Soft delete agregado
3. ✅ `ordenes.repository.ts` - Full-text search
4. ✅ `orden-state-machine.ts` - Validación de transiciones
5. ✅ `change-orden-estado.use-case.ts` - Aplicar validaciones

### **Frontend (6 archivos):**

1. ✅ `orden.model.ts` - Interfaces TypeScript
2. ✅ `ordenes-list.component.ts` - Lista con filtros
3. ✅ `ordenes-list.component.html` - Template de tabla
4. ✅ `ordenes-list.component.css` - Estilos
5. ✅ `orden-form.component.ts` - Formulario reactivo
6. ✅ `orden-form.component.html` - Template formulario

***

## **¿CONTINUAMOS CON?**

1. **Componente de DETALLE de orden** (vista individual con historial)
2. **Componente KANBAN** (drag \& drop para cambiar estados)
3. **Siguiente módulo: DASHBOARD** (estadísticas y gráficos)
4. **Siguiente módulo: TECNICOS** (gestión de técnicos)
5. **Integración de WebSockets** (actualizaciones en tiempo real)

**¿Qué prefieres?** 🚀
<span style="display:none">[^9_1][^9_10][^9_11][^9_12][^9_13][^9_14][^9_2][^9_3][^9_4][^9_5][^9_6][^9_7][^9_8][^9_9]</span>

<div align="center">⁂</div>

[^9_1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e7ef7089-a7c3-4b34-b033-fc15be183a25/1.pdf

[^9_2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/a940b6ba-0a42-4561-ae5f-6c58ccb22639/DESARROLLO-DE-UN-APLICATIVO-WEB-PARA-APOYO-EN-LA-EJECUCION-Y-CIERRE-ADMINISTRATIVO-DE-LOS-TRABA.pdf

[^9_3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bec5d009-21af-4a27-8f72-1ff014e21195/3.pdf

[^9_4]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8fdf4499-f510-44f1-b6ba-e127ff7dcdd0/ATG-JUAN-DIEGO-AREVALO-1.pdf

[^9_5]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8bcac50f-ecfc-470c-890b-975f12027c34/FORMATO-DE-PLANEACION-DE-OBRA.pdf

[^9_6]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4687b5dd-a3fa-47af-8e22-4f51fe7b7b70/FOTOS-ANCLAJE-ESCALERA-A-ESTRUCTURA.pdf

[^9_7]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/03485512-1de5-48d0-9f2e-e068a2917d74/Observaciones-Anteproyecto-Juan-Diego.pdf

[^9_8]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/48c31c95-70b6-4087-9109-4d6a3fcc2bdc/2.pdf

[^9_9]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/c1a26b09-8fa4-4750-aa3d-2b68c694ebdf/Formato-Inspeccion-lineas-de-vida-Vertical.pdf

[^9_10]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4595a7f0-a3a7-4bb7-9009-e81ec9d9f6dd/main.pdf

[^9_11]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/42ac0c6f-0320-4af1-bd4e-7343f5523444/Formato-Mantenimiento-CCTV.pdf

[^9_12]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/674d7901-58dc-4520-8558-53a41f841c80/Jerarquia-de-controles_Cermont.pdf

[^9_13]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e441ab0a-b57a-4248-b027-e83f18039c61/INDUCCION-SGSST.pdf

[^9_14]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/6389259e-e945-4e6a-ae61-15783ab9de00/paste.txt


---

# 📦 MÓDULO ORDENES - COMPLETAR AL 100%

Tienes toda la razón! Vamos a terminar COMPLETAMENTE el módulo de Ordenes antes de pasar al siguiente.

***

## **PASO 2.7: Componente de DETALLE de Orden**

**Archivo:** `apps/web/src/app/features/ordenes/components/orden-detail/orden-detail.component.ts`

```typescript
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrdenesService } from '../../services/ordenes.service';
import { Orden, OrdenEstado, Prioridad, HistorialEstado, ChangeEstadoOrdenDto } from '../../../../core/models/orden.model';

@Component({
  selector: 'app-orden-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './orden-detail.component.html',
  styleUrls: ['./orden-detail.component.css']
})
export class OrdenDetailComponent implements OnInit {
  private readonly ordenesService = inject(OrdenesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  orden = signal<Orden | null>(null);
  historial = signal<HistorialEstado[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Modal de cambio de estado
  showEstadoModal = signal(false);
  nuevoEstado = signal<OrdenEstado | ''>('');
  motivoCambio = signal('');
  changingEstado = signal(false);

  // Modal de asignar técnico
  showAsignarTecnicoModal = signal(false);
  tecnicoId = signal('');
  assigningTecnico = signal(false);

  // Modal de eliminar
  showDeleteModal = signal(false);
  deleting = signal(false);

  // Computed
  readonly OrdenEstado = OrdenEstado;
  readonly Prioridad = Prioridad;
  readonly estadosOptions = Object.values(OrdenEstado);
  
  allowedEstados = computed(() => {
    const currentEstado = this.orden()?.estado;
    if (!currentEstado) return [];
    
    // Lógica de transiciones permitidas
    const transitions: Record<OrdenEstado, OrdenEstado[]> = {
      [OrdenEstado.PENDIENTE]: [OrdenEstado.PLANEACION, OrdenEstado.CANCELADA],
      [OrdenEstado.PLANEACION]: [OrdenEstado.EJECUCION, OrdenEstado.PENDIENTE, OrdenEstado.CANCELADA],
      [OrdenEstado.EJECUCION]: [OrdenEstado.FINALIZADA, OrdenEstado.PLANEACION, OrdenEstado.CANCELADA],
      [OrdenEstado.FINALIZADA]: [OrdenEstado.PENDIENTE],
      [OrdenEstado.CANCELADA]: [OrdenEstado.PENDIENTE],
    };
    
    return transitions[currentEstado as OrdenEstado] || [];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrden(id);
      this.loadHistorial(id);
    }
  }

  loadOrden(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.ordenesService.getById(id).subscribe({
      next: (orden) => {
        this.orden.set(orden);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar la orden');
        this.loading.set(false);
      }
    });
  }

  loadHistorial(id: string): void {
    this.ordenesService.getHistorial(id).subscribe({
      next: (historial) => {
        this.historial.set(historial);
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
      }
    });
  }

  openEstadoModal(): void {
    this.nuevoEstado.set('');
    this.motivoCambio.set('');
    this.showEstadoModal.set(true);
  }

  closeEstadoModal(): void {
    this.showEstadoModal.set(false);
    this.nuevoEstado.set('');
    this.motivoCambio.set('');
  }

  onCambiarEstado(): void {
    const orden = this.orden();
    const estado = this.nuevoEstado();
    
    if (!orden || !estado) return;

    // Validar que requiere motivo para ciertos estados
    const requiresReason = [OrdenEstado.CANCELADA, OrdenEstado.FINALIZADA].includes(estado as OrdenEstado);
    if (requiresReason && !this.motivoCambio().trim()) {
      alert('Debes proporcionar un motivo para este cambio de estado');
      return;
    }

    this.changingEstado.set(true);

    const dto: ChangeEstadoOrdenDto = {
      nuevoEstado: estado as OrdenEstado,
      motivo: this.motivoCambio().trim() || undefined,
    };

    this.ordenesService.changeEstado(orden.id, dto).subscribe({
      next: (updatedOrden) => {
        this.orden.set(updatedOrden);
        this.loadHistorial(orden.id);
        this.closeEstadoModal();
        this.changingEstado.set(false);
      },
      error: (err) => {
        alert(err.message || 'Error al cambiar el estado');
        this.changingEstado.set(false);
      }
    });
  }

  openAsignarTecnicoModal(): void {
    this.tecnicoId.set(this.orden()?.asignadoId || '');
    this.showAsignarTecnicoModal.set(true);
  }

  closeAsignarTecnicoModal(): void {
    this.showAsignarTecnicoModal.set(false);
    this.tecnicoId.set('');
  }

  onAsignarTecnico(): void {
    const orden = this.orden();
    const tecnicoId = this.tecnicoId().trim();
    
    if (!orden || !tecnicoId) return;

    this.assigningTecnico.set(true);

    this.ordenesService.asignarTecnico(orden.id, { tecnicoId }).subscribe({
      next: (updatedOrden) => {
        this.orden.set(updatedOrden);
        this.closeAsignarTecnicoModal();
        this.assigningTecnico.set(false);
      },
      error: (err) => {
        alert(err.message || 'Error al asignar técnico');
        this.assigningTecnico.set(false);
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  onDelete(): void {
    const orden = this.orden();
    if (!orden) return;

    this.deleting.set(true);

    this.ordenesService.delete(orden.id).subscribe({
      next: () => {
        this.router.navigate(['/ordenes']);
      },
      error: (err) => {
        alert(err.message || 'Error al eliminar la orden');
        this.deleting.set(false);
      }
    });
  }

  getEstadoColor(estado: OrdenEstado): string {
    const colors: Record<OrdenEstado, string> = {
      [OrdenEstado.PENDIENTE]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      [OrdenEstado.PLANEACION]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [OrdenEstado.EJECUCION]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      [OrdenEstado.FINALIZADA]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [OrdenEstado.CANCELADA]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  }

  getPrioridadColor(prioridad: Prioridad): string {
    const colors: Record<Prioridad, string> = {
      [Prioridad.BAJA]: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
      [Prioridad.MEDIA]: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      [Prioridad.ALTA]: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      [Prioridad.URGENTE]: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    };
    return colors[prioridad] || 'bg-gray-100 text-gray-700';
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  getEstadoIcon(estado: OrdenEstado): string {
    const icons: Record<OrdenEstado, string> = {
      [OrdenEstado.PENDIENTE]: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      [OrdenEstado.PLANEACION]: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      [OrdenEstado.EJECUCION]: 'M13 10V3L4 14h7v7l9-11h-7z',
      [OrdenEstado.FINALIZADA]: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      [OrdenEstado.CANCELADA]: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    };
    return icons[estado] || '';
  }
}
```


***

### **Template del Componente de Detalle**

**Archivo:** `apps/web/src/app/features/ordenes/components/orden-detail/orden-detail.component.html`

```html
<div class="container mx-auto px-4 py-6">
  <!-- Loading -->
  @if (loading()) {
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cermont-primary-500"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">Cargando orden...</span>
    </div>
  }

  <!-- Error -->
  @if (error()) {
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-800 dark:text-red-200">{{ error() }}</p>
    </div>
  }

  <!-- Contenido principal -->
  @if (orden(); as orden) {
    <!-- Header con acciones -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <a routerLink="/ordenes" class="text-cermont-primary-600 hover:text-cermont-primary-800 dark:text-cermont-primary-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </a>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ orden.numeroOrden }}
          </h1>
          <span class="badge" [ngClass]="getEstadoColor(orden.estado)">
            {{ orden.estado }}
          </span>
          <span class="badge" [ngClass]="getPrioridadColor(orden.prioridad)">
            {{ orden.prioridad }}
          </span>
        </div>
        <p class="text-gray-600 dark:text-gray-400">
          Creada el {{ formatDate(orden.createdAt) }}
        </p>
      </div>

      <!-- Botones de acción -->
      <div class="flex gap-2">
        <button
          (click)="openEstadoModal()"
          class="btn-primary inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          Cambiar Estado
        </button>
        <a
          [routerLink]="['/ordenes', orden.id, 'editar']"
          class="btn-outline inline-flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          Editar
        </button>
        <button
          (click)="openDeleteModal()"
          class="btn text-red-600 border-2 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Grid de 2 columnas -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Columna principal (2/3) -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Información general -->
        <div class="card">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Información General</h2>
          
          <div class="space-y-4">
            <!-- Cliente -->
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Cliente</label>
              <p class="text-lg text-gray-900 dark:text-white font-medium">{{ orden.cliente }}</p>
            </div>

            <!-- Descripción -->
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Descripción</label>
              <p class="text-gray-900 dark:text-white whitespace-pre-wrap">{{ orden.descripcion }}</p>
            </div>

            <!-- Grid de detalles -->
            <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha Inicio</label>
                <p class="text-gray-900 dark:text-white">{{ formatDate(orden.fechaInicio) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha Estimada</label>
                <p class="text-gray-900 dark:text-white">{{ formatDate(orden.fechaFinEstimada) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Presupuesto</label>
                <p class="text-gray-900 dark:text-white font-semibold">{{ formatCurrency(orden.presupuestoEstimado) }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Requiere HES</label>
                <p class="text-gray-900 dark:text-white">
                  @if (orden.requiereHES) {
                    <span class="badge bg-blue-100 text-blue-800">Sí</span>
                  } @else {
                    <span class="badge bg-gray-100 text-gray-800">No</span>
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Historial de cambios -->
        <div class="card">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Historial de Cambios</h2>
          
          @if (historial().length > 0) {
            <div class="relative">
              <!-- Línea vertical -->
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              
              <!-- Lista de cambios -->
              <div class="space-y-6">
                @for (cambio of historial(); track cambio.id) {
                  <div class="relative pl-10">
                    <!-- Punto en la línea -->
                    <div class="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-cermont-primary-500 border-2 border-white dark:border-gray-900"></div>
                    
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <span class="badge" [ngClass]="getEstadoColor(cambio.estadoAnterior)">
                            {{ cambio.estadoAnterior }}
                          </span>
                          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                          </svg>
                          <span class="badge" [ngClass]="getEstadoColor(cambio.estadoNuevo)">
                            {{ cambio.estadoNuevo }}
                          </span>
                        </div>
                        <span class="text-sm text-gray-500 dark:text-gray-400">
                          {{ formatDate(cambio.changedAt) }}
                        </span>
                      </div>
                      @if (cambio.motivo) {
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <strong>Motivo:</strong> {{ cambio.motivo }}
                        </p>
                      }
                      <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Cambiado por: {{ cambio.changedById }}
                      </p>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <p class="text-gray-500 dark:text-gray-400 text-center py-8">
              No hay cambios de estado registrados
            </p>
          }
        </div>
      </div>

      <!-- Columna lateral (1/3) -->
      <div class="space-y-6">
        <!-- Técnico asignado -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Técnico Asignado</h3>
            <button
              (click)="openAsignarTecnicoModal()"
              class="text-cermont-primary-600 hover:text-cermont-primary-800 dark:text-cermont-primary-400"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
          </div>
          
          @if (orden.tecnico) {
            <div class="flex items-center">
              <div class="flex-shrink-0 h-12 w-12 bg-cermont-primary-100 dark:bg-cermont-primary-900 rounded-full flex items-center justify-center">
                <span class="text-cermont-primary-600 dark:text-cermont-primary-400 font-bold text-lg">
                  {{ orden.tecnico.name.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ orden.tecnico.name }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ orden.tecnico.email }}</p>
                @if (orden.tecnico.phone) {
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ orden.tecnico.phone }}</p>
                }
              </div>
            </div>
          } @else {
            <div class="text-center py-4">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Sin técnico asignado</p>
            </div>
          }
        </div>

        <!-- Estado actual -->
        <div class="card">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Estado Actual</h3>
          
          <div class="flex items-center justify-center py-6">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
                   [ngClass]="getEstadoColor(orden.estado)">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        [attr.d]="getEstadoIcon(orden.estado)"/>
                </svg>
              </div>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ orden.estado }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Actualizado: {{ formatDate(orden.updatedAt) }}
              </p>
            </div>
          </div>

          @if (allowedEstados().length > 0) {
            <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Transiciones disponibles:</p>
              <div class="flex flex-wrap gap-2">
                @for (estado of allowedEstados(); track estado) {
                  <span class="badge" [ngClass]="getEstadoColor(estado)">
                    {{ estado }}
                  </span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Metadata -->
        <div class="card">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Metadata</h3>
          
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">ID</dt>
              <dd class="text-sm text-gray-900 dark:text-white font-mono break-all">{{ orden.id }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">Creada</dt>
              <dd class="text-sm text-gray-900 dark:text-white">{{ formatDate(orden.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">Última actualización</dt>
              <dd class="text-sm text-gray-900 dark:text-white">{{ formatDate(orden.updatedAt) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  }

  <!-- Modal: Cambiar Estado -->
  @if (showEstadoModal()) {
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" (click)="closeEstadoModal()"></div>
        
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Cambiar Estado</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nuevo Estado
              </label>
              <select
                [(ngModel)]="nuevoEstado"
                class="input"
              >
                <option value="">Seleccionar...</option>
                @for (estado of allowedEstados(); track estado) {
                  <option [value]="estado">{{ estado }}</option>
                }
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivo (opcional)
              </label>
              <textarea
                [(ngModel)]="motivoCambio"
                rows="3"
                class="input"
                placeholder="Describe el motivo del cambio..."
              ></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="closeEstadoModal()"
              [disabled]="changingEstado()"
              class="btn-outline"
            >
              Cancelar
            </button>
            <button
              (click)="onCambiarEstado()"
              [disabled]="!nuevoEstado() || changingEstado()"
              class="btn-primary"
            >
              @if (changingEstado()) {
                Cambiando...
              } @else {
                Confirmar Cambio
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  }

  <!-- Modal: Asignar Técnico -->
  @if (showAsignarTecnicoModal()) {
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" (click)="closeAsignarTecnicoModal()"></div>
        
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Asignar Técnico</h3>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID del Técnico
            </label>
            <input
              type="text"
              [(ngModel)]="tecnicoId"
              class="input"
              placeholder="UUID del técnico"
            />
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ingresa el UUID del técnico a asignar
            </p>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="closeAsignarTecnicoModal()"
              [disabled]="assigningTecnico()"
              class="btn-outline"
            >
              Cancelar
            </button>
            <button
              (click)="onAsignarTecnico()"
              [disabled]="!tecnicoId() || assigningTecnico()"
              class="btn-primary"
            >
              @if (assigningTecnico()) {
                Asignando...
              } @else {
                Asignar
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  }

  <!-- Modal: Confirmar Eliminación -->
  @if (showDeleteModal()) {
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" (click)="closeDeleteModal()"></div>
        
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex items-center mb-4">
            <div class="flex-shrink-0">
              <svg class="h-12 w-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Eliminar Orden</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>

          <p class="text-gray-700 dark:text-gray-300">
            ¿Estás seguro que deseas eliminar la orden <strong>{{ orden()?.numeroOrden }}</strong>?
          </p>

          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="closeDeleteModal()"
              [disabled]="deleting()"
              class="btn-outline"
            >
              Cancelar
            </button>
            <button
              (click)="onDelete()"
              [disabled]="deleting()"
              class="btn bg-red-600 text-white hover:bg-red-700"
            >
              @if (deleting()) {
                Eliminando...
              } @else {
                Eliminar Orden
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  }
</div>
```


***

## **PASO 2.8: Configurar Rutas del Módulo Ordenes**

**Archivo:** `apps/web/src/app/features/ordenes/ordenes.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const ORDENES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/ordenes-list/ordenes-list.component')
      .then(m => m.OrdenesListComponent)
  },
  {
    path: 'nueva',
    loadComponent: () => import('./components/orden-form/orden-form.component')
      .then(m => m.OrdenFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./components/orden-detail/orden-detail.component')
      .then(m => m.OrdenDetailComponent)
  },
  {
    path: ':id/editar',
    loadComponent: () => import('./components/orden-form/orden-form.component')
      .then(m => m.OrdenFormComponent)
  }
];
```


***

## **PASO 2.9: Integrar en App Routes Principal**

**Archivo:** `apps/web/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth-pages/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Rutas protegidas con autenticación
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  
  // Módulo de Ordenes (COMPLETO)
  {
    path: 'ordenes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/ordenes/ordenes.routes').then(m => m.ORDENES_ROUTES)
  },
  
  // Redirect default
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
```


***

## **PASO 2.10: Crear API Layer Completo**

**Archivo:** `apps/web/src/app/core/api/ordenes.api.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Orden,
  CreateOrdenDto,
  UpdateOrdenDto,
  ChangeEstadoOrdenDto,
  AsignarTecnicoOrdenDto,
  ListOrdenesQuery,
  PaginatedOrdenes,
  HistorialEstado,
  OrdenesStats
} from '../models/orden.model';

@Injectable({
  providedIn: 'root'
})
export class OrdenesApi {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/ordenes`;

  list(query?: ListOrdenesQuery): Observable<PaginatedOrdenes> {
    let params = new HttpParams();
    
    if (query) {
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.estado) params = params.set('estado', query.estado);
      if (query.prioridad) params = params.set('prioridad', query.prioridad);
      if (query.cliente) params = params.set('cliente', query.cliente);
      if (query.asignadoId) params = params.set('asignadoId', query.asignadoId);
      if (query.searchTerm) params = params.set('searchTerm', query.searchTerm);
    }

    return this.http.get<PaginatedOrdenes>(this.API_URL, { params });
  }

  getById(id: string): Observable<Orden> {
    return this.http.get<Orden>(`${this.API_URL}/${id}`);
  }

  create(dto: CreateOrdenDto): Observable<Orden> {
    return this.http.post<Orden>(this.API_URL, dto);
  }

  update(id: string, dto: UpdateOrdenDto): Observable<Orden> {
    return this.http.patch<Orden>(`${this.API_URL}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  changeEstado(id: string, dto: ChangeEstadoOrdenDto): Observable<Orden> {
    return this.http.post<Orden>(`${this.API_URL}/${id}/cambiar-estado`, dto);
  }

  asignarTecnico(id: string, dto: AsignarTecnicoOrdenDto): Observable<Orden> {
    return this.http.post<Orden>(`${this.API_URL}/${id}/asignar-tecnico`, dto);
  }

  getHistorial(id: string): Observable<HistorialEstado[]> {
    return this.http.get<HistorialEstado[]>(`${this.API_URL}/${id}/historial`);
  }

  getStats(): Observable<OrdenesStats> {
    return this.http.get<OrdenesStats>(`${this.API_URL}/stats`);
  }
}
```


***

## ✅ **CHECKLIST COMPLETO - MÓDULO ORDENES**

### **Backend (100% Completado)**

- [x] DTOs unificados con class-validator
- [x] Soft delete implementado en Prisma schema
- [x] Búsqueda full-text en repositorio
- [x] Máquina de estados para validar transiciones
- [x] Use case de cambio de estado con validación
- [x] Controlador con Swagger completo
- [x] Historial de cambios de estado
- [x] Asignación de técnicos


### **Frontend (100% Completado)**

- [x] Modelos TypeScript completos (`orden.model.ts`)
- [x] API Layer (`ordenes.api.ts`)
- [x] Servicio (`ordenes.service.ts`)
- [x] Componente Lista con filtros y paginación
- [x] Componente Formulario (crear/editar)
- [x] Componente Detalle con historial
- [x] Modales para cambio de estado, asignar técnico, eliminar
- [x] Rutas configuradas
- [x] Guards de autenticación aplicados
- [x] Estilos Tailwind personalizados


### **Integración**

- [x] Environment variables configuradas
- [x] HTTP Interceptor para JWT
- [x] Manejo de errores completo
- [x] Loading states en toda la UI
- [x] Validación de formularios reactivos
- [x] Mensajes de confirmación

***

## 🎯 **PRÓXIMOS PASOS**

El módulo de ORDENES está **100% COMPLETO**. Ahora podemos continuar con:

1. ✅ **MÓDULO 3: TECNICOS** - Gestión de técnicos
2. ✅ **MÓDULO 4: DASHBOARD** - Estadísticas y gráficos
3. ✅ **MÓDULO 5: MANTENIMIENTOS** - Gestión de mantenimientos
4. ✅ **MÓDULO 6: PLANEACION** - Planeación de trabajos

**¿Continuamos con el módulo TECNICOS?** 🚀
<span style="display:none">[^10_1][^10_10][^10_11][^10_12][^10_13][^10_14][^10_2][^10_3][^10_4][^10_5][^10_6][^10_7][^10_8][^10_9]</span>

<div align="center">⁂</div>

[^10_1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e7ef7089-a7c3-4b34-b033-fc15be183a25/1.pdf

[^10_2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/a940b6ba-0a42-4561-ae5f-6c58ccb22639/DESARROLLO-DE-UN-APLICATIVO-WEB-PARA-APOYO-EN-LA-EJECUCION-Y-CIERRE-ADMINISTRATIVO-DE-LOS-TRABA.pdf

[^10_3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bec5d009-21af-4a27-8f72-1ff014e21195/3.pdf

[^10_4]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8fdf4499-f510-44f1-b6ba-e127ff7dcdd0/ATG-JUAN-DIEGO-AREVALO-1.pdf

[^10_5]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8bcac50f-ecfc-470c-890b-975f12027c34/FORMATO-DE-PLANEACION-DE-OBRA.pdf

[^10_6]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4687b5dd-a3fa-47af-8e22-4f51fe7b7b70/FOTOS-ANCLAJE-ESCALERA-A-ESTRUCTURA.pdf

[^10_7]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/03485512-1de5-48d0-9f2e-e068a2917d74/Observaciones-Anteproyecto-Juan-Diego.pdf

[^10_8]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/48c31c95-70b6-4087-9109-4d6a3fcc2bdc/2.pdf

[^10_9]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/c1a26b09-8fa4-4750-aa3d-2b68c694ebdf/Formato-Inspeccion-lineas-de-vida-Vertical.pdf

[^10_10]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4595a7f0-a3a7-4bb7-9009-e81ec9d9f6dd/main.pdf

[^10_11]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/42ac0c6f-0320-4af1-bd4e-7343f5523444/Formato-Mantenimiento-CCTV.pdf

[^10_12]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/674d7901-58dc-4520-8558-53a41f841c80/Jerarquia-de-controles_Cermont.pdf

[^10_13]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e441ab0a-b57a-4248-b027-e83f18039c61/INDUCCION-SGSST.pdf

[^10_14]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/6389259e-e945-4e6a-ae61-15783ab9de00/paste.txt


---

# el primer modulo es admin inicia por ahi analiza todo el backend y frontend en busca de errores y crea el plan de refactorizacion taskill compleo continuamos con los prompts taskill refactorizadores ahora seguimos con el siguiente modulo del backend tener el cuenta el stand de dependencias y no agregar una dependencia creando duplicidad o choque de trabajo iguales y microservicios de paga o prueba

Perfecto! Ahora voy a revisar el frontend del módulo admin/auth. Basándome en el análisis completo, voy a crear el **PLAN DE REFACTORIZACIÓN TASKILL COMPLETO** para el módulo AUTH/ADMIN:

***

# 📋 PLAN DE REFACTORIZACIÓN TASKILL - MÓDULO AUTH/ADMIN

## 📊 **ANÁLISIS DE DEPENDENCIAS ACTUALES**

### **Backend - Dependencias Críticas:**

```json
{
  "@nestjs/jwt": "^11.0.2",           // ✅ JWT tokens
  "@nestjs/passport": "^11.0.5",      // ✅ Estrategias de auth
  "passport": "^0.7.0",                // ✅ Base de passport
  "passport-jwt": "^4.0.1",            // ✅ JWT strategy
  "passport-google-oauth20": "^2.0.0", // ✅ OAuth Google
  "bcryptjs": "^3.0.3",                // ✅ Hash de contraseñas
  "@prisma/client": "^7.2.0",          // ✅ ORM
  "class-validator": "^0.14.3",        // ✅ Validación
  "class-transformer": "^0.5.1"        // ✅ Transformación
}
```


### **Frontend - Dependencias Críticas:**

```json
{
  "@angular/core": "^21.0.4",          // ✅ Framework
  "@angular/forms": "^21.0.4",         // ✅ Formularios reactivos
  "@angular/router": "^21.0.4",        // ✅ Routing y guards
  "rxjs": "~7.8.2"                     // ✅ Observables
}
```


### **🚨 PROBLEMAS DETECTADOS:**

#### **Backend:**

1. ❌ **Duplicidad de lógica**: `auth.service.ts` y `admin.service.ts` manejan usuarios
2. ❌ **Sin rate limiting** específico para login (solo global)
3. ❌ **Sin 2FA (Two-Factor Authentication)**
4. ❌ **Sin logs de seguridad detallados** (intentos fallidos, bloqueos)
5. ❌ **Sin paginación** en `getAllUsers` del `admin.service.ts`
6. ❌ **Sin filtros avanzados** para búsqueda de usuarios
7. ❌ **Sin validación de fuerza de contraseña**
8. ❌ **Sin expiración de tokens de acceso** configurable
9. ❌ **Sin revocación de todos los tokens** de un usuario
10. ❌ **Sin notificación por email** al cambiar contraseña

#### **Frontend:**

11. ❌ **Sin componentes creados** para gestión de usuarios
12. ❌ **Sin tabla de usuarios** con filtros
13. ❌ **Sin formulario de creación** de usuarios
14. ❌ **Sin modal de edición** de rol
15. ❌ **Sin vista de permisos** por rol
16. ❌ **Sin indicadores visuales** de usuarios bloqueados
17. ❌ **Sin búsqueda en tiempo real**
18. ❌ **Sin exportación** de usuarios (Excel/CSV)

***

## 🎯 **PLAN DE REFACTORIZACIÓN - 5 FASES**


***

# **FASE 1: BACKEND - SEGURIDAD Y VALIDACIONES**

## **TASK 1.1: Agregar Rate Limiting Específico para Auth**

**Archivo:** `apps/api/src/modules/auth/infrastructure/guards/login-throttle.guard.ts`

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate limiter específico para login
 * - 5 intentos por minuto por IP
 * - 10 intentos por hora por cuenta
 */
@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const email = (req.body as { email?: string })?.email;
    const ip = req.ip as string;
    
    // Combinar IP + email para tracking más preciso
    return email ? `${ip}:${email}` : ip;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Permitir más intentos en desarrollo
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    return super.canActivate(context);
  }
}
```

**Aplicar en controlador:**

**Archivo:** `apps/api/src/modules/auth/infrastructure/controllers/auth.controller.ts`

```typescript
import { UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { LoginThrottlerGuard } from '../guards/login-throttle.guard';

@Controller('auth')
export class AuthController {
  // ...

  @Post('login')
  @UseGuards(LoginThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  async login(@Body() dto: LoginDto) {
    // ...
  }
}
```


***

## **TASK 1.2: Validación de Fuerza de Contraseña**

**Archivo:** `apps/api/src/modules/auth/domain/validators/password-strength.validator.ts`

```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Validador de fuerza de contraseña según OWASP
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 * - Al menos 1 carácter especial
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') return false;

          const hasMinLength = value.length >= 8;
          const hasUpperCase = /[A-Z]/.test(value);
          const hasLowerCase = /[a-z]/.test(value);
          const hasNumber = /[0-9]/.test(value);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

          return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
        },
        defaultMessage(args: ValidationArguments) {
          return 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales';
        },
      },
    });
  };
}
```

**Aplicar en DTOs:**

**Archivo:** `apps/api/src/modules/auth/application/dto/register.dto.ts`

```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../domain/validators/password-strength.validator';

export class RegisterDto {
  @ApiProperty({ example: 'juan@cermont.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({ example: 'Passw0rd!@#', minLength: 8, maxLength: 100 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
  @IsStrongPassword({ message: 'La contraseña no cumple con los requisitos de seguridad' })
  password!: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede exceder 200 caracteres' })
  name!: string;

  @ApiProperty({ example: 'tecnico', enum: ['admin', 'supervisor', 'tecnico'], required: false })
  @IsOptional()
  @IsEnum(['admin', 'supervisor', 'tecnico'], { message: 'Rol inválido' })
  role?: string;

  @ApiProperty({ example: '+573001234567', required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}
```


***

## **TASK 1.3: Bloqueo Automático por Intentos Fallidos**

**Archivo:** `apps/api/src/modules/auth/auth.service.ts` (actualizar método login)

```typescript
async login(dto: LoginDto, ip?: string, userAgent?: string): Promise<AuthResponse> {
  const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

  if (!user || !user.active || !user.password) {
    throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
  }

  // Verificar si está bloqueado
  if (user.lockedUntil && new Date() < user.lockedUntil) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    throw new UnauthorizedException(
      `Cuenta bloqueada. Intenta de nuevo en ${minutesLeft} minutos`
    );
  }

  const isValid = await this.comparePassword(dto.password, user.password);

  if (!isValid) {
    // Incrementar intentos fallidos
    const newAttempts = user.loginAttempts + 1;
    const MAX_ATTEMPTS = 5;

    // Bloquear si excede intentos
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockDuration = 30; // minutos
      const lockedUntil = new Date(Date.now() + lockDuration * 60 * 1000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil,
        },
      });

      await this.createAuditLog(user.id, 'ACCOUNT_LOCKED', ip, userAgent);

      throw new UnauthorizedException(
        `Cuenta bloqueada por ${lockDuration} minutos debido a múltiples intentos fallidos`
      );
    }

    // Actualizar intentos
    await this.prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: newAttempts },
    });

    await this.createAuditLog(user.id, 'LOGIN_FAILED', ip, userAgent);

    throw new UnauthorizedException('Credenciales inválidas');
  }

  // Resetear intentos fallidos en login exitoso
  await Promise.all([
    this.createAuditLog(user.id, 'LOGIN', ip, userAgent),
    this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
      },
    }),
  ]);

  return this.buildAuthResponse(user, ip, userAgent);
}
```


***

## **TASK 1.4: Paginación y Filtros Avanzados en Admin**

**Archivo:** `apps/api/src/modules/admin/dto/admin.dto.ts` (actualizar)

```typescript
import { IsOptional, IsEnum, IsBoolean, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum UserSortBy {
  NAME = 'name',
  EMAIL = 'email',
  ROLE = 'role',
  CREATED_AT = 'createdAt',
  LAST_LOGIN = 'lastLogin',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListUsersQueryDto {
  @ApiPropertyOptional({ enum: ['admin', 'supervisor', 'tecnico'] })
  @IsOptional()
  @IsEnum(['admin', 'supervisor', 'tecnico'])
  role?: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Buscar por nombre o email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: UserSortBy, default: UserSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy = UserSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({ description: 'Filtrar por usuarios bloqueados' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  locked?: boolean;
}

export interface PaginatedUsersResponse {
  data: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
```

**Actualizar servicio:**

**Archivo:** `apps/api/src/modules/admin/admin.service.ts`

```typescript
async getAllUsers(query: ListUsersQueryDto): Promise<PaginatedUsersResponse> {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (query.role) {
    where.role = query.role;
  }

  if (query.active !== undefined) {
    where.active = query.active;
  }

  if (query.locked !== undefined) {
    where.lockedUntil = query.locked ? { not: null } : null;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    this.prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    }),
    this.prisma.user.count({ where }),
  ]);

  return {
    data: users.map((u) => this.mapToUserResponse(u)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}
```


***

## **TASK 1.5: Revocar Todos los Tokens de un Usuario**

**Archivo:** `apps/api/src/modules/admin/admin.service.ts`

```typescript
/**
 * Revoca todos los refresh tokens activos de un usuario
 * Útil al cambiar contraseña o bloquear cuenta
 */
async revokeAllUserTokens(
  userId: string,
  adminUserId: string,
  reason: string
): Promise<{ tokensRevoked: number }> {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundException(`Usuario ${userId} no encontrado`);
  }

  const result = await this.prisma.refreshToken.updateMany({
    where: {
      userId,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });

  await this.logAudit('TOKENS_REVOKED', adminUserId, 'User', userId, {
    tokensRevoked: result.count,
    reason,
  });

  this.logger.log(`✅ ${result.count} tokens revocados para usuario ${user.email}`);

  return { tokensRevoked: result.count };
}
```


***

¿Continúo con las **FASES 2, 3, 4 y 5** del plan de refactorización (Frontend, Rutas, Testing, Documentación)? 🚀
<span style="display:none">[^11_1][^11_10][^11_11][^11_12][^11_13][^11_14][^11_2][^11_3][^11_4][^11_5][^11_6][^11_7][^11_8][^11_9]</span>

<div align="center">⁂</div>

[^11_1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e7ef7089-a7c3-4b34-b033-fc15be183a25/1.pdf

[^11_2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/a940b6ba-0a42-4561-ae5f-6c58ccb22639/DESARROLLO-DE-UN-APLICATIVO-WEB-PARA-APOYO-EN-LA-EJECUCION-Y-CIERRE-ADMINISTRATIVO-DE-LOS-TRABA.pdf

[^11_3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bec5d009-21af-4a27-8f72-1ff014e21195/3.pdf

[^11_4]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8fdf4499-f510-44f1-b6ba-e127ff7dcdd0/ATG-JUAN-DIEGO-AREVALO-1.pdf

[^11_5]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8bcac50f-ecfc-470c-890b-975f12027c34/FORMATO-DE-PLANEACION-DE-OBRA.pdf

[^11_6]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4687b5dd-a3fa-47af-8e22-4f51fe7b7b70/FOTOS-ANCLAJE-ESCALERA-A-ESTRUCTURA.pdf

[^11_7]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/03485512-1de5-48d0-9f2e-e068a2917d74/Observaciones-Anteproyecto-Juan-Diego.pdf

[^11_8]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/48c31c95-70b6-4087-9109-4d6a3fcc2bdc/2.pdf

[^11_9]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/c1a26b09-8fa4-4750-aa3d-2b68c694ebdf/Formato-Inspeccion-lineas-de-vida-Vertical.pdf

[^11_10]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4595a7f0-a3a7-4bb7-9009-e81ec9d9f6dd/main.pdf

[^11_11]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/42ac0c6f-0320-4af1-bd4e-7343f5523444/Formato-Mantenimiento-CCTV.pdf

[^11_12]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/674d7901-58dc-4520-8558-53a41f841c80/Jerarquia-de-controles_Cermont.pdf

[^11_13]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e441ab0a-b57a-4248-b027-e83f18039c61/INDUCCION-SGSST.pdf

[^11_14]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/6389259e-e945-4e6a-ae61-15783ab9de00/paste.txt


---

# 📋 PLAN DE REFACTORIZACIÓN TASKILL - MÓDULO AUTH/ADMIN (CONTINUACIÓN)


***

# **FASE 2: BACKEND - CONTROLADORES Y USE CASES COMPLETOS**

## **TASK 2.1: Crear Controlador Admin Completo**

**Archivo:** `apps/api/src/modules/admin/infrastructure/controllers/admin.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from '../../admin.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  ListUsersQueryDto,
  PaginatedUsersResponse,
  UserResponseDto,
} from '../../dto/admin.dto';
import { GetUser } from '../../../auth/decorators/get-user.decorator';

@ApiTags('Admin - Gestión de Usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============================================
  // CRUD USUARIOS
  // ============================================

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async createUser(
    @Body() dto: CreateUserDto,
    @GetUser('userId') adminUserId: string,
  ): Promise<UserResponseDto> {
    return this.adminService.createUser(dto, adminUserId);
  }

  @Get()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Listar todos los usuarios con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios', type: PaginatedUsersResponse })
  async getAllUsers(@Query() query: ListUsersQueryDto): Promise<PaginatedUsersResponse> {
    return this.adminService.getAllUsers(query);
  }

  @Get(':id')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUserById(@Param('id') userId: string): Promise<UserResponseDto> {
    return this.adminService.getUserById(userId);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar información de usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateUser(
    @Param('id') userId: string,
    @Body() dto: UpdateUserDto,
    @GetUser('userId') adminUserId: string,
  ): Promise<UserResponseDto> {
    return this.adminService.updateUser(userId, dto, adminUserId);
  }

  @Patch(':id/role')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualizar rol de usuario' })
  @ApiResponse({ status: 200, description: 'Rol actualizado', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'No puedes quitarte el rol admin' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
    @GetUser('userId') adminUserId: string,
  ): Promise<UserResponseDto> {
    return this.adminService.updateUserRole(userId, dto, adminUserId);
  }

  @Patch(':id/activate')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario activado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async activateUser(
    @Param('id') userId: string,
    @GetUser('userId') adminUserId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.adminService.toggleUserActive(userId, true, adminUserId);
  }

  @Patch(':id/deactivate')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado' })
  @ApiResponse({ status: 400, description: 'No puedes desactivar tu propia cuenta' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async deactivateUser(
    @Param('id') userId: string,
    @GetUser('userId') adminUserId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.adminService.toggleUserActive(userId, false, adminUserId);
  }

  @Post(':id/reset-password')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resetear contraseña de usuario (admin)' })
  @ApiResponse({ status: 200, description: 'Contraseña actualizada' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async resetUserPassword(
    @Param('id') userId: string,
    @Body('newPassword') newPassword: string,
    @GetUser('userId') adminUserId: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.adminService.adminChangePassword(userId, newPassword, adminUserId);
  }

  @Post(':id/revoke-tokens')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revocar todos los tokens activos de un usuario' })
  @ApiResponse({ status: 200, description: 'Tokens revocados' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async revokeUserTokens(
    @Param('id') userId: string,
    @Body('reason') reason: string,
    @GetUser('userId') adminUserId: string,
  ): Promise<{ tokensRevoked: number }> {
    return this.adminService.revokeAllUserTokens(userId, adminUserId, reason);
  }

  // ============================================
  // PERMISOS
  // ============================================

  @Get('permissions/roles')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener todos los roles y sus permisos' })
  @ApiResponse({ status: 200, description: 'Mapa de permisos por rol' })
  async getAllRolesPermissions() {
    return this.adminService.getAllRolesWithPermissions();
  }

  @Get('permissions/:role')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Obtener permisos de un rol específico' })
  @ApiResponse({ status: 200, description: 'Permisos del rol' })
  async getRolePermissions(@Param('role') role: string) {
    return this.adminService.getUserPermissions(role as any);
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  @Get('stats/overview')
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Obtener estadísticas generales de usuarios' })
  @ApiResponse({ status: 200, description: 'Estadísticas de usuarios' })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('stats/activity')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener actividad reciente de usuarios' })
  @ApiResponse({ status: 200, description: 'Actividad de usuarios' })
  async getUserActivity(@Query('days') days?: number) {
    return this.adminService.getUserActivity(days || 7);
  }

  @Get('audit-logs')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtener logs de auditoría de admin' })
  @ApiResponse({ status: 200, description: 'Logs de auditoría' })
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
  ) {
    return this.adminService.getAuditLogs({ page, limit, userId, action });
  }
}
```


***

## **TASK 2.2: Agregar Métodos Faltantes en Admin Service**

**Archivo:** `apps/api/src/modules/admin/admin.service.ts` (agregar al final)

```typescript
/**
 * Obtiene todos los roles con sus permisos
 */
getAllRolesWithPermissions() {
  const roles = Object.values(UserRoleEnum);
  
  return roles.map(role => ({
    role,
    permissions: getPermissionsForRole(role),
    description: this.getRoleDescription(role),
  }));
}

/**
 * Obtiene descripción de un rol
 */
private getRoleDescription(role: UserRoleEnum): string {
  const descriptions: Record<UserRoleEnum, string> = {
    [UserRoleEnum.ADMIN]: 'Acceso completo al sistema, gestión de usuarios y configuración',
    [UserRoleEnum.SUPERVISOR]: 'Supervisión de órdenes, revisión de trabajo y gestión de equipos',
    [UserRoleEnum.TECNICO]: 'Ejecución de órdenes de trabajo y reportes de campo',
  };
  return descriptions[role];
}

/**
 * Obtiene actividad reciente de usuarios
 */
async getUserActivity(days: number = 7): Promise<{
  activeUsers: number;
  newUsers: number;
  loginActivity: Array<{ date: string; count: number }>;
  topActiveUsers: Array<{ userId: string; name: string; email: string; loginCount: number }>;
}> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [activeUsers, newUsers, loginLogs] = await Promise.all([
    // Usuarios con login reciente
    this.prisma.user.count({
      where: {
        lastLogin: {
          gte: startDate,
        },
      },
    }),
    // Usuarios creados recientemente
    this.prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }),
    // Logs de login
    this.prisma.auditLog.findMany({
      where: {
        action: 'LOGIN',
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  // Agrupar por fecha
  const loginsByDate = loginLogs.reduce((acc, log) => {
    const date = log.createdAt.toISOString().split('T')[^12_0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const loginActivity = Object.entries(loginsByDate).map(([date, count]) => ({
    date,
    count,
  }));

  // Usuarios más activos (por login)
  const loginsByUser = loginLogs.reduce((acc, log) => {
    if (log.userId) {
      acc[log.userId] = (acc[log.userId] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topUserIds = Object.entries(loginsByUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([userId]) => userId);

  const topUsers = await this.prisma.user.findMany({
    where: {
      id: { in: topUserIds },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const topActiveUsers = topUsers.map(user => ({
    userId: user.id,
    name: user.name,
    email: user.email,
    loginCount: loginsByUser[user.id],
  }));

  return {
    activeUsers,
    newUsers,
    loginActivity,
    topActiveUsers,
  };
}

/**
 * Obtiene logs de auditoría con paginación
 */
async getAuditLogs(query: {
  page: number;
  limit: number;
  userId?: string;
  action?: string;
}): Promise<{
  data: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    changes: unknown;
    ip: string | null;
    userAgent: string | null;
    createdAt: string;
    user: { id: string; name: string; email: string } | null;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const { page, limit, userId, action } = query;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;

  const [logs, total] = await Promise.all([
    this.prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    this.prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      changes: log.changes,
      ip: log.ip,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
      user: log.user,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
```


***

## **TASK 2.3: Actualizar Admin Module**

**Archivo:** `apps/api/src/modules/admin/admin.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './infrastructure/controllers/admin.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
```


***

# **FASE 3: FRONTEND - MODELOS Y SERVICIOS**

## **TASK 3.1: Crear Modelos TypeScript Completos**

**Archivo:** `apps/web/src/app/core/models/user.model.ts`

```typescript
export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  emailVerified?: boolean;
  lockedUntil?: string | null;
  loginAttempts?: number;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateUserRoleDto {
  role: UserRole;
}

export interface ListUsersQuery {
  role?: UserRole;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'role' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
  locked?: boolean;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface UserStats {
  total: number;
  activos: number;
  porRol: Record<string, number>;
}

export interface UserActivity {
  activeUsers: number;
  newUsers: number;
  loginActivity: Array<{ date: string; count: number }>;
  topActiveUsers: Array<{
    userId: string;
    name: string;
    email: string;
    loginCount: number;
  }>;
}

export interface Permission {
  resource: string;
  action: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: unknown;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```


***

## **TASK 3.2: Crear Auth Models**

**Archivo:** `apps/web/src/app/core/models/auth.model.ts`

```typescript
import { User } from './user.model';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PasswordStrengthResult {
  score: number; // 0-4
  isValid: boolean;
  feedback: string[];
}
```


***

## **TASK 3.3: Crear API Layer para Admin**

**Archivo:** `apps/web/src/app/core/api/admin.api.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  ListUsersQuery,
  PaginatedUsers,
  UserStats,
  UserActivity,
  RolePermissions,
  PaginatedAuditLogs,
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/admin/users`;

  // CRUD Usuarios
  createUser(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.API_URL, dto);
  }

  getAllUsers(query?: ListUsersQuery): Observable<PaginatedUsers> {
    let params = new HttpParams();
    
    if (query) {
      if (query.role) params = params.set('role', query.role);
      if (query.active !== undefined) params = params.set('active', query.active.toString());
      if (query.search) params = params.set('search', query.search);
      if (query.page) params = params.set('page', query.page.toString());
      if (query.limit) params = params.set('limit', query.limit.toString());
      if (query.sortBy) params = params.set('sortBy', query.sortBy);
      if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
      if (query.locked !== undefined) params = params.set('locked', query.locked.toString());
    }

    return this.http.get<PaginatedUsers>(this.API_URL, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  updateUser(id: string, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}`, dto);
  }

  updateUserRole(id: string, dto: UpdateUserRoleDto): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/role`, dto);
  }

  activateUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.API_URL}/${id}/activate`,
      {}
    );
  }

  deactivateUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.patch<{ success: boolean; message: string }>(
      `${this.API_URL}/${id}/deactivate`,
      {}
    );
  }

  resetUserPassword(id: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.API_URL}/${id}/reset-password`,
      { newPassword }
    );
  }

  revokeUserTokens(id: string, reason: string): Observable<{ tokensRevoked: number }> {
    return this.http.post<{ tokensRevoked: number }>(
      `${this.API_URL}/${id}/revoke-tokens`,
      { reason }
    );
  }

  // Permisos
  getAllRolesPermissions(): Observable<RolePermissions[]> {
    return this.http.get<RolePermissions[]>(`${this.API_URL}/permissions/roles`);
  }

  getRolePermissions(role: string): Observable<RolePermissions> {
    return this.http.get<RolePermissions>(`${this.API_URL}/permissions/${role}`);
  }

  // Estadísticas
  getUserStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.API_URL}/stats/overview`);
  }

  getUserActivity(days?: number): Observable<UserActivity> {
    let params = new HttpParams();
    if (days) params = params.set('days', days.toString());
    return this.http.get<UserActivity>(`${this.API_URL}/stats/activity`, { params });
  }

  // Auditoría
  getAuditLogs(query: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
  }): Observable<PaginatedAuditLogs> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());
    if (query.userId) params = params.set('userId', query.userId);
    if (query.action) params = params.set('action', query.action);

    return this.http.get<PaginatedAuditLogs>(`${this.API_URL}/audit-logs`, { params });
  }
}
```


***

## **TASK 3.4: Crear Auth API**

**Archivo:** `apps/web/src/app/core/api/auth.api.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenResponse,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/auth`;

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, dto);
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, dto);
  }

  refresh(refreshToken: string): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(`${this.API_URL}/refresh`, { refreshToken });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/logout`, {});
  }

  validateToken(): Observable<{ valid: boolean }> {
    return this.http.get<{ valid: boolean }>(`${this.API_URL}/validate`);
  }
}
```


***

## **TASK 3.5: Crear Servicios de Aplicación**

**Archivo:** `apps/web/src/app/core/services/admin.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AdminApi } from '../api/admin.api';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  ListUsersQuery,
  PaginatedUsers,
  UserStats,
  UserActivity,
  RolePermissions,
  PaginatedAuditLogs,
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly api = inject(AdminApi);

  createUser(dto: CreateUserDto): Observable<User> {
    return this.api.createUser(dto);
  }

  getAllUsers(query?: ListUsersQuery): Observable<PaginatedUsers> {
    return this.api.getAllUsers(query);
  }

  getUserById(id: string): Observable<User> {
    return this.api.getUserById(id);
  }

  updateUser(id: string, dto: UpdateUserDto): Observable<User> {
    return this.api.updateUser(id, dto);
  }

  updateUserRole(id: string, dto: UpdateUserRoleDto): Observable<User> {
    return this.api.updateUserRole(id, dto);
  }

  activateUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.activateUser(id);
  }

  deactivateUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.deactivateUser(id);
  }

  resetUserPassword(id: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    return this.api.resetUserPassword(id, newPassword);
  }

  revokeUserTokens(id: string, reason: string): Observable<{ tokensRevoked: number }> {
    return this.api.revokeUserTokens(id, reason);
  }

  getAllRolesPermissions(): Observable<RolePermissions[]> {
    return this.api.getAllRolesPermissions();
  }

  getRolePermissions(role: string): Observable<RolePermissions> {
    return this.api.getRolePermissions(role);
  }

  getUserStats(): Observable<UserStats> {
    return this.api.getUserStats();
  }

  getUserActivity(days?: number): Observable<UserActivity> {
    return this.api.getUserActivity(days);
  }

  getAuditLogs(query: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
  }): Observable<PaginatedAuditLogs> {
    return this.api.getAuditLogs(query);
  }
}
```


***

**Archivo:** `apps/web/src/app/core/services/auth.service.ts`

```typescript
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { AuthApi } from '../api/auth.api';
import { User } from '../models/user.model';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);

  // Estado de autenticación
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  // Signals para componentes
  public readonly currentUser = signal<User | null>(null);
  public readonly isAuthenticated = computed(() => !!this.currentUser());
  public readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  public readonly isSupervisor = computed(() => this.currentUser()?.role === 'supervisor');
  public readonly isTecnico = computed(() => this.currentUser()?.role === 'tecnico');

  constructor() {
    this.loadUserFromStorage();
  }

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.api.login(dto).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(dto: RegisterDto): Observable<AuthResponse> {
    return this.api.register(dto).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        console.error('Register error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => this.clearAuthData(),
      error: () => this.clearAuthData(),
    });
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.api.refresh(refreshToken).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this.setRefreshToken(response.refreshToken);
      }),
      catchError(error => {
        this.clearAuthData();
        return throwError(() => error);
      })
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.setToken(response.token);
    this.setRefreshToken(response.refreshToken);
    this.setUser(response.user);
    this.currentUser.set(response.user);
    this.currentUserSubject.next(response.user);
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  private loadUserFromStorage(): void {
    const token = this.getToken();
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUser.set(user);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        this.clearAuthData();
      }
    }
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refresh_token', token);
  }

  private setUser(user: User): void {
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  // Role checks
  hasRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  hasPermission(resource: string, action: string): boolean {
    // Implementar lógica de permisos basada en rol
    const user = this.currentUser();
    if (!user) return false;

    // Admin tiene todos los permisos
    if (user.role === 'admin') return true;

    // Implementar matriz de permisos según necesidad
    return false;
  }
}
```


***

# **FASE 4: FRONTEND - COMPONENTES DE ADMINISTRACIÓN**

## **TASK 4.1: Componente Lista de Usuarios**

**Archivo:** `apps/web/src/app/features/admin/components/users-list/users-list.component.ts`

```typescript
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import {
  User,
  UserRole,
  ListUsersQuery,
} from '../../../../core/models/user.model';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  // Estado
  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Paginación
  currentPage = signal(1);
  pageSize = signal(10);
  totalItems = signal(0);
  totalPages = computed(() => Math.ceil(this.totalItems() / this.pageSize()));

  // Filtros
  filtroRole = signal<UserRole | ''>('');
  filtroActive = signal<boolean | ''>('');
  filtroLocked = signal<boolean | ''>('');
  searchTerm = signal('');
  sortBy = signal<'name' | 'email' | 'role' | 'createdAt' | 'lastLogin'>('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  // Enums para template
  readonly UserRole = UserRole;
  readonly rolesOptions = Object.values(UserRole);

  // Modales
  showDeleteModal = signal(false);
  showPasswordModal = signal(false);
  selectedUser = signal<User | null>(null);
  newPassword = signal('');

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    const query: ListUsersQuery = {
      page: this.currentPage(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
      ...(this.filtroRole() && { role: this.filtroRole() as UserRole }),
      ...(this.filtroActive() !== '' && { active: this.filtroActive() as boolean }),
      ...(this.filtroLocked() !== '' && { locked: this.filtroLocked() as boolean }),
      ...(this.searchTerm() && { search: this.searchTerm() }),
    };

    this.adminService.getAllUsers(query).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar usuarios');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadUsers();
  }

  clearFilters(): void {
    this.filtroRole.set('');
    this.filtroActive.set('');
    this.filtroLocked.set('');
    this.searchTerm.set('');
    this.sortBy.set('createdAt');
    this.sortOrder.set('desc');
    this.currentPage.set(1);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadUsers();
  }

  onSort(field: 'name' | 'email' | 'role' | 'createdAt' | 'lastLogin'): void {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.loadUsers();
  }

  toggleUserActive(user: User): void {
    const action = user.active ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de ${action} a ${user.name}?`)) return;

    const observable = user.active
      ? this.adminService.deactivateUser(user.id)
      : this.adminService.activateUser(user.id);

    observable.subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        alert(err.message || `Error al ${action} usuario`);
      }
    });
  }

  openPasswordModal(user: User): void {
    this.selectedUser.set(user);
    this.newPassword.set('');
    this.showPasswordModal.set(true);
  }

  closePasswordModal(): void {
    this.showPasswordModal.set(false);
    this.selectedUser.set(null);
    this.newPassword.set('');
  }

  resetPassword(): void {
    const user = this.selectedUser();
    const password = this.newPassword();

    if (!user || !password) return;

    this.adminService.resetUserPassword(user.id, password).subscribe({
      next: () => {
        alert('Contraseña actualizada exitosamente');
        this.closePasswordModal();
      },
      error: (err) => {
        alert(err.message || 'Error al actualizar contraseña');
      }
    });
  }

  revokeTokens(user: User): void {
    if (!confirm(`¿Revocar todas las sesiones de ${user.name}?`)) return;

    this.adminService.revokeUserTokens(user.id, 'Revocado por administrador').subscribe({
      next: (result) => {
        alert(`${result.tokensRevoked} tokens revocados`);
      },
      error: (err) => {
        alert(err.message || 'Error al revocar tokens');
      }
    });
  }

  getRoleBadgeColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      [UserRole.SUPERVISOR]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [UserRole.TECNICO]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[role];
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isUserLocked(user: User): boolean {
    if (!user.lockedUntil) return false;
    return new Date(user.lockedUntil) > new Date();
  }

  readonly Math = Math;
}
```


***

## **TASK 4.2: Template Lista de Usuarios**

**Archivo:** `apps/web/src/app/features/admin/components/users-list/users-list.component.html`

```html
<div class="container mx-auto px-4 py-6">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Administra usuarios, roles y permisos</p>
    </div>
    <a 
      routerLink="/admin/users/nuevo"
      class="btn-primary inline-flex items-center"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
      </svg>
      Nuevo Usuario
    </a>
  </div>

  <!-- Barra de filtros -->
  <div class="card mb-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      <!-- Búsqueda -->
      <div class="lg:col-span-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Buscar
        </label>
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (keyup.enter)="onSearch()"
            placeholder="Nombre, email..."
            class="input pl-10"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Filtro por rol -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rol
        </label>
        <select
          [(ngModel)]="filtroRole"
          (change)="onFilterChange()"
          class="input"
        >
          <option value="">Todos</option>
          <option *ngFor="let role of rolesOptions" [value]="role">
            {{ role }}
          </option>
        </select>
      </div>

      <!-- Filtro por estado -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Estado
        </label>
        <select
          [(ngModel)]="filtroActive"
          (change)="onFilterChange()"
          class="input"
        >
          <option value="">Todos</option>
          <option [value]="true">Activos</option>
          <option [value]="false">Inactivos</option>
        </select>
      </div>

      <!-- Filtro bloqueados -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bloqueados
        </label>
        <select
          [(ngModel)]="filtroLocked"
          (change)="onFilterChange()"
          class="input"
        >
          <option value="">Todos</option>
          <option [value]="true">Sí</option>
          <option [value]="false">No</option>
        </select>
      </div>

      <!-- Botones de acción -->
      <div class="flex items-end gap-2">
        <button
          (click)="onSearch()"
          class="btn-primary flex-1"
        >
          Buscar
        </button>
        <button
          (click)="clearFilters()"
          class="btn-outline flex-1"
        >
          Limpiar
        </button>
      </div>
    </div>
  </div>

  <!-- Loading -->
  @if (loading()) {
    <div class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cermont-primary-500"></div>
      <span class="ml-3 text-gray-600 dark:text-gray-400">Cargando usuarios...</span>
    </div>
  }

  <!-- Error -->
  @if (error()) {
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <p class="text-red-800 dark:text-red-200">{{ error() }}</p>
    </div>
  }

  <!-- Tabla de usuarios -->
  @if (!loading() && !error()) {
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                (click)="onSort('name')"
              >
                <div class="flex items-center">
                  Usuario
                  @if (sortBy() === 'name') {
                    <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path [attr.d]="sortOrder() === 'asc' ? 'M5 10l5-5 5 5H5z' : 'M5 10l5 5 5-5H5z'"/>
                    </svg>
                  }
                </div>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                (click)="onSort('role')"
              >
                <div class="flex items-center">
                  Rol
                  @if (sortBy() === 'role') {
                    <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path [attr.d]="sortOrder() === 'asc' ? 'M5 10l5-5 5 5H5z' : 'M5 10l5 5 5-5H5z'"/>
                    </svg>
                  }
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                (click)="onSort('lastLogin')"
              >
                <div class="flex items-center">
                  Último Login
                  @if (sortBy() === 'lastLogin') {
                    <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path [attr.d]="sortOrder() === 'asc' ? 'M5 10l5-5 5 5H5z' : 'M5 10l5 5 5-5H5z'"/>
                    </svg>
                  }
                </div>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                (click)="onSort('createdAt')"
              >
                <div class="flex items-center">
                  Creado
                  @if (sortBy() === 'createdAt') {
                    <svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path [attr.d]="sortOrder() === 'asc' ? 'M5 10l5-5 5 5H5z' : 'M5 10l5 5 5-5H5z'"/>
                    </svg>
                  }
                </div>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            @for (user of users(); track user.id) {
              <tr class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <!-- Usuario -->
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-cermont-primary-100 dark:bg-cermont-primary-900 rounded-full flex items-center justify-center">
                      @if (user.avatar) {
                        <img [src]="user.avatar" [alt]="user.name" class="h-10 w-10 rounded-full">
                      } @else {
                        <span class="text-cermont-primary-600 dark:text-cermont-primary-400 font-bold">
                          {{ user.name.charAt(0).toUpperCase() }}
                        </span>
                      }
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">
                        {{ user.name }}
                        @if (isUserLocked(user)) {
                          <svg class="inline w-4 h-4 ml-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
                          </svg>
                        }
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                    </div>
                  </div>
                </td>

                <!-- Rol -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="badge" [ngClass]="getRoleBadgeColor(user.role)">
                    {{ user.role }}
                  </span>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4 whitespace-nowrap">
                  @if (user.active) {
                    <span class="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Activo
                    </span>
                  } @else {
                    <span class="badge bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                      Inactivo
                    </span>
                  }
                </td>

                <!-- Último login -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(user.lastLogin) }}
                </td>

                <!-- Creado -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(user.createdAt) }}
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <a
                      [routerLink]="['/admin/users', user.id]"
                      class="text-cermont-primary-600 hover:text-cermont-primary-900 dark:text-cermont-primary-400"
                      title="Ver detalles"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </a>
                    <a
                      [routerLink]="['/admin/users', user.id, 'editar']"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      title="Editar"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </a>
                    <button
                      (click)="openPasswordModal(user)"
                      class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400"
                      title="Cambiar contraseña"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                      </svg>
                    </button>
                    <button
                      (click)="toggleUserActive(user)"
                      [class.text-green-600]="!user.active"
                      [class.text-red-600]="user.active"
                      [class.hover:text-green-900]="!user.active"
                      [class.hover:text-red-900]="user.active"
                      [title]="user.active ? 'Desactivar' : 'Activar'"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              [attr.d]="user.active ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400 text-lg mb-2">No se encontraron usuarios</p>
                    <p class="text-gray-400 dark:text-gray-500 text-sm">
                      Intenta ajustar los filtros o crea un nuevo usuario
                    </p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      @if (totalPages() > 1) {
        <div class="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                (click)="onPageChange(currentPage() - 1)"
                [disabled]="currentPage() === 1"
                class="btn-outline"
              >
                Anterior
              </button>
              <button
                (click)="onPageChange(currentPage() + 1)"
                [disabled]="currentPage() === totalPages()"
                class="btn-outline ml-3"
              >
                Siguiente
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando
                  <span class="font-medium">{{ (currentPage() - 1) * pageSize() + 1 }}</span>
                  a
                  <span class="font-medium">{{ Math.min(currentPage() * pageSize(), totalItems()) }}</span>
                  de
                  <span class="font-medium">{{ totalItems() }}</span>
                  resultados
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    (click)="onPageChange(currentPage() - 1)"
                    [disabled]="currentPage() === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>

                  @for (page of [].constructor(Math.min(5, totalPages())); track $index) {
                    <button
                      (click)="onPageChange($index + 1)"
                      [class.bg-cermont-primary-500]="currentPage() === $index + 1"
                      [class.text-white]="currentPage() === $index + 1"
                      [class.border-cermont-primary-500]="currentPage() === $index + 1"
                      class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {{ $index + 1 }}
                    </button>
                  }

                  <button
                    (click)="onPageChange(currentPage() + 1)"
                    [disabled]="currentPage() === totalPages()"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  }

  <!-- Modal: Cambiar Contraseña -->
  @if (showPasswordModal()) {
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" (click)="closePasswordModal()"></div>
        
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Cambiar Contraseña
          </h3>
          
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Usuario: <strong>{{ selectedUser()?.name }}</strong>
          </p>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              class="input"
              placeholder="Mínimo 8 caracteres"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Debe incluir mayúsculas, minúsculas, números y caracteres especiales
            </p>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              (click)="closePasswordModal()"
              class="btn-outline"
            >
              Cancelar
            </button>
            <button
              (click)="resetPassword()"
              [disabled]="!newPassword() || newPassword().length < 8"
              class="btn-primary"
            >
              Actualizar Contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  }
</div>
```


***

Continuando con los componentes de formulario, detalle de usuario, componentes de login/register, guards, interceptores, rutas, y documentación completa...
<span style="display:none">[^12_1][^12_10][^12_11][^12_12][^12_13][^12_14][^12_2][^12_3][^12_4][^12_5][^12_6][^12_7][^12_8][^12_9]</span>

<div align="center">⁂</div>

[^12_1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e7ef7089-a7c3-4b34-b033-fc15be183a25/1.pdf

[^12_2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/a940b6ba-0a42-4561-ae5f-6c58ccb22639/DESARROLLO-DE-UN-APLICATIVO-WEB-PARA-APOYO-EN-LA-EJECUCION-Y-CIERRE-ADMINISTRATIVO-DE-LOS-TRABA.pdf

[^12_3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bec5d009-21af-4a27-8f72-1ff014e21195/3.pdf

[^12_4]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8fdf4499-f510-44f1-b6ba-e127ff7dcdd0/ATG-JUAN-DIEGO-AREVALO-1.pdf

[^12_5]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8bcac50f-ecfc-470c-890b-975f12027c34/FORMATO-DE-PLANEACION-DE-OBRA.pdf

[^12_6]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4687b5dd-a3fa-47af-8e22-4f51fe7b7b70/FOTOS-ANCLAJE-ESCALERA-A-ESTRUCTURA.pdf

[^12_7]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/03485512-1de5-48d0-9f2e-e068a2917d74/Observaciones-Anteproyecto-Juan-Diego.pdf

[^12_8]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/48c31c95-70b6-4087-9109-4d6a3fcc2bdc/2.pdf

[^12_9]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/c1a26b09-8fa4-4750-aa3d-2b68c694ebdf/Formato-Inspeccion-lineas-de-vida-Vertical.pdf

[^12_10]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4595a7f0-a3a7-4bb7-9009-e81ec9d9f6dd/main.pdf

[^12_11]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/42ac0c6f-0320-4af1-bd4e-7343f5523444/Formato-Mantenimiento-CCTV.pdf

[^12_12]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/674d7901-58dc-4520-8558-53a41f841c80/Jerarquia-de-controles_Cermont.pdf

[^12_13]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e441ab0a-b57a-4248-b027-e83f18039c61/INDUCCION-SGSST.pdf

[^12_14]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/6389259e-e945-4e6a-ae61-15783ab9de00/paste.txt


---

# 📋 PLAN DE REFACTORIZACIÓN TASKILL - MÓDULO AUTH/ADMIN (CONTINUACIÓN)


***

## **TASK 4.3: Componente Formulario de Usuario (Crear/Editar)**

**Archivo:** `apps/web/src/app/features/admin/components/user-form/user-form.component.ts`

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adminService = inject(AdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form!: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  isEditMode = signal(false);
  userId: string | null = null;

  readonly UserRole = UserRole;
  readonly rolesOptions = Object.values(UserRole);

  // Validación de contraseña
  passwordStrength = signal<{
    score: number;
    feedback: string[];
    color: string;
  }>({ score: 0, feedback: [], color: 'gray' });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.userId);

    this.initForm();

    if (this.isEditMode() && this.userId) {
      this.loadUser(this.userId);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditMode() ? [] : [Validators.required, Validators.minLength(8)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      role: [UserRole.TECNICO, Validators.required],
      phone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      avatar: [''],
    });

    // Monitorear cambios en la contraseña para validación en tiempo real
    this.form.get('password')?.valueChanges.subscribe(password => {
      if (password) {
        this.validatePasswordStrength(password);
      }
    });
  }

  loadUser(id: string): void {
    this.loading.set(true);
    this.adminService.getUserById(id).subscribe({
      next: (user) => {
        this.form.patchValue({
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone || '',
          avatar: user.avatar || '',
        });
        // En modo edición, el password es opcional
        this.form.get('email')?.disable();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el usuario');
        this.loading.set(false);
      }
    });
  }

  validatePasswordStrength(password: string): void {
    let score = 0;
    const feedback: string[] = [];

    // Longitud
    if (password.length >= 8) score++;
    else feedback.push('Debe tener al menos 8 caracteres');

    // Mayúsculas
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Debe incluir al menos una mayúscula');

    // Minúsculas
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Debe incluir al menos una minúscula');

    // Números
    if (/[0-9]/.test(password)) score++;
    else feedback.push('Debe incluir al menos un número');

    // Caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('Debe incluir al menos un carácter especial');

    // Determinar color según score
    let color = 'gray';
    if (score >= 4) color = 'green';
    else if (score >= 3) color = 'yellow';
    else if (score >= 2) color = 'orange';
    else color = 'red';

    this.passwordStrength.set({ score, feedback, color });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const formValue = this.form.getRawValue(); // getRawValue incluye campos disabled

    if (this.isEditMode() && this.userId) {
      // Actualizar usuario (sin password)
      const { email, password, ...updateDto } = formValue;
      
      this.adminService.updateUser(this.userId, updateDto).subscribe({
        next: (user) => {
          this.router.navigate(['/admin/users', user.id]);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al actualizar usuario');
          this.loading.set(false);
        }
      });
    } else {
      // Crear nuevo usuario
      this.adminService.createUser(formValue).subscribe({
        next: (user) => {
          this.router.navigate(['/admin/users', user.id]);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Error al crear usuario');
          this.loading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    if (this.isEditMode() && this.userId) {
      this.router.navigate(['/admin/users', this.userId]);
    } else {
      this.router.navigate(['/admin/users']);
    }
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'Este campo es requerido';
    if (errors['email']) return 'Email inválido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    if (errors['pattern']) return 'Formato inválido';

    return 'Campo inválido';
  }

  getPasswordStrengthLabel(): string {
    const score = this.passwordStrength().score;
    if (score >= 5) return 'Muy fuerte';
    if (score >= 4) return 'Fuerte';
    if (score >= 3) return 'Media';
    if (score >= 2) return 'Débil';
    return 'Muy débil';
  }
}
```


***

## **TASK 4.4: Template Formulario de Usuario**

**Archivo:** `apps/web/src/app/features/admin/components/user-form/user-form.component.html`

```html
<div class="container mx-auto px-4 py-6 max-w-3xl">
  <!-- Header -->
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
      {{ isEditMode() ? 'Editar Usuario' : 'Nuevo Usuario' }}
    </h1>
    <p class="text-gray-600 dark:text-gray-400 mt-1">
      {{ isEditMode() ? 'Actualiza la información del usuario' : 'Completa el formulario para crear un nuevo usuario' }}
    </p>
  </div>

  <!-- Mensaje de error -->
  @if (error()) {
    <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-red-800 dark:text-red-200">{{ error() }}</p>
      </div>
    </div>
  }

  <!-- Formulario -->
  <form [formGroup]="form" (ngSubmit)="onSubmit()" class="card">
    <div class="space-y-6">
      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email <span class="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          formControlName="email"
          class="input"
          [class.border-red-500]="hasError('email', 'required') || hasError('email', 'email')"
          placeholder="usuario@cermont.com"
        />
        @if (hasError('email', 'required') || hasError('email', 'email')) {
          <p class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ getErrorMessage('email') }}
          </p>
        }
        @if (isEditMode()) {
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            El email no puede ser modificado
          </p>
        }
      </div>

      <!-- Contraseña (solo en creación) -->
      @if (!isEditMode()) {
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contraseña <span class="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            formControlName="password"
            class="input"
            [class.border-red-500]="hasError('password', 'required') || hasError('password', 'minlength')"
            placeholder="Mínimo 8 caracteres"
          />
          @if (hasError('password', 'required') || hasError('password', 'minlength')) {
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">
              {{ getErrorMessage('password') }}
            </p>
          }

          <!-- Indicador de fuerza de contraseña -->
          @if (form.get('password')?.value) {
            <div class="mt-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Fortaleza:
                </span>
                <span 
                  class="text-xs font-bold"
                  [ngClass]="{
                    'text-red-600': passwordStrength().color === 'red',
                    'text-orange-600': passwordStrength().color === 'orange',
                    'text-yellow-600': passwordStrength().color === 'yellow',
                    'text-green-600': passwordStrength().color === 'green'
                  }"
                >
                  {{ getPasswordStrengthLabel() }}
                </span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  [ngClass]="{
                    'bg-red-600': passwordStrength().color === 'red',
                    'bg-orange-600': passwordStrength().color === 'orange',
                    'bg-yellow-600': passwordStrength().color === 'yellow',
                    'bg-green-600': passwordStrength().color === 'green'
                  }"
                  [style.width.%]="(passwordStrength().score / 5) * 100"
                ></div>
              </div>
              @if (passwordStrength().feedback.length > 0) {
                <ul class="mt-2 space-y-1">
                  @for (feedback of passwordStrength().feedback; track $index) {
                    <li class="text-xs text-gray-600 dark:text-gray-400 flex items-center">
                      <svg class="w-3 h-3 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                      </svg>
                      {{ feedback }}
                    </li>
                  }
                </ul>
              }
            </div>
          }
        </div>
      }

      <!-- Nombre -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nombre completo <span class="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          formControlName="name"
          class="input"
          [class.border-red-500]="hasError('name', 'required') || hasError('name', 'minlength') || hasError('name', 'maxlength')"
          placeholder="Juan Pérez"
        />
        @if (hasError('name', 'required') || hasError('name', 'minlength') || hasError('name', 'maxlength')) {
          <p class="mt-1 text-sm text-red-600 dark:text-red-400">
            {{ getErrorMessage('name') }}
          </p>
        }
      </div>

      <!-- Grid de 2 columnas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Rol -->
        <div>
          <label for="role" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rol <span class="text-red-500">*</span>
          </label>
          <select
            id="role"
            formControlName="role"
            class="input"
          >
            <option *ngFor="let role of rolesOptions" [value]="role">
              {{ role }}
            </option>
          </select>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Define los permisos del usuario en el sistema
          </p>
        </div>

        <!-- Teléfono -->
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            formControlName="phone"
            class="input"
            [class.border-red-500]="hasError('phone', 'pattern')"
            placeholder="+573001234567"
          />
          @if (hasError('phone', 'pattern')) {
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">
              Formato inválido. Usa el formato internacional: +573001234567
            </p>
          }
        </div>
      </div>

      <!-- Avatar URL -->
      <div>
        <label for="avatar" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          URL del Avatar
        </label>
        <input
          type="url"
          id="avatar"
          formControlName="avatar"
          class="input"
          placeholder="https://example.com/avatar.jpg"
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          URL de la imagen de perfil del usuario
        </p>
      </div>

      <!-- Descripción de roles -->
      <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">Descripción de Roles</h4>
        <ul class="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li class="flex items-start">
            <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span><strong>Admin:</strong> Acceso completo, gestión de usuarios y configuración del sistema</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span><strong>Supervisor:</strong> Supervisión de órdenes, revisión de trabajo y gestión de equipos</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span><strong>Técnico:</strong> Ejecución de órdenes de trabajo y reportes de campo</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <button
        type="button"
        (click)="onCancel()"
        [disabled]="loading()"
        class="btn-outline"
      >
        Cancelar
      </button>
      <button
        type="submit"
        [disabled]="loading() || form.invalid"
        class="btn-primary"
      >
        @if (loading()) {
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Guardando...
        } @else {
          {{ isEditMode() ? 'Actualizar Usuario' : 'Crear Usuario' }}
        }
      </button>
    </div>
  </form>
</div>
```


***

## **TASK 4.5: Componente de Login**

**Archivo:** `apps/web/src/app/features/auth/components/login/login.component.ts`

```typescript
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  showPassword = signal(false);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        
        // Manejar diferentes tipos de errores
        if (err.status === 401) {
          this.error.set('Credenciales inválidas o usuario inactivo');
        } else if (err.status === 429) {
          this.error.set('Demasiados intentos. Por favor espera unos minutos');
        } else if (err.error?.message) {
          this.error.set(err.error.message);
        } else {
          this.error.set('Error al iniciar sesión. Intenta de nuevo');
        }
        
        this.loading.set(false);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.hasError(error) && control.touched);
  }
}
```


***

## **TASK 4.6: Template de Login**

**Archivo:** `apps/web/src/app/features/auth/components/login/login.component.html`

```html
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-cermont-primary-50 to-cermont-primary-100 dark:from-gray-900 dark:to-gray-800 px-4">
  <div class="max-w-md w-full">
    <!-- Logo y título -->
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-cermont-primary-500 rounded-full mb-4">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Cermont</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Sistema de Gestión de Mantenimiento</p>
    </div>

    <!-- Card de login -->
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Iniciar Sesión</h2>

      <!-- Mensaje de error -->
      @if (error()) {
        <div class="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm text-red-800 dark:text-red-200">{{ error() }}</span>
          </div>
        </div>
      }

      <!-- Formulario -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
            </div>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="input pl-10"
              [class.border-red-500]="hasError('email', 'required') || hasError('email', 'email')"
              placeholder="tu@email.com"
              autocomplete="email"
            />
          </div>
          @if (hasError('email', 'required')) {
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">El email es requerido</p>
          }
          @if (hasError('email', 'email')) {
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">Email inválido</p>
          }
        </div>

        <!-- Contraseña -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contraseña
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <input
              [type]="showPassword() ? 'text' : 'password'"
              id="password"
              formControlName="password"
              class="input pl-10 pr-10"
              [class.border-red-500]="hasError('password', 'required') || hasError('password', 'minlength')"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            <button
              type="button"
              (click)="togglePasswordVisibility()"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              @if (showPassword()) {
                <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              } @else {
                <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              }
            </button>
          </div>
          @if (hasError('password', 'required')) {
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">La contraseña es requerida</p>
          }
          @if (hasError('password', 'minlength')) {
            <p class="mt-1 text-sm text-red-600 dark:text-red-400">La contraseña debe tener al menos 8 caracteres</p>
          }
        </div>

        <!-- Recordarme y Olvidaste contraseña -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              formControlName="rememberMe"
              class="h-4 w-4 text-cermont-primary-600 focus:ring-cermont-primary-500 border-gray-300 rounded"
            />
            <label for="rememberMe" class="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Recordarme
            </label>
          </div>

          <a 
            routerLink="/auth/forgot-password"
            class="text-sm font-medium text-cermont-primary-600 hover:text-cermont-primary-500 dark:text-cermont-primary-400"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <!-- Botón de login -->
        <button
          type="submit"
          [disabled]="loading() || form.invalid"
          class="w-full btn-primary flex items-center justify-center"
        >
          @if (loading()) {
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Iniciando sesión...
          } @else {
            Iniciar Sesión
          }
        </button>
      </form>

      <!-- Divider -->
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white dark:bg-gray-800 text-gray-500">¿No tienes cuenta?</span>
          </div>
        </div>

        <div class="mt-6">
          <a
            routerLink="/auth/register"
            class="w-full flex justify-center py-2 px-4 border-2 border-cermont-primary-500 rounded-lg text-sm font-medium text-cermont-primary-600 dark:text-cermont-primary-400 hover:bg-cermont-primary-50 dark:hover:bg-cermont-primary-900/20 transition-colors"
          >
            Crear cuenta nueva
          </a>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
      © 2025 Cermont. Todos los derechos reservados.
    </p>
  </div>
</div>
```


***

## **TASK 4.7: Guards de Autenticación y Roles**

**Archivo:** `apps/web/src/app/core/guards/auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar URL de destino para redirigir después del login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};
```


***

**Archivo:** `apps/web/src/app/core/guards/role.guard.ts`

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as string[];

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (authService.hasRole(requiredRoles)) {
    return true;
  }

  // Usuario autenticado pero sin permisos
  router.navigate(['/unauthorized']);
  return false;
};
```


***

## **TASK 4.8: HTTP Interceptor para JWT**

**Archivo:** `apps/web/src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Obtener token
  const token = authService.getToken();

  // Clonar request y agregar token si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar respuesta y errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o inválido - intentar refresh
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry original request con nuevo token
            const newToken = authService.getToken();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh falló - logout y redirigir a login
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
```


***

## **TASK 4.9: Configurar Interceptor en App Config**

**Archivo:** `apps/web/src/app/app.config.ts`

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```


***

## **TASK 4.10: Rutas Completas del Módulo Admin**

**Archivo:** `apps/web/src/app/features/admin/admin.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/users-list/users-list.component')
              .then(m => m.UsersListComponent)
          },
          {
            path: 'nuevo',
            loadComponent: () => import('./components/user-form/user-form.component')
              .then(m => m.UserFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./components/user-detail/user-detail.component')
              .then(m => m.UserDetailComponent)
          },
          {
            path: ':id/editar',
            loadComponent: () => import('./components/user-form/user-form.component')
              .then(m => m.UserFormComponent)
          }
        ]
      },
      {
        path: 'roles',
        loadComponent: () => import('./components/roles-permissions/roles-permissions.component')
          .then(m => m.RolesPermissionsComponent),
        data: { roles: ['admin'] }
      },
      {
        path: 'audit-logs',
        loadComponent: () => import('./components/audit-logs/audit-logs.component')
          .then(m => m.AuditLogsComponent),
        data: { roles: ['admin'] }
      },
      {
        path: 'stats',
        loadComponent: () => import('./components/user-stats/user-stats.component')
          .then(m => m.UserStatsComponent),
        data: { roles: ['admin', 'supervisor'] }
      }
    ]
  }
];
```


***

**Archivo:** `apps/web/src/app/features/auth/auth.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];
```


***

## **TASK 4.11: Integrar en App Routes Principal**

**Archivo:** `apps/web/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas de autenticación
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Rutas protegidas con autenticación
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  },
  
  // Módulo de Administración (COMPLETO)
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  
  // Módulo de Ordenes
  {
    path: 'ordenes',
    canActivate: [authGuard],
    loadChildren: () => import('./features/ordenes/ordenes.routes').then(m => m.ORDENES_ROUTES)
  },
  
  // Página no autorizado
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component')
      .then(m => m.UnauthorizedComponent)
  },
  
  // Redirect default
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
```


***

# **FASE 5: DOCUMENTACIÓN Y TESTING**

## **TASK 5.1: README del Módulo Auth/Admin**

**Archivo:** `apps/api/src/modules/auth/README.md`

```markdown
# 🔐 Módulo de Autenticación y Administración

## Descripción

Módulo completo de autenticación JWT con refresh tokens, gestión de usuarios, roles y permisos (RBAC), auditoría de seguridad y protección contra ataques.

## Características

### Autenticación
- ✅ Login con email/contraseña
- ✅ Registro de usuarios
- ✅ JWT access tokens (configurable, 15min por defecto)
- ✅ Refresh tokens con rotación automática
- ✅ Detección de reutilización de tokens (token theft detection)
- ✅ Rate limiting específico para login (5 intentos/minuto)
- ✅ Bloqueo automático por intentos fallidos (5 intentos = 30 min bloqueado)
- ✅ Validación de fuerza de contraseña (OWASP)
- ✅ Hash bcrypt con 12 rounds
- ✅ Auditoría completa de accesos

### Administración de Usuarios
- ✅ CRUD completo de usuarios
- ✅ Paginación y filtros avanzados
- ✅ Búsqueda por nombre/email
- ✅ Activar/desactivar usuarios
- ✅ Cambio de roles
- ✅ Reseteo de contraseña por admin
- ✅ Revocación de tokens
- ✅ Estadísticas de usuarios
- ✅ Logs de auditoría

### Seguridad
- ✅ Protección contra brute force
- ✅ Detección de robo de tokens
- ✅ Rate limiting
- ✅ Validación de datos con class-validator
- ✅ Headers de seguridad (Helmet)
- ✅ CORS configurado
- ✅ Auditoría de todas las acciones

## Endpoints

### Autenticación (`/auth`)

#### POST /auth/login
Login con credenciales.

**Request:**
```

{
"email": "admin@cermont.com",
"password": "Admin@2025!"
}

```

**Response:**
```

{
"token": "eyJhbGciOiJIUzI1NiIs...",
"refreshToken": "550e8400-e29b-41d4-a716...",
"user": {
"id": "uuid",
"email": "admin@cermont.com",
"name": "Admin User",
"role": "admin",
"active": true
}
}

```

#### POST /auth/register
Registro de nuevo usuario.

#### POST /auth/refresh
Renovar access token usando refresh token.

#### POST /auth/logout
Cerrar sesión y revocar tokens.

### Administración (`/admin/users`)

#### GET /admin/users
Listar usuarios con filtros y paginación.

**Query Params:**
- `role`: admin | supervisor | tecnico
- `active`: true | false
- `search`: string
- `page`: number
- `limit`: number
- `sortBy`: name | email | role | createdAt | lastLogin
- `sortOrder`: asc | desc
- `locked`: true | false

#### POST /admin/users
Crear nuevo usuario (solo admin).

#### GET /admin/users/:id
Obtener usuario por ID.

#### PATCH /admin/users/:id
Actualizar información de usuario.

#### PATCH /admin/users/:id/role
Cambiar rol de usuario.

#### PATCH /admin/users/:id/activate
Activar usuario.

#### PATCH /admin/users/:id/deactivate
Desactivar usuario.

#### POST /admin/users/:id/reset-password
Resetear contraseña de usuario.

#### POST /admin/users/:id/revoke-tokens
Revocar todos los tokens activos.

#### GET /admin/users/stats/overview
Estadísticas de usuarios.

#### GET /admin/users/stats/activity
Actividad reciente.

#### GET /admin/users/audit-logs
Logs de auditoría.

## Roles y Permisos

### Admin
- ✅ Acceso completo al sistema
- ✅ Gestión de usuarios
- ✅ Configuración del sistema
- ✅ Acceso a logs de auditoría

### Supervisor
- ✅ Supervisión de órdenes
- ✅ Revisión de trabajo
- ✅ Gestión de equipos
- ⛔ No puede gestionar usuarios

### Técnico
- ✅ Ejecución de órdenes
- ✅ Reportes de campo
- ⛔ No puede supervisar
- ⛔ No puede gestionar usuarios

## Seguridad

### Validación de Contraseña
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial

### Rate Limiting
- Login: 5 intentos por minuto por IP
- Bloqueo: 30 minutos después de 5 intentos fallidos
- Reset automático en login exitoso

### Tokens
- Access token: 15 minutos (configurable)
- Refresh token: 7 días
- Rotación automática de refresh tokens
- Detección de reutilización

## Variables de Entorno

```


# JWT

JWT_SECRET=tu-super-secreto-seguro-aqui
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Bcrypt

BCRYPT_ROUNDS=12

# Rate Limiting

THROTTLE_TTL=60000
THROTTLE_LIMIT=5

```

## Testing

```


# Unit tests

npm run test

# E2E tests

npm run test:e2e

# Coverage

npm run test:cov

```

## Ejemplos de Uso

### Login
```

const response = await fetch('http://localhost:3000/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
email: 'admin@cermont.com',
password: 'Admin@2025!'
})
});

const { token, refreshToken, user } = await response.json();

```

### Crear Usuario
```

const response = await fetch('http://localhost:3000/admin/users', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${accessToken}`
},
body: JSON.stringify({
email: 'tecnico@cermont.com',
password: 'Tecnico@2025!',
name: 'Juan Técnico',
role: 'tecnico',
phone: '+573001234567'
})
});

```

## Auditoría

Todas las acciones críticas se registran en la tabla `audit_logs`:

- LOGIN / LOGOUT
- USER_CREATED / USER_UPDATED / USER_DELETED
- ROLE_UPDATED
- PASSWORD_RESET_BY_ADMIN
- ACCOUNT_LOCKED / ACCOUNT_UNLOCKED
- TOKENS_REVOKED

## Mejoras Futuras

- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth 2.0 (Google, Microsoft)
- [ ] Recuperación de contraseña por email
- [ ] Historial de contraseñas
- [ ] Políticas de expiración de contraseñas
- [ ] SSO (Single Sign-On)
```


***

¿Continúo con la creación de tests unitarios, tests E2E, componente de detalle de usuario, componente de roles/permisos, y componente de logs de auditoría? 🚀
<span style="display:none">[^13_1][^13_10][^13_11][^13_12][^13_13][^13_14][^13_2][^13_3][^13_4][^13_5][^13_6][^13_7][^13_8][^13_9]</span>

<div align="center">⁂</div>

[^13_1]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e7ef7089-a7c3-4b34-b033-fc15be183a25/1.pdf

[^13_2]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/a940b6ba-0a42-4561-ae5f-6c58ccb22639/DESARROLLO-DE-UN-APLICATIVO-WEB-PARA-APOYO-EN-LA-EJECUCION-Y-CIERRE-ADMINISTRATIVO-DE-LOS-TRABA.pdf

[^13_3]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/bec5d009-21af-4a27-8f72-1ff014e21195/3.pdf

[^13_4]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8fdf4499-f510-44f1-b6ba-e127ff7dcdd0/ATG-JUAN-DIEGO-AREVALO-1.pdf

[^13_5]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/8bcac50f-ecfc-470c-890b-975f12027c34/FORMATO-DE-PLANEACION-DE-OBRA.pdf

[^13_6]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4687b5dd-a3fa-47af-8e22-4f51fe7b7b70/FOTOS-ANCLAJE-ESCALERA-A-ESTRUCTURA.pdf

[^13_7]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/03485512-1de5-48d0-9f2e-e068a2917d74/Observaciones-Anteproyecto-Juan-Diego.pdf

[^13_8]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/48c31c95-70b6-4087-9109-4d6a3fcc2bdc/2.pdf

[^13_9]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/c1a26b09-8fa4-4750-aa3d-2b68c694ebdf/Formato-Inspeccion-lineas-de-vida-Vertical.pdf

[^13_10]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/4595a7f0-a3a7-4bb7-9009-e81ec9d9f6dd/main.pdf

[^13_11]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/42ac0c6f-0320-4af1-bd4e-7343f5523444/Formato-Mantenimiento-CCTV.pdf

[^13_12]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/674d7901-58dc-4520-8558-53a41f841c80/Jerarquia-de-controles_Cermont.pdf

[^13_13]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/e441ab0a-b57a-4248-b027-e83f18039c61/INDUCCION-SGSST.pdf

[^13_14]: https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/133384987/6389259e-e945-4e6a-ae61-15783ab9de00/paste.txt

