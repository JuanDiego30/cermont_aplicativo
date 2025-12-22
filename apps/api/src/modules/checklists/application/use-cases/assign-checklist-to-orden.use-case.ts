/**
 * Use Case: AssignChecklistToOrdenUseCase
 * 
 * Asigna un checklist template a una orden
 */

import { Injectable, Inject, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  IChecklistRepository,
  CHECKLIST_REPOSITORY,
} from '../../domain/repositories';
import { Checklist } from '../../domain/entities/checklist.entity';
import { ChecklistItem } from '../../domain/entities/checklist-item.entity';
import { AssignChecklistToOrdenDto } from '../dto/assign-checklist.dto';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistMapper } from '../mappers/checklist.mapper';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class AssignChecklistToOrdenUseCase {
  private readonly logger = new Logger(AssignChecklistToOrdenUseCase.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService, // Temporal para validar orden
  ) {}

  async execute(dto: AssignChecklistToOrdenDto): Promise<ChecklistResponseDto> {
    const context = {
      action: 'ASSIGN_CHECKLIST_TO_ORDEN',
      ordenId: dto.ordenId,
      checklistId: dto.checklistId,
    };

    this.logger.log('Asignando checklist a orden', context);

    try {
      // 1. Validar que la orden existe
      const orden = await this.prisma.order.findUnique({
        where: { id: dto.ordenId },
      });

      if (!orden) {
        throw new NotFoundException(`Orden ${dto.ordenId} no encontrada`);
      }

      // 2. Obtener template
      const template = await this.repository.findTemplateById(dto.checklistId);
      if (!template) {
        throw new NotFoundException(`Checklist template ${dto.checklistId} no encontrado`);
      }

      // 3. Validar que puede asignarse
      if (!template.getStatus().puedeAsignarse()) {
        throw new ConflictException(
          `El checklist debe estar en estado ACTIVE para asignarse`,
        );
      }

      // 4. Verificar que no existe ya una asignación
      const exists = await this.repository.existsAssigned(
        dto.checklistId,
        dto.ordenId,
      );
      if (exists) {
        throw new ConflictException(
          `El checklist ya está asignado a esta orden`,
        );
      }

      // 5. Crear instancia desde template
      const items = template.getItems().map((item) =>
        ChecklistItem.fromPersistence({
          id: ChecklistItem.create({ label: item.getLabel() }).getId().getValue(),
          label: item.getLabel(),
          isRequired: item.getIsRequired(),
          isChecked: false,
          orden: item.getOrden(),
        }),
      );

      const instance = Checklist.createInstanceFromTemplate({
        templateId: dto.checklistId,
        name: template.getName(),
        description: template.getDescription() || undefined,
        items,
        ordenId: dto.ordenId,
      });

      // 6. Guardar instancia
      const savedInstance = await this.repository.save(instance);

      // 7. Publicar eventos
      const domainEvents = savedInstance.getDomainEvents();
      for (const event of domainEvents) {
        this.eventEmitter.emit(event.eventName, event);
      }
      savedInstance.clearDomainEvents();

      this.logger.log('Checklist asignado exitosamente', {
        ...context,
        instanceId: savedInstance.getId().getValue(),
      });

      return ChecklistMapper.toResponseDto(savedInstance);
    } catch (error) {
      this.logger.error('Error asignando checklist', {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
