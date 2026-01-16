/**
 * Use Case: ArchiveTemplateUseCase
 *
 * Archiva un template de formulario
 */

import { Injectable, Inject } from '@nestjs/common';
import { FormTemplate } from '../../domain/entities/form-template.entity';
import { IFormTemplateRepository, FORM_TEMPLATE_REPOSITORY } from '../../domain/repositories';
import { getTemplateOrThrow } from './form-template.utils';

@Injectable()
export class ArchiveTemplateUseCase {
  constructor(
    @Inject(FORM_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IFormTemplateRepository
  ) {}

  async execute(templateId: string): Promise<FormTemplate> {
    const template = await getTemplateOrThrow(this.templateRepository, templateId);

    // Archivar
    template.archive();

    return await this.templateRepository.save(template);
  }
}
