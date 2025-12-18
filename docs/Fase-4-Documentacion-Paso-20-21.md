# 🟢 FASE 4: DOCUMENTACIÓN COMPLETA - PASOS 20-21 (16 HORAS)

**Documento**: Plan Detallado de Documentación  
**Duración**: 16 horas (Semana 8)  
**Prioridad**: 🟡 MEDIA  
**Objetivo**: 100% Swagger + JSDoc completo + README por módulo  

---

## 📋 TABLA DE CONTENIDOS

1. [Paso 20: Swagger 100% Completo (8h)](#paso-20-swagger)
2. [Paso 21: JSDoc + README (8h)](#paso-21-jsdoc)
3. [Setup Swagger](#setup-swagger)
4. [Plantillas de Documentación](#plantillas)
5. [Checklist Final](#checklist-final)

---

## 🔧 SETUP SWAGGER

### Instalar Dependencias

```bash
cd apps/api
pnpm add @nestjs/swagger swagger-ui-express class-transformer class-validator
```

### Configurar en main.ts

**Archivo**: `apps/api/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';

async function bootstrap() {
  const env = validateEnv();
  const app = await NestFactory.create(AppModule);

  // ✅ SWAGGER SETUP
  const config = new DocumentBuilder()
    .setTitle('Cermont API')
    .setDescription(
      'Sistema completo de gestión de órdenes de trabajo, técnicos y reportes',
    )
    .setVersion('1.0.0')
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Órdenes', 'Gestión de órdenes de trabajo')
    .addTag('Técnicos', 'Gestión de técnicos')
    .addTag('Usuarios', 'Gestión de usuarios')
    .addTag('Dashboard', 'Estadísticas y KPIs')
    .addTag('Reportes', 'Generación de reportes y PDFs')
    .addTag('Email', 'Servicios de email')
    .setBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  // ✅ HABILITAR CORS Y COMPRESSION
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  await app.listen(env.PORT);
  console.log(`✅ Application listening on port ${env.PORT}`);
  console.log(`📚 Swagger available at http://localhost:${env.PORT}/api/docs`);
}

bootstrap();
```

---

## 🟢 PASO 20: SWAGGER 100% COMPLETO (8 HORAS)

### 20.1 DTOs Documentados

**Archivo**: `apps/api/src/modules/ordenes/application/dto/create-orden.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsUUID, Min, MinLength } from 'class-validator';

/**
 * DTO para crear una nueva orden de trabajo
 * 
 * @example
 * ```json
 * {
 *   "titulo": "Mantenimiento preventivo",
 *   "descripcion": "Revisión general de equipos",
 *   "clienteId": "550e8400-e29b-41d4-a716-446655440000",
 *   "tecnicoId": "550e8400-e29b-41d4-a716-446655440001",
 *   "monto": 1500.50,
 *   "fechaProgramada": "2025-12-25T09:00:00Z"
 * }
 * ```
 */
export class CreateOrdenDTO {
  /**
   * Título o nombre de la orden de trabajo
   * @example "Mantenimiento preventivo"
   */
  @ApiProperty({
    example: 'Mantenimiento preventivo',
    description: 'Título descriptivo de la orden',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  titulo: string;

  /**
   * Descripción detallada de la orden
   * @example "Revisión general de equipos, cambio de piezas desgastadas"
   */
  @ApiProperty({
    example: 'Revisión general de equipos, cambio de piezas desgastadas',
    description: 'Descripción detallada de los trabajos a realizar',
    minLength: 10,
  })
  @IsString()
  @MinLength(10)
  descripcion: string;

  /**
   * UUID del cliente solicitante
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del usuario cliente',
    format: 'uuid',
  })
  @IsUUID()
  clienteId: string;

  /**
   * UUID del técnico asignado
   * @example "550e8400-e29b-41d4-a716-446655440001"
   */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID del técnico responsable',
    format: 'uuid',
  })
  @IsUUID()
  tecnicoId: string;

  /**
   * Monto estimado de la orden en pesos colombianos
   * @example 1500.50
   */
  @ApiProperty({
    example: 1500.50,
    description: 'Monto en COP',
    minimum: 0,
    type: 'number',
  })
  @IsNumber()
  @Min(0)
  monto: number;

  /**
   * Fecha programada para ejecutar la orden
   * @example "2025-12-25T09:00:00Z"
   */
  @ApiProperty({
    example: '2025-12-25T09:00:00Z',
    description: 'Fecha y hora programada',
    type: 'string',
    format: 'date-time',
  })
  @IsDate()
  fechaProgramada: Date;

  /**
   * Observaciones adicionales (opcional)
   * @example "Cliente solicita que lleguen después de las 10 AM"
   */
  @ApiPropertyOptional({
    example: 'Cliente solicita que lleguen después de las 10 AM',
    description: 'Notas adicionales',
  })
  @IsString()
  observaciones?: string;
}
```

**Archivo**: `apps/api/src/modules/ordenes/application/dto/orden-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

/**
 * Respuesta de una orden de trabajo
 * Se utiliza en todos los endpoints que retornan órdenes
 */
export class OrdenResponseDTO {
  /**
   * ID único de la orden
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  /**
   * Número de referencia de la orden
   * @example "ORD-123456"
   */
  @ApiProperty({
    example: 'ORD-123456',
  })
  numero: string;

  /**
   * Título de la orden
   * @example "Mantenimiento preventivo"
   */
  @ApiProperty({
    example: 'Mantenimiento preventivo',
  })
  titulo: string;

  /**
   * Estado actual de la orden
   * @example "EN_PROCESO"
   */
  @ApiProperty({
    example: 'EN_PROCESO',
    enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA', 'PAUSADA'],
  })
  estado: string;

  /**
   * Monto de la orden
   * @example 1500.50
   */
  @ApiProperty({
    example: 1500.50,
    type: 'number',
  })
  monto: number;

  /**
   * Fecha de creación
   * @example "2025-12-18T10:30:00Z"
   */
  @ApiProperty({
    example: '2025-12-18T10:30:00Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  /**
   * Fecha de última actualización
   * @example "2025-12-18T15:45:00Z"
   */
  @ApiProperty({
    example: '2025-12-18T15:45:00Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
```

### 20.2 Controllers Documentados

**Archivo**: `apps/api/src/modules/ordenes/infrastructure/controllers/ordenes.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  CacheInterceptor,
  HttpCode,
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
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CreateOrdenDTO } from '../../application/dto/create-orden.dto';
import { UpdateOrdenDTO } from '../../application/dto/update-orden.dto';
import { OrdenResponseDTO } from '../../application/dto/orden-response.dto';
import { OrdenesService } from '../../application/services/ordenes.service';

/**
 * Controller para gestión de órdenes de trabajo
 * 
 * Endpoints disponibles:
 * - POST /ordenes - Crear nueva orden
 * - GET /ordenes - Listar órdenes
 * - GET /ordenes/:id - Obtener orden específica
 * - PATCH /ordenes/:id - Actualizar orden
 * - DELETE /ordenes/:id - Eliminar orden
 * 
 * Todos los endpoints requieren autenticación con JWT bearer token
 */
@ApiTags('Órdenes')
@Controller('ordenes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  /**
   * Crear una nueva orden de trabajo
   * 
   * Solo usuarios con rol ADMIN o OPERADOR pueden crear órdenes.
   * Se asigna automáticamente el técnico más disponible si no se especifica.
   * Se envía email de confirmación al cliente y técnico.
   * 
   * @param dto - Datos de la orden a crear
   * @returns Orden creada con ID generado
   * 
   * @throws BadRequestException si los datos son inválidos
   * @throws ConflictException si hay conflicto de datos
   */
  @Post()
  @Roles('ADMIN', 'OPERADOR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nueva orden de trabajo',
    description: `
      Crea una nueva orden de trabajo en el sistema.
      
      **Validaciones:**
      - El título debe tener mínimo 3 caracteres
      - La descripción debe tener mínimo 10 caracteres
      - El monto debe ser positivo
      - La fecha programada debe ser en el futuro
      - El cliente y técnico deben existir
      
      **Eventos:**
      - Se crea evento de dominio: OrdenCreatedEvent
      - Se envía email al cliente con detalles de la orden
      - Se envía email al técnico con asignación
    `,
  })
  @ApiBody({
    type: CreateOrdenDTO,
    description: 'Datos para crear la orden',
    examples: {
      ejemplo1: {
        summary: 'Orden de mantenimiento',
        value: {
          titulo: 'Mantenimiento preventivo',
          descripcion: 'Revisión y cambio de piezas desgastadas',
          clienteId: '550e8400-e29b-41d4-a716-446655440000',
          tecnicoId: '550e8400-e29b-41d4-a716-446655440001',
          monto: 1500.50,
          fechaProgramada: '2025-12-25T09:00:00Z',
          observaciones: 'Cliente disponible solo después de las 10 AM',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    type: OrdenResponseDTO,
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      numero: 'ORD-123456',
      titulo: 'Mantenimiento preventivo',
      descripcion: 'Revisión y cambio de piezas desgastadas',
      estado: 'PENDIENTE',
      monto: 1500.50,
      createdAt: '2025-12-18T10:30:00Z',
      updatedAt: '2025-12-18T10:30:00Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o cliente/técnico no existe',
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'Sin permisos para crear órdenes' })
  async create(@Body() createOrdenDTO: CreateOrdenDTO): Promise<OrdenResponseDTO> {
    return this.ordenesService.create(createOrdenDTO);
  }

  /**
   * Listar órdenes con filtros y paginación
   * 
   * @param page - Número de página (default: 1)
   * @param limit - Items por página (default: 50, máximo: 100)
   * @param estado - Filtrar por estado
   * @param clienteId - Filtrar por cliente
   * @param tecnicoId - Filtrar por técnico
   * @returns Lista paginada de órdenes
   */
  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({
    summary: 'Listar órdenes de trabajo',
    description: `
      Retorna lista paginada de órdenes con opciones de filtrado.
      
      **Filtros disponibles:**
      - estado: PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA, PAUSADA
      - clienteId: UUID del cliente
      - tecnicoId: UUID del técnico
      - desde: Fecha mínima (ISO 8601)
      - hasta: Fecha máxima (ISO 8601)
      
      **Ordenamiento:**
      - Por defecto ordenada por fecha descendente (más recientes primero)
    `,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items por página (max 100)',
    example: 50,
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA', 'PAUSADA'],
    description: 'Filtrar por estado',
  })
  @ApiQuery({
    name: 'clienteId',
    required: false,
    type: String,
    format: 'uuid',
    description: 'Filtrar por cliente',
  })
  @ApiQuery({
    name: 'tecnicoId',
    required: false,
    type: String,
    format: 'uuid',
    description: 'Filtrar por técnico',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrdenResponseDTO' },
        },
        pagination: {
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            pages: { type: 'number' },
          },
        },
      },
    },
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('estado') estado?: string,
    @Query('clienteId') clienteId?: string,
    @Query('tecnicoId') tecnicoId?: string,
  ) {
    return this.ordenesService.findAll({
      page,
      limit: Math.min(limit, 100),
      filters: { estado, clienteId, tecnicoId },
    });
  }

  /**
   * Obtener una orden específica por ID
   * 
   * @param id - UUID de la orden
   * @returns Datos completos de la orden
   * @throws NotFoundException si no existe
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener orden por ID',
    description: 'Retorna los detalles completos de una orden específica',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'ID de la orden',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden encontrada',
    type: OrdenResponseDTO,
  })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
  async findOne(@Param('id') id: string): Promise<OrdenResponseDTO> {
    return this.ordenesService.findOne(id);
  }

  /**
   * Actualizar una orden
   * 
   * @param id - UUID de la orden
   * @param dto - Datos a actualizar
   * @returns Orden actualizada
   */
  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR', 'TECNICO')
  @ApiOperation({
    summary: 'Actualizar orden',
    description: 'Actualiza los datos de una orden existente',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiBody({
    type: UpdateOrdenDTO,
  })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada',
    type: OrdenResponseDTO,
  })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
  async update(
    @Param('id') id: string,
    @Body() updateOrdenDTO: UpdateOrdenDTO,
  ): Promise<OrdenResponseDTO> {
    return this.ordenesService.update(id, updateOrdenDTO);
  }

  /**
   * Eliminar una orden
   * 
   * Solo se pueden eliminar órdenes en estado PENDIENTE o CANCELADA
   * 
   * @param id - UUID de la orden
   * @returns Confirmación de eliminación
   */
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar orden',
    description: 'Elimina una orden del sistema (solo PENDIENTE o CANCELADA)',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Orden eliminada',
  })
  @ApiNotFoundResponse({ description: 'Orden no encontrada' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.ordenesService.delete(id);
  }
}
```

### 20.3 Generar Documentación

```bash
cd apps/api

# Compilar TypeScript
pnpm build

# Validar Swagger
curl http://localhost:3000/api/docs/swagger-ui.css

# Exportar Swagger JSON
curl http://localhost:3000/api/docs-json > swagger.json
```

---

## 🟢 PASO 21: JSDOC + README (8 HORAS)

### 21.1 JSDoc Completo en Domain

**Archivo**: `apps/api/src/modules/ordenes/domain/entities/orden.entity.ts`

```typescript
/**
 * Entidad de Dominio: Orden de Trabajo
 * 
 * Representa una orden de trabajo en el contexto del negocio.
 * Una orden es creada por un cliente, asignada a un técnico, y ejecutada.
 * 
 * **Ciclo de vida de una orden:**
 * ```
 * PENDIENTE → EN_PROCESO → COMPLETADA
 *    ↓              ↓
 * CANCELADA   PAUSADA → EN_PROCESO
 * ```
 * 
 * **Responsabilidades:**
 * - Mantener los datos de la orden
 * - Validar transiciones de estado
 * - Registrar eventos de dominio
 * - Calcular métricas
 * 
 * @example
 * ```typescript
 * const orden = Orden.create({
 *   id: 'orden-123',
 *   numero: OrdenNumero.create('ORD-123456'),
 *   clienteId: 'cliente-123',
 *   tecnicoId: 'tecnico-456',
 *   estado: OrdenStatus.create('PENDIENTE'),
 *   monto: Monto.create(1000),
 *   titulo: 'Mantenimiento',
 *   descripcion: 'Revisión de equipos',
 * });
 * 
 * // Cambiar estado
 * orden.cambiarEstado(OrdenStatus.create('EN_PROCESO'));
 * ```
 * 
 * @class
 * @see OrdenStatus para estados válidos
 * @see OrdenNumero para formato de número
 * @see OrdenStatus para transiciones válidas
 */
export class Orden {
  /**
   * ID único de la orden
   * @type {string}
   * @private
   */
  private id: string;

  /**
   * Número de referencia único
   * @type {OrdenNumero}
   * @private
   */
  private numero: OrdenNumero;

  /**
   * Cliente solicitante
   * @type {string}
   * @private
   */
  private clienteId: string;

  /**
   * Técnico asignado
   * @type {string | null}
   * @private
   */
  private tecnicoId: string | null;

  /**
   * Estado actual de la orden
   * @type {OrdenStatus}
   * @private
   */
  private estado: OrdenStatus;

  /**
   * Monto de la orden
   * @type {Monto}
   * @private
   */
  private monto: Monto;

  /**
   * Título de la orden
   * @type {string}
   * @private
   */
  private titulo: string;

  /**
   * Descripción detallada
   * @type {string}
   * @private
   */
  private descripcion: string;

  /**
   * Eventos de dominio a publicar
   * @type {DomainEvent[]}
   * @private
   */
  private domainEvents: DomainEvent[] = [];

  /**
   * Constructor privado (usar factory method create)
   * @private
   */
  private constructor(
    id: string,
    numero: OrdenNumero,
    clienteId: string,
    tecnicoId: string | null,
    estado: OrdenStatus,
    monto: Monto,
    titulo: string,
    descripcion: string,
  ) {
    this.id = id;
    this.numero = numero;
    this.clienteId = clienteId;
    this.tecnicoId = tecnicoId;
    this.estado = estado;
    this.monto = monto;
    this.titulo = titulo;
    this.descripcion = descripcion;
  }

  /**
   * Factory method para crear una nueva orden
   * 
   * @param {Object} props - Propiedades de la orden
   * @param {string} props.id - ID único
   * @param {OrdenNumero} props.numero - Número de referencia
   * @param {string} props.clienteId - ID del cliente
   * @param {string} props.tecnicoId - ID del técnico
   * @param {OrdenStatus} props.estado - Estado inicial
   * @param {Monto} props.monto - Monto de la orden
   * @param {string} props.titulo - Título
   * @param {string} props.descripcion - Descripción
   * @returns {Orden} Nueva instancia de Orden
   * 
   * @throws {InvalidOrdenError} Si los datos son inválidos
   * 
   * @example
   * ```typescript
   * const orden = Orden.create({
   *   id: 'orden-123',
   *   numero: OrdenNumero.create('ORD-123456'),
   *   clienteId: 'cliente-123',
   *   tecnicoId: 'tecnico-456',
   *   estado: OrdenStatus.create('PENDIENTE'),
   *   monto: Monto.create(1000),
   *   titulo: 'Mantenimiento',
   *   descripcion: 'Revisión de equipos',
   * });
   * ```
   */
  static create(props: {
    id: string;
    numero: OrdenNumero;
    clienteId: string;
    tecnicoId: string;
    estado: OrdenStatus;
    monto: Monto;
    titulo: string;
    descripcion: string;
  }): Orden {
    // Validaciones
    if (!props.titulo || props.titulo.length < 3) {
      throw new InvalidOrdenError('El título debe tener mínimo 3 caracteres');
    }

    return new Orden(
      props.id,
      props.numero,
      props.clienteId,
      props.tecnicoId,
      props.estado,
      props.monto,
      props.titulo,
      props.descripcion,
    );
  }

  /**
   * Cambiar el estado de la orden
   * 
   * Valida que la transición sea permitida según las reglas de negocio.
   * Si es válida, registra un evento de dominio.
   * 
   * @param {OrdenStatus} nuevoEstado - Nuevo estado
   * @throws {InvalidStateTransitionError} Si la transición no es válida
   * 
   * @example
   * ```typescript
   * orden.cambiarEstado(OrdenStatus.create('EN_PROCESO'));
   * ```
   */
  cambiarEstado(nuevoEstado: OrdenStatus): void {
    if (!this.puedeTransicionarA(nuevoEstado)) {
      throw new InvalidStateTransitionError(
        `No se puede cambiar de ${this.estado.getValue()} a ${nuevoEstado.getValue()}`,
      );
    }

    const estadoAnterior = this.estado;
    this.estado = nuevoEstado;

    // Registrar evento de dominio
    this.addDomainEvent({
      type: 'OrdenStatusChangedEvent',
      data: {
        ordenId: this.id,
        estadoAnterior: estadoAnterior.getValue(),
        nuevoEstado: nuevoEstado.getValue(),
        timestamp: new Date(),
      },
    });
  }

  /**
   * Validar si se puede transicionar a un nuevo estado
   * 
   * **Transiciones permitidas:**
   * - PENDIENTE → EN_PROCESO, CANCELADA
   * - EN_PROCESO → COMPLETADA, PAUSADA
   * - PAUSADA → EN_PROCESO, CANCELADA
   * - COMPLETADA → (ninguna - es final)
   * - CANCELADA → (ninguna - es final)
   * 
   * @param {OrdenStatus} nuevoEstado - Estado destino
   * @returns {boolean} true si la transición es válida
   * 
   * @private
   */
  private puedeTransicionarA(nuevoEstado: OrdenStatus): boolean {
    const transiciones: Record<string, string[]> = {
      PENDIENTE: ['EN_PROCESO', 'CANCELADA'],
      EN_PROCESO: ['COMPLETADA', 'PAUSADA'],
      PAUSADA: ['EN_PROCESO', 'CANCELADA'],
      COMPLETADA: [],
      CANCELADA: [],
    };

    const estadoActual = this.estado.getValue();
    return transiciones[estadoActual]?.includes(nuevoEstado.getValue()) ?? false;
  }

  /**
   * Registrar un evento de dominio
   * 
   * Los eventos se publican después de guardar la entidad.
   * 
   * @param {DomainEvent} event - Evento a registrar
   * @private
   */
  private addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  /**
   * Obtener los eventos de dominio registrados
   * 
   * @returns {DomainEvent[]} Lista de eventos
   */
  getDomainEvents(): DomainEvent[] {
    return this.domainEvents;
  }

  /**
   * Limpiar eventos después de publicar
   * 
   * @private
   */
  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  // Getters (sin JSDoc adicional - nombres descriptivos)
  getId(): string { return this.id; }
  getNumero(): OrdenNumero { return this.numero; }
  getClienteId(): string { return this.clienteId; }
  getTecnicoId(): string | null { return this.tecnicoId; }
  getEstado(): OrdenStatus { return this.estado; }
  getMonto(): Monto { return this.monto; }
  getTitulo(): string { return this.titulo; }
  getDescripcion(): string { return this.descripcion; }
}
```

### 21.2 README por Módulo

**Archivo**: `apps/api/src/modules/ordenes/README.md`

```markdown
# Módulo: Órdenes de Trabajo 📋

Sistema completo para la gestión del ciclo de vida de órdenes de trabajo, desde su creación hasta su cierre.

## 📋 Tabla de Contenidos

1. [Descripción](#descripción)
2. [Arquitectura](#arquitectura)
3. [Use Cases](#use-cases)
4. [Endpoints](#endpoints)
5. [Datos](#datos)
6. [Tests](#tests)
7. [Ejemplos](#ejemplos)

## 📖 Descripción

El módulo de Órdenes gestiona:
- **Creación** de órdenes de trabajo
- **Asignación** automática de técnicos
- **Seguimiento** del estado
- **Generación** de reportes y evidencias
- **Notificaciones** a clientes y técnicos

## 🏗️ Arquitectura

Implementa **Domain-Driven Design** con 3 capas:

```
ordenes/
├── domain/                          # Lógica de negocio pura
│   ├── entities/
│   │   └── orden.entity.ts
│   ├── value-objects/
│   │   ├── orden-numero.vo.ts       # ORD-XXXXXX
│   │   ├── orden-status.vo.ts       # Estados permitidos
│   │   └── monto.vo.ts              # Validación monetaria
│   ├── repositories/
│   │   └── orden.repository.ts      # Interfaz de persistencia
│   └── exceptions/
│       ├── orden-not-found.error.ts
│       └── invalid-state-transition.error.ts
│
├── application/                     # Lógica de aplicación
│   ├── dto/
│   │   ├── create-orden.dto.ts
│   │   ├── update-orden.dto.ts
│   │   └── orden-response.dto.ts
│   ├── use-cases/
│   │   ├── create-orden.use-case.ts
│   │   ├── update-orden-status.use-case.ts
│   │   ├── delete-orden.use-case.ts
│   │   └── list-ordenes.use-case.ts
│   └── services/
│       └── ordenes.service.ts
│
└── infrastructure/                  # Implementaciones técnicas
    ├── controllers/
    │   └── ordenes.controller.ts
    ├── persistence/
    │   └── orden.prisma.repository.ts
    └── events/
        └── orden-created.event-handler.ts
```

### Conceptos Clave

**Value Objects** (Objetos de Valor):
- No tienen identidad única
- Immutables (no se pueden cambiar)
- Validan sus propios datos
- Ejemplo: `OrdenNumero`, `Monto`, `OrdenStatus`

**Entities** (Entidades):
- Tienen identidad única
- Pueden cambiar durante su ciclo de vida
- Contienen lógica de negocio
- Ejemplo: `Orden`

**Use Cases**:
- Orquestan la lógica de aplicación
- Coordinan entre entidades y servicios
- Publican eventos de dominio
- Ejemplo: `CreateOrdenUseCase`

## 🎯 Use Cases

### 1. CreateOrdenUseCase
**Crear nueva orden de trabajo**

```typescript
// Input
{
  titulo: "Mantenimiento preventivo",
  descripcion: "Revisión de equipos",
  clienteId: "uuid",
  tecnicoId: "uuid",
  monto: 1500,
  fechaProgramada: "2025-12-25T09:00:00Z"
}

// Proceso
1. Validar datos de entrada
2. Verificar que cliente existe
3. Verificar que técnico existe
4. Crear entidad Orden
5. Guardar en BD
6. Publicar evento OrdenCreatedEvent
7. Enviar notificaciones por email

// Output
{
  id: "uuid",
  numero: "ORD-123456",
  estado: "PENDIENTE",
  ...
}
```

### 2. UpdateOrdenStatusUseCase
**Cambiar estado de la orden**

```typescript
// Input
{
  ordenId: "uuid",
  nuevoEstado: "EN_PROCESO"
}

// Validaciones
- Orden existe
- Nueva estado es válido
- Transición es permitida (PENDIENTE → EN_PROCESO ✓)

// Resultado
- Estado actualizado
- Evento OrdenStatusChangedEvent publicado
- Notificaciones enviadas
```

### 3. ListOrdenesUseCase
**Listar órdenes con filtros**

```typescript
// Filtros disponibles
{
  estado?: "PENDIENTE" | "EN_PROCESO" | "COMPLETADA",
  clienteId?: "uuid",
  tecnicoId?: "uuid",
  desde?: "2025-01-01",
  hasta?: "2025-12-31"
}

// Paginación
{
  page: 1,
  limit: 50
}

// Resultado
{
  data: [...],
  pagination: {
    total: 250,
    page: 1,
    limit: 50,
    pages: 5
  }
}
```

## 🔌 Endpoints

### POST /ordenes
Crear nueva orden de trabajo

```http
POST /ordenes HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "titulo": "Mantenimiento preventivo",
  "descripcion": "Revisión de equipos",
  "clienteId": "550e8400-e29b-41d4-a716-446655440000",
  "tecnicoId": "550e8400-e29b-41d4-a716-446655440001",
  "monto": 1500.50,
  "fechaProgramada": "2025-12-25T09:00:00Z"
}

# Respuesta 201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero": "ORD-123456",
  "titulo": "Mantenimiento preventivo",
  "estado": "PENDIENTE",
  "monto": 1500.50,
  "createdAt": "2025-12-18T10:30:00Z",
  "updatedAt": "2025-12-18T10:30:00Z"
}
```

### GET /ordenes
Listar órdenes

```http
GET /ordenes?page=1&limit=50&estado=PENDIENTE HTTP/1.1
Authorization: Bearer <token>

# Respuesta 200 OK
{
  "data": [...],
  "pagination": {
    "total": 250,
    "page": 1,
    "limit": 50,
    "pages": 5
  }
}
```

### GET /ordenes/:id
Obtener orden específica

```http
GET /ordenes/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer <token>

# Respuesta 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "numero": "ORD-123456",
  ...
}
```

### PATCH /ordenes/:id
Actualizar orden

```http
PATCH /ordenes/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "EN_PROCESO"
}

# Respuesta 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "estado": "EN_PROCESO",
  ...
}
```

### DELETE /ordenes/:id
Eliminar orden

```http
DELETE /ordenes/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Authorization: Bearer <token>

# Respuesta 204 No Content
```

## 📊 Datos

### Estados de Orden

```
PENDIENTE
  ↓ crear orden
  
EN_PROCESO
  ↓ completar trabajo
  
COMPLETADA (estado final)
  
O

CANCELADA (estado final)
```

### Schema Prisma

```prisma
model Order {
  id            String   @id @default(cuid())
  numero        String   @unique
  titulo        String
  descripcion   String
  estado        String   @default("PENDIENTE")
  monto         Float
  clienteId     String
  tecnicoId     String
  fechaInicio   DateTime?
  fechaFin      DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  cliente       User     @relation("ClienteOrdenes", fields: [clienteId], references: [id])
  tecnico       User     @relation("TecnicoOrdenes", fields: [tecnicoId], references: [id])
  
  @@index([clienteId])
  @@index([tecnicoId])
  @@index([estado])
}
```

## 🧪 Tests

### Tests Unitarios

```bash
# Ejecutar tests del módulo
pnpm test -- ordenes

# Con coverage
pnpm test:cov -- ordenes

# Watch mode
pnpm test:watch -- ordenes
```

Cobertura esperada: > 85%

**Tests incluidos:**
- ✅ Value Objects (Orden Número, Monto, Estado)
- ✅ Entities (Orden - crear, cambiar estado, validaciones)
- ✅ Use Cases (crear, actualizar, listar, eliminar)
- ✅ Services (búsqueda, filtrado)
- ✅ Controllers (endpoints)

### Tests E2E

```bash
# Ejecutar E2E
pnpm test:e2e -- ordenes.e2e-spec

# CRUD completo
# - Crear orden
# - Listar órdenes
# - Obtener orden
# - Actualizar orden
# - Eliminar orden
```

## 📖 Ejemplos

### Crear Orden en TypeScript

```typescript
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDTO } from './dto/create-orden.dto';

// Inyectar servicio
constructor(private ordenesService: OrdenesService) {}

// Usar
const dto: CreateOrdenDTO = {
  titulo: 'Mantenimiento preventivo',
  descripcion: 'Revisión de equipos',
  clienteId: 'cliente-123',
  tecnicoId: 'tecnico-456',
  monto: 1500,
  fechaProgramada: new Date('2025-12-25'),
};

const orden = await this.ordenesService.create(dto);
console.log(`Orden creada: ${orden.numero}`); // ORD-123456
```

### Cambiar Estado

```typescript
// Cambiar a EN_PROCESO
const actualizada = await this.ordenesService.update(ordenId, {
  estado: 'EN_PROCESO'
});

// Sistema automáticamente:
// 1. Valida transición (PENDIENTE → EN_PROCESO ✓)
// 2. Registra evento de dominio
// 3. Notifica al cliente y técnico
// 4. Guarda cambios en BD
```

---

**📚 Documentación completada. Todos los módulos deben tener esta estructura.**
```

