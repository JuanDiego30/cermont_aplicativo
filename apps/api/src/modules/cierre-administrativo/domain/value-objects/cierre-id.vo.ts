/**
 * @valueObject CierreId
 *
 * UUID identifier for cierre administrativo
 */

import { randomUUID } from "crypto";
import { ValidationError } from "../exceptions";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CierreId {
  private constructor(private readonly value: string) {
    Object.freeze(this);
  }

  static generate(): CierreId {
    return new CierreId(randomUUID());
  }

  static create(value: string): CierreId {
    if (!value || !UUID_REGEX.test(value)) {
      throw new ValidationError("CierreId debe ser un UUID válido", "cierreId");
    }
    return new CierreId(value.toLowerCase());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CierreId): boolean {
    return other instanceof CierreId && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJSON(): string {
    return this.value;
  }
}
