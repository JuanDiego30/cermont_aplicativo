/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KITS MODULE - CERMONT APLICATIVO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Módulo NestJS que encapsula la funcionalidad de Kits Típicos.
 * Exporta KitsService para uso en PlaneacionModule y EjecucionModule.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { Module } from '@nestjs/common';
import { KitsController } from './kits.controller';
import { KitsService } from './kits.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [KitsController],
    providers: [KitsService, PrismaService],
    exports: [KitsService],
})
export class KitsModule { }
