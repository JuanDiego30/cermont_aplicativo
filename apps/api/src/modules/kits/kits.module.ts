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
import { KIT_REPOSITORY } from './application/dto';
import { KitRepository } from './infrastructure/persistence';
import { ListKitsUseCase, CreateKitUseCase } from './application/use-cases';

@Module({
    imports: [PrismaModule],
    controllers: [KitsController],
    providers: [
        KitsService,
        {
            provide: KIT_REPOSITORY,
            useClass: KitRepository,
        },
        ListKitsUseCase,
        CreateKitUseCase,
    ],
    exports: [KitsService],
})
export class KitsModule { }
