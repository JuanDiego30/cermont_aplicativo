/**
 * Exception: FirmaInvalidaException
 *
 * Se lanza cuando una firma digital es inválida
 */

export class FirmaInvalidaException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirmaInvalidaException';
    Object.setPrototypeOf(this, FirmaInvalidaException.prototype);
  }
}
