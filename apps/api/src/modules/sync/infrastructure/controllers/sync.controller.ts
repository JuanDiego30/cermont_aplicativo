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
    const result = SyncBatchSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.processBatch.execute(req.user.id, result.data);
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
