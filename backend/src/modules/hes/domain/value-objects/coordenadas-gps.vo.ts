/**
 * Value Object: CoordenadasGPS
 *
 * Coordenadas geográficas (latitud, longitud)
 */

import { ValidationError } from '../../../../shared/domain/exceptions';

export class CoordenadasGPS {
  private constructor(
    private readonly _latitud: number,
    private readonly _longitud: number
  ) {
    Object.freeze(this);
  }

  public static create(latitud: number, longitud: number): CoordenadasGPS {
    CoordenadasGPS.validate(latitud, longitud);
    return new CoordenadasGPS(latitud, longitud);
  }

  private static validate(latitud: number, longitud: number): void {
    if (isNaN(latitud) || isNaN(longitud)) {
      throw new ValidationError('Latitud y longitud deben ser números válidos');
    }

    if (latitud < -90 || latitud > 90) {
      throw new ValidationError(`Latitud inválida: ${latitud}. Debe estar entre -90 y 90`);
    }

    if (longitud < -180 || longitud > 180) {
      throw new ValidationError(`Longitud inválida: ${longitud}. Debe estar entre -180 y 180`);
    }
  }

  public getLatitud(): number {
    return this._latitud;
  }

  public getLongitud(): number {
    return this._longitud;
  }

  public toJSON(): { lat: number; lon: number } {
    return {
      lat: this._latitud,
      lon: this._longitud,
    };
  }

  public toString(): string {
    return `${this._latitud},${this._longitud}`;
  }

  public equals(other: CoordenadasGPS): boolean {
    return (
      Math.abs(this._latitud - other._latitud) < 0.0001 &&
      Math.abs(this._longitud - other._longitud) < 0.0001
    );
  }
}
