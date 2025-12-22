import { Module } from '@nestjs/common';
import { MantenimientosController } from './infrastructure/controllers/mantenimientos.controller';
import { MantenimientosService } from './mantenimientos.service';
import { MantenimientosRepository, PrismaMantenimientoRepository } from './infrastructure/persistence';
import { MANTENIMIENTO_REPOSITORY } from './application/dto';
import {
    ListMantenimientosUseCase,
    CreateMantenimientoUseCase,
    EjecutarMantenimientoUseCase,
    GetProximosMantenimientosUseCase,
} from './application/use-cases';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MantenimientosController],
    providers: [
        MantenimientosService,
        MantenimientosRepository,
        {
            provide: MANTENIMIENTO_REPOSITORY,
            useClass: PrismaMantenimientoRepository,
        },
        ListMantenimientosUseCase,
        CreateMantenimientoUseCase,
        EjecutarMantenimientoUseCase,
        GetProximosMantenimientosUseCase,
    ],
    exports: [MantenimientosService],
})
export class MantenimientosModule { }
