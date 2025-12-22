/**
 * Value Object: EstadoAlerta
 * 
 * Representa el estado de una alerta en su ciclo de vida
 * 
 * Estados:
 * - PENDIENTE: No enviada aún
 * - PROCESANDO: En cola de envío
 * - ENVIADA: Enviada exitosamente
 * - FALLIDA: Fallo en envío
 * - LEIDA: Usuario la leyó
 */

import { ValidationError } from '../exceptions';

export enum EstadoAlertaEnum {
  PENDIENTE = 'PENDIENTE',   // No enviada aún
  PROCESANDO = 'PROCESANDO', // En cola de envío
  ENVIADA = 'ENVIADA',       // Enviada exitosamente
  FALLIDA = 'FALLIDA',       // Fallo en envío
  LEIDA = 'LEIDA',           // Usuario la leyó
}

export class EstadoAlerta {
  private constructor(private readonly _value: EstadoAlertaEnum) {
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Crear EstadoAlerta validado
   * @throws {ValidationError} si el estado es inválido
   */
  public static create(value: string): EstadoAlerta {
    if (!Object.values(EstadoAlertaEnum).includes(value as EstadoAlertaEnum)) {
      throw new ValidationError(
        `Estado inválido. Estados permitidos: ${Object.values(EstadoAlertaEnum).join(', ')}`,
        'estado',
        value,
      );
    }
    return new EstadoAlerta(value as EstadoAlertaEnum);
  }

  /**
   * Factory methods para estados comunes
   */
  public static pendiente(): EstadoAlerta {
    return new EstadoAlerta(EstadoAlertaEnum.PENDIENTE);
  }

  public static procesando(): EstadoAlerta {
    return new EstadoAlerta(EstadoAlertaEnum.PROCESANDO);
  }

  public static enviada(): EstadoAlerta {
    return new EstadoAlerta(EstadoAlertaEnum.ENVIADA);
  }

  public static fallida(): EstadoAlerta {
    return new EstadoAlerta(EstadoAlertaEnum.FALLIDA);
  }

  public static leida(): EstadoAlerta {
    return new EstadoAlerta(EstadoAlertaEnum.LEIDA);
  }

  /**
   * Obtener el valor del estado
   */
  public getValue(): EstadoAlertaEnum {
    return this._value;
  }

  /**
   * Verificar si está pendiente de envío
   */
  public isPendiente(): boolean {
    return this._value === EstadoAlertaEnum.PENDIENTE;
  }

  /**
   * Verificar si está procesando
   */
  public isProcesando(): boolean {
    return this._value === EstadoAlertaEnum.PROCESANDO;
  }

  /**
   * Verificar si fue enviada exitosamente
   */
  public isEnviada(): boolean {
    return this._value === EstadoAlertaEnum.ENVIADA;
  }

  /**
   * Verificar si falló el envío
   */
  public isFallida(): boolean {
    return this._value === EstadoAlertaEnum.FALLIDA;
  }

  /**
   * Verificar si está leída
   */
  public isLeida(): boolean {
    return this._value === EstadoAlertaEnum.LEIDA;
  }

  /**
   * Verificar si puede ser marcada como leída
   */
  public puedeMarcarseComoLeida(): boolean {
    return this._value === EstadoAlertaEnum.ENVIADA;
  }

  /**
   * Comparación por valor
   */
  public equals(other: EstadoAlerta): boolean {
    if (!other || !(other instanceof EstadoAlerta)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * Representación en string
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Serialización JSON
   */
  public toJSON(): string {
    return this._value;
  }
}

