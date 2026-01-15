import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ArchivadoHistoricoService } from "./archivado-historico.service";
import {
  ArchivarManualDto,
  ExportarHistoricoDto,
  ConsultarHistoricoDto,
  ConsultarHistoricoResponseDto,
  ResultadoArchivadoDto,
  ResultadoExportacionDto,
  EstadisticasArchivoDto,
  OrdenArchivadaResponseDto,
} from "./application/dto/archivado-historico.dto";

@ApiTags("Archivado Histórico")
@Controller("archivado-historico")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ArchivadoHistoricoController {
  constructor(private readonly archivadoService: ArchivadoHistoricoService) {}

  @Get("estadisticas")
  @ApiOperation({ summary: "Obtener estadísticas de archivo" })
  @ApiResponse({ status: 200, type: EstadisticasArchivoDto })
  async getEstadisticas(): Promise<EstadisticasArchivoDto> {
    return this.archivadoService.getEstadisticas();
  }

  @Post("archivar-manual")
  @ApiOperation({ summary: "Archivar órdenes manualmente" })
  @ApiResponse({ status: 201, type: ResultadoArchivadoDto })
  @ApiResponse({ status: 404, description: "Orden no encontrada" })
  async archivarManual(
    @Body() dto: ArchivarManualDto,
  ): Promise<ResultadoArchivadoDto> {
    return this.archivadoService.archivarManual(dto);
  }

  @Post("archivar-automatico")
  @ApiOperation({ summary: "Ejecutar archivado automático (manual trigger)" })
  @ApiResponse({ status: 201, type: ResultadoArchivadoDto })
  async archivarAutomatico(): Promise<ResultadoArchivadoDto> {
    return this.archivadoService.archivarAutomatico();
  }

  @Get("consultar")
  @ApiOperation({ summary: "Consultar órdenes archivadas" })
  @ApiQuery({ name: "numeroOrden", required: false, type: String })
  @ApiQuery({ name: "clienteId", required: false, type: String })
  @ApiQuery({ name: "fechaDesde", required: false, type: String })
  @ApiQuery({ name: "fechaHasta", required: false, type: String })
  @ApiQuery({ name: "pagina", required: false, type: Number })
  @ApiQuery({ name: "limite", required: false, type: Number })
  @ApiResponse({ status: 200, type: ConsultarHistoricoResponseDto })
  async consultarHistorico(
    @Query() query: ConsultarHistoricoDto,
  ): Promise<ConsultarHistoricoResponseDto> {
    return this.archivadoService.consultarHistorico(query);
  }

  @Post("exportar")
  @ApiOperation({ summary: "Exportar histórico a CSV o ZIP" })
  @ApiResponse({ status: 201, type: ResultadoExportacionDto })
  @ApiResponse({ status: 404, description: "No hay órdenes archivadas" })
  async exportarHistorico(
    @Body() dto: ExportarHistoricoDto,
  ): Promise<ResultadoExportacionDto> {
    return this.archivadoService.exportarHistorico(dto);
  }

  @Post("restaurar/:ordenId")
  @ApiOperation({ summary: "Restaurar orden archivada (emergencia)" })
  @ApiResponse({ status: 200, type: OrdenArchivadaResponseDto })
  @ApiParam({ name: "ordenId", type: "string" })
  @ApiResponse({ status: 404, description: "Orden no encontrada" })
  async restaurarOrden(
    @Param("ordenId") ordenId: string,
  ): Promise<OrdenArchivadaResponseDto> {
    return this.archivadoService.restaurarOrden(ordenId);
  }
}
