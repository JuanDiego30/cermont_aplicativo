/**
 * @useCase GetAnalisisCostosUseCase
 */
import { Injectable, Inject } from "@nestjs/common";
import { COSTO_REPOSITORY, ICostoRepository, CostoAnalysis } from "../dto";

@Injectable()
export class GetAnalisisCostosUseCase {
  constructor(
    @Inject(COSTO_REPOSITORY)
    private readonly repo: ICostoRepository,
  ) {}

  async execute(ordenId: string): Promise<CostoAnalysis> {
    return this.repo.getAnalisis(ordenId);
  }
}
