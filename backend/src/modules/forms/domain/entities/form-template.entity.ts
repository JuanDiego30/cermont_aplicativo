/**
 * Aggregate Root: FormTemplate
 *
 * Representa un template de formulario dinámico
 *
 * Invariantes:
 * - Nombre no puede estar vacío
 * - Debe tener al menos 1 campo para publicar
 * - Solo DRAFT puede editarse
 * - Solo PUBLISHED puede tener submissions
 */

import { FormTemplateId } from "../value-objects/form-template-id.vo";
import { TemplateVersion } from "../value-objects/template-version.vo";
import { FormStatus, FormStatusEnum } from "../value-objects/form-status.vo";
import { FormField } from "./form-field.entity";
import {
  BusinessRuleViolationError,
  TemplateNotPublishableException,
} from "../exceptions";
import { ValidationError } from "../../../../shared/domain/exceptions";
import {
  TemplateCreatedEvent,
  TemplatePublishedEvent,
  TemplateArchivedEvent,
} from "../events";
import { AggregateRoot } from "../../../../shared/base/aggregate-root";

export interface CreateFormTemplateProps {
  name: string;
  description?: string;
  contextType: string; // 'orden', 'checklist', 'inspeccion', 'encuesta'
  createdBy: string;
  version?: TemplateVersion;
  previousVersionId?: FormTemplateId;
  fields?: FormField[];
}

export class FormTemplate extends AggregateRoot {

  private constructor(
    private readonly _id: FormTemplateId,
    private _name: string,
    private _description: string | undefined,
    private _version: TemplateVersion,
    private _status: FormStatus,
    private _fields: FormField[],
    private _schema: Record<string, any>,
    private _contextType: string,
    private _createdBy: string,
    private _createdAt: Date,
    private _updatedBy?: string,
    private _updatedAt?: Date,
    private _publishedAt?: Date,
    private _archivedAt?: Date,
    private _previousVersionId?: FormTemplateId,
    private _isLatestVersion: boolean = true,
  ) {
    super();
    this.validate();
  }

  /**
   * Factory method: Crear nuevo template
   */
  public static create(props: CreateFormTemplateProps): FormTemplate {
    const id = FormTemplateId.generate();
    const version = props.version || TemplateVersion.initial();
    const status = FormStatus.draft();
    const fields = props.fields || [];
    const createdAt = new Date();

    const template = new FormTemplate(
      id,
      props.name,
      props.description,
      version,
      status,
      fields,
      {}, // schema se genera después
      props.contextType,
      props.createdBy,
      createdAt,
      undefined, // updatedBy
      undefined, // updatedAt
      undefined, // publishedAt
      undefined, // archivedAt
      props.previousVersionId,
      true, // isLatestVersion
    );

    // Generar schema inicial
    template.regenerateSchema();

    // Agregar evento de dominio
    template.addDomainEvent(
      new TemplateCreatedEvent({
        templateId: id.getValue(),
        name: props.name,
        contextType: props.contextType,
        createdBy: props.createdBy,
      }),
    );

    return template;
  }

  /**
   * Recrear desde persistencia
   */
  public static fromPersistence(props: {
    id: string;
    name: string;
    description?: string;
    version: string;
    status: string;
    fields: any[];
    schema: Record<string, any>;
    contextType: string;
    createdBy: string;
    createdAt: Date;
    updatedBy?: string;
    updatedAt?: Date;
    publishedAt?: Date;
    archivedAt?: Date;
    previousVersionId?: string;
    isLatestVersion?: boolean;
  }): FormTemplate {
    const fields = props.fields.map((f) => FormField.fromPersistence(f));

    return new FormTemplate(
      FormTemplateId.create(props.id),
      props.name,
      props.description,
      TemplateVersion.create(props.version),
      FormStatus.fromString(props.status),
      fields,
      props.schema,
      props.contextType,
      props.createdBy,
      props.createdAt,
      props.updatedBy,
      props.updatedAt,
      props.publishedAt,
      props.archivedAt,
      props.previousVersionId
        ? FormTemplateId.create(props.previousVersionId)
        : undefined,
      props.isLatestVersion ?? true,
    );
  }

  /**
   * Agregar campo al template
   */
  public addField(field: FormField): void {
    if (!this.canEdit()) {
      throw new BusinessRuleViolationError("Cannot edit published template");
    }

    // Validar que no exista campo con mismo ID
    if (this.hasField(field.getId())) {
      throw new BusinessRuleViolationError(
        `Field with id ${field.getId()} already exists`,
      );
    }

    this._fields.push(field);
    this.regenerateSchema();
    this.markAsUpdated();
  }

  /**
   * Remover campo del template
   */
  public removeField(fieldId: string): void {
    if (!this.canEdit()) {
      throw new BusinessRuleViolationError("Cannot edit published template");
    }

    const field = this.findField(fieldId);
    if (!field) {
      throw new BusinessRuleViolationError(
        `Field with id ${fieldId} not found`,
      );
    }

    this._fields = this._fields.filter((f) => f.getId() !== fieldId);
    this.regenerateSchema();
    this.markAsUpdated();
  }

  /**
   * Actualizar campo existente
   */
  public updateField(fieldId: string, updates: Partial<FormField>): void {
    if (!this.canEdit()) {
      throw new BusinessRuleViolationError("Cannot edit published template");
    }

    const field = this.findField(fieldId);
    if (!field) {
      throw new BusinessRuleViolationError(
        `Field with id ${fieldId} not found`,
      );
    }

    // Actualizar campo (inmutabilidad)
    const updatedField = field.update(updates as any);
    this._fields = this._fields.map((f) =>
      f.getId() === fieldId ? updatedField : f,
    );

    this.regenerateSchema();
    this.markAsUpdated();
  }

  /**
   * Publicar template
   */
  public publish(): void {
    if (!this.canPublish()) {
      const reasons = this.getPublishValidationErrors();
      throw new TemplateNotPublishableException(
        "Template cannot be published",
        reasons,
      );
    }

    if (!this._status.canTransitionTo(FormStatusEnum.PUBLISHED)) {
      throw new BusinessRuleViolationError(
        `Cannot transition from ${this._status.getValue()} to PUBLISHED`,
      );
    }

    this._status = FormStatus.published();
    this._publishedAt = new Date();
    this.markAsUpdated();

    this.addDomainEvent(
      new TemplatePublishedEvent({
        templateId: this._id.getValue(),
        name: this._name,
        version: this._version.toString(),
      }),
    );
  }

  /**
   * Archivar template
   */
  public archive(): void {
    if (this.isArchived()) {
      throw new BusinessRuleViolationError("Template already archived");
    }

    if (!this._status.canTransitionTo(FormStatusEnum.ARCHIVED)) {
      throw new BusinessRuleViolationError(
        `Cannot transition from ${this._status.getValue()} to ARCHIVED`,
      );
    }

    this._status = FormStatus.archived();
    this._archivedAt = new Date();
    this.markAsUpdated();

    this.addDomainEvent(
      new TemplateArchivedEvent({
        templateId: this._id.getValue(),
        name: this._name,
      }),
    );
  }

  /**
   * Crear nueva versión del template
   */
  public createNewVersion(createdBy: string): FormTemplate {
    if (!this.isPublished()) {
      throw new BusinessRuleViolationError(
        "Can only version published templates",
      );
    }

    const newVersion = FormTemplate.create({
      name: this._name,
      description: this._description,
      contextType: this._contextType,
      createdBy,
      version: this._version.incrementMinor(),
      previousVersionId: this._id,
      fields: this._fields.map((f) => f.clone()),
    });

    // Marcar versión anterior como no-latest
    this._isLatestVersion = false;

    return newVersion;
  }

  /**
   * Actualizar información básica
   */
  public updateInfo(updates: {
    name?: string;
    description?: string;
    updatedBy: string;
  }): void {
    if (!this.canEdit()) {
      throw new BusinessRuleViolationError("Cannot edit published template");
    }

    if (updates.name) {
      if (updates.name.trim().length === 0) {
        throw new ValidationError("Name cannot be empty", "name");
      }
      this._name = updates.name.trim();
    }

    if (updates.description !== undefined) {
      this._description = updates.description?.trim();
    }

    this.markAsUpdated(updates.updatedBy);
  }

  /**
   * Regenerar JSON Schema desde campos
   */
  private regenerateSchema(): void {
    // Generación básica de schema
    // En producción, usar FormSchemaGeneratorService
    const schema: Record<string, any> = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {},
      required: [],
    };

    for (const field of this._fields) {
      const fieldSchema: Record<string, any> = {
        type: field.getType().getJsonSchemaType(),
        title: field.getLabel(),
      };

      if (field.getHelpText()) {
        fieldSchema.description = field.getHelpText();
      }

      // Agregar validaciones
      for (const validation of field.getValidations()) {
        Object.assign(fieldSchema, validation.toJsonSchema());
      }

      // Opciones para SELECT, RADIO, etc.
      if (field.getType().requiresOptions()) {
        fieldSchema.enum = field.getOptions();
      }

      schema.properties[field.getId()] = fieldSchema;

      if (field.isRequired()) {
        schema.required.push(field.getId());
      }
    }

    this._schema = schema;
  }

  private canEdit(): boolean {
    return this._status.isDraft();
  }

  private canPublish(): boolean {
    // Validaciones:
    // - Al menos 1 campo
    // - Todos los campos tienen configuración válida
    return this._fields.length > 0 && this._fields.every((f) => f.isValid());
  }

  private getPublishValidationErrors(): string[] {
    const errors: string[] = [];

    if (this._fields.length === 0) {
      errors.push("Template must have at least one field");
    }

    for (const field of this._fields) {
      if (!field.isValid()) {
        errors.push(`Field "${field.getLabel()}" is invalid`);
      }
    }

    return errors;
  }

  private hasField(fieldId: string): boolean {
    return this._fields.some((f) => f.getId() === fieldId);
  }

  private findField(fieldId: string): FormField | undefined {
    return this._fields.find((f) => f.getId() === fieldId);
  }

  private markAsUpdated(updatedBy?: string): void {
    this._updatedBy = updatedBy || this._createdBy;
    this._updatedAt = new Date();
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new ValidationError("Template name is required", "name");
    }
  }

  // Getters
  public getId(): FormTemplateId {
    return this._id;
  }

  public getName(): string {
    return this._name;
  }

  public getDescription(): string | undefined {
    return this._description;
  }

  public getVersion(): TemplateVersion {
    return this._version;
  }

  public getStatus(): FormStatus {
    return this._status;
  }

  public getFields(): FormField[] {
    return [...this._fields];
  }

  public getSchema(): Record<string, any> {
    return { ...this._schema };
  }

  public getContextType(): string {
    return this._contextType;
  }

  public getCreatedBy(): string {
    return this._createdBy;
  }

  public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedBy(): string | undefined {
    return this._updatedBy;
  }

  public getUpdatedAt(): Date | undefined {
    return this._updatedAt;
  }

  public getPublishedAt(): Date | undefined {
    return this._publishedAt;
  }

  public getArchivedAt(): Date | undefined {
    return this._archivedAt;
  }

  public getPreviousVersionId(): FormTemplateId | undefined {
    return this._previousVersionId;
  }

  public isLatestVersion(): boolean {
    return this._isLatestVersion;
  }

  // Queries
  public isDraft(): boolean {
    return this._status.isDraft();
  }

  public isPublished(): boolean {
    return this._status.isPublished();
  }

  public isArchived(): boolean {
    return this._status.isArchived();
  }

  public getRequiredFields(): FormField[] {
    return this._fields.filter((f) => f.isRequired());
  }

  public getFieldsWithConditionalLogic(): FormField[] {
    return this._fields.filter((f) => f.hasConditionalLogic());
  }

  public getCalculatedFields(): FormField[] {
    return this._fields.filter((f) => f.isCalculated());
  }

  public getField(fieldId: string): FormField | undefined {
    return this.findField(fieldId);
  }
}

