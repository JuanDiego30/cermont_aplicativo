/**
 * @useCase UpdateAvanceUseCase
 * Updates execution progress using domain entity.
 */
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  EJECUCION_REPOSITORY,
  IEjecucionRepository,
} from "../../domain/repositories";
import { EjecucionId, ProgressPercentage } from "../../domain/value-objects";
import { Ejecucion } from "../../domain/entities";
import { EjecucionResponse } from "../dto";

@Injectable()
export class UpdateAvanceUseCase {
  constructor(
    @Inject(EJECUCION_REPOSITORY)
    private readonly repo: IEjecucionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    avance: number,
    tecnicoId: string,
    observaciones?: string,
  ): Promise<{ message: string; data: EjecucionResponse }> {
    // 1. Find execution
    const ejecucion = await this.repo.findById(EjecucionId.create(id));
    if (!ejecucion) {
      throw new NotFoundException(`Ejecución ${id} no encontrada`);
    }

    // 2. Validate progress value
    if (avance < 0 || avance > 100) {
      throw new BadRequestException("El avance debe estar entre 0 y 100");
    }

    // 3. Update progress using domain method
    const newProgress = ProgressPercentage.fromValue(avance);
    ejecucion.updateProgress(newProgress, tecnicoId, observaciones);

    // 4. Save
    const saved = await this.repo.save(ejecucion);

    // 5. Publish domain events
    const domainEvents = saved.getDomainEvents();
    for (const event of domainEvents) {
      this.eventEmitter.emit(event.eventName, event);
    }
    saved.clearDomainEvents();

    return {
      message: `Avance actualizado a ${avance}%`,
      data: this.toResponse(saved),
    };
  }

  private toResponse(e: Ejecucion): EjecucionResponse {
    return {
      id: e.getId().getValue(),
      ordenId: e.getOrdenId(),
      tecnicoId: e.getStartedBy() || "",
      estado: e.getStatus().getValue(),
      avance: e.getProgress().getValue(),
      horasReales: e.getTotalWorkedTime().getTotalHours(),
      fechaInicio: e.getStartedAt()?.toISOString() || new Date().toISOString(),
      fechaFin: e.getCompletedAt()?.toISOString(),
      observaciones: e.getObservaciones(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}
