import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ArchivadoService } from './archivado.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Archivado')
@Controller('archivado')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ArchivadoController {
    constructor(private readonly archivadoService: ArchivadoService) { }

    // *** Estadísticas y Dashboard ***

    @Get('estadisticas')
    @ApiOperation({ summary: 'Obtener estadísticas de archivado' })
    getEstadisticas() {
        return this.archivadoService.getEstadisticasArchivado();
    }

    // *** Listado de Archivos Históricos ***

    @Get('archivos')
    @ApiOperation({ summary: 'Listar archivos históricos disponibles' })
    @ApiQuery({ name: 'anio', required: false })
    getArchivosHistoricos(@Query('anio') anio?: string) {
        return this.archivadoService.getArchivosHistoricos(
            anio ? parseInt(anio, 10) : undefined,
        );
    }

    // *** Descarga de Archivos ***

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

    // *** Archivado Manual ***

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

    // *** Generación de ZIPs ***

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
