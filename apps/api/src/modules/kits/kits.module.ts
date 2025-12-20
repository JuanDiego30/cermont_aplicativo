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
import { PrismaModule } from '../../prisma/prisma.module';
import { KitsController } from './infrastructure/controllers/kits.controller';
import { KitsService } from './kits.service';

@Module({
    imports: [PrismaModule],
    controllers: [KitsController],
    providers: [KitsService],
    exports: [KitsService],
})
export class KitsModule { }
