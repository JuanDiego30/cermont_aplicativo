/**
 * @useCase ListCostosUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { COSTO_REPOSITORY, ICostoRepository, CostoQueryDto, CostoResponse } from '../dto';

@Injectable()
export class ListCostosUseCase {
  constructor(
    @Inject(COSTO_REPOSITORY)
    private readonly repo: ICostoRepository
  ) {}

  async execute(filters: CostoQueryDto): Promise<CostoResponse[]> {
    const costos = filters.ordenId
      ? await this.repo.findByOrden(filters.ordenId)
      : await this.repo.findAll(filters);

    return costos.map(c => ({
      id: c.id,
      ordenId: c.ordenId,
      tipo: c.tipo,
      descripcion: c.descripcion,
      cantidad: c.cantidad,
      precioUnitario: c.precioUnitario,
      total: c.total,
      proveedor: c.proveedor,
      createdAt: c.createdAt.toISOString(),
    }));
  }
}
