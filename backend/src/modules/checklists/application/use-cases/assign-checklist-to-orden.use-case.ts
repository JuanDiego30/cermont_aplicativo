/**
 * Use Case: AssignChecklistToOrdenUseCase
 *
 * Asigna un checklist template a una orden.
 * Delega la lógica a ChecklistAssignService.
 */

import { Injectable } from '@nestjs/common';
import { AssignChecklistToOrdenDto } from '../dto/assign-checklist.dto';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistAssignService } from '../services/checklist-assign.service';

@Injectable()
export class AssignChecklistToOrdenUseCase {
  constructor(private readonly assignService: ChecklistAssignService) {}

  async execute(dto: AssignChecklistToOrdenDto): Promise<ChecklistResponseDto> {
    const result = await this.assignService.assign({
      checklistId: dto.checklistId,
      targetType: 'orden',
      targetId: dto.ordenId,
    });
    return result.checklist;
  }
}
