import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { EnviarAlertaDto } from './dto';

@ApiTags('Alerts')
@Controller('alerts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a new alert' })
  async enviarAlerta(@Body() dto: EnviarAlertaDto) {
    return this.alertsService.enviarAlerta(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get alert history for current user' })
  async obtenerHistorial(
    @CurrentUser() user: any,
    @Query('leida') leida?: boolean,
    @Query('tipo') tipo?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.alertsService.obtenerHistorial(user.id, { leida, tipo, limit, offset });
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark alert as read' })
  async marcarComoLeida(@Param('id') id: string, @CurrentUser() user: any) {
    return this.alertsService.marcarComoLeida(id, user.id);
  }
}
