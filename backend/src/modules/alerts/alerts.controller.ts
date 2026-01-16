import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { EnviarAlertaDto } from './dto';

@ApiTags('Alertas')
@Controller('alertas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AlertasController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar una nueva alerta' })
  async enviarAlerta(@Body() dto: EnviarAlertaDto) {
    return this.alertsService.enviarAlerta(dto);
  }

  @Get('historial')
  @ApiOperation({ summary: 'Obtener historial de alertas del usuario actual' })
  async obtenerHistorial(
    @CurrentUser() user: any,
    @Query('leida') leida?: boolean,
    @Query('tipo') tipo?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.alertsService.obtenerHistorial(user.id, { leida, tipo, limit, offset });
  }

  @Patch(':id/leer')
  @ApiOperation({ summary: 'Marcar alerta como leída' })
  async marcarComoLeida(@Param('id') id: string, @CurrentUser() user: any) {
    return this.alertsService.marcarComoLeida(id, user.id);
  }
}
