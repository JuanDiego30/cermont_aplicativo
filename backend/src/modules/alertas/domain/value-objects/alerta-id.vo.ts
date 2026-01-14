/**
 * Value Object: AlertaId
 *
 * Representa un identificador único de alerta (UUID v4)
 *
 * Invariantes:
 * - Debe ser un UUID válido (formato 8-4-4-4-12)
 * - Inmutable
 *
 * @example
 * // Generar nuevo
 * const id = AlertaId.generate();
 *
 * // Desde existente
 * const id = AlertaId.create('123e4567-e89b-12d3-a456-426614174000');
 */

import { randomUUID } from "crypto";
import { ValidationError } from "../exceptions";

// Regex para validar UUID v4
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class AlertaId {
  private constructor(private readonly _value: string) {
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Generar un nuevo AlertaId (UUID v4)
   */
  public static generate(): AlertaId {
    return new AlertaId(randomUUID());
  }

  /**
   * Crear desde UUID existente
   * @throws {ValidationError} si el UUID es inválido
   */
  public static create(value: string): AlertaId {
    if (!value || typeof value !== "string" || !UUID_REGEX.test(value)) {
      throw new ValidationError(
        "AlertaId debe ser un UUID válido",
        "alertaId",
        value,
      );
    }
    return new AlertaId(value.toLowerCase());
  }

  /**
   * Obtener el valor del ID
   */
  public getValue(): string {
    return this._value;
  }

  /**
   * Comparación por valor (no por referencia)
   */
  public equals(other: AlertaId): boolean {
    if (!other || !(other instanceof AlertaId)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * Representación en string
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Serialización JSON
   */
  public toJSON(): string {
    return this._value;
  }
}
