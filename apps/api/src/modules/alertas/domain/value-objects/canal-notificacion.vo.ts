/**
 * Value Object: CanalNotificacion
 * 
 * Representa un canal de envío de notificaciones
 * 
 * Canales disponibles:
 * - EMAIL: Notificaciones por correo electrónico
 * - PUSH: Notificaciones push (Firebase)
 * - SMS: Notificaciones por SMS (Twilio)
 * - IN_APP: Notificaciones en la aplicación (tiempo real)
 */

import { ValidationError } from '../exceptions';

export enum CanalNotificacionEnum {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
}

export class CanalNotificacion {
  private constructor(private readonly _value: CanalNotificacionEnum) {
    Object.freeze(this); // Inmutabilidad
  }

  /**
   * Crear CanalNotificacion validado
   * @throws {ValidationError} si el canal es inválido
   */
  public static create(value: string): CanalNotificacion {
    if (!Object.values(CanalNotificacionEnum).includes(value as CanalNotificacionEnum)) {
      throw new ValidationError(
        `Canal inválido. Canales permitidos: ${Object.values(CanalNotificacionEnum).join(', ')}`,
        'canal',
        value,
      );
    }
    return new CanalNotificacion(value as CanalNotificacionEnum);
  }

  /**
   * Crear múltiples canales desde array de strings
   */
  public static createMultiple(values: string[]): CanalNotificacion[] {
    return values.map((v) => this.create(v));
  }

  /**
   * Obtener el valor del canal
   */
  public getValue(): CanalNotificacionEnum {
    return this._value;
  }

  /**
   * Verificar si requiere servicio externo (email, push, SMS)
   */
  public requiresExternalService(): boolean {
    return [
      CanalNotificacionEnum.EMAIL,
      CanalNotificacionEnum.PUSH,
      CanalNotificacionEnum.SMS,
    ].includes(this._value);
  }

  /**
   * Verificar si es en tiempo real
   */
  public isRealTime(): boolean {
    return [
      CanalNotificacionEnum.IN_APP,
      CanalNotificacionEnum.PUSH,
    ].includes(this._value);
  }

  /**
   * Obtener tiempo estimado de entrega (en segundos)
   */
  public getTiempoEstimadoEntrega(): number {
    const tiempos = {
      [CanalNotificacionEnum.EMAIL]: 60,    // 1 minuto
      [CanalNotificacionEnum.PUSH]: 5,      // 5 segundos
      [CanalNotificacionEnum.SMS]: 30,      // 30 segundos
      [CanalNotificacionEnum.IN_APP]: 1,    // Instantáneo
    };
    return tiempos[this._value];
  }

  /**
   * Comparación por valor
   */
  public equals(other: CanalNotificacion): boolean {
    if (!other || !(other instanceof CanalNotificacion)) {
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

