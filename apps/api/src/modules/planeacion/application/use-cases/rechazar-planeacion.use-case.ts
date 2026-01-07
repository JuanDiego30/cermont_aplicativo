/**
 * @useCase RechazarPlaneacionUseCase
 */
import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  PLANEACION_REPOSITORY,
  IPlaneacionRepository,
} from "../../domain/repositories";
import { PlaneacionResponse, EstadoPlaneacion } from "../dto";

@Injectable()
export class RechazarPlaneacionUseCase {
  constructor(
    @Inject(PLANEACION_REPOSITORY)
    private readonly planeacionRepository: IPlaneacionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    id: string,
    motivo: string,
  ): Promise<{ message: string; data: PlaneacionResponse }> {
    const planeacion = await this.planeacionRepository.rechazar(id, motivo);

    this.eventEmitter.emit("planeacion.rechazada", {
      planeacionId: id,
      motivo,
    });

    return {
      message: "Planeación rechazada",
      data: {
        id: planeacion.id,
        ordenId: planeacion.ordenId,
        estado: planeacion.estado as EstadoPlaneacion,
        cronograma: planeacion.cronograma,
        manoDeObra: planeacion.manoDeObra,
        observaciones: planeacion.observaciones,
        createdAt: planeacion.createdAt.toISOString(),
        updatedAt: planeacion.updatedAt.toISOString(),
      },
    };
  }
}
