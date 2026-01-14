/**
 * Use Case: AssignChecklistToEjecucionUseCase
 *
 * Asigna un checklist template a una ejecución.
 * Delega la lógica a ChecklistAssignService.
 */

import { Injectable } from "@nestjs/common";
import { AssignChecklistToEjecucionDto } from "../dto/assign-checklist.dto";
import { ChecklistResponseDto } from "../dto/checklist-response.dto";
import { ChecklistAssignService } from "../services/checklist-assign.service";

@Injectable()
export class AssignChecklistToEjecucionUseCase {
  constructor(private readonly assignService: ChecklistAssignService) {}

  async execute(
    dto: AssignChecklistToEjecucionDto,
  ): Promise<ChecklistResponseDto> {
    const result = await this.assignService.assign({
      checklistId: dto.checklistId,
      targetType: "ejecucion",
      targetId: dto.ejecucionId,
    });
    return result.checklist;
  }
}
