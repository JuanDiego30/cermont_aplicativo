# GUÍA DE EJECUCIÓN LÍNEA POR LÍNEA - CORRECCIONES CERMONT

## 📝 CHECKLIST DETALLADO DE IMPLEMENTACIÓN

### FASE 1: BACKEND - ESTRUCTURA BASE

#### ✅ PASO 1.1: Crear Estructura de DTOs

**Ruta:** `apps/api/src/modules/orders/dtos/`

Crear archivo `create-order.dto.ts` (YA PROPORCIONADO EN DOCUMENTO ANTERIOR)

Crear archivo `update-order.dto.ts`:

```typescript
// apps/api/src/modules/orders/dtos/update-order.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
```

Crear archivo `order-response.dto.ts`:

```typescript
// apps/api/src/modules/orders/dtos/order-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  status: OrderStatus;

  @ApiProperty()
  serviceType: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ required: false })
  assignedTo?: string;

  @ApiProperty({ required: false })
  estimatedHours?: number;

  @ApiProperty({ required: false })
  actualHours?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
```

---

#### ✅ PASO 1.2: Crear Validaciones Personalizadas

**Ruta:** `apps/api/src/common/validators/`

```typescript
// apps/api/src/common/validators/is-valid-uuid.validator.ts

import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { v4 as isUuid } from 'uuid';

@ValidatorConstraint({ name: 'isValidUUID', async: false })
export class IsValidUUIDConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (!value) return false;
    try {
      isUuid(value);
      return isUuid(value) === value;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} debe ser un UUID válido`;
  }
}

export function IsValidUUID(validationOptions?: ValidationOptions) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUUIDConstraint,
    });
  };
}
```

---

#### ✅ PASO 1.3: Crear Exception Filters Global

**Ruta:** `apps/api/src/common/filters/`

```typescript
// apps/api/src/common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message
        : exceptionResponse;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: message || 'Error interno del servidor',
      error:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Internal Server Error'
          : (exceptionResponse as any).error || 'Error',
    };

    this.logger.error(
      `[${request.method}] ${request.url}`,
      JSON.stringify(errorResponse)
    );

    response.status(status).json(errorResponse);
  }
}

// apps/api/src/common/filters/all-exceptions.filter.ts

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';

    this.logger.error(
      `[${request.method}] ${request.url}`,
      exception instanceof Error ? exception.stack : String(exception)
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Error interno del servidor',
      error: 'Internal Server Error',
    });
  }
}
```

**Agregar en `app.module.ts` línea ~5 (imports):**

```typescript
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  // ... resto del módulo
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
```

---

#### ✅ PASO 1.4: Crear Servicio de Órdenes Completo

**Ruta:** `apps/api/src/modules/orders/orders.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dtos/create-order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear nueva orden
   */
  async create(createOrderDto: CreateOrderDto, userId: string) {
    try {
      // Verificar que el cliente existe
      const client = await this.prisma.client.findUnique({
        where: { id: createOrderDto.clientId },
      });

      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      // Generar número único de orden
      const orderNumber = this.generateOrderNumber();

      const order = await this.prisma.order.create({
        data: {
          orderNumber,
          ...createOrderDto,
          createdById: userId,
          status: 'DRAFT',
        },
        include: {
          client: true,
          createdBy: true,
          assignedTo: true,
        },
      });

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al crear orden: ${error.message}`
      );
    }
  }

  /**
   * Obtener todas las órdenes con paginación
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string
  ) {
    try {
      const skip = (page - 1) * limit;

      const where: Prisma.OrderWhereInput = {};
      if (status) {
        where.status = status.toUpperCase();
      }

      const [data, total] = await Promise.all([
        this.prisma.order.findMany({
          where,
          skip,
          take: limit,
          include: {
            client: true,
            createdBy: true,
            assignedTo: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.order.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener órdenes: ${error.message}`
      );
    }
  }

  /**
   * Obtener una orden por ID
   */
  async findOne(id: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          client: true,
          createdBy: true,
          assignedTo: true,
          evidence: true,
          materials: true,
          workPlans: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Orden con ID ${id} no encontrada`);
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al obtener orden: ${error.message}`
      );
    }
  }

  /**
   * Actualizar una orden
   */
  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      // Verificar que la orden existe
      await this.findOne(id);

      const updatedOrder = await this.prisma.order.update({
        where: { id },
        data: updateOrderDto,
        include: {
          client: true,
          createdBy: true,
          assignedTo: true,
        },
      });

      return updatedOrder;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar orden: ${error.message}`
      );
    }
  }

  /**
   * Eliminar (cancelar) una orden
   */
  async delete(id: string) {
    try {
      const order = await this.findOne(id);

      if (order.status === 'CLOSED' || order.status === 'CANCELLED') {
        throw new BadRequestException(
          'No se puede cancelar una orden ya cerrada o cancelada'
        );
      }

      await this.prisma.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          closedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al eliminar orden: ${error.message}`
      );
    }
  }

  /**
   * Generar número único de orden
   * Formato: OT-YYYYMMDD-XXXX (ej: OT-20251226-0001)
   */
  private generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return `OT-${year}${month}${day}-${random}`;
  }

  /**
   * Obtener estadísticas de órdenes
   */
  async getStats() {
    try {
      const [
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
      ] = await Promise.all([
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'PENDING' } }),
        this.prisma.order.count({ where: { status: 'INPROGRESS' } }),
        this.prisma.order.count({ where: { status: 'COMPLETED' } }),
        this.prisma.order.count({ where: { status: 'CANCELLED' } }),
      ]);

      return {
        totalOrders,
        pendingOrders,
        inProgressOrders,
        completedOrders,
        cancelledOrders,
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener estadísticas: ${error.message}`
      );
    }
  }
}
```

---

### FASE 2: FRONTEND - SERVICIOS Y INTERCEPTORES

#### ✅ PASO 2.1: Crear Guard de Autenticación

**Ruta:** `apps/web/src/app/core/guards/auth.guard.ts`

```typescript
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Redirigir a login si no está autenticado
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });

    return false;
  }
}
```

---

#### ✅ PASO 2.2: Crear Hook para Sincronización Offline

**Ruta:** `apps/web/src/app/core/services/sync.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap } from 'rxjs/operators';

interface SyncQueueItem {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isSyncing = false;
  private syncStatus$ = new BehaviorSubject<'idle' | 'syncing' | 'synced'>('idle');

  constructor() {
    this.loadQueueFromStorage();
    this.setupPeriodicSync();
  }

  /**
   * Agregar operación a la cola de sincronización
   */
  addToQueue(
    method: 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data: any
  ): void {
    const item: SyncQueueItem = {
      id: `${Date.now()}-${Math.random()}`,
      method,
      endpoint,
      data,
      timestamp: Date.now(),
    };

    this.syncQueue.push(item);
    this.saveQueueToStorage();
  }

  /**
   * Obtener estado de sincronización
   */
  getSyncStatus$(): Observable<string> {
    return this.syncStatus$.asObservable();
  }

  /**
   * Guardar cola en localStorage
   */
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error guardando cola de sincronización:', error);
    }
  }

  /**
   * Cargar cola desde localStorage
   */
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem('sync_queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error cargando cola de sincronización:', error);
    }
  }

  /**
   * Configurar sincronización periódica
   */
  private setupPeriodicSync(): void {
    interval(30000).subscribe(() => {
      // Intentar sincronizar cada 30 segundos
      if (navigator.onLine && !this.isSyncing) {
        this.sync();
      }
    });
  }

  /**
   * Sincronizar cola con servidor
   */
  private async sync(): Promise<void> {
    if (this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.syncStatus$.next('syncing');

    // Implementar lógica de sincronización real aquí
    // Por ahora, solo simulamos
    try {
      // Aquí iría la lógica real de sincronización
      await new Promise((resolve) => setTimeout(resolve, 1000));

      this.syncQueue = [];
      this.saveQueueToStorage();
      this.syncStatus$.next('synced');
    } catch (error) {
      console.error('Error durante sincronización:', error);
      this.syncStatus$.next('idle');
    } finally {
      this.isSyncing = false;
    }
  }
}
```

---

#### ✅ PASO 2.3: Crear Componente de Login

**Ruta:** `apps/web/src/app/pages/login/login.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <!-- Logo y título -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-900 mb-2">CERMONT</h1>
          <p class="text-gray-600">Sistema de Gestión de Órdenes</p>
        </div>

        <!-- Formulario -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="tu@correo.com"
            />
            <div
              *ngIf="email.invalid && email.touched"
              class="text-red-500 text-sm mt-1"
            >
              Email inválido
            </div>
          </div>

          <!-- Password -->
          <div class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              formControlName="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <div
              *ngIf="password.invalid && password.touched"
              class="text-red-500 text-sm mt-1"
            >
              La contraseña es requerida
            </div>
          </div>

          <!-- Botón Login -->
          <button
            type="submit"
            [disabled]="!loginForm.valid || isLoading"
            class="w-full bg-primary-500 text-white py-2 rounded-lg font-semibold hover:bg-primary-600 transition disabled:opacity-50"
          >
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>

          <!-- Mensaje de error -->
          <div
            *ngIf="errorMessage"
            class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm"
          >
            {{ errorMessage }}
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al iniciar sesión';
        this.isLoading = false;
      },
    });
  }
}
```

---

### FASE 3: CONFIGURACIÓN Y RUTAS

#### ✅ PASO 3.1: Configurar Rutas principales

**Ruta:** `apps/web/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrdersListComponent } from './components/orders/orders-list.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'orders',
    component: OrdersListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
```

---

#### ✅ PASO 3.2: Crear App Component Principal

**Ruta:** `apps/web/src/app/app.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { SyncService } from './core/services/sync.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <!-- Navbar si está autenticado -->
    <nav
      *ngIf="(currentUser$ | async) as user"
      class="bg-primary-900 text-white shadow"
    >
      <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div class="text-xl font-bold">CERMONT</div>
        <div class="flex items-center gap-6">
          <a routerLink="/dashboard" class="hover:text-primary-200">
            Dashboard
          </a>
          <a routerLink="/orders" class="hover:text-primary-200">
            Órdenes
          </a>
          <!-- Indicador de sincronización -->
          <div
            [ngClass]="getSyncStatusClass()"
            class="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
          >
            <span>{{ syncStatus$ | async }}</span>
          </div>
          <button
            (click)="logout()"
            class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main class="min-h-screen bg-gray-50">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  syncStatus$ = this.syncService.getSyncStatus$();

  constructor(
    private authService: AuthService,
    private syncService: SyncService
  ) {}

  ngOnInit(): void {
    // Inicializar aplicación
  }

  logout(): void {
    this.authService.logout();
  }

  getSyncStatusClass(): string {
    return 'bg-green-500 text-white'; // Ajustar según estado real
  }
}
```

---

### FASE 4: TESTING Y VALIDACIÓN

#### ✅ PASO 4.1: Crear Tests Unitarios para OrdersService

**Ruta:** `apps/api/src/modules/orders/orders.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    client: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una orden exitosamente', async () => {
      const createOrderDto = {
        clientId: 'client-uuid',
        serviceType: 'maintenance',
        description: 'Mantenimiento preventivo',
      };

      const mockClient = { id: 'client-uuid', name: 'Cliente Test' };
      const mockOrder = {
        id: 'order-uuid',
        orderNumber: 'OT-20251226-0001',
        ...createOrderDto,
        status: 'DRAFT',
      };

      mockPrismaService.client.findUnique.mockResolvedValue(mockClient);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(createOrderDto as any, 'user-uuid');

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.order.create).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si cliente no existe', async () => {
      const createOrderDto = {
        clientId: 'invalid-uuid',
        serviceType: 'maintenance',
        description: 'Test',
      };

      mockPrismaService.client.findUnique.mockResolvedValue(null);

      try {
        await service.create(createOrderDto as any, 'user-uuid');
        fail('Debería haber lanzado NotFoundException');
      } catch (error) {
        expect(error.message).toContain('Cliente no encontrado');
      }
    });
  });

  describe('findAll', () => {
    it('debe retornar lista paginada de órdenes', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: 'OT-20251226-0001',
          status: 'DRAFT',
        },
        {
          id: 'order-2',
          orderNumber: 'OT-20251226-0002',
          status: 'PENDING',
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.order.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockOrders);
      expect(result.total).toBe(2);
      expect(result.pages).toBe(1);
    });
  });
});
```

---

## 📋 CHECKLIST DE VALIDACIÓN

### Backend

- [ ] DTOs creados y validados
- [ ] Guards JWT implementados
- [ ] Exception filters configurados
- [ ] Service de órdenes completo
- [ ] Swagger documentación generada
- [ ] Tests unitarios pasando
- [ ] CORS configurado correctamente
- [ ] Validación global activada
- [ ] Migraciones Prisma ejecutadas
- [ ] Base de datos con datos seed

### Frontend

- [ ] AuthService implementado
- [ ] AuthInterceptor funcionando
- [ ] AuthGuard protegiendo rutas
- [ ] OrdersService consumiendo API
- [ ] Componente Login funcional
- [ ] Componente Orders List con datos reales
- [ ] Tailwind configurado con paleta
- [ ] HttpClientModule importado
- [ ] Rutas configuradas
- [ ] SyncService para offline

### Integración

- [ ] Frontend consume correctamente endpoints backend
- [ ] Login funciona end-to-end
- [ ] Refresh token automático
- [ ] Errores 401 manejados correctamente
- [ ] CORS funcionando en todas las peticiones
- [ ] Timestamps sincronizados
- [ ] Paginación trabajando
- [ ] Filtros aplicándose correctamente

---

## 🚀 COMANDOS DE EJECUCIÓN

```bash
# Backend - Crear y ejecutar migraciones
cd apps/api
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev

# Frontend - Instalar y ejecutar
cd apps/web
pnpm install
pnpm dev

# Ejecutar tests
pnpm test

# Build para producción
pnpm build
```

---

**Documento completo de ejecución línea por línea**
**Versión 1.0 - Diciembre 2025**
