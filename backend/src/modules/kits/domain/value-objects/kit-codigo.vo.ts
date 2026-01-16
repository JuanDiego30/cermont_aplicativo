/**
 * Value Object: KitCodigo
 *
 * Código único legible de un Kit (ej: KIT-ELEC-001)
 */
import { ValidationError } from "../../../../shared/domain/exceptions";

export class KitCodigo {
  private static readonly PATTERN = /^KIT-([A-Z]{3,4}-)?[0-9]{3,4}$/;

  private constructor(private readonly _value: string) {
    Object.freeze(this);
  }

  public static create(value: string): KitCodigo {
    this.validate(value);
    return new KitCodigo(value);
  }

  public static generate(categoriaPrefix: string, sequence: number): KitCodigo {
    const prefix = categoriaPrefix.toUpperCase().substring(0, 4);
    const sequenceStr = sequence.toString().padStart(3, "0");
    return new KitCodigo(`KIT-${prefix}-${sequenceStr}`);
  }

  public static generateSimple(sequence: number): KitCodigo {
    const sequenceStr = sequence.toString().padStart(3, "0");
    return new KitCodigo(`KIT-${sequenceStr}`);
  }

  private static validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValidationError("Código de kit no puede estar vacío", "codigo");
    }
    if (!this.PATTERN.test(value)) {
      throw new ValidationError(
        "Formato de código inválido. Esperado: KIT-XXX-000 o KIT-000",
        "codigo",
      );
    }
  }

  public getValue(): string {
    return this._value;
  }

  public equals(other: KitCodigo): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}

