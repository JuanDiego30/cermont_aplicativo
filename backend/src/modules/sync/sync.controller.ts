import { Controller, Get, Post, Body, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { SyncService, PendingSync } from "./sync.service";
import type { SyncResult } from "./sync.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Request } from "express";

interface AuthRequest extends Request {
  user: { id: string; role: string };
}

@ApiTags("Sync")
@Controller("sync")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @ApiOperation({
    summary: "Sincronizar datos pendientes desde dispositivo offline",
    description:
      "Recibe un array de operaciones pendientes y las procesa secuencialmente",
  })
  async syncPendingData(
    @Body() body: { items: PendingSync[] },
    @Req() req: AuthRequest,
  ): Promise<SyncResult[]> {
    return this.syncService.syncPendingData(req.user.id, body.items);
  }

  @Get("status")
  @ApiOperation({ summary: "Obtener estado de la última sincronización" })
  async getLastSyncStatus(@Req() req: AuthRequest): Promise<unknown> {
    return this.syncService.getLastSyncStatus(req.user.id);
  }

  @Get("ordenes-offline")
  @ApiOperation({
    summary: "Descargar órdenes para trabajo offline",
    description:
      "Obtiene las órdenes asignadas al usuario con toda la información necesaria para trabajar sin conexión",
  })
  async getOrdenesParaOffline(@Req() req: AuthRequest): Promise<unknown> {
    return this.syncService.getOrdenesParaOffline(req.user.id);
  }
}
