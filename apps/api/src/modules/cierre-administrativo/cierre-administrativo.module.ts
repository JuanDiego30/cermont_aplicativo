import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CierreAdministrativoController } from './infrastructure/controllers/cierre-administrativo.controller';
import { CierreAdministrativoService } from './cierre-administrativo.service';
import { CIERRE_REPOSITORY } from './application/dto';
import { CierreRepository } from './infrastructure/persistence';
import {
  CreateCierreUseCase,
  GetCierreByOrdenUseCase,
  AprobarCierreUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule, EventEmitterModule.forRoot()],
  controllers: [CierreAdministrativoController],
  providers: [
    // Repository binding
    {
      provide: CIERRE_REPOSITORY,
      useClass: CierreRepository,
    },
    // Use Cases
    CreateCierreUseCase,
    GetCierreByOrdenUseCase,
    AprobarCierreUseCase,
    // Service (Legacy support)
    CierreAdministrativoService,
  ],
  exports: [
    CierreAdministrativoService,
    CIERRE_REPOSITORY,
    CreateCierreUseCase,
    GetCierreByOrdenUseCase,
    AprobarCierreUseCase,
  ],
})
export class CierreAdministrativoModule { }

