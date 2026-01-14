/**
 * @useCase CompletarEjecucionUseCase
 * Completes an execution using domain entity.
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
import { EjecucionResponse, CompletarEjecucionDto } from "../dto";
import { toEjecucionResponse } from "../mappers/ejecucion-response.mapper";
import { PrismaService } from "../../../../prisma/prisma.service";
import { publishDomainEvents } from "../../../../shared/base/publish-domain-events";

@Injectable()
export class CompletarEjecucionUseCase {
  constructor(
    @Inject(EJECUCION_REPOSITORY)
    private readonly repo: IEjecucionRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    id: string,
    dto: CompletarEjecucionDto,
  ): Promise<{ message: string; data: EjecucionResponse }> {
    // 1. Find execution
    const ejecucion = await this.repo.findById(EjecucionId.create(id));
    if (!ejecucion) {
      throw new NotFoundException(`Ejecución ${id} no encontrada`);
    }

    // 2. Ensure progress is 100% before completing
    if (!ejecucion.getProgress().isComplete()) {
      // Force to 100% if not already
      ejecucion.updateProgress(
        ProgressPercentage.complete(),
        dto.completadoPorId || "",
        "Completando ejecución",
      );
    }

    // 3. Complete using domain method
    ejecucion.complete(dto.completadoPorId || "", dto.observacionesFinales);

    // 4. Save
    const saved = await this.repo.save(ejecucion);

    // 5. Update order status
    await this.prisma.order.update({
      where: { id: saved.getOrdenId() },
      data: {
        estado: "completada",
        fechaFin: new Date(),
      },
    });

    // 6. Publish domain events
    publishDomainEvents(saved, this.eventEmitter);

    return {
      message: "Ejecución completada",
      data: toEjecucionResponse(saved),
    };
  }
}
