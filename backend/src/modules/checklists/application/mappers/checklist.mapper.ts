/**
 * @mapper ChecklistMapper
 *
 * Mapea entre Domain Entity y DTOs
 */

import { Checklist } from '../../domain/entities/checklist.entity';
import { ChecklistItem } from '../../domain/entities/checklist-item.entity';
import { ChecklistResponseDto, ChecklistItemResponseDto } from '../dto/checklist-response.dto';

export class ChecklistMapper {
  /**
   * Domain Entity → Response DTO
   */
  public static toResponseDto(checklist: Checklist): ChecklistResponseDto {
    return {
      id: checklist.getId().getValue(),
      name: checklist.getName(),
      description: checklist.getDescription() || undefined,
      status: checklist.getStatus().getValue(),
      tipo: checklist.getTipo() || undefined,
      categoria: checklist.getCategoria() || undefined,
      items: checklist.getItems().map(item => this.itemToDto(item)),
      ordenId: checklist.getOrdenId() || undefined,
      ejecucionId: checklist.getEjecucionId() || undefined,
      templateId: checklist.getTemplateId() || undefined,
      completada: checklist.getCompletada(),
      completionRatio: checklist.getCompletionRatio(),
      completionPercentage: checklist.getCompletionPercentage(),
      isTemplate: checklist.isTemplate(),
      isAssigned: checklist.isAssigned(),
      createdAt: checklist.getCreatedAt(),
      updatedAt: checklist.getUpdatedAt(),
    };
  }

  /**
   * ChecklistItem → ItemResponseDto
   */
  public static itemToDto(item: ChecklistItem): ChecklistItemResponseDto {
    return {
      id: item.getId().getValue(),
      label: item.getLabel(),
      isRequired: item.getIsRequired(),
      isChecked: item.getIsChecked(),
      checkedAt: item.getCheckedAt(),
      observaciones: item.getObservaciones(),
      orden: item.getOrden(),
    };
  }

  /**
   * Domain Entity → Persistence (Prisma)
   */
  public static toPersistence(checklist: Checklist): any {
    return checklist.toPersistence();
  }

  /**
   * Array de Domain Entities → Array de Response DTOs
   */
  public static toResponseDtoArray(checklists: Checklist[]): ChecklistResponseDto[] {
    return checklists.map(checklist => this.toResponseDto(checklist));
  }
}
