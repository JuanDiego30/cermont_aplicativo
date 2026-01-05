/**
 * Use Case: PublishTemplateUseCase
 *
 * Publica un template de formulario (cambia estado de DRAFT a PUBLISHED)
 */

import { Injectable, Inject } from "@nestjs/common";
import { FormTemplate } from "../../domain/entities/form-template.entity";
import {
  IFormTemplateRepository,
  FORM_TEMPLATE_REPOSITORY,
} from "../../domain/repositories";
import { TemplateNotPublishableException } from "../../domain/exceptions";
import { getTemplateOrThrow } from "./form-template.utils";

@Injectable()
export class PublishTemplateUseCase {
  constructor(
    @Inject(FORM_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IFormTemplateRepository,
  ) {}

  async execute(templateId: string): Promise<FormTemplate> {
    const template = await getTemplateOrThrow(this.templateRepository, templateId);

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

    return await this.templateRepository.save(template);
  }
}
