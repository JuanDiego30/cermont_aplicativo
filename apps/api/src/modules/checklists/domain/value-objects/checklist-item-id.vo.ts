/**
 * Value Object: ChecklistItemId
 *
 * Identificador único de item de checklist (UUID v4)
 */

import { randomUUID } from "crypto";
import { ValidationError } from "../exceptions";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ChecklistItemId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static generate(): ChecklistItemId {
    return new ChecklistItemId(randomUUID());
  }

  public static create(value: string): ChecklistItemId {
    if (!value || typeof value !== "string" || !UUID_REGEX.test(value)) {
      throw new ValidationError(
        "ChecklistItemId debe ser un UUID válido",
        "checklistItemId",
        value,
      );
    }
    return new ChecklistItemId(value.toLowerCase());
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: ChecklistItemId): boolean {
    if (!other || !(other instanceof ChecklistItemId)) {
      return false;
    }
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
