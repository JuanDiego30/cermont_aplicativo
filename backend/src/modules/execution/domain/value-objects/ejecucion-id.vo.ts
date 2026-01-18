/**
 * @vo EjecucionId
 * Value Object representing a unique identifier for an Ejecucion (Execution).
 */
import { randomUUID } from 'crypto';

export class EjecucionId {
  private constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('EjecucionId cannot be empty');
    }
  }

  public static generate(): EjecucionId {
    return new EjecucionId(randomUUID());
  }

  public static create(value: string): EjecucionId {
    return new EjecucionId(value);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: EjecucionId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
