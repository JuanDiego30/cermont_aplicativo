/**
 * ChecklistAssignService
 *
 * Servicio compartido para asignar checklists a diferentes entidades (Orden, Ejecución).
 * Elimina duplicación entre AssignChecklistToOrdenUseCase y AssignChecklistToEjecucionUseCase.
 */

import { Injectable, Inject, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IChecklistRepository, CHECKLIST_REPOSITORY } from '../../domain/repositories';
import { Checklist } from '../../domain/entities/checklist.entity';
import { ChecklistItem } from '../../domain/entities/checklist-item.entity';
import { ChecklistResponseDto } from '../dto/checklist-response.dto';
import { ChecklistMapper } from '../mappers/checklist.mapper';
import { PrismaService } from '../../../../prisma/prisma.service';

export type AssignTargetType = 'orden' | 'ejecucion';

export interface AssignChecklistParams {
  checklistId: string;
  targetType: AssignTargetType;
  targetId: string;
}

export interface AssignChecklistResult {
  success: boolean;
  checklist: ChecklistResponseDto;
}

@Injectable()
export class ChecklistAssignService {
  private readonly logger = new Logger(ChecklistAssignService.name);

  constructor(
    @Inject(CHECKLIST_REPOSITORY)
    private readonly repository: IChecklistRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService
  ) {}

  /**
   * Asigna un checklist template a una orden o ejecución
   */
  async assign(params: AssignChecklistParams): Promise<AssignChecklistResult> {
    const { checklistId, targetType, targetId } = params;
    const context = {
      action: `ASSIGN_CHECKLIST_TO_${targetType.toUpperCase()}`,
      targetType,
      targetId,
      checklistId,
    };

    this.logger.log(`Asignando checklist a ${targetType}`, context);

    try {
      // 1. Validar que el target existe
      await this.validateTargetExists(targetType, targetId);

      // 2. Obtener y validar template
      const template = await this.getAndValidateTemplate(checklistId);

      // 3. Verificar que no existe ya una asignación
      await this.checkNotAlreadyAssigned(checklistId, targetType, targetId);

      // 4. Crear instancia desde template
      const instance = this.createInstanceFromTemplate(template, targetType, targetId);

      // 5. Guardar instancia
      const savedInstance = await this.repository.save(instance);

      // 6. Publicar eventos
      this.publishDomainEvents(savedInstance);

      this.logger.log(`Checklist asignado exitosamente a ${targetType}`, {
        ...context,
        instanceId: savedInstance.getId().getValue(),
      });

      return {
        success: true,
        checklist: ChecklistMapper.toResponseDto(savedInstance),
      };
    } catch (error) {
      this.logger.error(`Error asignando checklist a ${targetType}`, {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ============ MÉTODOS PRIVADOS ============

  private async validateTargetExists(
    targetType: AssignTargetType,
    targetId: string
  ): Promise<void> {
    if (targetType === 'orden') {
      const orden = await this.prisma.order.findUnique({
        where: { id: targetId },
      });
      if (!orden) {
        throw new NotFoundException(`Orden ${targetId} no encontrada`);
      }
    } else {
      const ejecucion = await this.prisma.ejecucion.findUnique({
        where: { id: targetId },
      });
      if (!ejecucion) {
        throw new NotFoundException(`Ejecución ${targetId} no encontrada`);
      }
    }
  }

  private async getAndValidateTemplate(checklistId: string): Promise<Checklist> {
    const template = await this.repository.findTemplateById(checklistId);
    if (!template) {
      throw new NotFoundException(`Checklist template ${checklistId} no encontrado`);
    }

    if (!template.getStatus().puedeAsignarse()) {
      throw new ConflictException(`El checklist debe estar en estado ACTIVE para asignarse`);
    }

    return template;
  }

  private async checkNotAlreadyAssigned(
    checklistId: string,
    targetType: AssignTargetType,
    targetId: string
  ): Promise<void> {
    const ordenId = targetType === 'orden' ? targetId : undefined;
    const ejecucionId = targetType === 'ejecucion' ? targetId : undefined;

    const exists = await this.repository.existsAssigned(checklistId, ordenId, ejecucionId);
    if (exists) {
      throw new ConflictException(`El checklist ya está asignado a esta ${targetType}`);
    }
  }

  private createInstanceFromTemplate(
    template: Checklist,
    targetType: AssignTargetType,
    targetId: string
  ): Checklist {
    const items = template.getItems().map(item =>
      ChecklistItem.fromPersistence({
        id: ChecklistItem.create({ label: item.getLabel() }).getId().getValue(),
        label: item.getLabel(),
        isRequired: item.getIsRequired(),
        isChecked: false,
        orden: item.getOrden(),
      })
    );

    const instanceParams: {
      templateId: string;
      name: string;
      description?: string;
      items: ChecklistItem[];
      ordenId?: string;
      ejecucionId?: string;
    } = {
      templateId: template.getId().getValue(),
      name: template.getName(),
      description: template.getDescription() || undefined,
      items,
    };

    if (targetType === 'orden') {
      instanceParams.ordenId = targetId;
    } else {
      instanceParams.ejecucionId = targetId;
    }

    return Checklist.createInstanceFromTemplate(instanceParams);
  }

  private publishDomainEvents(checklist: Checklist): void {
    const domainEvents = checklist.getDomainEvents();
    for (const event of domainEvents) {
      this.eventEmitter.emit(event.eventName, event);
    }
    checklist.clearDomainEvents();
  }
}
