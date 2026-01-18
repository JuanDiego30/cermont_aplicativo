/**
 * @valueObject TimePeriod
 *
 * Representa un período temporal con validación y métodos de comparación.
 *
 * Invariantes:
 * - StartDate <= EndDate
 * - No más de 1 año de rango (performance)
 * - Fechas no en futuro (excepto para períodos custom)
 */

import { ValidationError } from '../exceptions';

export enum TimePeriodType {
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

export class TimePeriod {
  private static readonly MAX_DURATION_DAYS = 365;

  private constructor(
    private readonly _startDate: Date,
    private readonly _endDate: Date,
    private readonly _type: TimePeriodType
  ) {
    this.validate();
    Object.freeze(this);
  }

  /**
   * Crea un período para hoy
   */
  public static today(): TimePeriod {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return new TimePeriod(start, end, TimePeriodType.TODAY);
  }

  /**
   * Crea un período para esta semana
   */
  public static week(): TimePeriod {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return new TimePeriod(start, end, TimePeriodType.WEEK);
  }

  /**
   * Crea un período para este mes
   */
  public static month(): TimePeriod {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return new TimePeriod(start, end, TimePeriodType.MONTH);
  }

  /**
   * Crea un período para este trimestre
   */
  public static quarter(): TimePeriod {
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);
    const start = new Date(today.getFullYear(), quarter * 3, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today.getFullYear(), (quarter + 1) * 3, 0);
    end.setHours(23, 59, 59, 999);
    return new TimePeriod(start, end, TimePeriodType.QUARTER);
  }

  /**
   * Crea un período para este año
   */
  public static year(): TimePeriod {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today.getFullYear(), 11, 31);
    end.setHours(23, 59, 59, 999);
    return new TimePeriod(start, end, TimePeriodType.YEAR);
  }

  /**
   * Crea un período custom
   */
  public static custom(startDate: Date, endDate: Date): TimePeriod {
    return new TimePeriod(startDate, endDate, TimePeriodType.CUSTOM);
  }

  /**
   * Crea desde string (ISO format)
   */
  public static fromISO(startISO: string, endISO: string): TimePeriod {
    const start = new Date(startISO);
    const end = new Date(endISO);
    return TimePeriod.custom(start, end);
  }

  /**
   * Obtiene la fecha de inicio
   */
  public getStartDate(): Date {
    return new Date(this._startDate);
  }

  /**
   * Obtiene la fecha de fin
   */
  public getEndDate(): Date {
    return new Date(this._endDate);
  }

  /**
   * Obtiene el tipo de período
   */
  public getType(): TimePeriodType {
    return this._type;
  }

  /**
   * Calcula la duración en días
   */
  public getDurationInDays(): number {
    const diffTime = Math.abs(this._endDate.getTime() - this._startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir ambos días
  }

  /**
   * Obtiene el período anterior equivalente
   */
  public getPreviousPeriod(): TimePeriod {
    const duration = this.getDurationInDays();
    const start = new Date(this._startDate);
    start.setDate(start.getDate() - duration);
    const end = new Date(this._endDate);
    end.setDate(end.getDate() - duration);
    return new TimePeriod(start, end, this._type);
  }

  /**
   * Verifica si una fecha está contenida en el período
   */
  public contains(date: Date): boolean {
    return date >= this._startDate && date <= this._endDate;
  }

  /**
   * Verifica si se solapa con otro período
   */
  public overlaps(other: TimePeriod): boolean {
    return (
      this.contains(other._startDate) ||
      this.contains(other._endDate) ||
      other.contains(this._startDate) ||
      other.contains(this._endDate)
    );
  }

  /**
   * Compara con otro período
   */
  public equals(other: TimePeriod): boolean {
    if (!other || !(other instanceof TimePeriod)) {
      return false;
    }
    return (
      this._startDate.getTime() === other._startDate.getTime() &&
      this._endDate.getTime() === other._endDate.getTime() &&
      this._type === other._type
    );
  }

  /**
   * Serialización JSON
   */
  public toJSON(): any {
    return {
      startDate: this._startDate.toISOString(),
      endDate: this._endDate.toISOString(),
      type: this._type,
      durationInDays: this.getDurationInDays(),
    };
  }

  /**
   * Representación string
   */
  public toString(): string {
    return `${this._startDate.toISOString().split('T')[0]} to ${this._endDate.toISOString().split('T')[0]}`;
  }

  /**
   * Validación de invariantes
   */
  private validate(): void {
    if (this._startDate > this._endDate) {
      throw new ValidationError('Start date must be before or equal to end date', 'timePeriod');
    }

    const duration = this.getDurationInDays();
    if (duration > TimePeriod.MAX_DURATION_DAYS) {
      throw new ValidationError(
        `Period duration cannot exceed ${TimePeriod.MAX_DURATION_DAYS} days`,
        'timePeriod'
      );
    }

    // Validar que no esté en el futuro (excepto custom)
    const now = new Date();
    if (this._type !== TimePeriodType.CUSTOM && this._startDate > now) {
      throw new ValidationError('Period cannot start in the future', 'timePeriod');
    }
  }
}
