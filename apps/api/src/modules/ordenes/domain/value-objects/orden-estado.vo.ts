/**
 * @valueObject OrdenEstado
 * @description Value Object que representa el estado de una orden
 * @layer Domain
 */
export type EstadoOrden =
  | 'planeacion'
  | 'ejecucion'
  | 'pausada'
  | 'completada'
  | 'cancelada';

export class OrdenEstado {
  private static readonly VALID_TRANSITIONS: Record<EstadoOrden, EstadoOrden[]> = {
    planeacion: ['ejecucion', 'cancelada'],
    ejecucion: ['pausada', 'completada', 'cancelada'],
    pausada: ['ejecucion', 'cancelada'],
    completada: [],
    cancelada: [],
  };

  private constructor(private readonly _value: EstadoOrden) {
    Object.freeze(this);
  }

  get value(): EstadoOrden {
    return this._value;
  }

  get isActive(): boolean {
    return ['planeacion', 'ejecucion', 'pausada'].includes(this._value);
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

  static create(value: EstadoOrden): OrdenEstado {
    return new OrdenEstado(value);
  }

  static planeacion(): OrdenEstado {
    return new OrdenEstado('planeacion');
  }

  static ejecucion(): OrdenEstado {
    return new OrdenEstado('ejecucion');
  }

  static pausada(): OrdenEstado {
    return new OrdenEstado('pausada');
  }

  static completada(): OrdenEstado {
    return new OrdenEstado('completada');
  }

  static cancelada(): OrdenEstado {
    return new OrdenEstado('cancelada');
  }

  canTransitionTo(newState: EstadoOrden): boolean {
    return OrdenEstado.VALID_TRANSITIONS[this._value].includes(newState);
  }

  transitionTo(newState: EstadoOrden): OrdenEstado {
    if (!this.canTransitionTo(newState)) {
      throw new Error(
        `Transición inválida de ${this._value} a ${newState}`,
      );
    }
    return OrdenEstado.create(newState);
  }

  getAllowedTransitions(): EstadoOrden[] {
    return OrdenEstado.VALID_TRANSITIONS[this._value];
  }

  equals(other: OrdenEstado): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
