/**
 * Use Case: ArchiveTemplateUseCase
 *
 * Archiva un template de formulario
 */

import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { FormTemplate } from "../../domain/entities/form-template.entity";
import { FormTemplateId } from "../../domain/value-objects/form-template-id.vo";
import {
  IFormTemplateRepository,
  FORM_TEMPLATE_REPOSITORY,
} from "../../domain/repositories";

@Injectable()
export class ArchiveTemplateUseCase {
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

    // Archivar
    template.archive();

    // Guardar
    const saved = await this.templateRepository.save(template);

    return saved;
  }
}
