/**
 * Use Case: GetSubmissionUseCase
 * 
 * Obtiene una submission por ID
 */

import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { FormSubmission } from '../../domain/entities/form-submission.entity';
import { FormSubmissionId } from '../../domain/value-objects/form-submission-id.vo';
import {
  IFormSubmissionRepository,
  FORM_SUBMISSION_REPOSITORY,
} from '../../domain/repositories';

@Injectable()
export class GetSubmissionUseCase {
  constructor(
    @Inject(FORM_SUBMISSION_REPOSITORY)

    private readonly submissionRepository: IFormSubmissionRepository,
  ) { }

  async execute(submissionId: string): Promise<FormSubmission> {
    const id = FormSubmissionId.create(submissionId);

    const submission = await this.submissionRepository.findById(id);
    if (!submission) {
      throw new NotFoundException(`Submission not found: ${submissionId}`);
    }

    return submission;
  }
}

