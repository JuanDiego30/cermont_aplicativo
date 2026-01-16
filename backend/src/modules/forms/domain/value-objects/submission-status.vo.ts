/**
 * Value Object: SubmissionStatus
 *
 * Estado de una submission de formulario (INCOMPLETE, SUBMITTED, VALIDATED)
 */

export enum SubmissionStatusEnum {
  INCOMPLETE = 'INCOMPLETE',
  SUBMITTED = 'SUBMITTED',
  VALIDATED = 'VALIDATED',
}

export class SubmissionStatus {
  private constructor(private readonly _value: SubmissionStatusEnum) {
    Object.freeze(this);
  }

  public static incomplete(): SubmissionStatus {
    return new SubmissionStatus(SubmissionStatusEnum.INCOMPLETE);
  }

  public static submitted(): SubmissionStatus {
    return new SubmissionStatus(SubmissionStatusEnum.SUBMITTED);
  }

  public static validated(): SubmissionStatus {
    return new SubmissionStatus(SubmissionStatusEnum.VALIDATED);
  }

  public static fromString(value: string): SubmissionStatus {
    const enumValue = Object.values(SubmissionStatusEnum).find(v => v === value.toUpperCase());
    if (!enumValue) {
      throw new Error(`Invalid SubmissionStatus: ${value}`);
    }
    return new SubmissionStatus(enumValue);
  }

  public isIncomplete(): boolean {
    return this._value === SubmissionStatusEnum.INCOMPLETE;
  }

  public isSubmitted(): boolean {
    return this._value === SubmissionStatusEnum.SUBMITTED;
  }

  public isValidated(): boolean {
    return this._value === SubmissionStatusEnum.VALIDATED;
  }

  public getValue(): SubmissionStatusEnum {
    return this._value;
  }

  public equals(other: SubmissionStatus): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
