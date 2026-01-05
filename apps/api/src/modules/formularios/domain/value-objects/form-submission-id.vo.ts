/**
 * Value Object: FormSubmissionId
 *
 * Identificador único de una submission de formulario
 */

import { ValidationError } from "../../../../common/domain/exceptions";

export class FormSubmissionId {
  private constructor(private readonly _value: string) {
    if (!_value || _value.trim() === "") {
      throw new ValidationError("FormSubmissionId cannot be empty");
    }
    Object.freeze(this);
  }

  public static create(value: string): FormSubmissionId {
    return new FormSubmissionId(value);
  }

  public static generate(): FormSubmissionId {
    const { randomUUID } = require("crypto");
    return new FormSubmissionId(randomUUID());
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: FormSubmissionId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
