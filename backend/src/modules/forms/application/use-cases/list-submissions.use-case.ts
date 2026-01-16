/**
 * Use Case: ListSubmissionsUseCase
 *
 * Lista submissions con filtros opcionales
 */

import { Injectable, Inject } from '@nestjs/common';
import { FormSubmission } from '../../domain/entities/form-submission.entity';
import { FormTemplateId } from '../../domain/value-objects/form-template-id.vo';
import { IFormSubmissionRepository, FORM_SUBMISSION_REPOSITORY } from '../../domain/repositories';
import { ListSubmissionsQueryDto } from '../dto/list-submissions-query.dto';

@Injectable()
export class ListSubmissionsUseCase {
  constructor(
    @Inject(FORM_SUBMISSION_REPOSITORY)
    private readonly submissionRepository: IFormSubmissionRepository
  ) {}

  async execute(query: ListSubmissionsQueryDto): Promise<FormSubmission[]> {
    // Si se especifica templateId, filtrar por template
    if (query.templateId) {
      const templateId = FormTemplateId.create(query.templateId);
      return this.submissionRepository.findByTemplate(templateId);
    }

    // Si se especifica contexto, filtrar por contexto
    if (query.contextType && query.contextId) {
      return this.submissionRepository.findByContext(query.contextType, query.contextId);
    }

    // Por defecto, todas las submissions
    return this.submissionRepository.findAll();
  }
}
