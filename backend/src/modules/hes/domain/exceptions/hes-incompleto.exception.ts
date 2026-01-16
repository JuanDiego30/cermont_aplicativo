/**
 * Exception: HESIncompletoException
 *
 * Se lanza cuando se intenta completar una HES incompleta
 */

export class HESIncompletoException extends Error {
  constructor(public readonly errores: string[]) {
    super(`HES incompleta: ${errores.join(', ')}`);
    this.name = 'HESIncompletoException';
    Object.setPrototypeOf(this, HESIncompletoException.prototype);
  }
}
