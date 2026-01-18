# Cermont Backend - Architecture & Stack Documentation

## Stack Oficial

### Core Framework

- **NestJS 11.x**: Framework principal con arquitectura modular
- **TypeScript 5.x**: Tipado estricto habilitado
- **Prisma 6.x**: ORM con PostgreSQL

### Validación

- **class-validator**: Validación de DTOs con decoradores
- **class-transformer**: Transformación de datos
- **ValidationPipe global**: Configurado en `main.ts` con:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`
  - `enableImplicitConversion: true`

### Autenticación & Autorización

- **passport + passport-jwt**: Estrategia JWT
- **@nestjs/jwt**: Generación y verificación de tokens
- **Guards globales** (registrados en `app.module.ts`):
  - `JwtAuthGuard`: Protege todas las rutas por defecto
  - `RolesGuard`: Verifica roles con `@Roles()` decorator
  - `CustomThrottleGuard`: Rate limiting
- **Decoradores**:
  - `@Public()`: Marca rutas como públicas (no requieren auth)
  - `@Roles('admin', 'tecnico')`: Define roles requeridos
  - `@CurrentUser()`: Obtiene el usuario autenticado

### HTTP Client

- **@nestjs/axios (HttpService)**: Cliente HTTP estándar
- **NO usar axios directamente**: Usar `HttpService` inyectado

### Logging

- **LoggerService** (`@/lib/logging/logger.service`): Logger unificado
- Soporta: log, error, warn, debug, verbose, audit, performance, http
- Configurado con archivos de log y rotación
- **pino/pino-http**: Solo en desarrollo para logs legibles

### Documentación API

- **@nestjs/swagger**: Documentación automática OpenAPI
- Disponible en `/api/docs`

### Otras Dependencias Core

- **date-fns**: Manipulación de fechas
- **bcryptjs**: Hash de contraseñas
- **nodemailer**: Envío de emails
- **pdfkit/puppeteer**: Generación de PDFs
- **sharp**: Procesamiento de imágenes
- **xlsx**: Exportación Excel

## Estructura de Módulos

```
src/
├── app.module.ts          # Módulo raíz
├── main.ts                # Bootstrap
├── common/                # Utilidades compartidas
│   ├── decorators/        # @Public, @Roles, @CurrentUser
│   ├── filters/           # Exception filters
│   ├── guards/            # Guards personalizados
│   ├── interceptors/      # Logging, transform
│   ├── middleware/        # Request ID, security
│   └── pipes/             # ParseUUID, ParseInt
├── lib/                   # Librerías internas
│   ├── logging/           # LoggerService
│   └── shared/            # Filtros y utilidades
├── modules/               # Módulos de negocio
│   ├── auth/              # Autenticación
│   ├── ordenes/           # Órdenes de trabajo
│   ├── ejecucion/         # Ejecución de trabajos
│   ├── evidencias/        # Gestión de evidencias
│   └── ...
└── prisma/                # Configuración Prisma
```

## Patrones de Código

### DTOs con class-validator

```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrdenDto {
  @ApiProperty({ description: 'Descripción de la orden' })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  clienteId?: string;
}
```

### Controllers

```typescript
@Controller('ordenes')
@ApiTags('ordenes')
@ApiBearerAuth()
export class OrdenesController {
  constructor(private readonly service: OrdenesService) {}

  @Post()
  @Roles('admin', 'tecnico')
  async create(@Body() dto: CreateOrdenDto, @CurrentUser() user: JwtPayload) {
    return this.service.create(dto, user.sub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get('public/info')
  @Public() // Ruta pública
  async getPublicInfo() {
    return { status: 'ok' };
  }
}
```

### Services con DI

```typescript
@Injectable()
export class OrdenesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService
  ) {
    this.logger = new LoggerService(OrdenesService.name);
  }

  async findOne(id: string): Promise<Orden> {
    const orden = await this.prisma.order.findUnique({ where: { id } });
    if (!orden) {
      throw new NotFoundException(`Orden ${id} no encontrada`);
    }
    return orden;
  }
}
```

## Variables de Entorno

Validadas en `config/env.validation.ts` con class-validator:

| Variable         | Requerida | Descripción                         |
| ---------------- | --------- | ----------------------------------- |
| `NODE_ENV`       | No        | development/production/test         |
| `PORT`           | No        | Puerto del servidor (default: 4000) |
| `DATABASE_URL`   | Sí        | URL de conexión PostgreSQL          |
| `JWT_SECRET`     | Sí        | Secret para JWT (min 32 caracteres) |
| `JWT_EXPIRES_IN` | No        | Expiración token (default: 15m)     |
| `FRONTEND_URL`   | No        | URL frontend para CORS              |

## Comandos

```bash
# Desarrollo
pnpm dev

# Build
pnpm build

# Tests
pnpm test

# Prisma
pnpm prisma:generate
pnpm prisma:migrate

# Lint
pnpm lint
```

## Dependencias NO Usadas (Eliminadas)

- **zod**: Migrado a class-validator
- **axios directo**: Usar @nestjs/axios HttpService

## Notas de Mantenimiento

1. **Nuevos DTOs**: Siempre usar class-validator + @nestjs/swagger
2. **Nuevas rutas protegidas**: Por defecto requieren auth (JwtAuthGuard global)
3. **Rutas públicas**: Marcar explícitamente con `@Public()`
4. **HTTP requests externos**: Usar HttpService de @nestjs/axios
5. **Logs**: Usar LoggerService, no console.log
6. **Tests**: Mantener cobertura de tests unitarios por módulo
