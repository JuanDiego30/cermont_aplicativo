/**
 * @useCase DeleteOrdenUseCase
 * @description Caso de uso para eliminar una orden
 * @layer Application
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ORDEN_REPOSITORY, IOrdenRepository } from '../../domain/repositories';

@Injectable()
export class DeleteOrdenUseCase {
  constructor(
    @Inject(ORDEN_REPOSITORY)
    private readonly ordenRepository: IOrdenRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<{ message: string }> {
    // Verificar existencia
    const orden = await this.ordenRepository.findById(id);

    if (!orden) {
      throw new NotFoundException('Orden no encontrada');
    }

    // Eliminar
    await this.ordenRepository.delete(id);

    // Emitir evento
    this.eventEmitter.emit('orden.deleted', {
      ordenId: id,
      numero: orden.numero.value,
    });

    return { message: 'Orden eliminada exitosamente' };
  }
}
