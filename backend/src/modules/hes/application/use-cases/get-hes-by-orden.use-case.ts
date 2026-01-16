/**
 * Use Case: GetHESByOrdenUseCase
 *
 * Obtiene la HES asociada a una orden (relación 1:1)
 */

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { HES } from '../../domain/entities/hes.entity';
import { IHESRepository, HES_REPOSITORY } from '../../domain/repositories';

@Injectable()
export class GetHESByOrdenUseCase {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository
  ) {}

  async execute(ordenId: string): Promise<HES> {
    const hes = await this.repository.findByOrden(ordenId);

    if (!hes) {
      throw new NotFoundException(`No se encontró HES para la orden: ${ordenId}`);
    }

    return hes;
  }
}
