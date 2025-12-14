/**
 * @useCase InspeccionarLineaVidaUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LINEA_VIDA_REPOSITORY, ILineaVidaRepository, InspeccionLineaVidaDto, InspeccionResponse } from '../dto';

@Injectable()
export class InspeccionarLineaVidaUseCase {
  constructor(
    @Inject(LINEA_VIDA_REPOSITORY)
    private readonly repo: ILineaVidaRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: InspeccionLineaVidaDto, inspectorId: string): Promise<{ message: string; data: InspeccionResponse }> {
    const linea = await this.repo.findById(dto.lineaVidaId);
    if (!linea) throw new NotFoundException('Línea de vida no encontrada');

    const inspeccion = await this.repo.createInspeccion(dto, inspectorId);

    // Actualizar próxima inspección si se especificó
    if (dto.proximaInspeccion) {
      await this.repo.updateProximaInspeccion(dto.lineaVidaId, dto.proximaInspeccion);
    }

    this.eventEmitter.emit('linea-vida.inspeccionada', {
      lineaVidaId: dto.lineaVidaId,
      aprobado: dto.aprobado,
      inspectorId,
    });

    return {
      message: dto.aprobado ? 'Inspección aprobada' : 'Inspección rechazada - requiere acción',
      data: {
        id: inspeccion.id,
        lineaVidaId: inspeccion.lineaVidaId,
        tipo: inspeccion.tipo,
        resultados: inspeccion.resultados,
        aprobado: inspeccion.aprobado,
        inspectorId: inspeccion.inspectorId,
        createdAt: inspeccion.createdAt.toISOString(),
      },
    };
  }
}
