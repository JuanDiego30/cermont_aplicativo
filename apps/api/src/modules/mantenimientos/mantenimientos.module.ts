import { Module } from '@nestjs/common';

import { MantenimientosController } from './infrastructure/controllers/mantenimientos.controller';
import {
	CreateMantenimientoUseCase,
	EjecutarMantenimientoUseCase,
	GetProximosMantenimientosUseCase,
	ListMantenimientosUseCase,
} from './application/use-cases';
import { MANTENIMIENTO_REPOSITORY } from './application/dto';
import { MantenimientoRepository } from './infrastructure/persistence/mantenimiento.repository';

@Module({
	controllers: [MantenimientosController],
	providers: [
		// Repository
		{
			provide: MANTENIMIENTO_REPOSITORY,
			useClass: MantenimientoRepository,
		},
		MantenimientoRepository,

		// Use cases
		ListMantenimientosUseCase,
		CreateMantenimientoUseCase,
		EjecutarMantenimientoUseCase,
		GetProximosMantenimientosUseCase,
	],
})
export class MantenimientosModule {}
