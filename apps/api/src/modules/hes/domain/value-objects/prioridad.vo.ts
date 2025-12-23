/**
 * Value Object: Prioridad
 * 
 * Prioridad del servicio
 */

import { ValidationError } from '../../../../common/domain/exceptions';

export enum PrioridadEnum {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export class Prioridad {
  private constructor(private readonly _value: PrioridadEnum) {
    Object.freeze(this);
  }

  public static baja(): Prioridad {
    return new Prioridad(PrioridadEnum.BAJA);
  }

  public static media(): Prioridad {
    return new Prioridad(PrioridadEnum.MEDIA);
  }

  public static alta(): Prioridad {
    return new Prioridad(PrioridadEnum.ALTA);
  }

  public static urgente(): Prioridad {
    return new Prioridad(PrioridadEnum.URGENTE);
  }

  public static fromString(value: string): Prioridad {
    if (!value || value.trim() === '') {
      throw new ValidationError('Prioridad no puede estar vacía');
    }

    const upperValue = value.toUpperCase();
    const enumValue = PrioridadEnum[upperValue as keyof typeof PrioridadEnum];

    if (!enumValue) {
      throw new ValidationError(
        `Prioridad inválida: ${value}. Valores válidos: ${Object.values(PrioridadEnum).join(', ')}`
      );
    }

    return new Prioridad(enumValue);
  }

  public getValue(): PrioridadEnum {
    return this._value;
  }

  public getNivel(): number {
    switch (this._value) {
      case PrioridadEnum.BAJA:
        return 1;
      case PrioridadEnum.MEDIA:
        return 2;
      case PrioridadEnum.ALTA:
        return 3;
      case PrioridadEnum.URGENTE:
        return 4;
    }
  }

  public esUrgente(): boolean {
    return this._value === PrioridadEnum.URGENTE;
  }

  public requiereAtencionInmediata(): boolean {
    return this.esUrgente() || this._value === PrioridadEnum.ALTA;
  }

  public equals(other: Prioridad): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}

