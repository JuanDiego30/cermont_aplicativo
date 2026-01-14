/**
 * @useCase GetEjecucionUseCase
 * Retrieves an execution by order ID and maps to response DTO.
 */
import { Injectable, Inject } from "@nestjs/common";
import {
  EJECUCION_REPOSITORY,
  IEjecucionRepository,
} from "../../domain/repositories";
import { EjecucionResponse } from "../dto";

@Injectable()
export class GetEjecucionUseCase {
  constructor(
    @Inject(EJECUCION_REPOSITORY)
    private readonly repo: IEjecucionRepository,
  ) {}

  async execute(ordenId: string): Promise<EjecucionResponse | null> {
    const ejecucion = await this.repo.findByOrdenId(ordenId);
    if (!ejecucion) return null;

    return {
      id: ejecucion.getId().getValue(),
      ordenId: ejecucion.getOrdenId(),
      tecnicoId: ejecucion.getStartedBy() || "",
      estado: ejecucion.getStatus().getValue(),
      avance: ejecucion.getProgress().getValue(),
      horasReales: ejecucion.getTotalWorkedTime().getTotalHours(),
      fechaInicio:
        ejecucion.getStartedAt()?.toISOString() || new Date().toISOString(),
      fechaFin: ejecucion.getCompletedAt()?.toISOString(),
      observaciones: ejecucion.getObservaciones(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
