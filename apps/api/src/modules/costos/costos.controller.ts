import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CostosService } from './costos.service';
import type { CostAnalysis } from './costos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Costos')
@Controller('costos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CostosController {
    constructor(private readonly costosService: CostosService) { }

    // *** Endpoints de Dashboard ***

    @Get('dashboard')
    @ApiOperation({ summary: 'Dashboard de costos con métricas y alertas' })
    getCostDashboard(): Promise<unknown> {
        return this.costosService.getCostDashboard();
    }

    @Get('reporte')
    @ApiOperation({ summary: 'Reporte de costos con filtro de fechas' })
    @ApiQuery({ name: 'startDate', required: false })
    @ApiQuery({ name: 'endDate', required: false })
    getCostReport(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<unknown> {
        const dateRange =
            startDate && endDate
                ? { start: new Date(startDate), end: new Date(endDate) }
                : undefined;

        return this.costosService.getCostReport(dateRange);
    }

    // *** Endpoints de Análisis por Orden ***

    @Get('analisis/:ordenId')
    @ApiOperation({ summary: 'Análisis de costos real vs presupuestado para una orden' })
    getCostAnalysis(@Param('ordenId') ordenId: string): Promise<CostAnalysis> {
        return this.costosService.getCostAnalysis(ordenId);
    }

    @Post('tracking/:ordenId')
    @ApiOperation({ summary: 'Crear registro de costos completo para una orden' })
    createCostTracking(
        @Param('ordenId') ordenId: string,
        @Body() dto: {
            manoDeObra?: number;
            materiales?: number;
            equipos?: number;
            transporte?: number;
            descripcion?: string;
        },
    ): Promise<{ message: string; costosCreados: number; analysis: CostAnalysis }> {
        return this.costosService.createCostTracking(ordenId, dto);
    }

    // *** Endpoints CRUD básicos ***

    @Get('orden/:ordenId')
    @ApiOperation({ summary: 'Obtener costos de una orden' })
    findByOrden(@Param('ordenId') ordenId: string) {
        return this.costosService.findByOrden(ordenId);
    }

    @Post()
    @ApiOperation({ summary: 'Agregar un costo individual' })
    create(
        @Body() dto: {
            ordenId: string;
            concepto: string;
            monto: number;
            tipo: string;
            descripcion?: string;
        },
    ) {
        return this.costosService.create(dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar un costo' })
    update(@Param('id') id: string, @Body() dto: any) {
        return this.costosService.update(id, dto);
    }

    @Delete(':id')
    @Roles('admin', 'supervisor')
    @ApiOperation({ summary: 'Eliminar un costo' })
    remove(@Param('id') id: string) {
        return this.costosService.remove(id);
    }
}
