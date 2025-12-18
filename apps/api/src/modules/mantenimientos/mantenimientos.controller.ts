
import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BaseController } from '../../common/base/base.controller';
import { Mantenimiento } from './domain/entities/mantenimiento.entity';
import { MantenimientosService } from './mantenimientos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Mantenimientos')
@Controller('mantenimientos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MantenimientosController extends BaseController<Mantenimiento> {
    constructor(private readonly mantenimientosService: MantenimientosService) {
        super(mantenimientosService);
    }

    // Endpoints específicos pueden agregarse aquí
    // Hereda crud standard de BaseController
}
