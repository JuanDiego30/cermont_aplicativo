import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { COSTO_REPOSITORY } from './application/dto';
import {
  GetAnalisisCostosUseCase,
  ListCostosUseCase,
  RegistrarCostoUseCase,
} from './application/use-cases';
import { CostsService } from './costs.service';
import { CostsController } from './infrastructure/controllers/costs.controller';
import { CostoRepository } from './infrastructure/persistence';

@Module({
  imports: [PrismaModule],
  controllers: [CostsController],
  providers: [
    CostsService,
    {
      provide: COSTO_REPOSITORY,
      useClass: CostoRepository,
    },
    ListCostosUseCase,
    RegistrarCostoUseCase,
    GetAnalisisCostosUseCase,
  ],
  exports: [CostsService],
})
export class CostsModule {}
