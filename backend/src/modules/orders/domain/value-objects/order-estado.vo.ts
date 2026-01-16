/**
 * @valueObject Orderstado
 * @description Value Object que representa el estado de una Order
 * @layer Domain
 */
export type EstadoOrder =
  | 'pendiente'
  | 'planeacion'
  | 'ejecucion'
  | 'completada'
  | 'cancelada'
  | 'pausada';

export class Orderstado {
  /**
   * IMPORTANT:
   * Keep transitions aligned with unit tests under
   * `modules/Orders/domain/value-objects/__tests__/Order-estado.vo.spec.ts`.
   */
  private static readonly VALID_TRANSITIONS: Record<EstadoOrder, EstadoOrder[]> = {
    pendiente: ['planeacion', 'cancelada'],
    planeacion: ['ejecucion', 'cancelada'],
    ejecucion: ['completada', 'pausada', 'cancelada'],
    completada: [],
    cancelada: [],
    pausada: ['ejecucion', 'cancelada'],
  };

  private constructor(private readonly _value: EstadoOrder) {
    Object.freeze(this);
  }

  get value(): EstadoOrder {
    return this._value;
  }

  get isActive(): boolean {
    return ['pendiente', 'planeacion', 'ejecucion', 'pausada'].includes(this._value);
  }

  get isFinal(): boolean {
    return ['completada', 'cancelada'].includes(this._value);
  }

  get canStartExecution(): boolean {
    return this._value === 'planeacion';
  }

  get canComplete(): boolean {
    return this._value === 'ejecucion';
  }

  static create(value: EstadoOrder): Orderstado {
    return new Orderstado(value);
  }

  static pendiente(): Orderstado {
    return new Orderstado('pendiente');
  }

  static planeacion(): Orderstado {
    return new Orderstado('planeacion');
  }

  static ejecucion(): Orderstado {
    return new Orderstado('ejecucion');
  }

  static completada(): Orderstado {
    return new Orderstado('completada');
  }

  static cancelada(): Orderstado {
    return new Orderstado('cancelada');
  }

  static pausada(): Orderstado {
    return new Orderstado('pausada');
  }

  canTransitionTo(newState: EstadoOrder): boolean {
    return Orderstado.VALID_TRANSITIONS[this._value].includes(newState);
  }

  transitionTo(newState: EstadoOrder): Orderstado {
    if (!this.canTransitionTo(newState)) {
      throw new Error(`Transición inválida de ${this._value} a ${newState}`);
    }
    return Orderstado.create(newState);
  }

  getAllowedTransitions(): EstadoOrder[] {
    return Orderstado.VALID_TRANSITIONS[this._value];
  }

  equals(other: Orderstado): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
