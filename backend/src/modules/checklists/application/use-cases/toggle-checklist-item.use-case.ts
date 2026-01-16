/**
 * Use Case: ToggleChecklistItemUseCase
 *
 * Togglea un item de checklist (marca/desmarca)
 */

import { Injectable, Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IChecklistRepository, CHECKLIST_REPOSITORY } from '../../domain/repositories';
import { ChecklistItemId } from '../../domain/value-objects/checklist-item-id.vo';
import { ToggleChecklistItemDto } from '../dto/toggle-item.dto';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistMapper } from '../mappers/checklist.mapper';

@Injectable()
export class ToggleChecklistItemUseCase {
  private readonly logger = new Logger(ToggleChecklistItemUseCase.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository,
    private readonly eventEmitter: EventEmitter2
  ) {}

  async execute(dto: ToggleChecklistItemDto, userId?: string): Promise<ChecklistResponseDto> {
    const context = {
      action: 'TOGGLE_CHECKLIST_ITEM',
      checklistId: dto.checklistId,
      itemId: dto.itemId,
      userId,
    };

    this.logger.log('Toggling checklist item', context);

    try {
      // 1. Buscar checklist
      const checklist = await this.repository.findInstanceById(dto.checklistId);
      if (!checklist) {
        throw new NotFoundException(`Checklist ${dto.checklistId} no encontrado`);
      }

      // 2. Validar pertenencia a orden/ejecución
      if (dto.ordenId && checklist.getOrdenId() !== dto.ordenId) {
        throw new ForbiddenException('El checklist no pertenece a esta orden');
      }
      if (dto.ejecucionId && checklist.getEjecucionId() !== dto.ejecucionId) {
        throw new ForbiddenException('El checklist no pertenece a esta ejecución');
      }

      // 3. Toggle item (validación de dominio ocurre aquí)
      const itemId = ChecklistItemId.create(dto.itemId);
      checklist.toggleItem(itemId, userId);

      // 4. Guardar
      const savedChecklist = await this.repository.save(checklist);

      // 5. Publicar eventos
      const domainEvents = savedChecklist.getDomainEvents();
      for (const event of domainEvents) {
        this.eventEmitter.emit(event.eventName, event);
      }
      savedChecklist.clearDomainEvents();

      this.logger.log('Item toggled exitosamente', {
        ...context,
        checked: savedChecklist
          .getItems()
          .find(i => i.getId().equals(itemId))
          ?.getIsChecked(),
      });

      return ChecklistMapper.toResponseDto(savedChecklist);
    } catch (error) {
      this.logger.error('Error toggling item', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
