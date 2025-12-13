/**
 * @module ReportesModule (Refactored)
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { REPORTE_REPOSITORY } from './application/dto';
import { ReporteRepository } from './infrastructure/persistence';
import { ReportesController } from './infrastructure/controllers';
import {
  GenerateReporteOrdenesUseCase,
  GetReporteOrdenDetalleUseCase,
} from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [ReportesController],
  providers: [
    { provide: REPORTE_REPOSITORY, useClass: ReporteRepository },
    GenerateReporteOrdenesUseCase,
    GetReporteOrdenDetalleUseCase,
  ],
  exports: [REPORTE_REPOSITORY],
})
export class ReportesModuleRefactored {}
