import { Module } from '@nestjs/common';
import { LineasVidaController } from './infrastructure/controllers/lineas-vida.controller';
import { LineasVidaService } from './lineas-vida.service';
import {
  ListLineasVidaUseCase,
  CreateLineaVidaUseCase,
  InspeccionarLineaVidaUseCase,
} from './application/use-cases';
import { LINEA_VIDA_REPOSITORY } from './application/dto';
import { PrismaLineaVidaRepository } from './infrastructure/persistence';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LineasVidaController],
  providers: [
    LineasVidaService,
    {
      provide: LINEA_VIDA_REPOSITORY,
      useClass: PrismaLineaVidaRepository,
    },
    ListLineasVidaUseCase,
    CreateLineaVidaUseCase,
    InspeccionarLineaVidaUseCase,
  ],
  exports: [LineasVidaService],
})
export class LineasVidaModule { }
