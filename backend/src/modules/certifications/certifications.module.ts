/**
 * @module CertificacionesModule
 * @description Módulo de gestión de certificaciones de técnicos y equipos
 *
 * Características:
 * - Registro de certificaciones con validación de fechas
 * - Cálculo automático de estado de vigencia
 * - Alertas de vencimiento (30, 15, 7 días)
 * - Validación de certificaciones para asignación a órdenes
 * - Integración con módulo de planeación
 */

import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { CertificationsController } from "./certifications.controller";
import { CertificationsService } from "./certifications.service";

@Module({
  imports: [PrismaModule],
  controllers: [CertificationsController],
  providers: [CertificationsService],
  exports: [CertificationsService],
})
export class CertificationsModule {}
