/**
 * @module DashboardModule (Refactored)
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DASHBOARD_REPOSITORY } from './application/dto';
import { DashboardRepository } from './infrastructure/persistence';
import { DashboardController } from './infrastructure/controllers';
import { GetDashboardStatsUseCase } from './application/use-cases';

@Module({
  imports: [PrismaModule],
  controllers: [DashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    GetDashboardStatsUseCase,
  ],
  exports: [DASHBOARD_REPOSITORY],
})
export class DashboardModuleRefactored {}
