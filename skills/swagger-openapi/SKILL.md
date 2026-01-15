---
name: swagger-openapi
description: Experto en documentación de APIs con Swagger/OpenAPI para NestJS. Usar para documentar endpoints, DTOs, autenticación y generar especificaciones OpenAPI.
triggers:
  - Swagger
  - OpenAPI
  - API documentation
  - swagger-ui
  - api-docs
  - specification
  - schema
role: specialist
scope: documentation
output-format: code
---

# Swagger/OpenAPI Documentation Expert

Especialista en documentación automática de APIs REST con Swagger y OpenAPI para NestJS.

## Rol

Arquitecto de APIs con 7+ años de experiencia en diseño y documentación de APIs REST. Experto en OpenAPI 3.0, Swagger UI, y mejores prácticas de documentación de APIs.

## Cuándo Usar Este Skill

- Configurar Swagger en NestJS
- Documentar endpoints con decoradores
- Generar especificaciones OpenAPI
- Documentar DTOs y modelos
- Configurar autenticación en Swagger
- Exportar specs para Postman/Insomnia
- Versionamiento de APIs
- Documentar respuestas de error

## Instalación

```bash
pnpm add @nestjs/swagger swagger-ui-express
```

## Configuración Base

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Cermont API')
    .setDescription(`
      API REST para el sistema de gestión de obras Cermont.
      
      ## Autenticación
      La API usa JWT Bearer tokens. Incluye el header:
      \`Authorization: Bearer <token>\`
      
      ## Rate Limiting
      - 100 requests por minuto para endpoints públicos
      - 1000 requests por minuto para usuarios autenticados
      
      ## Códigos de Error
      | Código | Descripción |
      |--------|-------------|
      | 400 | Bad Request - Datos inválidos |
      | 401 | Unauthorized - Token inválido o expirado |
      | 403 | Forbidden - Sin permisos |
      | 404 | Not Found - Recurso no encontrado |
      | 429 | Too Many Requests - Rate limit excedido |
      | 500 | Internal Server Error |
    `)
    .setVersion('1.0')
    .setContact('Cermont Team', 'https://cermont.com', 'dev@cermont.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Development')
    .addServer('https://api.cermont.com', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // Nombre de referencia
    )
    .addTag('auth', 'Autenticación y autorización')
    .addTag('users', 'Gestión de usuarios')
    .addTag('orders', 'Gestión de órdenes de trabajo')
    .addTag('projects', 'Gestión de proyectos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Customizar UI
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Cermont API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  });

  // Exponer spec JSON
  app.getHttpAdapter().get('/api-docs-json', (req, res) => {
    res.json(document);
  });

  await app.listen(3000);
  console.log('Swagger UI: http://localhost:3000/api-docs');
}
bootstrap();
```

## Documentar Controllers

```typescript
// users.controller.ts
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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
@ApiExtraModels(PaginatedResponseDto, UserResponseDto)
export class UsersController {
  
  @Get()
  @ApiOperation({
    summary: 'List all users',
    description: 'Retrieves a paginated list of users. Requires admin role.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'user', 'supervisor'] })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(UserResponseDto) },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden - Admin only' })
  @Roles('admin')
  async findAll(@Query() query: PaginationDto) {
    // Implementation
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid', description: 'User UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    // Implementation
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  @Roles('admin')
  async create(@Body() dto: CreateUserDto) {
    // Implementation
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    // Implementation
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'User deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  @Roles('admin')
  async remove(@Param('id') id: string) {
    // Implementation
  }
}
```

## Documentar DTOs

```typescript
// dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  SUPERVISOR = 'supervisor',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@company.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'SecureP@ss123',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiPropertyOptional({
    description: 'User role in the system',
    enum: UserRole,
    default: UserRole.USER,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.USER;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+57 300 123 4567',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

// dto/user-response.dto.ts
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@company.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User role',
    enum: ['admin', 'user', 'supervisor'],
    example: 'user',
  })
  role: string;

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-15T10:30:00Z',
    format: 'date-time',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean;
}

// dto/update-user.dto.ts - Usando PartialType
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password'] as const),
) {}
```

## DTOs de Paginación

```typescript
// common/dto/pagination.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

// common/dto/paginated-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: [Object] })
  data: T[];

  @ApiProperty()
  meta: PaginatedMetaDto;
}
```

## Documentar Respuestas de Error

```typescript
// common/dto/error-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Detailed error messages',
    example: ['email must be an email', 'password is too short'],
    type: [String],
  })
  errors?: string[];

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/users',
  })
  path: string;
}

// Usar en controller
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'Validation error',
  type: ErrorResponseDto,
})
```

## Generar OpenAPI Spec

```typescript
// scripts/generate-openapi.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from '../src/app.module';

async function generateSpec() {
  const app = await NestFactory.create(AppModule, { logger: false });
  
  const config = new DocumentBuilder()
    .setTitle('Cermont API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Guardar como JSON
  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  
  // Guardar como YAML
  const yaml = require('js-yaml');
  writeFileSync('./openapi.yaml', yaml.dump(document));
  
  console.log('OpenAPI spec generated: openapi.json, openapi.yaml');
  await app.close();
}

generateSpec();
```

## Plugin CLI para Auto-Documentación

```javascript
// nest-cli.json
{
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "classValidatorShim": true,
          "introspectComments": true,
          "dtoFileNameSuffix": [".dto.ts", ".entity.ts"]
        }
      }
    ]
  }
}
```

Con el plugin, los comentarios JSDoc se convierten en descripciones:

```typescript
export class CreateUserDto {
  /**
   * The email address of the user
   * @example john.doe@company.com
   */
  email: string;
  
  /**
   * User's full name
   * @example John Doe
   */
  name: string;
}
```

## Restricciones

### DEBE HACER
- Documentar todos los endpoints públicos
- Incluir ejemplos en todos los campos
- Documentar códigos de error posibles
- Usar tipos específicos (uuid, email, date-time)
- Agrupar endpoints con @ApiTags
- Documentar autenticación requerida

### NO DEBE HACER
- Exponer campos sensibles en docs (passwords)
- Dejar endpoints sin descripción
- Olvidar documentar respuestas de error
- Usar any o types genéricos sin schema

## Skills Relacionados

- **nestjs-expert** - Arquitectura NestJS
- **jwt-auth-patterns** - Documentar autenticación
- **clean-architecture** - DTOs y responses
