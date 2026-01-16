/**
 * Aggregate Root: FormSubmission
 *
 * Representa una submission (respuesta) de un formulario
 *
 * Invariantes:
 * - Debe estar asociada a un template válido
 * - Respuestas deben validarse contra el template
 * - Solo puede enviarse una vez
 */

import { FormSubmissionId } from '../value-objects/form-submission-id.vo';
import { FormTemplateId } from '../value-objects/form-template-id.vo';
import { TemplateVersion } from '../value-objects/template-version.vo';
import { SubmissionStatus, SubmissionStatusEnum } from '../value-objects/submission-status.vo';
import { FieldValue } from '../value-objects/field-value.vo';
import { FormTemplate } from './form-template.entity';
import { ValidationFailedException, SubmissionValidationError } from '../exceptions';
import { FormSubmittedEvent, FormValidatedEvent } from '../events';
import { CalculationEngineService } from '../services/calculation-engine.service';
import { FormValidatorService } from '../services/form-validator.service';
import { AggregateRoot } from '../../../../shared/base/aggregate-root';

export interface CreateSubmissionProps {
  templateId: FormTemplateId;
  templateVersion: TemplateVersion;
  contextType: string;
  contextId?: string;
  submittedBy: string;
}

export class FormSubmission extends AggregateRoot {
  private static readonly calculationEngine = new CalculationEngineService();
  private static readonly validator = new FormValidatorService();

  private constructor(
    private readonly _id: FormSubmissionId,
    private _templateId: FormTemplateId,
    private _templateVersion: TemplateVersion,
    private _answers: Map<string, FieldValue>,
    private _status: SubmissionStatus,
    private _validationErrors: SubmissionValidationError[],
    private _contextType: string,
    private _submittedBy: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _contextId?: string,
    private _submittedAt?: Date,
    private _validatedAt?: Date,
    private _validatedBy?: string
  ) {
    super();
  }

  /**
   * Factory method: Crear nueva submission
   */
  public static create(props: CreateSubmissionProps): FormSubmission {
    const id = FormSubmissionId.generate();
    const now = new Date();

    return new FormSubmission(
      id,
      props.templateId,
      props.templateVersion,
      new Map(),
      SubmissionStatus.incomplete(),
      [],
      props.contextType,
      props.submittedBy,
      now,
      now,
      props.contextId,
      undefined, // submittedAt
      undefined, // validatedAt
      undefined // validatedBy
    );
  }

  /**
   * Recrear desde persistencia
   */
  public static fromPersistence(props: {
    id: string;
    templateId: string;
    templateVersion: string;
    answers: Record<string, any>;
    status: string;
    validationErrors?: SubmissionValidationError[];
    contextType: string;
    contextId?: string;
    submittedBy: string;
    submittedAt?: Date;
    validatedAt?: Date;
    validatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
  }): FormSubmission {
    const answers = new Map<string, FieldValue>();
    for (const [key, value] of Object.entries(props.answers)) {
      answers.set(key, FieldValue.create(value));
    }

    return new FormSubmission(
      FormSubmissionId.create(props.id),
      FormTemplateId.create(props.templateId),
      TemplateVersion.create(props.templateVersion),
      answers,
      SubmissionStatus.fromString(props.status),
      props.validationErrors || [],
      props.contextType,
      props.submittedBy,
      props.createdAt,
      props.updatedAt,
      props.contextId,
      props.submittedAt,
      props.validatedAt,
      props.validatedBy
    );
  }

  /**
   * Establecer respuesta para un campo
   */
  public setAnswer(fieldId: string, value: any): void {
    if (this.isComplete()) {
      throw new Error('Cannot modify answers after submission');
    }

    const fieldValue = FieldValue.create(value);
    this._answers.set(fieldId, fieldValue);
    this._updatedAt = new Date();
  }

  /**
   * Enviar formulario (validar y marcar como enviado)
   */
  public submit(template: FormTemplate): void {
    if (this.isComplete()) {
      throw new Error('Form already submitted');
    }

    // Aplicar defaults antes de validar
    this.applyDefaultValues(template);

    // Validar respuestas contra template
    const errors = this.validateAnswers(template);

    if (errors.length > 0) {
      this._validationErrors = errors;
      throw new ValidationFailedException('Form validation failed', errors);
    }

    // Calcular campos calculados
    this.calculateFields(template);

    this._status = SubmissionStatus.submitted();
    this._submittedAt = new Date();
    this._updatedAt = new Date();

    this.addDomainEvent(
      new FormSubmittedEvent({
        submissionId: this._id.getValue(),
        templateId: this._templateId.getValue(),
        submittedBy: this._submittedBy,
        contextType: this._contextType,
        contextId: this._contextId,
      })
    );
  }

  /**
   * Validar submission manualmente
   */
  public validate(validatedBy: string): void {
    if (!this.isSubmitted()) {
      throw new Error('Can only validate submitted forms');
    }

    this._status = SubmissionStatus.validated();
    this._validatedAt = new Date();
    this._validatedBy = validatedBy;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new FormValidatedEvent({
        submissionId: this._id.getValue(),
        templateId: this._templateId.getValue(),
        validatedBy,
      })
    );
  }

  /**
   * Validar respuestas contra template
   */
  private validateAnswers(template: FormTemplate): SubmissionValidationError[] {
    return FormSubmission.validator.validate(this._answers, template);
  }

  /**
   * Calcular campos calculados
   */
  private calculateFields(template: FormTemplate): void {
    const calculatedFields = template.getCalculatedFields();

    // Usar el estado más reciente del formulario (incluye defaults)
    const baseFormData = this.getFormDataObject();

    for (const field of calculatedFields) {
      const formula = field.getCalculationFormula();
      if (formula) {
        // No calcular si dependencias están incompletas
        const referenced = formula.getReferencedFields();
        const hasAllDependencies = referenced.every(ref => {
          const refValue = this._answers.get(ref);
          return refValue !== undefined && !refValue.isEmpty();
        });
        if (!hasAllDependencies) {
          continue;
        }

        const result = FormSubmission.calculationEngine.calculate(formula, baseFormData);
        if (result !== null) {
          this.setAnswer(field.getId(), result);
        }
      }
    }
  }

  private applyDefaultValues(template: FormTemplate): void {
    for (const field of template.getFields()) {
      if (this._answers.has(field.getId())) {
        continue;
      }

      const defaultValue = field.getDefaultValue();
      if (defaultValue && !defaultValue.isEmpty()) {
        this._answers.set(field.getId(), FieldValue.create(defaultValue.getValue()));
      }
    }
  }

  private getFormDataObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const [key, value] of this._answers.entries()) {
      obj[key] = value.getValue();
    }
    return obj;
  }

  // Getters
  public getId(): FormSubmissionId {
    return this._id;
  }

  public getTemplateId(): FormTemplateId {
    return this._templateId;
  }

  public getTemplateVersion(): TemplateVersion {
    return this._templateVersion;
  }

  public getAnswer(fieldId: string): FieldValue | undefined {
    return this._answers.get(fieldId);
  }

  public hasAnswer(fieldId: string): boolean {
    return this._answers.has(fieldId);
  }

  public getAnswers(): Map<string, FieldValue> {
    return new Map(this._answers);
  }

  public getAnswersObject(): Record<string, any> {
    const obj: Record<string, any> = {};
    this._answers.forEach((value, key) => {
      obj[key] = value.getValue();
    });
    return obj;
  }

  public getStatus(): SubmissionStatus {
    return this._status;
  }

  public getValidationErrors(): SubmissionValidationError[] {
    return [...this._validationErrors];
  }

  public getContextType(): string {
    return this._contextType;
  }

  public getContextId(): string | undefined {
    return this._contextId;
  }

  public getSubmittedBy(): string {
    return this._submittedBy;
  }

  public getSubmittedAt(): Date | undefined {
    return this._submittedAt;
  }

  public getValidatedAt(): Date | undefined {
    return this._validatedAt;
  }

  public getValidatedBy(): string | undefined {
    return this._validatedBy;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // Queries
  public isIncomplete(): boolean {
    return this._status.isIncomplete();
  }

  public isSubmitted(): boolean {
    return this._status.isSubmitted();
  }

  public isValidated(): boolean {
    return this._status.isValidated();
  }

  public isComplete(): boolean {
    return this.isSubmitted() || this.isValidated();
  }

  public hasValidationErrors(): boolean {
    return this._validationErrors.length > 0;
  }
}
