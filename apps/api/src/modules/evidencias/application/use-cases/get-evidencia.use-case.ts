/**
 * @useCase GetEvidenciaUseCase
 * @description Retrieves a single evidencia by ID
 */

import { Injectable, Inject, Logger, NotFoundException } from "@nestjs/common";
import {
  IEvidenciaRepository,
  EVIDENCIA_REPOSITORY,
} from "../../domain/repositories";
import { EvidenciaMapper } from "../mappers";
import { EvidenciaResponse } from "../dto";

@Injectable()
export class GetEvidenciaUseCase {
  private readonly logger = new Logger(GetEvidenciaUseCase.name);

  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repository: IEvidenciaRepository,
  ) {}

  async execute(id: string): Promise<EvidenciaResponse> {
    this.logger.log(`Getting evidencia: ${id}`);

    const evidencia = await this.repository.findById(id);

    if (!evidencia) {
      this.logger.warn(`Evidencia not found: ${id}`);
      throw new NotFoundException(`Evidencia ${id} not found`);
    }

    return EvidenciaMapper.toResponse(evidencia);
  }
}
