/**
 * @useCase GetCierreByOrdenUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CIERRE_REPOSITORY, ICierreRepository, CierreResponse } from '../dto';

@Injectable()
export class GetCierreByOrdenUseCase {
  constructor(
    @Inject(CIERRE_REPOSITORY)
    private readonly repo: ICierreRepository,
  ) {}

  async execute(ordenId: string): Promise<CierreResponse> {
    const cierre = await this.repo.findByOrden(ordenId);
    if (!cierre) {
      throw new NotFoundException('Cierre administrativo no encontrado');
    }
    return this.toResponse(cierre);
  }

  private toResponse(cierre: any): CierreResponse {
    return {
      id: cierre.id,
      ordenId: cierre.ordenId,
      estado: cierre.estado,
      documentos: cierre.documentos?.map((d: any) => ({
        id: d.id,
        tipo: d.tipo,
        numero: d.numero,
        fechaDocumento: d.fechaDocumento?.toISOString(),
        url: d.url,
        estado: d.estado,
      })) || [],
      observaciones: cierre.observaciones,
      fechaCierre: cierre.fechaCierre?.toISOString(),
      creadoPorId: cierre.creadoPorId,
      createdAt: cierre.createdAt.toISOString(),
    };
  }
}
