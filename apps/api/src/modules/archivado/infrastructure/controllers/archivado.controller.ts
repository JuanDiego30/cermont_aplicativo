/**
 * @controller ArchivadoController
 * @description Controlador unificado de archivado con todas las funcionalidades
 */
import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import {
  ListArchivadasUseCase,
  ArchivarOrdenUseCase,
  DesarchivarOrdenUseCase,
} from '../../application/use-cases';
import { ArchivadoQuerySchema, ArchivarOrdenSchema } from '../../application/dto';
import { ArchivadoService } from '../../archivado.service';

@ApiTags('Archivado')
@Controller('archivado')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ArchivadoController {
  constructor(
    private readonly listArchivadas: ListArchivadasUseCase,
    private readonly archivarOrden: ArchivarOrdenUseCase,
    private readonly desarchivarOrden: DesarchivarOrdenUseCase,
    private readonly archivadoService: ArchivadoService,
  ) {}

  // =====================================================
  // ENDPOINTS DDD (Use Cases)
  // =====================================================

  @Get()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Listar órdenes archivadas' })
  async findAll(@Query() query: unknown) {
    const result = ArchivadoQuerySchema.safeParse(query);
    const filters = result.success ? result.data : { page: 1, limit: 20 };
    return this.listArchivadas.execute(filters);
  }

  @Post()
  @Roles('admin', 'supervisor')
  @ApiOperation({ summary: 'Archivar una orden' })
  async archivar(@Body() body: unknown, @Req() req: any) {
    const result = ArchivarOrdenSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.archivarOrden.execute({ ...result.data, archivedBy: req.user.id });
  }

  @Delete(':ordenId')
  @Roles('admin')
  @ApiOperation({ summary: 'Desarchivar una orden' })
  async desarchivar(@Param('ordenId') ordenId: string, @Req() req: any) {
    return this.desarchivarOrden.execute({ ordenId, unarchivedBy: req.user.id });
  }

  // =====================================================
  // ENDPOINTS ADICIONALES (Servicio directo)
  // =====================================================

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de archivado' })
  getEstadisticas() {
    return this.archivadoService.getEstadisticasArchivado();
  }

  @Get('archivos')
  @ApiOperation({ summary: 'Listar archivos históricos disponibles' })
  @ApiQuery({ name: 'anio', required: false })
  getArchivosHistoricos(@Query('anio') anio?: string) {
    return this.archivadoService.getArchivosHistoricos(
      anio ? parseInt(anio, 10) : undefined,
    );
  }

  @Get('descargar/:id')
  @ApiOperation({ summary: 'Descargar archivo histórico' })
  async descargarArchivo(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const archivo = await this.archivadoService.getArchivoParaDescarga(id);

    res.setHeader('Content-Type', archivo.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${archivo.fileName}"`,
    );

    res.sendFile(archivo.filePath);
  }

  @Post('archivar/:mes/:anio')
  @Roles('admin')
  @ApiOperation({ summary: 'Archivar órdenes de un mes específico manualmente' })
  archivarMes(
    @Param('mes') mes: string,
    @Param('anio') anio: string,
  ) {
    return this.archivadoService.archivarMes(
      parseInt(mes, 10),
      parseInt(anio, 10),
    );
  }

  @Post('archivar-ahora')
  @Roles('admin')
  @ApiOperation({ summary: 'Ejecutar archivado automático ahora' })
  archivarAhora() {
    return this.archivadoService.archivarOrdenesCompletadas();
  }

  @Post('zip-evidencias/:mes/:anio')
  @Roles('admin')
  @ApiOperation({ summary: 'Generar ZIP con evidencias de un mes' })
  generarZipEvidencias(
    @Param('mes') mes: string,
    @Param('anio') anio: string,
  ) {
    return this.archivadoService.generarZipEvidencias(
      parseInt(mes, 10),
      parseInt(anio, 10),
    );
  }
}
