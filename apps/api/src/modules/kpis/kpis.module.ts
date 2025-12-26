import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { KpisController } from './infrastructure/controllers';
import {
    GetOrdenesKpisUseCase,
    GetTecnicosKpisUseCase,
    GetFinancialKpisUseCase,
    GetDashboardKpisUseCase,
} from './application/use-cases';

@Module({
    imports: [PrismaModule],
    controllers: [KpisController],
    providers: [
        // Use Cases
        GetOrdenesKpisUseCase,
        GetTecnicosKpisUseCase,
        GetFinancialKpisUseCase,
        GetDashboardKpisUseCase,
    ],
    exports: [
        GetOrdenesKpisUseCase,
        GetTecnicosKpisUseCase,
        GetFinancialKpisUseCase,
        GetDashboardKpisUseCase,
    ],
})
export class KpisModule { }
