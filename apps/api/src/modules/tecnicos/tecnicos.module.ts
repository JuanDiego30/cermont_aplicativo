/**
 * @module TecnicosModule
 * @description NestJS module with Clean Architecture wiring
 * @layer Infrastructure
 */
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';

// Domain
import { TECNICO_REPOSITORY } from './domain/repositories';

// Application - Use Cases
import {
    ListTecnicosUseCase,
    GetTecnicoByIdUseCase,
    ChangeDisponibilidadUseCase,
    FindAvailableTecnicosUseCase,
} from './application/use-cases';

// Infrastructure
import { PrismaTecnicoRepository } from './infrastructure/persistence';
import { TecnicosController } from './infrastructure/controllers/tecnicos.controller';

@Module({
    imports: [PrismaModule],
    controllers: [TecnicosController],
    providers: [
        // Repository binding (Dependency Inversion)
        {
            provide: TECNICO_REPOSITORY,
            useClass: PrismaTecnicoRepository,
        },
        // Use Cases
        ListTecnicosUseCase,
        GetTecnicoByIdUseCase,
        ChangeDisponibilidadUseCase,
        FindAvailableTecnicosUseCase,
    ],
    exports: [
        TECNICO_REPOSITORY,
        ListTecnicosUseCase,
        GetTecnicoByIdUseCase,
        FindAvailableTecnicosUseCase,
    ],
})
export class TecnicosModule { }
