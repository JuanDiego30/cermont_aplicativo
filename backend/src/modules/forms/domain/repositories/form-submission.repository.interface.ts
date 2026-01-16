/**
 * Repository Interface: IFormSubmissionRepository
 *
 * Contrato para persistencia de FormSubmission
 */

import { FormSubmission } from "../entities/form-submission.entity";
import { FormSubmissionId } from "../value-objects/form-submission-id.vo";
import { FormTemplateId } from "../value-objects/form-template-id.vo";

export interface IFormSubmissionRepository {
  /**
   * Guardar submission (create o update)
   */
  save(submission: FormSubmission): Promise<FormSubmission>;

  /**
   * Buscar por ID
   */
  findById(id: FormSubmissionId): Promise<FormSubmission | null>;

  /**
   * Buscar por template
   */
  findByTemplate(templateId: FormTemplateId): Promise<FormSubmission[]>;

  /**
   * Buscar por contexto
   */
  findByContext(
    contextType: string,
    contextId: string,
  ): Promise<FormSubmission[]>;

  /**
   * Contar submissions de un template
   */
  countSubmissions(templateId: FormTemplateId): Promise<number>;

  /**
   * Buscar todas las submissions
   */
  findAll(): Promise<FormSubmission[]>;

  /**
   * Eliminar submission
   */
  delete(id: FormSubmissionId): Promise<void>;
}
