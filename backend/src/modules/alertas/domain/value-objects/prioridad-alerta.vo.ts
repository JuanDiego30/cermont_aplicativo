/**
 * Value Object: PrioridadAlerta
 *
 * Representa la prioridad de una alerta
 *
 * Jerarquía: CRITICAL > ERROR > WARNING > INFO
 *
 * @example
 * const prioridad = PrioridadAlerta.create('CRITICAL');
 * prioridad.esCritica(); // true
 * prioridad.getNivelUrgencia(); // 1
 */

import { ValidationError } from "../exceptions";
import { EnumValueObject } from "../../../../shared/base/enum-value-object";

export enum PrioridadAlertaEnum {
  CRITICAL = "CRITICAL", // Errores críticos, requiere acción inmediata
  ERROR = "ERROR", // Errores importantes
  WARNING = "WARNING", // Advertencias
  INFO = "INFO", // Información general
}

export class PrioridadAlerta extends EnumValueObject<PrioridadAlertaEnum> {
  private static readonly HIERARCHY = [
    PrioridadAlertaEnum.CRITICAL,
    PrioridadAlertaEnum.ERROR,
    PrioridadAlertaEnum.WARNING,
    PrioridadAlertaEnum.INFO,
  ];

  private constructor(value: PrioridadAlertaEnum) {
    super(value);
  }

  /**
   * Crear PrioridadAlerta validada
   * @throws {ValidationError} si la prioridad es inválida
   */
  public static create(value: string): PrioridadAlerta {
    if (
      !Object.values(PrioridadAlertaEnum).includes(value as PrioridadAlertaEnum)
    ) {
      throw new ValidationError(
        `Prioridad inválida. Prioridades permitidas: ${Object.values(PrioridadAlertaEnum).join(", ")}`,
        "prioridad",
        value,
      );
    }
    return new PrioridadAlerta(value as PrioridadAlertaEnum);
  }

  /**
   * Obtener nivel de urgencia (1=más urgente, 4=menos urgente)
   */
  public getNivelUrgencia(): number {
    return PrioridadAlerta.HIERARCHY.indexOf(this._value) + 1;
  }

  /**
   * Verificar si es más urgente que otra prioridad
   */
  public esMasUrgenteQue(other: PrioridadAlerta): boolean {
    return this.getNivelUrgencia() < other.getNivelUrgencia();
  }

  /**
   * Verificar si es crítica
   */
  public esCritica(): boolean {
    return this._value === PrioridadAlertaEnum.CRITICAL;
  }

  /**
   * Obtener color para UI
   */
  public getColor(): string {
    const colors = {
      [PrioridadAlertaEnum.CRITICAL]: "#FF0000", // Rojo
      [PrioridadAlertaEnum.ERROR]: "#FF6B6B", // Rojo claro
      [PrioridadAlertaEnum.WARNING]: "#FFA500", // Naranja
      [PrioridadAlertaEnum.INFO]: "#4CAF50", // Verde
    };
    return colors[this._value];
  }
}
