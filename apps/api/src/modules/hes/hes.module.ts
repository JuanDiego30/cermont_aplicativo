import { Module } from '@nestjs/common';
import { HESController } from './infrastructure/controllers/hes.controller';
import { HesService } from './hes.service';

@Module({
  controllers: [HESController],
  providers: [HesService],
  exports: [HesService],
})
export class HesModule { }
