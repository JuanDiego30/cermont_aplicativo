/**
 * Use Case: UpdateChecklistItemUseCase
 * 
 * Actualiza observaciones de un item
 */

import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  IChecklistRepository,
  CHECKLIST_REPOSITORY,
} from '../../domain/repositories';
import { ChecklistItemId } from '../../domain/value-objects/checklist-item-id.vo';
import { UpdateChecklistItemDto } from '../dto/toggle-item.dto';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistMapper } from '../mappers/checklist.mapper';

@Injectable()
export class UpdateChecklistItemUseCase {
  private readonly logger = new Logger(UpdateChecklistItemUseCase.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository,
  ) {}

  async execute(dto: UpdateChecklistItemDto): Promise<ChecklistResponseDto> {
    const context = {
      action: 'UPDATE_CHECKLIST_ITEM',
      checklistId: dto.checklistId,
      itemId: dto.itemId,
    };

    this.logger.log('Actualizando item de checklist', context);

    try {
      // 1. Buscar checklist
      const checklist = await this.repository.findInstanceById(dto.checklistId);
      if (!checklist) {
        throw new NotFoundException(`Checklist ${dto.checklistId} no encontrado`);
      }

      // 2. Actualizar observaciones
      const itemId = ChecklistItemId.create(dto.itemId);
      checklist.updateItemObservaciones(itemId, dto.observaciones || '');

      // 3. Guardar
      const savedChecklist = await this.repository.save(checklist);

      this.logger.log('Item actualizado exitosamente', context);

      return ChecklistMapper.toResponseDto(savedChecklist);
    } catch (error) {
      this.logger.error('Error actualizando item', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

