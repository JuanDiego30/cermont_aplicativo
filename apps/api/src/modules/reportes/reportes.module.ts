import { Module } from '@nestjs/common';
import { ReportesController } from './infrastructure/controllers/reportes.controller';
import { ReportesService } from './reportes.service';
import { REPORTE_REPOSITORY } from './application/dto';
import { ReporteRepository } from './infrastructure/persistence';
import { GenerateReporteOrdenesUseCase, GetReporteOrdenDetalleUseCase } from './application/use-cases';
import { PrismaModule } from '../../prisma/prisma.module';

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
export class ReportesModule { }
