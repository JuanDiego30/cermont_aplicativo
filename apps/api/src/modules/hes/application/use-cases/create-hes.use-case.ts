/**
 * @useCase CreateHESUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HES_REPOSITORY, IHESRepository, CreateHESDto, HESResponse } from '../dto';

@Injectable()
export class CreateHESUseCase {
  constructor(
    @Inject(HES_REPOSITORY)
    private readonly repo: IHESRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateHESDto, inspectorId: string): Promise<{ message: string; data: HESResponse }> {
    const hes = await this.repo.create(dto, inspectorId);

    this.eventEmitter.emit('hes.created', {
      hesId: hes.id,
      equipoId: dto.equipoId,
      aprobado: dto.aprobado,
    });

    return {
      message: dto.aprobado ? 'Inspección aprobada' : 'Inspección rechazada',
      data: {
        id: hes.id,
        equipoId: hes.equipoId,
        ordenId: hes.ordenId,
        tipo: hes.tipo,
        resultados: hes.resultados,
        observaciones: hes.observaciones,
        aprobado: hes.aprobado,
        inspectorId: hes.inspectorId,
        createdAt: hes.createdAt.toISOString(),
      },
    };
  }
}
