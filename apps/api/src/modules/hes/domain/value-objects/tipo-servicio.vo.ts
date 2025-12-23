/**
 * Value Object: TipoServicio
 * 
 * Tipo de servicio a realizar
 */

import { ValidationError } from '../../../../common/domain/exceptions';

export enum TipoServicioEnum {
  MANTENIMIENTO_PREVENTIVO = 'MANTENIMIENTO_PREVENTIVO',
  MANTENIMIENTO_CORRECTIVO = 'MANTENIMIENTO_CORRECTIVO',
  REPARACION = 'REPARACION',
  INSTALACION = 'INSTALACION',
  INSPECCION = 'INSPECCION',
  DIAGNOSTICO = 'DIAGNOSTICO',
  GARANTIA = 'GARANTIA',
}

export class TipoServicio {
  private constructor(private readonly _value: TipoServicioEnum) {
    Object.freeze(this);
  }

  public static mantenimientoPreventivo(): TipoServicio {
    return new TipoServicio(TipoServicioEnum.MANTENIMIENTO_PREVENTIVO);
  }

  public static mantenimientoCorrectivo(): TipoServicio {
    return new TipoServicio(TipoServicioEnum.MANTENIMIENTO_CORRECTIVO);
  }

  public static reparacion(): TipoServicio {
    return new TipoServicio(TipoServicioEnum.REPARACION);
  }

  public static instalacion(): TipoServicio {
    return new TipoServicio(TipoServicioEnum.INSTALACION);
  }

  public static inspeccion(): TipoServicio {
    return new TipoServicio(TipoServicioEnum.INSPECCION);
  }

  public static diagnostico(): TipoServicio {
    return new TipoServicio(TipoServicioEnum.DIAGNOSTICO);
  }

  public static garantia(): TipoServicio {
    return new TipoServicio(TipoServicioEnum.GARANTIA);
  }

  public static fromString(value: string): TipoServicio {
    if (!value || value.trim() === '') {
      throw new ValidationError('Tipo de servicio no puede estar vacío');
    }

    const upperValue = value.toUpperCase().replace(/\s+/g, '_');
    const enumValue = TipoServicioEnum[upperValue as keyof typeof TipoServicioEnum];

    if (!enumValue) {
      throw new ValidationError(
        `Tipo de servicio inválido: ${value}. Valores válidos: ${Object.values(TipoServicioEnum).join(', ')}`
      );
    }

    return new TipoServicio(enumValue);
  }

  public getValue(): TipoServicioEnum {
    return this._value;
  }

  public requiereInspeccionDetallada(): boolean {
    return [
      TipoServicioEnum.INSTALACION,
      TipoServicioEnum.REPARACION,
      TipoServicioEnum.INSPECCION,
    ].includes(this._value);
  }

  public requiereFotosEntrada(): boolean {
    return [
      TipoServicioEnum.REPARACION,
      TipoServicioEnum.MANTENIMIENTO_CORRECTIVO,
      TipoServicioEnum.GARANTIA,
    ].includes(this._value);
  }

  public requiereDiagnostico(): boolean {
    return [
      TipoServicioEnum.REPARACION,
      TipoServicioEnum.DIAGNOSTICO,
      TipoServicioEnum.MANTENIMIENTO_CORRECTIVO,
    ].includes(this._value);
  }

  public equals(other: TipoServicio): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value.replace(/_/g, ' ');
  }
}

