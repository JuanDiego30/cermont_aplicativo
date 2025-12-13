/**
 * @useCase DeleteEvidenciaUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EVIDENCIA_REPOSITORY, IEvidenciaRepository } from '../../domain/repositories';

@Injectable()
export class DeleteEvidenciaUseCase {
  constructor(
    @Inject(EVIDENCIA_REPOSITORY)
    private readonly repo: IEvidenciaRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    const evidencia = await this.repo.findById(id);
    if (!evidencia) {
      throw new NotFoundException('Evidencia no encontrada');
    }

    await this.repo.delete(id);

    this.eventEmitter.emit('evidencia.deleted', {
      evidenciaId: id,
      ordenId: evidencia.ordenId,
    });

    return { message: 'Evidencia eliminada' };
  }
}
