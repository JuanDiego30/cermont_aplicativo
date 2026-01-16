import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DashboardController } from './infrastructure/controllers/dashboard.controller';
import { DashboardService } from './dashboard.service';
import { KpiCalculatorService } from './services/kpi-calculator.service';
import { GetDashboardStatsUseCase } from './application/use-cases';
import { DASHBOARD_REPOSITORY } from './application/dto';
import { DashboardRepository } from './infrastructure/persistence/dashboard.repository';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [
    // Repository binding (Dependency Inversion)
    {
      provide: DASHBOARD_REPOSITORY,
      useClass: DashboardRepository,
    },
    // Services
    DashboardService,
    KpiCalculatorService,
    // Use Cases
    GetDashboardStatsUseCase,
  ],
  exports: [DashboardService, KpiCalculatorService, DASHBOARD_REPOSITORY, GetDashboardStatsUseCase],
})
export class DashboardModule {}
