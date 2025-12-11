import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Reportes')
@Controller('reportes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportesController {
    constructor(private readonly reportesService: ReportesService) { }
    @Get('ordenes') reporteOrdenes(@Query('desde') desde?: string, @Query('hasta') hasta?: string) { return this.reportesService.reporteOrdenes(desde, hasta); }
    @Get('orden/:id') reporteOrden(@Param('id') id: string) { return this.reportesService.reporteOrden(id); }
}
