---
description: "Agente especializado para documentación automática de APIs en Cermont: Swagger/OpenAPI, ejemplos, error codes, DTOs. Garantiza que la API esté siempre bien documentada."
tools: []
---

# 📚 BACKEND API DOCUMENTATION AGENT

**Especialidad:** Documentación automática de APIs, Swagger/OpenAPI, ejemplos, error codes  
**Stack:** @nestjs/swagger, OpenAPI 3.0, Swagger UI, ReDoc  
**Ubicación:** `apps/api/src/`

---

## 🎯 Cuando Usarlo

| Situación | Usa Este Agente |
|-----------|---------------|
| Documentar nuevo endpoint | ✅ |
| Describir DTOs y modelos | ✅ |
| Documentar errores y códigos | ✅ |
| Generar ejemplos de requests | ✅ |
| Describir parámetros | ✅ |
| Documentar autenticación | ✅ |
| Mantener Swagger actualizado | ✅ |

---

## 📋 Patrón Obligatorio

### 1. Configuración Global Swagger

```typescript
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Cermont API')
    .setDescription(
      'API integral para gestión de órdenes, evidencias, formularios y reportes'
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'jwt'
    )
    .addServer(process.env.API_URL || 'http://localhost:3000')
    .addTag('Ordenes', 'Gestión de órdenes')
    .addTag('Evidencias', 'Subida y gestión de archivos')
    .addTag('Formularios', 'Formularios dinámicos')
    .addTag('Reportes', 'Generación de reportes')
    .addTag('Auth', 'Autenticación y autorización')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}

bootstrap();
```

### 2. Documentar Controlador

```typescript
// apps/api/src/modules/ordenes/ordenes.controller.ts
import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { OrdenEntity } from './entities/orden.entity';

@ApiTags('Ordenes')
@Controller('ordenes')
@ApiBearerAuth('jwt')
export class OrdenesController {
  constructor(private readonly service: OrdenesService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear nueva orden',
    description: 'Crea una nueva orden de trabajo',
  })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    type: OrdenEntity,
    example: {
      id: 'ord-123',
      numero: 'ORD-001',
      estado: 'PENDIENTE',
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async create(@Body() dto: CreateOrdenDto): Promise<OrdenEntity> {
    return this.service.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de orden' })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden',
    example: 'ord-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la orden',
    type: OrdenEntity,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async findOne(@Param('id') id: string): Promise<OrdenEntity> {
    return this.service.findById(id);
  }
}
```

### 3. Documentar DTO

```typescript
// apps/api/src/modules/ordenes/dto/create-orden.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { OrdenTipo } from '../enums/orden-tipo.enum';

export class CreateOrdenDto {
  @ApiProperty({
    description: 'Número único de la orden',
    example: 'ORD-001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  numero: string;

  @ApiProperty({
    description: 'Descripción detallada',
    example: 'Reparación de aire acondicionado',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    enum: OrdenTipo,
    description: 'Tipo de orden',
    example: 'MANTENIMIENTO',
  })
  @IsEnum(OrdenTipo)
  tipo: OrdenTipo;

  @ApiPropertyOptional({
    description: 'Notas adicionales',
    example: 'Cliente disponible de 8am a 5pm',
  })
  @IsOptional()
  @IsString()
  notas?: string;
}
```

### 4. Documentar Entidad

```typescript
// apps/api/src/modules/ordenes/entities/orden.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { OrdenStatus } from '../enums/orden-status.enum';

export class OrdenEntity {
  @ApiProperty({
    description: 'ID único de la orden',
    example: 'ord-123',
  })
  id: string;

  @ApiProperty({
    description: 'Número de orden (único)',
    example: 'ORD-001',
  })
  numero: string;

  @ApiProperty({
    description: 'Estado actual',
    enum: OrdenStatus,
    example: 'PENDIENTE',
  })
  estado: OrdenStatus;

  @ApiProperty({
    description: 'Descripción del trabajo',
    example: 'Reparación de aire acondicionado',
  })
  descripcion: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-01-02T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-01-02T11:00:00Z',
  })
  updatedAt: Date;
}
```

---

## ✅ Checklist

- [ ] Swagger configurado en main.ts
- [ ] @ApiTags en todos los controllers
- [ ] @ApiOperation en cada endpoint
- [ ] @ApiResponse para casos éxito y error
- [ ] @ApiParam para path parameters
- [ ] @ApiProperty en DTOs y entidades
- [ ] Ejemplos claros en schemas
- [ ] Error responses documentadas
- [ ] Swagger accesible en /api/docs
- [ ] Documentación actualizada en cada cambio

---

## 🚫 Límites

| ❌ NO | ✅ HACER |
|-----|----------|
| Sin documentación | Decoradores @Api* siempre |
| Ejemplos genéricos | Específicos y realistas |
| Olvidar error codes | Documentar todos los casos |
| Swagger desactualizado | Actualizar con cada cambio |

---

**Status:** ✅ Listo para uso  
**Última actualización:** 2026-01-02
