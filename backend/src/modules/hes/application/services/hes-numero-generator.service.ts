/**
 * Application Service: HESNumeroGeneratorService
 *
 * Genera números únicos de HES en formato HES-YYYY-0001
 * Moved to application layer because it uses NestJS DI decorators
 */

import { Inject, Injectable } from "@nestjs/common";
import {
    HES_REPOSITORY,
    IHESRepository,
} from "../../domain/repositories/hes.repository.interface";
import { HESNumero } from "../../domain/value-objects/hes-numero.vo";

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
