/**
 * Use Case: GetChecklistsByOrdenUseCase
 *
 * Obtiene todas las checklists asignadas a una orden
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { IChecklistRepository, CHECKLIST_REPOSITORY } from '../../domain/repositories';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistMapper } from '../mappers/checklist.mapper';

@Injectable()
export class GetChecklistsByOrdenUseCase {
  private readonly logger = new Logger(GetChecklistsByOrdenUseCase.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository
  ) {}

  async execute(ordenId: string): Promise<ChecklistResponseDto[]> {
    this.logger.log(`Obteniendo checklists para orden ${ordenId}`);

    const checklists = await this.repository.findByOrden(ordenId);

    return ChecklistMapper.toResponseDtoArray(checklists);
  }
}
