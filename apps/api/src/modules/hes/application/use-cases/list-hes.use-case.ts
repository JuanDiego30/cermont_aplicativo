/**
 * Use Case: ListHESUseCase
 * 
 * Lista HES con filtros opcionales
 */

import { Injectable, Inject } from '@nestjs/common';
import { HES } from '../../domain/entities/hes.entity';
import { IHESRepository, HES_REPOSITORY } from '../../domain/repositories';
import { ListHESQueryDto } from '../dto/list-hes-query.dto';

@Injectable()
export class ListHESUseCase {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository,
  ) {}

  async execute(query: ListHESQueryDto): Promise<HES[]> {
    const filters: any = {};

    if (query.estado) {
      filters.estado = query.estado;
    }

    if (query.tipoServicio) {
      filters.tipoServicio = query.tipoServicio;
    }

    if (query.ordenId) {
      filters.ordenId = query.ordenId;
    }

    if (query.fechaDesde) {
      filters.fechaDesde = new Date(query.fechaDesde);
    }

    if (query.fechaHasta) {
      filters.fechaHasta = new Date(query.fechaHasta);
    }

    return this.repository.findAll(filters);
  }
}
