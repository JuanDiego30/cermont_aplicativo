/**
 * @useCase GetReporteOrdenDetalleUseCase
 */
import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { REPORTE_REPOSITORY, IReporteRepository } from "../dto";

@Injectable()
export class GetReporteOrdenDetalleUseCase {
  constructor(
    @Inject(REPORTE_REPOSITORY)
    private readonly repo: IReporteRepository,
  ) {}

  async execute(ordenId: string) {
    const orden = await this.repo.getOrdenDetalle(ordenId);
    if (!orden) {
      throw new NotFoundException("Orden no encontrada");
    }

    return {
      orden: {
        id: orden.id,
        numero: orden.numero,
        titulo: orden.titulo,
        descripcion: orden.descripcion,
        estado: orden.estado,
        prioridad: orden.prioridad,
        fechaCreacion: orden.createdAt.toISOString(),
        fechaCompletado: orden.fechaCompletado?.toISOString(),
      },
      tecnico: orden.tecnicoAsignado
        ? {
            id: orden.tecnicoAsignado.id,
            nombre: orden.tecnicoAsignado.nombre,
            email: orden.tecnicoAsignado.email,
          }
        : null,
      ejecucion: orden.ejecucion
        ? {
            fechaInicio: orden.ejecucion.fechaInicio?.toISOString(),
            fechaFin: orden.ejecucion.fechaFin?.toISOString(),
            horasReales: orden.ejecucion.horasReales,
            avance: orden.ejecucion.avance,
          }
        : null,
      evidencias: orden.evidencias?.length || 0,
      checklists: orden.checklists?.length || 0,
      generadoEn: new Date().toISOString(),
    };
  }
}
