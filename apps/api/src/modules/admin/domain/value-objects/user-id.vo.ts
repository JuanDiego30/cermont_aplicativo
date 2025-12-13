/**
 * @valueObject UserId
 * 
 * UserId tipado como UUID.
 */

import { randomUUID } from 'crypto';

// Regex para validar UUID v4
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class UserId {
  private readonly value: string;

  private constructor(id: string) {
    this.value = id;
  }

  /**
   * Crea un nuevo UserId (genera UUID)
   */
  static create(): UserId {
    return new UserId(randomUUID());
  }

  /**
   * Crea UserId desde string existente
   * @throws Error si el UUID es inválido
   */
  static fromString(id: string): UserId {
    if (!this.isValidUUID(id)) {
      throw new Error(`UUID inválido: ${id}`);
    }
    return new UserId(id.toLowerCase());
  }

  /**
   * Valida formato UUID
   */
  private static isValidUUID(id: string): boolean {
    if (!id) return false;
    return UUID_REGEX.test(id);
  }

  /**
   * Obtiene el valor del ID
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compara con otro UserId
   */
  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  /**
   * Representación string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Para serialización JSON
   */
  toJSON(): string {
    return this.value;
  }
}
