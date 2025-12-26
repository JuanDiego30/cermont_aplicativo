import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArchivadoHistoricoService } from './archivado-historico.service';

/**
 * Cron Service para archivado automático
 * Ejecuta el 1er día de cada mes a las 2:00 AM
 */
@Injectable()
export class ArchivadoCronService {
    private readonly logger = new Logger(ArchivadoCronService.name);

    constructor(private readonly archivadoService: ArchivadoHistoricoService) { }

    /**
     * Archivado automático mensual
     * Cron: 0 2 1 * * (2:00 AM, día 1 de cada mes)
     */
    @Cron('0 2 1 * *')
    async handleArchivoMensual() {
        this.logger.log('Iniciando archivado automático mensual...');

        try {
            const resultado = await this.archivadoService.archivarAutomatico();

            this.logger.log(`Archivado completado:`, {
                ordenesArchivadas: resultado.ordenesArchivadas,
                ordenesOmitidas: resultado.ordenesOmitidas,
                errores: resultado.errores.length,
            });
        } catch (error) {
            this.logger.error('Error en archivado automático:', error);
        }
    }

    /**
     * Verificación semanal de órdenes pendientes de archivar
     * Cron: 0 8 * * MON (8:00 AM cada lunes)
     */
    @Cron('0 8 * * MON')
    async verificarPendientes() {
        this.logger.log('Verificando órdenes pendientes de archivar...');

        try {
            const estadisticas = await this.archivadoService.getEstadisticas();

            this.logger.log(`Estadísticas de archivo:`, {
                activas: estadisticas.totalOrdenesActivas,
                archivadas: estadisticas.totalOrdenesArchivadas,
                espacioMB: estadisticas.espacioUtilizadoMB,
            });
        } catch (error) {
            this.logger.error('Error verificando pendientes:', error);
        }
    }
}
