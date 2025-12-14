/**
 * @useCase ArchivarOrdenUseCase
 */
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ARCHIVADO_REPOSITORY, IArchivadoRepository, ArchivarOrdenDto } from '../dto';

@Injectable()
export class ArchivarOrdenUseCase {
  constructor(
    @Inject(ARCHIVADO_REPOSITORY)
    private readonly repo: IArchivadoRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    dto: ArchivarOrdenDto,
    userId: string,
  ): Promise<{ message: string }> {
    const yaArchivada = await this.repo.isArchivada(dto.ordenId);
    if (yaArchivada) {
      throw new BadRequestException('La orden ya está archivada');
    }

    await this.repo.archivar(dto.ordenId, userId, dto.motivo);

    this.eventEmitter.emit('orden.archivada', {
      ordenId: dto.ordenId,
      userId,
    });

    return { message: 'Orden archivada exitosamente' };
  }
}
