/**
 * Use Case: CompleteChecklistUseCase
 * 
 * Completa un checklist manualmente
 */

import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IChecklistRepository,
  CHECKLIST_REPOSITORY,
} from '../../domain/repositories';
import { CompleteChecklistDto } from '../dto/complete-checklist.dto';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistMapper } from '../mappers/checklist.mapper';

@Injectable()
export class CompleteChecklistUseCase {
  private readonly logger = new Logger(CompleteChecklistUseCase.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CompleteChecklistDto, userId: string): Promise<ChecklistResponseDto> {
    const context = {
      action: 'COMPLETE_CHECKLIST',
      checklistId: dto.checklistId,
      userId,
    };

    this.logger.log('Completando checklist', context);

    try {
      // 1. Buscar checklist
      const checklist = await this.repository.findInstanceById(dto.checklistId);
      if (!checklist) {
        throw new NotFoundException(`Checklist ${dto.checklistId} no encontrado`);
      }

      // 2. Completar manualmente (validación de dominio ocurre aquí)
      checklist.completeManually(userId);

      // 3. Guardar
      const savedChecklist = await this.repository.save(checklist);

      // 4. Publicar eventos
      const domainEvents = savedChecklist.getDomainEvents();
      for (const event of domainEvents) {
        this.eventEmitter.emit(event.eventName, event);
      }
      savedChecklist.clearDomainEvents();

      this.logger.log('Checklist completado exitosamente', context);

      return ChecklistMapper.toResponseDto(savedChecklist);
    } catch (error) {
      this.logger.error('Error completando checklist', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

