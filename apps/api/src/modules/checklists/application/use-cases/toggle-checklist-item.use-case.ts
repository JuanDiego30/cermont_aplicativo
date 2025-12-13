/**
 * @useCase ToggleChecklistItemUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CHECKLIST_REPOSITORY, IChecklistRepository } from '../../domain/repositories';

@Injectable()
export class ToggleChecklistItemUseCase {
  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repo: IChecklistRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    ordenId: string,
    checklistId: string,
    itemId: string,
    completado: boolean,
    observaciones?: string,
  ): Promise<{ message: string; item: { itemId: string; completado: boolean } }> {
    const item = await this.repo.toggleItem(ordenId, checklistId, itemId, completado, observaciones);

    this.eventEmitter.emit('checklist.item.toggled', {
      ordenId,
      checklistId,
      itemId,
      completado,
    });

    return {
      message: completado ? 'Item marcado como completado' : 'Item desmarcado',
      item: {
        itemId: item.itemId,
        completado: item.completado,
      },
    };
  }
}
