import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { REPORTE_REPOSITORY } from './application/dto';
import {
  GenerateReporteOrdenesUseCase,
  GetReporteOrdenDetalleUseCase,
} from './application/use-cases';
import { ReportsController } from './infrastructure/controllers';
import { ReporteRepository } from './infrastructure/persistence';
import { ReportesService } from './reportes.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
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
