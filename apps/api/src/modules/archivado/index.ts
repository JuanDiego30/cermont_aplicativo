/**
 * @barrel Archivado Module Exports
 * 
 * Exportaciones del módulo de archivado histórico.
 */

// Services
export { ArchivadoService } from './archivado.service';

// DTOs
export {
    ArchivarMesDto,
    ListarArchivosQueryDto,
    GenerarZipDto,
    ArchivoHistoricoDto,
    ListarArchivosResponseDto,
    ArchivarResultadoDto,
    EstadisticasArchivadoDto,
    DescargaArchivoDto,
    TipoArchivo,
} from './dto/archivado.dto';

// Module
export { ArchivadoModule } from './archivado.module';
