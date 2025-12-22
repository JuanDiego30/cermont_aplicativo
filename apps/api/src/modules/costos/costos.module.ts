import { Module } from '@nestjs/common';
import { CostosController } from './infrastructure/controllers/costos.controller';
import { CostosService } from './costos.service';
import { COSTO_REPOSITORY } from './application/dto';
import { CostoRepository } from './infrastructure/persistence';
import { ListCostosUseCase, RegistrarCostoUseCase, GetAnalisisCostosUseCase } from './application/use-cases';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CostosController],
  providers: [
    CostosService,
    {
      provide: COSTO_REPOSITORY,
      useClass: CostoRepository,
    },
    ListCostosUseCase,
    RegistrarCostoUseCase,
    GetAnalisisCostosUseCase,
  ],
  exports: [CostosService],
})
export class CostosModule { }
