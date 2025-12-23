/**
 * Domain Service: HESNumeroGeneratorService
 * 
 * Genera números únicos de HES en formato HES-YYYY-0001
 */

import { Injectable, Inject } from '@nestjs/common';
import { HESNumero } from '../value-objects/hes-numero.vo';
import { IHESRepository, HES_REPOSITORY } from '../repositories/hes.repository.interface';

@Injectable()
export class HESNumeroGeneratorService {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repository: IHESRepository,
  ) {}

  async generateNext(year: number): Promise<HESNumero> {
    const lastNumber = await this.repository.findLastNumberByYear(year);

    let sequence = 1;
    if (lastNumber) {
      sequence = lastNumber.getSequence() + 1;
    }

    return HESNumero.generate(year, sequence);
  }

  async exists(numero: HESNumero): Promise<boolean> {
    return this.repository.existsByNumero(numero.getValue());
  }
}
