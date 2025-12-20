/**
 * @controller KpisController
 *
 * API REST para obtener KPIs y métricas del dashboard.
 */
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KpisService } from '../../kpis.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@ApiTags('KPIs')
@Controller('kpis')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KpisController {
    constructor(private readonly kpisService: KpisService) { }

    @Get('dashboard')
    @Roles('admin', 'supervisor', 'administrativo')
    @ApiOperation({ summary: 'Obtener KPIs principales del dashboard' })
    getDashboardKPIs() {
        return this.kpisService.getDashboardKPIs();
    }

    @Get('orden/:ordenId')
    @ApiOperation({ summary: 'Obtener KPIs de una orden específica' })
    getOrdenKPIs(@Param('ordenId') ordenId: string) {
        return this.kpisService.getOrdenKPIs(ordenId);
    }
}
