/**
 * @controller SyncController
 * @description Controlador para sincronización offline
 */
import {
    Body,
    Controller,
    Get,
    Post,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import {
    CurrentUser,
    JwtPayload,
} from "../../../../shared/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { SyncBatchDto } from "../../application/dto";
import {
    GetPendingSyncUseCase,
    ProcessSyncBatchUseCase,
} from "../../application/use-cases";
import { SyncService } from "../../sync.service";

/**
 * Controller para sincronización de datos offline
 * Permite sincronizar cambios realizados sin conexión
 */
@ApiTags("Sync")
@Controller("sync")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("JWT-auth")
export class SyncController {
  constructor(
    private readonly processBatch: ProcessSyncBatchUseCase,
    private readonly getPending: GetPendingSyncUseCase,
    private readonly legacySyncService: SyncService,
  ) {}

  /**
   * Sincronizar batch de cambios offline
   * @param dto - Batch de items a sincronizar
   * @param user - Usuario autenticado
   * @returns Resultado de sincronización
   */
  @Post()
  @ApiOperation({
    summary: "Sync offline changes",
    description:
      "Procesa un batch de cambios realizados offline y los sincroniza con el servidor.",
  })
  @ApiBody({ type: SyncBatchDto })
  @ApiResponse({
    status: 201,
    description: "Sincronización completada",
    schema: {
      properties: {
        synced: {
          type: "array",
          items: {
            type: "object",
            properties: {
              localId: { type: "string" },
              serverId: { type: "string" },
              success: { type: "boolean" },
            },
          },
        },
        serverChanges: { type: "array" },
        syncTimestamp: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Datos de sincronización inválidos",
  })
  @ApiResponse({ status: 401, description: "No autenticado" })
  async sync(
    @Body() dto: SyncBatchDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.processBatch.execute(user.userId, dto);
  }

  @Get("status")
  @ApiOperation({
    summary: "Get last sync status",
  })
  @ApiResponse({ status: 200, description: "Estado de sincronización" })
  async status(@CurrentUser() user: JwtPayload) {
    return this.legacySyncService.getLastSyncStatus(user.userId);
  }

  @Get("orders-offline")
  @ApiOperation({ summary: "Download orders for offline work" })
  @ApiResponse({ status: 200, description: "Offline orders" })
  async ordersOffline(@CurrentUser() user: JwtPayload) {
    return this.legacySyncService.getOrdenesParaOffline(user.userId);
  }

  /**
   * Obtener items pendientes de sincronización
   * @param user - Usuario autenticado
   * @returns Lista de items pendientes
   */
  @Get("pending")
  @ApiOperation({
    summary: "Obtener pendientes de sincronización",
    description:
      "Retorna los items que están pendientes o fallaron en sincronización.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de items pendientes",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          entityType: { type: "string" },
          action: { type: "string" },
          status: { type: "string", enum: ["pending", "failed"] },
          error: { type: "string" },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "No autenticado" })
  async pending(@CurrentUser() user: JwtPayload) {
    return this.getPending.execute(user.userId);
  }
}

