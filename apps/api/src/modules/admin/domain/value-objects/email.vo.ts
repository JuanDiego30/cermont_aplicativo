/**
 * @valueObject Email
 * 
 * Email como Value Object con validación inmutable.
 * Garantiza que todo email en el sistema sea válido.
 */

export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  /**
   * Crea un Email validado
   * @throws Error si el email es inválido
   */
  static create(email: string): Email {
    const normalized = email?.toLowerCase().trim();
    
    if (!this.isValid(normalized)) {
      throw new Error(`Email inválido: ${email}`);
    }
    
    return new Email(normalized);
  }

  /**
   * Valida formato de email
   */
  private static isValid(email: string): boolean {
    if (!email || email.length > 255) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Obtiene el valor del email
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Compara con otro Email
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Representación string
   */
  toString(): string {
    return this.value;
  }

  /**
   * Obtiene el dominio del email
   */
  getDomain(): string {
    return this.value.split('@')[1];
  }

  /**
   * Verifica si es email corporativo
   */
  isCorporate(corporateDomains: string[]): boolean {
    return corporateDomains.includes(this.getDomain());
  }

  /**
   * Obtiene la parte local del email (antes del @)
   */
  getLocalPart(): string {
    return this.value.split('@')[0];
  }
}
