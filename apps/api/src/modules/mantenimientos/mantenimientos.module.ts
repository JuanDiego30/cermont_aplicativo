
import { Module } from '@nestjs/common';
import { MantenimientosController } from './mantenimientos.controller';
import { MantenimientosService } from './mantenimientos.service';
import { MantenimientosRepository } from './infrastructure/persistence/mantenimiento.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [MantenimientosController],
    providers: [MantenimientosService, MantenimientosRepository],
    exports: [MantenimientosService],
})
export class MantenimientosModule { }
