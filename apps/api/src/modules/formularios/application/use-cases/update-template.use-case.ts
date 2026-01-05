/**
 * Use Case: UpdateTemplateUseCase
 *
 * Actualiza un template de formulario (solo si está en DRAFT)
 */

import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { FormTemplate } from "../../domain/entities/form-template.entity";
import { FormTemplateId } from "../../domain/value-objects/form-template-id.vo";
import {
  IFormTemplateRepository,
  FORM_TEMPLATE_REPOSITORY,
} from "../../domain/repositories";
import { UpdateFormTemplateDto } from "../dto/update-template.dto";

@Injectable()
export class UpdateTemplateUseCase {
  constructor(
    @Inject(FORM_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IFormTemplateRepository,
  ) {}

  async execute(
    templateId: string,
    dto: UpdateFormTemplateDto,
    updatedBy: string,
  ): Promise<FormTemplate> {
    const id = FormTemplateId.create(templateId);

    // Buscar template
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Template not found: ${templateId}`);
    }

    // Actualizar información básica
    if (dto.name || dto.description !== undefined) {
      template.updateInfo({
        name: dto.name,
        description: dto.description,
        updatedBy,
      });
    }

    // Actualizar campos si se proporcionan
    if (dto.fields) {
      // Remover campos existentes y agregar nuevos
      // (simplificado - en producción necesitarías lógica más sofisticada)
      const existingFieldIds = template.getFields().map((f) => f.getId());
      for (const fieldId of existingFieldIds) {
        template.removeField(fieldId);
      }

      // Agregar nuevos campos
      // (necesitarías convertir DTOs a Entities)
    }

    // Guardar
    const saved = await this.templateRepository.save(template);

    return saved;
  }
}
