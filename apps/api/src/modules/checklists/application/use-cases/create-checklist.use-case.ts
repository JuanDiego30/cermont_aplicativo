/**
 * Use Case: CreateChecklistUseCase
 * 
 * Crea una nueva plantilla de checklist en estado DRAFT
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IChecklistRepository,
  CHECKLIST_REPOSITORY,
} from '../../domain/repositories';
import { Checklist } from '../../domain/entities/checklist.entity';
import { CreateChecklistDto } from '../dto/create-checklist.dto';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistMapper } from '../mappers/checklist.mapper';

@Injectable()
export class CreateChecklistUseCase {
  private readonly logger = new Logger(CreateChecklistUseCase.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateChecklistDto): Promise<ChecklistResponseDto> {
    const context = {
      action: 'CREATE_CHECKLIST',
      name: dto.name,
      tipo: dto.tipo,
    };

    this.logger.log('Creando checklist', context);

    try {
      // Crear entidad de dominio
      const checklist = Checklist.createTemplate({
        name: dto.name,
        description: dto.description,
        tipo: dto.tipo,
        categoria: dto.categoria,
        items: dto.items.map((item) => ({
          label: item.label,
          isRequired: item.isRequired,
          orden: item.orden,
        })),
      });

      // Guardar en BD
      const savedChecklist = await this.repository.save(checklist);

      // Publicar eventos de dominio
      const domainEvents = savedChecklist.getDomainEvents();
      for (const event of domainEvents) {
        this.eventEmitter.emit(event.eventName, event);
      }
      savedChecklist.clearDomainEvents();

      this.logger.log('Checklist creado exitosamente', {
        ...context,
        checklistId: savedChecklist.getId().getValue(),
      });

      // Retornar DTO
      return ChecklistMapper.toResponseDto(savedChecklist);
    } catch (error) {
      this.logger.error('Error creando checklist', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
