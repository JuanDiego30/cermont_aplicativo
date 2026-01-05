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
import { EjecucionResponse } from "../dto";
import { toEjecucionResponse } from "../mappers/ejecucion-response.mapper";
import { publishDomainEvents } from "../../../../shared/base/publish-domain-events";

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
    publishDomainEvents(saved, this.eventEmitter);

    return {
      message: `Avance actualizado a ${avance}%`,
      data: toEjecucionResponse(saved),
    };
  }
}
