import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ArchivarManualDto,
  ConsultarHistoricoDto,
  ConsultarHistoricoResponseDto,
  EstadisticasArchivoDto,
  ExportarHistoricoDto,
  OrdenArchivadaResponseDto,
  ResultadoArchivadoDto,
  ResultadoExportacionDto,
} from './application/dto/archivado-historico.dto';
import { ArchivingService } from './archiving.service';

@ApiTags('Archive History')
@Controller('archiving')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ArchivingController {
  constructor(private readonly archivingService: ArchivingService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get archive statistics' })
  @ApiResponse({ status: 200, type: EstadisticasArchivoDto })
  async getEstadisticas(): Promise<EstadisticasArchivoDto> {
    return this.archivingService.getEstadisticas();
  }

  @Post('archive-manual')
  @ApiOperation({ summary: 'Archive orders manually' })
  @ApiResponse({ status: 201, type: ResultadoArchivadoDto })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async archivarManual(@Body() dto: ArchivarManualDto): Promise<ResultadoArchivadoDto> {
    return this.archivingService.archivarManual(dto);
  }

  @Post('archive-auto')
  @ApiOperation({ summary: 'Run automatic archival (manual trigger)' })
  @ApiResponse({ status: 201, type: ResultadoArchivadoDto })
  async archivarAutomatico(): Promise<ResultadoArchivadoDto> {
    return this.archivingService.archivarAutomatico();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search archived orders' })
  @ApiQuery({ name: 'numeroOrden', required: false, type: String })
  @ApiQuery({ name: 'clienteId', required: false, type: String })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String })
  @ApiQuery({ name: 'pagina', required: false, type: Number })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  @ApiResponse({ status: 200, type: ConsultarHistoricoResponseDto })
  async consultarHistorico(
    @Query() query: ConsultarHistoricoDto
  ): Promise<ConsultarHistoricoResponseDto> {
    return this.archivingService.consultarHistorico(query);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export archive to CSV or ZIP' })
  @ApiResponse({ status: 201, type: ResultadoExportacionDto })
  @ApiResponse({ status: 404, description: 'No hay órdenes archivadas' })
  async exportarHistorico(@Body() dto: ExportarHistoricoDto): Promise<ResultadoExportacionDto> {
    return this.archivingService.exportarHistorico(dto);
  }

  @Post('restore/:orderId')
  @ApiOperation({ summary: 'Restore archived order (emergency)' })
  @ApiResponse({ status: 200, type: OrdenArchivadaResponseDto })
  @ApiParam({ name: 'orderId', type: 'string' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  async restaurarOrden(@Param('orderId') orderId: string): Promise<OrdenArchivadaResponseDto> {
    return this.archivingService.restaurarOrden(orderId);
  }
}
