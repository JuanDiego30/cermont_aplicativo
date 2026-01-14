/**
 * @useCase CreateOrUpdatePlaneacionUseCase
 */
import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  PLANEACION_REPOSITORY,
  IPlaneacionRepository,
} from "../../domain/repositories";
import { CreatePlaneacionDto, PlaneacionResponse } from "../dto";

@Injectable()
export class CreateOrUpdatePlaneacionUseCase {
  constructor(
    @Inject(PLANEACION_REPOSITORY)
    private readonly planeacionRepository: IPlaneacionRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    ordenId: string,
    dto: CreatePlaneacionDto,
  ): Promise<{ message: string; data: PlaneacionResponse }> {
    const planeacion = await this.planeacionRepository.createOrUpdate(ordenId, {
      cronograma: dto.cronograma,
      manoDeObra: dto.manoDeObra,
      observaciones: dto.observaciones,
      kitId: dto.kitId,
    });

    this.eventEmitter.emit("planeacion.updated", {
      ordenId,
      planeacionId: planeacion.id,
    });

    return {
      message: "Planeación guardada",
      data: {
        id: planeacion.id,
        ordenId: planeacion.ordenId,
        estado: planeacion.estado,
        cronograma: planeacion.cronograma,
        manoDeObra: planeacion.manoDeObra,
        observaciones: planeacion.observaciones,
        createdAt: planeacion.createdAt.toISOString(),
        updatedAt: planeacion.updatedAt.toISOString(),
      },
    };
  }
}
