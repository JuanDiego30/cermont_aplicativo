# 🔍 FASE 3: CONSOLIDACIÓN DE MÓDULOS Y ELIMINACIÓN DE DUPLICIDAD

**Versión:** 3.0  
**Fecha:** 28 de Diciembre de 2025  
**Prioridad:** 🟡 MEDIA (después de Fase 2)  
**Tiempo Estimado:** 6-8 horas  

---

## 🎯 PROBLEMAS A RESOLVER

### Problema 3.1: DUPLICIDAD CRÍTICA - ÓRDENES

**Estado Actual:**
```
aps/api/src/modules/
├─ ordenes/          ← ESPAÑOL
│  ├─ ordenes.service.ts
│  ├─ ordenes.controller.ts
│  ├─ ordenes.module.ts
│  └─ dto/
│
├─ orders/            ← INGLÉS (DUPLICADO)
│  ├─ orders.service.ts
│  ├─ orders.controller.ts
│  ├─ orders.module.ts
└─ ...
```

**Problema:**
- Dos módulos haciendo lo mismo
- Rutas API duplicadas
- Código desincronizado
- Confusión en el equipo
- Mantenimiento duplicado

**Solución:** 
- Mantener `ordenes/` (español, coincide con dominio Colombia)
- Eliminar `orders/`
- Consolidar todo en `ordenes/`

---

### Problema 3.2: No hay Base Classes

**Problema:**
- Cada módulo implementa CRUD desde cero
- Duplicación de código en Servicios y Repositories
- No cumple REGLA 2: USAR BASE CLASSES

**Solución:**
- Crear `BaseService<T>`
- Crear `BaseRepository<T>`
- Crear `BaseController<T>`

---

### Problema 3.3: Mappers No Centralizados

**Problema:**
- Cada módulo convierte Entity ↑↓ DTO de forma diferente
- No hay patrón consistente
- Fácil que se desincronicen

**Solución:**
- Crear estructura de Mappers centralizada
- Patrón implícito

---

### Problema 3.4: DTOs Sin Value Objects

**Problema:**
- DTOs con strings simples
- No hay validación de negocios
- No cumple REGLA 3: VALUE OBJECTS

**Solución:**
- Crear Value Objects para datos críticos
- Validación en tiempo de compilación

---

## ✅ SOLUCIÓN PROPUESTA

### Paso 3.1: Crear Base Classes

**Archivo:** `apps/api/src/lib/base/base.repository.ts` (NUEVO)

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Logger } from '@nestjs/common';

/**
 * Clase base para todos los Repositories
 * Aplica REGLA 1: NO DUPLICAR CÓDIGO
 * Aplica REGLA 2: USAR BASE CLASSES
 * Aplica REGLA 10: NO N+1 QUERIES
 */
@Injectable()
export abstract class BaseRepository<T, CreateDTO, UpdateDTO> {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly prisma: PrismaService;
  protected abstract modelName: string; // 'user', 'order', etc

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

  /**
   * Obtener todos los registros con paginación
   */
  async findMany(
    skip: number = 0,
    take: number = 10,
    where?: Record<string, any>,
    include?: Record<string, any>,
  ): Promise<{ data: T[]; total: number }> {
    try {
      const [data, total] = await Promise.all([
        (this.prisma as any)[this.modelName].findMany({
          skip,
          take,
          where,
          include,
          orderBy: { createdAt: 'desc' },
        }),
        (this.prisma as any)[this.modelName].count({ where }),
      ]);

      return { data, total };
    } catch (error) {
      this.logger.error(`Error finding ${this.modelName}`, {
        error: error.message,
        modelName: this.modelName,
      });
      throw error;
    }
  }

  /**
   * Obtener un registro por ID
   */
  async findById(
    id: string,
    include?: Record<string, any>,
  ): Promise<T | null> {
    try {
      return await (this.prisma as any)[this.modelName].findUnique({
        where: { id },
        include,
      });
    } catch (error) {
      this.logger.error(`Error finding ${this.modelName} by ID`, {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Buscar registros por criterios
   */
  async findByWhere(
    where: Record<string, any>,
    include?: Record<string, any>,
  ): Promise<T | null> {
    try {
      return await (this.prisma as any)[this.modelName].findFirst({
        where,
        include,
      });
    } catch (error) {
      this.logger.error(`Error finding ${this.modelName}`, {
        error: error.message,
        where,
      });
      throw error;
    }
  }

  /**
   * Crear un nuevo registro
   */
  async create(data: CreateDTO): Promise<T> {
    try {
      return await (this.prisma as any)[this.modelName].create({
        data: data as any,
      });
    } catch (error) {
      this.logger.error(`Error creating ${this.modelName}`, {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Actualizar un registro
   */
  async update(id: string, data: UpdateDTO): Promise<T> {
    try {
      return await (this.prisma as any)[this.modelName].update({
        where: { id },
        data: data as any,
      });
    } catch (error) {
      this.logger.error(`Error updating ${this.modelName}`, {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Eliminar un registro
   */
  async delete(id: string): Promise<T> {
    try {
      return await (this.prisma as any)[this.modelName].delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error deleting ${this.modelName}`, {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Contar registros
   */
  async count(where?: Record<string, any>): Promise<number> {
    try {
      return await (this.prisma as any)[this.modelName].count({ where });
    } catch (error) {
      this.logger.error(`Error counting ${this.modelName}`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Verificar si existe
   */
  async exists(where: Record<string, any>): Promise<boolean> {
    try {
      const count = await (this.prisma as any)[this.modelName].count({
        where,
      });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking existence`, {
        error: error.message,
      });
      return false;
    }
  }
}
```

**Archivo:** `apps/api/src/lib/base/base.service.ts` (NUEVO)

```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseRepository } from './base.repository';

/**
 * Clase base para todos los Services
 * Implementa CRUD básico reutilizable
 */
@Injectable()
export abstract class BaseService<T, CreateDTO, UpdateDTO> {
  protected readonly logger = new Logger(this.constructor.name);
  protected abstract repository: BaseRepository<T, CreateDTO, UpdateDTO>;
  protected abstract entityName: string; // 'User', 'Order', etc

  /**
   * Obtener todos los registros
   */
  async findAll(
    skip: number = 0,
    take: number = 10,
    where?: Record<string, any>,
    include?: Record<string, any>,
  ) {
    try {
      return await this.repository.findMany(skip, take, where, include);
    } catch (error) {
      this.logger.error(`Error fetching ${this.entityName}`, error);
      throw error;
    }
  }

  /**
   * Obtener un registro por ID
   */
  async findOne(id: string, include?: Record<string, any>) {
    try {
      if (!id) {
        throw new Error('ID requerido');
      }

      const result = await this.repository.findById(id, include);

      if (!result) {
        throw new NotFoundException(
          `${this.entityName} con ID ${id} no encontrado`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Error fetching ${this.entityName}`, {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Crear un nuevo registro
   */
  async create(createDTO: CreateDTO) {
    try {
      const result = await this.repository.create(createDTO);
      this.logger.log(`${this.entityName} creado exitosamente`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating ${this.entityName}`, {
        error: error.message,
        data: createDTO,
      });
      throw error;
    }
  }

  /**
   * Actualizar un registro
   */
  async update(id: string, updateDTO: UpdateDTO) {
    try {
      // Verificar que existe
      await this.findOne(id);

      const result = await this.repository.update(id, updateDTO);
      this.logger.log(`${this.entityName} actualizado exitosamente`, { id });
      return result;
    } catch (error) {
      this.logger.error(`Error updating ${this.entityName}`, {
        id,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Eliminar un registro
   */
  async remove(id: string) {
    try {
      // Verificar que existe
      await this.findOne(id);

      const result = await this.repository.delete(id);
      this.logger.log(`${this.entityName} eliminado exitosamente`, { id });
      return result;
    } catch (error) {
      this.logger.error(`Error deleting ${this.entityName}`, {
        id,
        error: error.message,
      });
      throw error;
    }
  }
}
```

**Archivo:** `apps/api/src/lib/base/base.mapper.ts` (NUEVO)

```typescript
/**
 * Clase base para Mappers
 * Patrón de conversión de datos
 */
export abstract class BaseMapper<Domain, DTO, Persistence> {
  /**
   * Convertir Domain → DTO (para API)
   */
  abstract toPersistence(domain: Domain): Persistence;

  /**
   * Convertir DTO → Domain (desde cliente)
   */
  abstract toDomain(dto: DTO): Domain;

  /**
   * Convertir Persistence → Domain (desde BD)
   */
  abstract fromPersistence(raw: Persistence): Domain;

  /**
   * Convertir Domain → DTO (para respuesta)
   */
  abstract toDTO(domain: Domain): DTO;
}
```

---

### Paso 3.2: Crear Módulo Órdenes Consolidado

**PRIMERO:** Copiar todo de `ordenes/` a `ordenes-backup/` (por si acaso)

**SEGUNDO:** Actualizar `ordenes/` para usar base classes

**Archivo:** `apps/api/src/modules/ordenes/ordenes.repository.ts` (ACTUALIZAR)

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaseRepository } from '../../lib/base/base.repository';
import { Orden } from './entities/orden.entity';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';

@Injectable()
export class OrdenesRepository extends BaseRepository<
  Orden,
  CreateOrdenDto,
  UpdateOrdenDto
> {
  protected modelName = 'orden';

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Buscar órdenes por técnico
   */
  async findByTecnico(tecnicoId: string) {
    return this.findMany(0, 100, { tecnicoId }, {
      tecnico: true,
      cliente: true,
      items: true,
    });
  }

  /**
   * Buscar órdenes por estado
   */
  async findByEstado(estado: string) {
    return this.findMany(0, 100, { estado }, {
      tecnico: true,
      cliente: true,
    });
  }

  /**
   * Buscar órdenes por cliente
   */
  async findByCliente(clienteId: string) {
    return this.findMany(0, 100, { clienteId }, {
      cliente: true,
      tecnico: true,
    });
  }

  /**
   * Obtener órdenes del mes actual
   */
  async findFromCurrentMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    return this.findMany(
      0,
      1000,
      {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      {
        cliente: true,
        tecnico: true,
      },
    );
  }
}
```

**Archivo:** `apps/api/src/modules/ordenes/ordenes.service.ts` (ACTUALIZAR)

```typescript
import { Injectable } from '@nestjs/common';
import { BaseService } from '../../lib/base/base.service';
import { OrdenesRepository } from './ordenes.repository';
import { Orden } from './entities/orden.entity';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { AuditService, AuditAction } from '../../lib/services/audit.service';
import { BadRequestException, Logger } from '@nestjs/common';

@Injectable()
export class OrdenesService extends BaseService<Orden, CreateOrdenDto, UpdateOrdenDto> {
  protected entityName = 'Orden';
  protected logger = new Logger(OrdenesService.name);

  constructor(
    protected readonly repository: OrdenesRepository,
    private readonly auditService: AuditService,
  ) {
    super();
  }

  /**
   * Sobreescribir create para auditar
   */
  async create(createDTO: CreateOrdenDto, userId?: string) {
    try {
      const orden = await super.create(createDTO);

      if (userId) {
        await this.auditService.log({
          userId,
          action: AuditAction.ORDER_CREATE,
          entityType: 'ORDEN',
          entityId: orden.id,
          changes: createDTO as any,
        });
      }

      return orden;
    } catch (error) {
      this.logger.error('Error creando orden', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de orden
   */
  async cambiarEstado(
    id: string,
    nuevoEstado: string,
    userId?: string,
  ): Promise<Orden> {
    try {
      // Validar estado
      const estadosValidos = [
        'PENDIENTE',
        'EN_PROCESO',
        'PAUSADA',
        'COMPLETADA',
        'CANCELADA',
      ];
      if (!estadosValidos.includes(nuevoEstado)) {
        throw new BadRequestException(`Estado inválido: ${nuevoEstado}`);
      }

      // Obtener orden actual
      const orden = await this.findOne(id);

      // Validar transición
      if (!this.esTransicionValida(orden.estado, nuevoEstado)) {
        throw new BadRequestException(
          `No se puede cambiar de ${orden.estado} a ${nuevoEstado}`,
        );
      }

      // Actualizar
      const actualizada = await this.update(id, {
        estado: nuevoEstado,
      } as UpdateOrdenDto);

      // Auditar
      if (userId) {
        await this.auditService.log({
          userId,
          action: AuditAction.ORDER_STATUS_CHANGE,
          entityType: 'ORDEN',
          entityId: id,
          changes: { anterior: orden.estado, nuevo: nuevoEstado },
        });
      }

      return actualizada;
    } catch (error) {
      this.logger.error(`Error cambiando estado orden ${id}`, error);
      throw error;
    }
  }

  /**
   * Asignar técnico a orden
   */
  async asignarTecnico(
    ordenId: string,
    tecnicoId: string,
    userId?: string,
  ): Promise<Orden> {
    try {
      const orden = await this.update(ordenId, {
        tecnicoId,
      } as UpdateOrdenDto);

      if (userId) {
        await this.auditService.log({
          userId,
          action: AuditAction.ORDER_ASSIGN_TECH,
          entityType: 'ORDEN',
          entityId: ordenId,
          changes: { tecnicoId },
        });
      }

      return orden;
    } catch (error) {
      this.logger.error(`Error asignando técnico`, error);
      throw error;
    }
  }

  /**
   * Obtener órdenes del mes
   */
  async getOrdenesDelMes() {
    try {
      return await this.repository.findFromCurrentMonth();
    } catch (error) {
      this.logger.error('Error obteniendo órdenes del mes', error);
      throw error;
    }
  }

  /**
   * Validar transición de estados
   */
  private esTransicionValida(actual: string, nuevo: string): boolean {
    const transiciones: Record<string, string[]> = {
      PENDIENTE: ['EN_PROCESO', 'CANCELADA'],
      EN_PROCESO: ['COMPLETADA', 'PAUSADA', 'CANCELADA'],
      PAUSADA: ['EN_PROCESO', 'CANCELADA'],
      COMPLETADA: [],
      CANCELADA: [],
    };
    return transiciones[actual]?.includes(nuevo) ?? false;
  }
}
```

---

### Paso 3.3: Crear Mapper para Órdenes

**Archivo:** `apps/api/src/modules/ordenes/mappers/orden.mapper.ts` (NUEVO)

```typescript
import { BaseMapper } from '../../../lib/base/base.mapper';
import { Orden } from '../entities/orden.entity';
import { CreateOrdenDto } from '../dto/create-orden.dto';
import { OrdenResponseDto } from '../dto/orden-response.dto';

/**
 * Mapper para conversión de datos de Orden
 * Aplica REGLA 4: MAPPERS PARA CONVERSIÓN
 */
export class OrdenMapper extends BaseMapper<Orden, CreateOrdenDto, any> {
  /**
   * Convertir Domain → Persistence (para guardar en BD)
   */
  toPersistence(orden: Orden): any {
    return {
      numero: orden.numero,
      estado: orden.estado,
      clienteId: orden.clienteId,
      tecnicoId: orden.tecnicoId,
      descripcion: orden.descripcion,
      fecha: orden.fecha,
      monto: orden.monto,
      notas: orden.notas,
    };
  }

  /**
   * Convertir DTO → Domain (desde cliente)
   */
  toDomain(dto: CreateOrdenDto): Orden {
    return {
      numero: dto.numero,
      estado: 'PENDIENTE',
      clienteId: dto.clienteId,
      tecnicoId: dto.tecnicoId || null,
      descripcion: dto.descripcion,
      fecha: new Date(dto.fecha),
      monto: dto.monto,
      notas: dto.notas || '',
    } as Orden;
  }

  /**
   * Convertir Persistence → Domain (desde BD)
   */
  fromPersistence(raw: any): Orden {
    return {
      id: raw.id,
      numero: raw.numero,
      estado: raw.estado,
      clienteId: raw.clienteId,
      tecnicoId: raw.tecnicoId,
      descripcion: raw.descripcion,
      fecha: raw.fecha,
      monto: raw.monto,
      notas: raw.notas,
      cliente: raw.cliente,
      tecnico: raw.tecnico,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as Orden;
  }

  /**
   * Convertir Domain → DTO (para respuesta API)
   */
  toDTO(orden: Orden): OrdenResponseDto {
    return {
      id: orden.id,
      numero: orden.numero,
      estado: orden.estado,
      monto: orden.monto,
      cliente: orden.cliente
        ? {
            id: orden.cliente.id,
            nombre: orden.cliente.nombre,
            email: orden.cliente.email,
          }
        : null,
      tecnico: orden.tecnico
        ? {
            id: orden.tecnico.id,
            nombre: orden.tecnico.nombre,
            email: orden.tecnico.email,
          }
        : null,
      fecha: orden.fecha.toISOString(),
      descripcion: orden.descripcion,
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString(),
    };
  }
}
```

---

### Paso 3.4: Crear DTOs Validados para Órdenes

**Archivo:** `apps/api/src/modules/ordenes/dto/create-orden.dto.ts` (ACTUALIZAR)

```typescript
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateOrdenDto {
  @IsString({ message: 'Número debe ser texto' })
  @IsNotEmpty({ message: 'Número es requerido' })
  @MaxLength(20, { message: 'Número máximo 20 caracteres' })
  numero: string;

  @IsString({ message: 'ClienteId debe ser texto' })
  @IsNotEmpty({ message: 'ClienteId es requerido' })
  clienteId: string;

  @IsString({ message: 'Descripción debe ser texto' })
  @IsNotEmpty({ message: 'Descripción es requerida' })
  @MaxLength(500, { message: 'Descripción máximo 500 caracteres' })
  descripcion: string;

  @IsDateString({}, { message: 'Fecha debe ser formato ISO8601' })
  @IsNotEmpty({ message: 'Fecha es requerida' })
  fecha: string;

  @IsNumber({}, { message: 'Monto debe ser número' })
  @Min(0, { message: 'Monto no puede ser negativo' })
  @Max(999999999, { message: 'Monto máximo excedido' })
  @IsNotEmpty({ message: 'Monto es requerido' })
  monto: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notas?: string;

  @IsOptional()
  @IsString()
  tecnicoId?: string;
}
```

**Archivo:** `apps/api/src/modules/ordenes/dto/orden-response.dto.ts` (NUEVO)

```typescript
export class OrdenResponseDto {
  id: string;
  numero: string;
  estado: string;
  monto: number;
  fecha: string;
  descripcion: string;
  createdAt: string;
  updatedAt: string;
  cliente: {
    id: string;
    nombre: string;
    email: string;
  } | null;
  tecnico: {
    id: string;
    nombre: string;
    email: string;
  } | null;
}
```

**Archivo:** `apps/api/src/modules/ordenes/dto/update-orden.dto.ts` (ACTUALIZAR)

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdenDto } from './create-orden.dto';

export class UpdateOrdenDto extends PartialType(CreateOrdenDto) {}
```

---

### Paso 3.5: Actualizar Módulo Órdenes

**Archivo:** `apps/api/src/modules/ordenes/ordenes.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { OrdenesController } from './ordenes.controller';
import { OrdenesRepository } from './ordenes.repository';
import { AuditService } from '../../lib/services/audit.service';

@Module({
  controllers: [OrdenesController],
  providers: [OrdenesService, OrdenesRepository, AuditService],
  exports: [OrdenesService, OrdenesRepository],
})
export class OrdenesModule {}
```

---

### Paso 3.6: Actualizar Controller Órdenes

**Archivo:** `apps/api/src/modules/ordenes/ordenes.controller.ts`

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { JwtAuthGuard } from '../../lib/guards/jwt-auth.guard';
import { GetUser } from '../../lib/decorators/get-user.decorator';
import { OrdenMapper } from './mappers/orden.mapper';

@Controller('api/v1/ordenes')
@UseGuards(JwtAuthGuard)
export class OrdenesController {
  private readonly mapper = new OrdenMapper();

  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  async create(@Body() createOrdenDto: CreateOrdenDto, @GetUser() user) {
    const orden = await this.ordenesService.create(
      createOrdenDto,
      user?.id,
    );
    return this.mapper.toDTO(orden);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const skip = (page - 1) * limit;
    const result = await this.ordenesService.findAll(skip, limit, {}, {
      cliente: true,
      tecnico: true,
    });
    return {
      data: result.data.map(o => this.mapper.toDTO(o)),
      total: result.total,
      page,
      limit,
    };
  }

  @Get('mes')
  async getDelMes() {
    const result = await this.ordenesService.getOrdenesDelMes();
    return result.data.map(o => this.mapper.toDTO(o));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const orden = await this.ordenesService.findOne(id, {
      cliente: true,
      tecnico: true,
      items: true,
    });
    return this.mapper.toDTO(orden);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateOrdenDto: UpdateOrdenDto,
    @GetUser() user,
  ) {
    const orden = await this.ordenesService.update(id, updateOrdenDto);
    return this.mapper.toDTO(orden);
  }

  @Put(':id/estado')
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: string },
    @GetUser() user,
  ) {
    const orden = await this.ordenesService.cambiarEstado(
      id,
      body.estado,
      user?.id,
    );
    return this.mapper.toDTO(orden);
  }

  @Put(':id/tecnico')
  async asignarTecnico(
    @Param('id') id: string,
    @Body() body: { tecnicoId: string },
    @GetUser() user,
  ) {
    const orden = await this.ordenesService.asignarTecnico(
      id,
      body.tecnicoId,
      user?.id,
    );
    return this.mapper.toDTO(orden);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user) {
    await this.ordenesService.remove(id);
    return { message: 'Orden eliminada' };
  }
}
```

---

### Paso 3.7: ELIMINAR MÓdulo `orders/`

```bash
# Comando para eliminar módulo orders
rm -rf apps/api/src/modules/orders/

# Eliminar import de app.module.ts
# Buscar y eliminar: import { OrdersModule } from './modules/orders/orders.module';
# Buscar y eliminar: OrdersModule, de la lista de imports
```

---

## 📊 RESUMEN DE CAMBIOS

| Item | Acción | Archivos |
|------|--------|----------|
| Base Classes | Crear | `lib/base/base.repository.ts`, `base.service.ts`, `base.mapper.ts` |
| Órdenes | Actualizar | `ordenes.service.ts`, `ordenes.repository.ts`, `ordenes.controller.ts` |
| Mappers | Crear | `ordenes/mappers/orden.mapper.ts` |
| DTOs | Actualizar | `ordenes/dto/*` |
| Módulo | Actualizar | `ordenes.module.ts` |
| Orders (OLD) | Eliminar | `modules/orders/*` |
| App | Actualizar | `app.module.ts` (eliminar OrdersModule) |

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Crear `lib/base/base.repository.ts`
- [ ] Crear `lib/base/base.service.ts`
- [ ] Crear `lib/base/base.mapper.ts`
- [ ] Actualizar `ordenes.repository.ts`
- [ ] Actualizar `ordenes.service.ts`
- [ ] Actualizar `ordenes.controller.ts`
- [ ] Crear `ordenes/mappers/orden.mapper.ts`
- [ ] Actualizar DTOs de órdenes
- [ ] Actualizar `ordenes.module.ts`
- [ ] Eliminar módulo `orders/`
- [ ] Eliminar import de `app.module.ts`
- [ ] Ejecutar `npm test`
- [ ] Probar API: GET, POST, PUT, DELETE Órdenes
- [ ] Probar cambio de estado
- [ ] Verificar auditoría

---

## 🚀 SIGUIENTE: FASE 4

Ver `CORRECCION_FASE_4_VALIDACIONES.md` para:
- Agregar Value Objects a todos los módulos
- Implementar validaciones de negocio
- Testing unitario

