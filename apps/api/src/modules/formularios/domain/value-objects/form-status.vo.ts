/**
 * Value Object: FormStatus
 * 
 * Estado de un template de formulario (DRAFT, PUBLISHED, ARCHIVED)
 */

export enum FormStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class FormStatus {
  private static readonly VALID_TRANSITIONS: Map<FormStatusEnum, FormStatusEnum[]> = new Map([
    [FormStatusEnum.DRAFT, [FormStatusEnum.PUBLISHED]],
    [FormStatusEnum.PUBLISHED, [FormStatusEnum.ARCHIVED]],
    [FormStatusEnum.ARCHIVED, []],
  ]);

  private constructor(private readonly _value: FormStatusEnum) {
    Object.freeze(this);
  }

  public static draft(): FormStatus {
    return new FormStatus(FormStatusEnum.DRAFT);
  }

  public static published(): FormStatus {
    return new FormStatus(FormStatusEnum.PUBLISHED);
  }

  public static archived(): FormStatus {
    return new FormStatus(FormStatusEnum.ARCHIVED);
  }

  public static fromString(value: string): FormStatus {
    const enumValue = Object.values(FormStatusEnum).find(
      (v) => v === value.toUpperCase()
    );
    if (!enumValue) {
      throw new Error(`Invalid FormStatus: ${value}`);
    }
    return new FormStatus(enumValue);
  }

  public canTransitionTo(newStatus: FormStatusEnum): boolean {
    const allowed = FormStatus.VALID_TRANSITIONS.get(this._value) || [];
    return allowed.includes(newStatus);
  }

  public isDraft(): boolean {
    return this._value === FormStatusEnum.DRAFT;
  }

  public isPublished(): boolean {
    return this._value === FormStatusEnum.PUBLISHED;
  }

  public isArchived(): boolean {
    return this._value === FormStatusEnum.ARCHIVED;
  }

  public getValue(): FormStatusEnum {
    return this._value;
  }

  public equals(other: FormStatus): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}

