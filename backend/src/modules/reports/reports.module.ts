import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { REPORTE_REPOSITORY } from './application/dto';
import {
  GenerateReporteOrdenesUseCase,
  GetReporteOrdenDetalleUseCase,
} from './application/use-cases';
import { ReportesController } from './infrastructure/controllers/reportes.controller';
import { ReporteRepository } from './infrastructure/persistence';
import { ReportesService } from './reportes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportesController],
  providers: [
    ReportesService,
    {
      provide: REPORTE_REPOSITORY,
      useClass: ReporteRepository,
    },
    GenerateReporteOrdenesUseCase,
    GetReporteOrdenDetalleUseCase,
  ],
  exports: [ReportesService],
})
export class ReportsModule {}
