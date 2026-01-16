/**
 * Exception: HESYaCompletadoException
 *
 * Se lanza cuando se intenta editar una HES ya completada
 */

export class HESYaCompletadoException extends Error {
  constructor() {
    super('No se puede editar una HES ya completada');
    this.name = 'HESYaCompletadoException';
    Object.setPrototypeOf(this, HESYaCompletadoException.prototype);
  }
}
