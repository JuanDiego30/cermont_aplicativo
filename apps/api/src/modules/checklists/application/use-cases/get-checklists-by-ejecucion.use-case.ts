/**
 * Use Case: GetChecklistsByEjecucionUseCase
 * 
 * Obtiene todas las checklists asignadas a una ejecución
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IChecklistRepository,
  CHECKLIST_REPOSITORY,
} from '../../domain/repositories';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistMapper } from '../mappers/checklist.mapper';

@Injectable()
export class GetChecklistsByEjecucionUseCase {
  private readonly logger = new Logger(GetChecklistsByEjecucionUseCase.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository,
  ) {}

  async execute(ejecucionId: string): Promise<ChecklistResponseDto[]> {
    this.logger.log(`Obteniendo checklists para ejecución ${ejecucionId}`);

    const checklists = await this.repository.findByEjecucion(ejecucionId);

    return ChecklistMapper.toResponseDtoArray(checklists);
  }
}

