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
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "../../prisma/prisma.module";
import { ArchivadoHistoricoController } from "./archivado-historico.controller";
import { ArchivadoHistoricoService } from "./archivado-historico.service";
import { ArchivadoCronService } from "./archivado-cron.service";

@Module({
  imports: [PrismaModule],
  controllers: [ArchivadoHistoricoController],
  providers: [ArchivadoHistoricoService, ArchivadoCronService],
  exports: [ArchivadoHistoricoService],
})
export class ArchivadoHistoricoModule {}
