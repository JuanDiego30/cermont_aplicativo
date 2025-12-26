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

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CertificacionesController } from './certificaciones.controller';
import { CertificacionesService } from './certificaciones.service';

@Module({
    imports: [PrismaModule],
    controllers: [CertificacionesController],
    providers: [CertificacionesService],
    exports: [CertificacionesService],
})
export class CertificacionesModule { }
