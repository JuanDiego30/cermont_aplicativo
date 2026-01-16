/**
 * @valueObject OrderEstado
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

export class OrderEstado {
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

  static create(value: EstadoOrder): OrderEstado {
    return new OrderEstado(value);
  }

  static pendiente(): OrderEstado {
    return new OrderEstado('pendiente');
  }

  static planeacion(): OrderEstado {
    return new OrderEstado('planeacion');
  }

  static ejecucion(): OrderEstado {
    return new OrderEstado('ejecucion');
  }

  static completada(): OrderEstado {
    return new OrderEstado('completada');
  }

  static cancelada(): OrderEstado {
    return new OrderEstado('cancelada');
  }

  static pausada(): OrderEstado {
    return new OrderEstado('pausada');
  }

  canTransitionTo(newState: EstadoOrder): boolean {
    return OrderEstado.VALID_TRANSITIONS[this._value].includes(newState);
  }

  transitionTo(newState: EstadoOrder): OrderEstado {
    if (!this.canTransitionTo(newState)) {
      throw new Error(`Transición inválida de ${this._value} a ${newState}`);
    }
    return OrderEstado.create(newState);
  }

  getAllowedTransitions(): EstadoOrder[] {
    return OrderEstado.VALID_TRANSITIONS[this._value];
  }

  equals(other: OrderEstado): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
