import cron from 'node-cron';
import { ArchivingService } from '../../domain/services/ArchivingService.js';
import { logger } from '../../shared/utils/logger.js';

// Instanciación de dependencias (Composition Root para Cron Jobs)
// En un framework como NestJS esto sería automático, aquí lo hacemos manual.
const archivingService = new ArchivingService();

export const setupCronJobs = () => {
    logger.info('[Cron] Initializing cron jobs...');

    // Job 1: Archivado Mensual de Órdenes
    // Ejecutar el día 1 de cada mes a las 02:00 AM (para no chocar con backups de medianoche)
    cron.schedule('0 2 1 * *', async () => {
        logger.info('[Cron] Running monthly archiving job...');
        try {
            // Archivar órdenes con más de 30 días de antigüedad
            const count = await archivingService.runArchivingJob(30);
            logger.info(`[Cron] Archiving job completed. Archived: ${count}`);
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            logger.error(`[Cron] Error in monthly archiving job: ${msg}`);
        }
    });

    // Job 2: Limpieza de Tokens (Ejemplo)
    // cron.schedule('0 3 * * *', async () => { ... });

    logger.info('[Cron] Jobs scheduled: Monthly Archiving (0 2 1 * *)');
};

