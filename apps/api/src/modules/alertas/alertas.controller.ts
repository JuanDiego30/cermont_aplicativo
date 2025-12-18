/**
 * @controller AlertasController
 *
 * API REST para gestión de alertas automáticas.
 */
import {
    Controller,
    Get,
    Post,
    Param,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AlertasService } from './alertas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Alertas')
@Controller('alertas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AlertasController {
    constructor(private readonly alertasService: AlertasService) { }

    @Get('mis-alertas')
    @ApiOperation({ summary: 'Obtener alertas del usuario actual' })
    getMisAlertas(@CurrentUser() user: JwtPayload) {
        return this.alertasService.getAlertasUsuario(user.userId);
    }

    @Get('todas')
    @Roles('admin', 'administrativo')
    @ApiOperation({ summary: 'Obtener todas las alertas pendientes (admin)' })
    getTodasAlertas() {
        return this.alertasService.getTodasAlertasPendientes();
    }

    @Get('resumen')
    @Roles('admin', 'administrativo', 'supervisor')
    @ApiOperation({ summary: 'Obtener resumen de alertas para dashboard' })
    getResumen() {
        return this.alertasService.getResumenAlertas();
    }

    @Post(':id/leer')
    @ApiOperation({ summary: 'Marcar alerta como leída' })
    marcarLeida(@Param('id') id: string) {
        return this.alertasService.marcarLeida(id);
    }

    @Post(':id/resolver')
    @ApiOperation({ summary: 'Marcar alerta como resuelta' })
    marcarResuelta(@Param('id') id: string) {
        return this.alertasService.marcarResuelta(id);
    }

    @Post('ejecutar-verificacion')
    @Roles('admin')
    @ApiOperation({ summary: 'Ejecutar verificación manual de alertas' })
    async ejecutarVerificacion() {
        await this.alertasService.checkActasSinFirmar();
        await this.alertasService.checkSESPendientes();
        await this.alertasService.checkFacturasVencidas();
        return { message: 'Verificación de alertas ejecutada' };
    }
}
