/**
 * @useCase GetChecklistsByOrdenUseCase
 */
import { Injectable, Inject } from '@nestjs/common';
import { CHECKLIST_REPOSITORY, IChecklistRepository } from '../../domain/repositories';

@Injectable()
export class GetChecklistsByOrdenUseCase {
  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repo: IChecklistRepository,
  ) {}

  async execute(ordenId: string) {
    return this.repo.findByOrden(ordenId);
  }
}
