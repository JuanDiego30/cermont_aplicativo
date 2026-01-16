/**
 * @valueObject EvidenciaId
 * @description Value Object for Evidencia unique identifier
 */

import { randomUUID } from "crypto";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string): boolean => UUID_REGEX.test(value);

export class EvidenciaId {
  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static generate(): EvidenciaId {
    return new EvidenciaId(randomUUID());
  }

  public static create(value: string): EvidenciaId {
    if (!value || !isUuid(value)) {
      throw new Error(`Invalid EvidenciaId: ${value}`);
    }
    return new EvidenciaId(value);
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: EvidenciaId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
