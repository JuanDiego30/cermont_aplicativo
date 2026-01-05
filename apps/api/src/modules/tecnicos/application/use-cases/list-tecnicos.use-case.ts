/**
 * @use-case ListTecnicosUseCase
 * @description List all technicians with optional filters
 * @layer Application
 */
import { Injectable, Inject } from "@nestjs/common";
import {
  ITecnicoRepository,
  TECNICO_REPOSITORY,
  TecnicoFilters,
} from "../../domain/repositories";

@Injectable()
export class ListTecnicosUseCase {
  constructor(
    @Inject(TECNICO_REPOSITORY)
    private readonly tecnicoRepository: ITecnicoRepository,
  ) {}

  async execute(filters?: TecnicoFilters): Promise<{
    data: any[];
    total: number;
  }> {
    const [tecnicos, total] = await Promise.all([
      this.tecnicoRepository.findAll(filters),
      this.tecnicoRepository.count(filters),
    ]);

    return {
      data: tecnicos.map((t) => t.toJSON()),
      total,
    };
  }
}
