/**
 * @useCase RegistrarCostoUseCase
 */
import { Injectable, Inject } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  COSTO_REPOSITORY,
  ICostoRepository,
  RegistrarCostoDto,
  CostoResponse,
} from "../dto";

@Injectable()
export class RegistrarCostoUseCase {
  constructor(
    @Inject(COSTO_REPOSITORY)
    private readonly repo: ICostoRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    dto: RegistrarCostoDto,
  ): Promise<{ message: string; data: CostoResponse }> {
    const costo = await this.repo.create(dto);

    this.eventEmitter.emit("costo.registrado", {
      costoId: costo.id,
      ordenId: costo.ordenId,
      total: costo.total,
    });

    return {
      message: "Costo registrado",
      data: {
        id: costo.id,
        ordenId: costo.ordenId,
        tipo: costo.tipo,
        descripcion: costo.descripcion,
        cantidad: costo.cantidad,
        precioUnitario: costo.precioUnitario,
        total: costo.total,
        proveedor: costo.proveedor,
        createdAt: costo.createdAt.toISOString(),
      },
    };
  }
}
