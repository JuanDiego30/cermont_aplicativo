import { Module } from '@nestjs/common';
import { HESController } from './infrastructure/controllers/hes.controller';
import { HesService } from './hes.service';
import { HES_REPOSITORY } from './application/dto';
import { HESRepository } from './infrastructure/persistence';
import { ListHESUseCase, CreateHESUseCase } from './application/use-cases';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HESController],
  providers: [
    HesService,
    {
      provide: HES_REPOSITORY,
      useClass: HESRepository,
    },
    ListHESUseCase,
    CreateHESUseCase,
  ],
  exports: [HesService],
})
export class HesModule { }
