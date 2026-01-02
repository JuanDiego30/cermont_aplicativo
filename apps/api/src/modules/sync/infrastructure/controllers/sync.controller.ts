/**
 * @controller SyncController
 * @description Controlador para sincronización offline
 */
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ProcessSyncBatchUseCase, GetPendingSyncUseCase } from '../../application/use-cases';
import { SyncBatchSchema } from '../../application/dto';
import { z } from 'zod';
import { SyncService } from '../../sync.service';

/**
 * Controller para sincronización de datos offline
 * Permite sincronizar cambios realizados sin conexión
 */
@ApiTags('Sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SyncController {
  constructor(
    private readonly processBatch: ProcessSyncBatchUseCase,
    private readonly getPending: GetPendingSyncUseCase,
    private readonly legacySyncService: SyncService,
  ) { }

  /**
   * Sincronizar batch de cambios offline
   * @param body - Batch de items a sincronizar
   * @param req - Request con usuario autenticado
   * @returns Resultado de sincronización
   */
  @Post()
  @ApiOperation({
    summary: 'Sincronizar cambios offline',
    description: 'Procesa un batch de cambios realizados offline y los sincroniza con el servidor.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['items', 'deviceId'],
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entityType: { type: 'string', enum: ['orden', 'evidencia', 'checklist', 'ejecucion'] },
              entityId: { type: 'string' },
              action: { type: 'string', enum: ['create', 'update', 'delete'] },
              data: { type: 'object' },
              localId: { type: 'string' },
              timestamp: { type: 'string' },
            },
          },
        },
        deviceId: { type: 'string', example: 'device-uuid-123' },
        lastSyncTimestamp: { type: 'string', example: '2024-12-18T10:00:00Z' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Sincronización completada',
    schema: {
      properties: {
        synced: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              localId: { type: 'string' },
              serverId: { type: 'string' },
              success: { type: 'boolean' },
            },
          },
        },
        serverChanges: { type: 'array' },
        syncTimestamp: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de sincronización inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async sync(@Body() body: unknown, @Req() req: any) {
    // 1) Nuevo contrato (DDD)
    const dddParsed = SyncBatchSchema.safeParse(body);
    if (dddParsed.success) {
      return this.processBatch.execute(req.user.id, dddParsed.data);
    }

    // 2) Contrato legacy (compatibilidad)
    const LegacyItemSchema = z.object({
      id: z.string(),
      tipo: z.enum(['EJECUCION', 'CHECKLIST', 'EVIDENCIA', 'TAREA', 'COSTO']),
      operacion: z.enum(['CREATE', 'UPDATE', 'DELETE']),
      datos: z.record(z.string(), z.unknown()),
      timestamp: z.string(),
      ordenId: z.string().optional(),
      ejecucionId: z.string().optional(),
    });

    const LegacyBatchSchema = z.object({
      items: z.array(LegacyItemSchema).min(1),
    });

    const legacyParsed = LegacyBatchSchema.safeParse(body);
    if (legacyParsed.success) {
      return this.legacySyncService.syncPendingData(req.user.id, legacyParsed.data.items);
    }

    throw new BadRequestException({
      message: 'Datos de sincronización inválidos',
      ddd: dddParsed.error.flatten(),
      legacy: legacyParsed.error.flatten(),
    });
  }

  @Get('status')
  @ApiOperation({ summary: 'Obtener estado de la última sincronización (legacy)' })
  @ApiResponse({ status: 200, description: 'Estado de sincronización' })
  async status(@Req() req: any) {
    return this.legacySyncService.getLastSyncStatus(req.user.id);
  }

  @Get('ordenes-offline')
  @ApiOperation({ summary: 'Descargar órdenes para trabajo offline (legacy)' })
  @ApiResponse({ status: 200, description: 'Órdenes offline' })
  async ordenesOffline(@Req() req: any) {
    return this.legacySyncService.getOrdenesParaOffline(req.user.id);
  }

  /**
   * Obtener items pendientes de sincronización
   * @param req - Request con usuario autenticado
   * @returns Lista de items pendientes
   */
  @Get('pending')
  @ApiOperation({
    summary: 'Obtener pendientes de sincronización',
    description: 'Retorna los items que están pendientes o fallaron en sincronización.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de items pendientes',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          entityType: { type: 'string' },
          action: { type: 'string' },
          status: { type: 'string', enum: ['pending', 'failed'] },
          error: { type: 'string' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async pending(@Req() req: any) {
    return this.getPending.execute(req.user.id);
  }
}
