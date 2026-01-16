/**
 * Use Case: GetHESUseCase
 *
 * Obtiene una HES por ID
 */

import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { HES } from '../../domain/entities/hes.entity';
import { HESId } from '../../domain/value-objects/hes-id.vo';
import { IHESRepository, HES_REPOSITORY } from '../../domain/repositories';

@Injectable()
export class GetHESUseCase {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository
  ) {}

  async execute(hesId: string): Promise<HES> {
    const id = HESId.create(hesId);
    const hes = await this.repository.findById(id);

    if (!hes) {
      throw new NotFoundException(`HES no encontrada: ${hesId}`);
    }

    return hes;
  }
}
