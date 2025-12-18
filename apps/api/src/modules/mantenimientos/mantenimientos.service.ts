
import { Injectable } from '@nestjs/common';
import { BaseService } from '../../common/base/base.service';
import { Mantenimiento } from './domain/entities/mantenimiento.entity';
import { MantenimientosRepository } from './infrastructure/persistence/mantenimiento.repository';

@Injectable()
export class MantenimientosService extends BaseService<Mantenimiento> {
  constructor(private readonly mantenimientosRepository: MantenimientosRepository) {
    super(mantenimientosRepository, 'Mantenimiento');
  }

  // Métodos específicos del negocio pueden ir aquí
  // Por defecto hereda create, findAll, findOne, update, remove de BaseService
}
