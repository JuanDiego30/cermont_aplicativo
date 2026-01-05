/**
 * Use Case: PublishTemplateUseCase
 *
 * Publica un template de formulario (cambia estado de DRAFT a PUBLISHED)
 */

import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { FormTemplate } from "../../domain/entities/form-template.entity";
import { FormTemplateId } from "../../domain/value-objects/form-template-id.vo";
import {
  IFormTemplateRepository,
  FORM_TEMPLATE_REPOSITORY,
} from "../../domain/repositories";
import { TemplateNotPublishableException } from "../../domain/exceptions";

@Injectable()
export class PublishTemplateUseCase {
  constructor(
    @Inject(FORM_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IFormTemplateRepository,
  ) {}

  async execute(templateId: string): Promise<FormTemplate> {
    const id = FormTemplateId.create(templateId);

    // Buscar template
    const template = await this.templateRepository.findById(id);
    if (!template) {
      throw new NotFoundException(`Template not found: ${templateId}`);
    }

    // Publicar (valida internamente)
    try {
      template.publish();
    } catch (error) {
      if (error instanceof TemplateNotPublishableException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to publish template: ${message}`);
    }

    // Guardar cambios
    const saved = await this.templateRepository.save(template);

    return saved;
  }
}
