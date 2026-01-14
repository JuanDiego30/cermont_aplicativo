/**
 * @useCase GetOrdenByIdUseCase
 * @description Caso de uso para obtener una orden por ID
 * @layer Application
 */
import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { ORDEN_REPOSITORY, IOrdenRepository } from "../../domain/repositories";
import { OrdenDetailResponseZod } from "../dto";

@Injectable()
export class GetOrdenByIdUseCase {
  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
  ) {}

  async execute(id: string): Promise<OrdenDetailResponseZod> {
    const orden = await this.ordenRepository.findById(id);

    if (!orden) {
      throw new NotFoundException("Orden no encontrada");
    }

    return {
      id: orden.id,
      numero: orden.numero.value,
      descripcion: orden.descripcion,
      cliente: orden.cliente,
      estado: orden.estado.value,
      prioridad: orden.prioridad.value,
      fechaInicio: orden.fechaInicio?.toISOString(),
      fechaFin: orden.fechaFin?.toISOString(),
      fechaFinEstimada: orden.fechaFinEstimada?.toISOString(),
      presupuestoEstimado: orden.presupuestoEstimado,
      creador: orden.creador,
      asignado: orden.asignado,
      createdAt: orden.createdAt.toISOString(),
      updatedAt: orden.updatedAt.toISOString(),
    };
  }
}
