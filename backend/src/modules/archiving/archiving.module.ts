/**
 * @module ArchivadoHistoricoModule
 * @description Sistema de archivado automático con DB dual + exportación
 *
 * Características:
 * - Archivado automático mensual (órdenes >30 días completadas y pagadas)
 * - Cron job (1er día de cada mes a las 2:00 AM)
 * - Exportación CSV por período
 * - Exportación ZIP (PDFs + evidencias + CSV)
 * - Portal de consulta históricos (solo admin)
 * - Restauración de emergencia
 */

import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { ArchivadoCronService } from "./archivado-cron.service";
import { ArchivingController } from "./archiving.controller";
import { ArchivingService } from "./archiving.service";

@Module({
  imports: [PrismaModule],
  controllers: [ArchivingController],
  providers: [ArchivingService, ArchivadoCronService],
  exports: [ArchivingService],
})
export class ArchivingModule {}
