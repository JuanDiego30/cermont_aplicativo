# Common Layer - Clean Architecture

Capa común con utilidades, tipos y componentes reutilizables siguiendo Clean Architecture.

## 📁 Estructura

```
common/
├── types/          # Tipos TypeScript estrictos (sin 'any')
│   ├── api-response.types.ts    # Tipos para respuestas API
│   ├── exception.types.ts       # Tipos para excepciones
│   └── index.ts
├── dto/            # Data Transfer Objects
│   ├── api-response.dto.ts      # DTOs de respuesta
│   └── pagination.dto.ts        # DTOs de paginación
├── filters/        # Exception filters
│   ├── http-exception.filter.ts # Filtro HTTP general
│   └── prisma-exception.filter.ts # Filtros Prisma
├── guards/         # Authorization guards
│   ├── jwt-auth.guard.ts        # Autenticación JWT
│   └── roles.guard.ts           # Autorización por roles
├── decorators/     # Custom decorators
│   ├── current-user.decorator.ts # Extrae usuario del JWT
│   ├── public.decorator.ts       # Marca rutas públicas
│   ├── roles.decorator.ts        # Define roles requeridos
│   └── api-response.decorator.ts # Documentación Swagger
├── interceptors/   # Request/Response interceptors
│   ├── logging.interceptor.ts    # Logging de requests
│   └── transform.interceptor.ts  # Transforma respuestas
├── pipes/          # Validation pipes
│   ├── zod-validation.pipe.ts    # Validación con Zod
│   └── parse-int.pipe.ts         # Parseo de parámetros
├── utils/          # Utilidades
│   └── pagination.util.ts        # Helpers de paginación
├── errors/         # Errores personalizados
│   ├── domain-error.base.ts      # Errores de dominio
│   ├── application-error.base.ts # Errores de aplicación
│   └── prisma-error.mapper.ts    # Mapper de errores Prisma
├── interfaces/     # Contratos
│   ├── use-case.interface.ts     # Interface UseCase
│   └── repository.interface.ts   # Interface Repository
└── index.ts        # Barrel export
```

## 🎯 Uso

### Respuestas API Estandarizadas

```typescript
import { ApiResponses, ApiSuccessResponseDto, PaginatedResponseDto } from '@/common';

// Respuesta simple
@Get(':id')
async findOne(@Param('id') id: string) {
  const data = await this.service.findOne(id);
  return ApiResponses.success(data);
}

// Respuesta de creación
@Post()
async create(@Body() dto: CreateDto) {
  const created = await this.service.create(dto);
  return ApiResponses.created(created);
}

// Respuesta paginada
@Get()
async findAll(@Query() pagination: PaginationQueryDto) {
  const { data, total } = await this.service.findAll(pagination);
  return ApiResponses.paginated(data, total, pagination.page!, pagination.limit!);
}
```

### Paginación

```typescript
import { PaginationQueryDto, PaginationUtil } from '@/common';

@Get()
async findAll(@Query() query: PaginationQueryDto) {
  // Opción 1: Usar PaginationUtil
  const result = await PaginationUtil.paginate({
    model: this.prisma.usuario,
    query,
    where: { activo: true },
    orderBy: { createdAt: 'desc' },
  });
  
  return result;
}

// Opción 2: Manual
@Get()
async findAll(@Query() query: PaginationQueryDto) {
  const [data, total] = await Promise.all([
    this.prisma.usuario.findMany({
      skip: query.skip,
      take: query.take,
    }),
    this.prisma.usuario.count(),
  ]);
  
  return PaginatedResponseDto.create(data, total, query.page!, query.limit!);
}
```

### Errores Personalizados

```typescript
import { 
  NotFoundError, 
  ConflictError,
  EntityNotFoundError,
  BusinessRuleViolationError 
} from '@/common';

// Errores de aplicación (incluyen HTTP status)
throw new NotFoundError('Usuario', userId);
throw new ConflictError('El email ya está registrado', 'email');

// Errores de dominio (lógica de negocio pura)
throw new EntityNotFoundError('Orden', orderId);
throw new BusinessRuleViolationError('No se puede cancelar una orden completada');
```

### Validación con Zod

```typescript
import { z } from 'zod';
import { ZodValidationPipe } from '@/common';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().positive().optional(),
});

type CreateUserDto = z.infer<typeof createUserSchema>;

@Post()
create(@Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto) {
  return this.service.create(dto);
}
```

### Documentación Swagger

```typescript
import { ApiSuccessResponse, ApiPaginatedResponse, ApiErrorResponses } from '@/common';

@Get(':id')
@ApiSuccessResponse(UserDto, { description: 'Usuario encontrado' })
@ApiErrorResponses()
findOne(@Param('id') id: string) {
  // ...
}

@Get()
@ApiPaginatedResponse(UserDto, { description: 'Lista de usuarios' })
findAll() {
  // ...
}
```

### Guards y Decorators

```typescript
import { JwtAuthGuard, RolesGuard, Roles, CurrentUser, Public } from '@/common';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  
  @Get('me')
  getProfile(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Get()
  @Roles('admin', 'supervisor')
  findAll() {
    // Solo admin y supervisor
  }

  @Get('public')
  @Public()
  publicEndpoint() {
    // Sin autenticación requerida
  }
}
```

## ✅ Type Safety

Todo el código es 100% type-safe:
- ❌ Sin uso de `any`
- ✅ Type guards implementados
- ✅ Interfaces estrictas
- ✅ Generics con constraints

## 🔄 Migración desde versión anterior

Si usabas las clases anteriores:

```typescript
// Antes
import { ApiSuccessResponse, PaginatedResponseMeta } from './common/dto/api-response.dto';

// Después (alias disponibles para compatibilidad)
import { ApiSuccessResponse, PaginatedResponseMeta } from '@/common';

// O usar las nuevas clases directamente
import { ApiSuccessResponseDto, PaginationMetaDto } from '@/common';
```

## 📦 Imports recomendados

```typescript
// Importar todo de una vez
import {
  ApiResponses,
  PaginationQueryDto,
  HttpExceptionFilter,
  JwtAuthGuard,
  RolesGuard,
  CurrentUser,
  NotFoundError,
} from '@/common';

// O importar módulos específicos
import { PaginationUtil } from '@/common/utils/pagination.util';
import { PrismaErrorMapper } from '@/common/errors/prisma-error.mapper';
```

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test common

# Coverage
pnpm test:cov common
```
