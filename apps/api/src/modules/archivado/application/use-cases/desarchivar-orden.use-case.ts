/**
 * @useCase DesarchivarOrdenUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ARCHIVADO_REPOSITORY, IArchivadoRepository, DesarchivarOrdenDto } from '../dto';

@Injectable()
export class DesarchivarOrdenUseCase {
  constructor(
    @Inject(ARCHIVADO_REPOSITORY)
    private readonly repo: IArchivadoRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: DesarchivarOrdenDto): Promise<{ message: string }> {
    const archivada = await this.repo.isArchivada(dto.ordenId);
    if (!archivada) {
      throw new NotFoundException('La orden no está archivada');
    }

    await this.repo.desarchivar(dto.ordenId);

    this.eventEmitter.emit('orden.desarchivada', {
      ordenId: dto.ordenId,
    });

    return { message: 'Orden desarchivada exitosamente' };
  }
}
