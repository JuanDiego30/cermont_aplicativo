import { Module } from '@nestjs/common';
import { CostosController } from './infrastructure/controllers/costos.controller';
import { CostosService } from './costos.service';

@Module({
  controllers: [CostosController],
  providers: [CostosService],
  exports: [CostosService],
})
export class CostosModule { }
