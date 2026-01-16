import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import type { SyncResult } from './sync.service';
import { PendingSync, SyncService } from './sync.service';

interface AuthRequest extends Request {
  user: { id: string; role: string };
}

@ApiTags('Sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post()
  @ApiOperation({
    summary: 'Sync pending data from offline device',
    description: 'Recibe un array de operaciones pendientes y las procesa secuencialmente',
  })
  async syncPendingData(
    @Body() body: { items: PendingSync[] },
    @Req() req: AuthRequest
  ): Promise<SyncResult[]> {
    return this.syncService.syncPendingData(req.user.id, body.items);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get last sync status' })
  async getLastSyncStatus(@Req() req: AuthRequest): Promise<unknown> {
    return this.syncService.getLastSyncStatus(req.user.id);
  }

  @Get('orders-offline')
  @ApiOperation({
    summary: 'Download orders for offline work',
    description: 'Gets orders assigned to the user with all information needed to work offline',
  })
  async getOrdersForOffline(@Req() req: AuthRequest): Promise<unknown> {
    return this.syncService.getOrdenesParaOffline(req.user.id);
  }
}
