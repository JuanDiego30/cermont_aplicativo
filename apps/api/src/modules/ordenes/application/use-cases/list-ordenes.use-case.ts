/**
 * @useCase ListOrdenesUseCase
 * @description Caso de uso para listar órdenes
 * @layer Application
 */
import { Injectable, Inject } from "@nestjs/common";
import { ORDEN_REPOSITORY, IOrdenRepository } from "../../domain/repositories";
import { OrdenQueryDto, OrdenListResponseZod } from "../dto";

@Injectable()
export class ListOrdenesUseCase {
  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
  ) {}

  async execute(query: OrdenQueryDto): Promise<OrdenListResponseZod> {
    const result = await this.ordenRepository.findAll({
      estado: query.estado,
      cliente: query.cliente,
      prioridad: query.prioridad,
      asignadoId: query.asignadoId,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: result.data.map((orden) => ({
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
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
