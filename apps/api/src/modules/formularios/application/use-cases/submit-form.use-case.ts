/**
 * Use Case: SubmitFormUseCase
 * 
 * Envía (submite) un formulario completado
 */

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { FormSubmission } from '../../domain/entities/form-submission.entity';
import { FormTemplate } from '../../domain/entities/form-template.entity';
import { FormTemplateId } from '../../domain/value-objects/form-template-id.vo';
import {
  IFormTemplateRepository,
  IFormSubmissionRepository,
  FORM_TEMPLATE_REPOSITORY,
  FORM_SUBMISSION_REPOSITORY,
} from '../../domain/repositories';
import { ValidationFailedException } from '../../domain/exceptions';
import { SubmitFormDto } from '../dto/submit-form.dto';

@Injectable()
export class SubmitFormUseCase {
  constructor(
    @Inject(FORM_TEMPLATE_REPOSITORY)
    private readonly templateRepository: IFormTemplateRepository,
    @Inject(FORM_SUBMISSION_REPOSITORY)
    private readonly submissionRepository: IFormSubmissionRepository,
  ) {}

  async execute(
    dto: SubmitFormDto,
    submittedBy: string,
  ): Promise<FormSubmission> {
    const templateId = FormTemplateId.create(dto.templateId);

    // Buscar template
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new NotFoundException(`Template not found: ${dto.templateId}`);
    }

    // Verificar que template esté publicado
    if (!template.isPublished()) {
      throw new Error('Cannot submit form for unpublished template');
    }

    // Crear submission
    const submission = FormSubmission.create({
      templateId,
      templateVersion: template.getVersion(),
      contextType: dto.contextType || 'orden',
      contextId: dto.ordenId || dto.contextId,
      submittedBy,
    });

    // Establecer respuestas desde dto.answers o dto.data
    const answers = dto.answers || dto.data || {};
    for (const [fieldId, value] of Object.entries(answers)) {
      submission.setAnswer(fieldId, value);
    }

    // Enviar (valida internamente)
    try {
      submission.submit(template);
    } catch (error) {
      if (error instanceof ValidationFailedException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to submit form: ${message}`);
    }

    // Guardar
    const saved = await this.submissionRepository.save(submission);

    return saved;
  }
}

