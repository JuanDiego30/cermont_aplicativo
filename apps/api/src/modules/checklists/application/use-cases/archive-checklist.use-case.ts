/**
 * Use Case: ArchiveChecklistUseCase
 * 
 * Archiva un checklist
 */

import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import {
  IChecklistRepository,
  CHECKLIST_REPOSITORY,
} from '../../domain/repositories';
import { ArchiveChecklistDto } from '../dto/archive-checklist.dto';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistMapper } from '../mappers/checklist.mapper';

@Injectable()
export class ArchiveChecklistUseCase {
  private readonly logger = new Logger(ArchiveChecklistUseCase.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository,
  ) {}

  async execute(dto: ArchiveChecklistDto): Promise<ChecklistResponseDto> {
    const context = {
      action: 'ARCHIVE_CHECKLIST',
      checklistId: dto.checklistId,
    };

    this.logger.log('Archivando checklist', context);

    try {
      // 1. Buscar checklist
      const checklist = await this.repository.findById(dto.checklistId);
      if (!checklist) {
        throw new NotFoundException(`Checklist ${dto.checklistId} no encontrado`);
      }

      // 2. Archivar (validación de dominio ocurre aquí)
      checklist.archive();

      // 3. Guardar
      const savedChecklist = await this.repository.save(checklist);

      this.logger.log('Checklist archivado exitosamente', context);

      return ChecklistMapper.toResponseDto(savedChecklist);
    } catch (error) {
      this.logger.error('Error archivando checklist', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

