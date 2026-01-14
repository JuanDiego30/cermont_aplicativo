/**
 * @use-case FindAvailableTecnicosUseCase
 * @description Find all technicians available for assignment
 * @layer Application
 */
import { Injectable, Inject } from "@nestjs/common";
import {
  ITecnicoRepository,
  TECNICO_REPOSITORY,
} from "../../domain/repositories";

@Injectable()
export class FindAvailableTecnicosUseCase {
  constructor(
    @Inject(TECNICO_REPOSITORY)
    private readonly tecnicoRepository: ITecnicoRepository,
  ) {}

  async execute(): Promise<any[]> {
    const tecnicos = await this.tecnicoRepository.findAvailable();
    return tecnicos
      .filter((t) => t.isAvailableForAssignment)
      .map((t) => t.toJSON());
  }
}
