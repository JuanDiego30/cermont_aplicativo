import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { KpiCalculatorService } from './services/kpi-calculator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DashboardController],
    providers: [DashboardService, KpiCalculatorService],
    exports: [DashboardService, KpiCalculatorService],
})
export class DashboardModule {}
