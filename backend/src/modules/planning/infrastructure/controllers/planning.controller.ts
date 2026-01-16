/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PLANEACIÓN CONTROLLER - CERMONT APLICATIVO (REFACTORIZADO)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Logger,
    NotFoundException,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

// Guards y decoradores existentes
import { Roles } from '../../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';

// Rate limiting (ajustado a decoradores existentes)
import { Throttle } from '@nestjs/throttler';

// Use cases existentes
import {
    AprobarPlaneacionUseCase,
    CreateOrUpdatePlaneacionUseCase,
    GetPlaneacionUseCase,
    RechazarPlaneacionUseCase,
} from '../../application/use-cases';

// DTOs existentes (corregidos según lo que existe)
import { CreatePlaneacionDto, RechazarPlaneacionDto } from '../../application/dto';

@ApiTags('Planning')
@Controller('planning')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PlanningController {
  private readonly logger = new Logger(PlanningController.name);

  constructor(
    private readonly getPlaneacion: GetPlaneacionUseCase,
    private readonly createOrUpdatePlaneacion: CreateOrUpdatePlaneacionUseCase,
    private readonly aprobarPlaneacion: AprobarPlaneacionUseCase,
    private readonly rechazarPlaneacion: RechazarPlaneacionUseCase
  ) {}

  /**
   * ✅ OBTENER PLANEACIÓN POR ORDEN
   * GET /planning/:orderId
   */
  @Get(':orderId')
  @Throttle({ default: { limit: 200, ttl: 60000 } }) // 200 req/min
  @ApiOperation({
    summary: 'Obtener planeación por ID de orden',
    description:
      'Retorna la planeación completa incluyendo actividades, recursos y costos estimados',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order UUID',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: 200,
    description: 'Planeación obtenida correctamente',
  })
  @ApiNotFoundResponse({
    description: 'Planeación no encontrada para esta orden',
  })
  async findByOrden(@Param('orderId') orderId: string) {
    const context = {
      action: 'GET_PLANEACION',
      orderId,
    };

    this.logger.log('Obteniendo planeación', context);

    try {
      const planeacion = await this.getPlaneacion.execute(orderId);

      if (!planeacion) {
        throw new NotFoundException(`Planeación no encontrada para la orden ${orderId}`);
      }

      this.logger.log('Planeación obtenida exitosamente', {
        ...context,
        planeacionId: planeacion.id,
      });

      return planeacion;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Error obteniendo planeación', {
        ...context,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * ✅ CREAR O ACTUALIZAR PLANEACIÓN
   * POST /planning/:orderId
   */
  @Post(':orderId')
  @Roles('admin', 'supervisor', 'tecnico')
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 req/min
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Crear o actualizar planeación',
    description: 'Crea una nueva planeación o actualiza una existente',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order UUID',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fechaInicio: {
          type: 'string',
          format: 'date-time',
          example: '2024-02-15T08:00:00Z',
        },
        fechaFin: {
          type: 'string',
          format: 'date-time',
          example: '2024-02-15T17:00:00Z',
        },
        actividades: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              descripcion: { type: 'string', example: 'Inspección visual' },
              duracionEstimada: { type: 'number', example: 2 },
              orden: { type: 'number', example: 1 },
            },
          },
        },
        recursosNecesarios: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              nombre: { type: 'string', example: 'Arnés de seguridad' },
              cantidad: { type: 'number', example: 2 },
              tipo: { type: 'string', example: 'EQUIPO' },
            },
          },
        },
        observaciones: {
          type: 'string',
          example: 'Cliente solicita trabajo en horario de menor actividad',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Planeación creada/actualizada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiForbiddenResponse({
    description: 'Usuario sin permisos suficientes',
  })
  async createOrUpdate(@Param('orderId') orderId: string, @Body() dto: CreatePlaneacionDto) {
    const context = {
      action: 'CREATE_UPDATE_PLANEACION',
      orderId,
    };

    this.logger.log('Creando/actualizando planeación', context);

    try {
      const result = await this.createOrUpdatePlaneacion.execute(orderId, dto);

      this.logger.log('Planeación creada/actualizada exitosamente', {
        ...context,
        planeacionId: result.data?.id,
      });

      return result;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Error creando/actualizando planeación', {
        ...context,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }

  /**
   * ✅ APROBAR PLANEACIÓN
   * PUT /planning/:id/approve
   */
  @Put(':id/approve')
  @Roles('admin', 'supervisor')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 aprobaciones/min
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Aprobar planeación',
    description: 'Marca la planeación como aprobada, permitiendo iniciar la ejecución',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la planeación',
  })
  @ApiResponse({
    status: 200,
    description: 'Planeación aprobada correctamente',
    schema: {
      example: {
        message: 'Planeación aprobada exitosamente',
        data: {
          id: 'uuid',
          estado: 'APROBADA',
          aprobadoPor: 'uuid-supervisor',
          aprobadoEn: '2024-02-14T10:30:00Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Planeación no encontrada' })
  @ApiForbiddenResponse({ description: 'Solo supervisores pueden aprobar' })
  @ApiResponse({
    status: 409,
    description: 'Planeación ya fue aprobada',
  })
  async aprobar(@Param('id') id: string, @Body('userId') userId?: string) {
    const context = {
      action: 'APROBAR_PLANEACION',
      planeacionId: id,
      userId,
    };

    this.logger.log('Aprobando planeación', context);

    try {
      // Llamada corregida: solo 2 parámetros según firma original
      const result = await this.aprobarPlaneacion.execute(id, userId || 'system');

      this.logger.log('Planeación aprobada exitosamente', context);

      return {
        message: 'Planeación aprobada exitosamente',
        data: result.data,
      };
    } catch (error) {
      const err = error as Error;

      // Manejo de excepciones sin importar clases custom
      if (err.message.includes('ya aprobada') || err.message.includes('already approved')) {
        this.logger.warn('Intento de aprobar planeación ya aprobada', context);
      } else {
        this.logger.error('Error aprobando planeación', {
          ...context,
          error: err.message,
          stack: err.stack,
        });
      }
      throw error;
    }
  }

  /**
   * ✅ RECHAZAR PLANEACIÓN
   * PUT /planeacion/:id/rechazar
   */
  @Put(':id/reject')
  @Roles('admin', 'supervisor')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rechazar planeación',
    description: 'Marca la planeación como rechazada, requiriendo ajustes antes de aprobar',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la planeación',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        motivo: {
          type: 'string',
          example: 'Los recursos asignados no son suficientes para la complejidad del trabajo',
          minLength: 10,
          maxLength: 1000,
        },
      },
      required: ['motivo'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Planeación rechazada correctamente',
    schema: {
      example: {
        message: 'Planeación rechazada',
        data: {
          id: 'uuid',
          estado: 'RECHAZADA',
          rechazadoPor: 'uuid-supervisor',
          rechazadoEn: '2024-02-14T11:00:00Z',
          motivoRechazo: 'Recursos insuficientes...',
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Planeación no encontrada' })
  @ApiForbiddenResponse({ description: 'Solo supervisores pueden rechazar' })
  async rechazar(@Param('id') id: string, @Body() dto: RechazarPlaneacionDto) {
    const context = {
      action: 'RECHAZAR_PLANEACION',
      planeacionId: id,
    };

    this.logger.log('Rechazando planeación', context);

    try {
      // Llamada corregida: solo 2 parámetros según firma original
      const result = await this.rechazarPlaneacion.execute(id, dto.motivo);

      this.logger.log('Planeación rechazada exitosamente', context);

      return {
        message: 'Planeación rechazada',
        data: result.data,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error('Error rechazando planeación', {
        ...context,
        error: err.message,
        stack: err.stack,
      });
      throw error;
    }
  }
}
