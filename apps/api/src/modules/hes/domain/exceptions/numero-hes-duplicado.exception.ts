/**
 * Exception: NumeroHESDuplicadoException
 * 
 * Se lanza cuando se intenta crear una HES con número duplicado
 */

export class NumeroHESDuplicadoException extends Error {
  constructor(public readonly numero: string) {
    super(`Ya existe una HES con número: ${numero}`);
    this.name = 'NumeroHESDuplicadoException';
    Object.setPrototypeOf(this, NumeroHESDuplicadoException.prototype);
  }
}

