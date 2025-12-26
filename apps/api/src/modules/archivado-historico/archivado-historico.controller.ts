import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ArchivadoHistoricoService } from './archivado-historico.service';
import {
    ArchivarManualDto,
    ExportarHistoricoDto,
    ConsultarHistoricoDto,
    ResultadoArchivadoDto,
    ResultadoExportacionDto,
    EstadisticasArchivoDto,
    OrdenArchivadaResponseDto,
} from './application/dto/archivado-historico.dto';

@ApiTags('Archivado Histórico')
@Controller('archivado-historico')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArchivadoHistoricoController {
    constructor(private readonly archivadoService: ArchivadoHistoricoService) { }

    @Get('estadisticas')
    @ApiOperation({ summary: 'Obtener estadísticas de archivo' })
    @ApiResponse({ status: 200, type: EstadisticasArchivoDto })
    async getEstadisticas(): Promise<EstadisticasArchivoDto> {
        return this.archivadoService.getEstadisticas();
    }

    @Post('archivar-manual')
    @ApiOperation({ summary: 'Archivar órdenes manualmente' })
    @ApiResponse({ status: 201, type: ResultadoArchivadoDto })
    async archivarManual(@Body() dto: ArchivarManualDto): Promise<ResultadoArchivadoDto> {
        return this.archivadoService.archivarManual(dto);
    }

    @Post('archivar-automatico')
    @ApiOperation({ summary: 'Ejecutar archivado automático (manual trigger)' })
    @ApiResponse({ status: 201, type: ResultadoArchivadoDto })
    async archivarAutomatico(): Promise<ResultadoArchivadoDto> {
        return this.archivadoService.archivarAutomatico();
    }

    @Get('consultar')
    @ApiOperation({ summary: 'Consultar órdenes archivadas' })
    async consultarHistorico(
        @Query('numeroOrden') numeroOrden?: string,
        @Query('clienteId') clienteId?: string,
        @Query('fechaDesde') fechaDesde?: string,
        @Query('fechaHasta') fechaHasta?: string,
        @Query('pagina') pagina?: number,
        @Query('limite') limite?: number,
    ) {
        return this.archivadoService.consultarHistorico({
            numeroOrden,
            clienteId,
            fechaDesde,
            fechaHasta,
            pagina,
            limite,
        });
    }

    @Post('exportar')
    @ApiOperation({ summary: 'Exportar histórico a CSV o ZIP' })
    @ApiResponse({ status: 201, type: ResultadoExportacionDto })
    async exportarHistorico(@Body() dto: ExportarHistoricoDto): Promise<ResultadoExportacionDto> {
        return this.archivadoService.exportarHistorico(dto);
    }

    @Post('restaurar/:ordenId')
    @ApiOperation({ summary: 'Restaurar orden archivada (emergencia)' })
    @ApiResponse({ status: 200, type: OrdenArchivadaResponseDto })
    async restaurarOrden(@Param('ordenId') ordenId: string): Promise<OrdenArchivadaResponseDto> {
        return this.archivadoService.restaurarOrden(ordenId);
    }
}
