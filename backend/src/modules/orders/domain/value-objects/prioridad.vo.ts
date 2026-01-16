/**
 * @valueObject Prioridad
 * @description Value Object que representa la prioridad de una Order
 * @layer Domain
 */
export type PrioridadLevel = 'baja' | 'media' | 'alta' | 'urgente';

export class Prioridad {
  private static readonly WEIGHTS: Record<PrioridadLevel, number> = {
    baja: 1,
    media: 2,
    alta: 3,
    urgente: 4,
  };

  private static readonly COLORS: Record<PrioridadLevel, string> = {
    baja: '#22c55e', // green
    media: '#eab308', // yellow
    alta: '#f97316', // orange
    urgente: '#ef4444', // red
  };

  private constructor(private readonly _value: PrioridadLevel) {
    Object.freeze(this);
  }

  get value(): PrioridadLevel {
    return this._value;
  }

  get weight(): number {
    return Prioridad.WEIGHTS[this._value];
  }

  get color(): string {
    return Prioridad.COLORS[this._value];
  }

  get isUrgent(): boolean {
    return this._value === 'urgente';
  }

  get isHigh(): boolean {
    return this._value === 'alta' || this._value === 'urgente';
  }

  static create(value: PrioridadLevel): Prioridad {
    return new Prioridad(value);
  }

  static baja(): Prioridad {
    return new Prioridad('baja');
  }

  static media(): Prioridad {
    return new Prioridad('media');
  }

  static alta(): Prioridad {
    return new Prioridad('alta');
  }

  static urgente(): Prioridad {
    return new Prioridad('urgente');
  }

  isHigherThan(other: Prioridad): boolean {
    return this.weight > other.weight;
  }

  isLowerThan(other: Prioridad): boolean {
    return this.weight < other.weight;
  }

  equals(other: Prioridad): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
