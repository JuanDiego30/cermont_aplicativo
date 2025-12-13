/**
 * @useCase AssignChecklistToOrdenUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CHECKLIST_REPOSITORY, IChecklistRepository } from '../../domain/repositories';

@Injectable()
export class AssignChecklistToOrdenUseCase {
  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repo: IChecklistRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(ordenId: string, checklistId: string) {
    const assignment = await this.repo.assignToOrden(ordenId, checklistId);

    this.eventEmitter.emit('checklist.assigned', { ordenId, checklistId });

    return {
      message: 'Checklist asignado a la orden',
      data: assignment,
    };
  }
}
