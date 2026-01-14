/**
 * Value Object: TipoAlerta
 *
 * Representa el tipo de alerta en el sistema
 *
 * Tipos disponibles:
 * - ORDEN_CREADA, ORDEN_ASIGNADA, ORDEN_COMPLETADA, ORDEN_CANCELADA
 * - MANTENIMIENTO_PROGRAMADO, MANTENIMIENTO_COMPLETADO
 * - TAREA_VENCIDA
 * - USUARIO_CREADO, ROL_CAMBIADO
 * - SISTEMA_ERROR, SISTEMA_WARNING
 */

import { ValidationError } from "../exceptions";
import { EnumValueObject } from "../../../../shared/base/enum-value-object";

export enum TipoAlertaEnum {
  ORDEN_CREADA = "ORDEN_CREADA",
  ORDEN_ASIGNADA = "ORDEN_ASIGNADA",
  ORDEN_COMPLETADA = "ORDEN_COMPLETADA",
  ORDEN_CANCELADA = "ORDEN_CANCELADA",
  MANTENIMIENTO_PROGRAMADO = "MANTENIMIENTO_PROGRAMADO",
  MANTENIMIENTO_COMPLETADO = "MANTENIMIENTO_COMPLETADO",
  TAREA_VENCIDA = "TAREA_VENCIDA",
  USUARIO_CREADO = "USUARIO_CREADO",
  ROL_CAMBIADO = "ROL_CAMBIADO",
  SISTEMA_ERROR = "SISTEMA_ERROR",
  SISTEMA_WARNING = "SISTEMA_WARNING",
  // Tipos legacy (compatibilidad)
  ACTA_SIN_FIRMAR = "ACTA_SIN_FIRMAR",
  SES_PENDIENTE = "SES_PENDIENTE",
  FACTURA_VENCIDA = "FACTURA_VENCIDA",
  RECURSO_FALTANTE = "RECURSO_FALTANTE",
  CERTIFICACION_VENCIDA = "CERTIFICACION_VENCIDA",
  RETRASO_CRONOGRAMA = "RETRASO_CRONOGRAMA",
  PROPUESTA_SIN_RESPUESTA = "PROPUESTA_SIN_RESPUESTA",
}

export class TipoAlerta extends EnumValueObject<TipoAlertaEnum> {
  private constructor(value: TipoAlertaEnum) {
    super(value);
  }

  /**
   * Crear TipoAlerta validado
   * @throws {ValidationError} si el tipo es inválido
   */
  public static create(value: string): TipoAlerta {
    if (!Object.values(TipoAlertaEnum).includes(value as TipoAlertaEnum)) {
      throw new ValidationError(
        `Tipo de alerta inválido. Tipos permitidos: ${Object.values(TipoAlertaEnum).join(", ")}`,
        "tipoAlerta",
        value,
      );
    }
    return new TipoAlerta(value as TipoAlertaEnum);
  }

  /**
   * Obtener el valor del tipo
   */
  public getCategoria():
    | "ORDEN"
    | "MANTENIMIENTO"
    | "USUARIO"
    | "SISTEMA"
    | "LEGACY" {
    if (this._value.startsWith("ORDEN_")) return "ORDEN";
    if (this._value.startsWith("MANTENIMIENTO_")) return "MANTENIMIENTO";
    if (this._value.startsWith("USUARIO_") || this._value.includes("ROL"))
      return "USUARIO";
    if (this._value.startsWith("SISTEMA_")) return "SISTEMA";
    return "LEGACY";
  }

  /**
   * Verificar si requiere acción inmediata
   */
  public requiereAccionInmediata(): boolean {
    const tiposUrgentes = [
      TipoAlertaEnum.SISTEMA_ERROR,
      TipoAlertaEnum.TAREA_VENCIDA,
      TipoAlertaEnum.FACTURA_VENCIDA,
    ];
    return tiposUrgentes.includes(this._value);
  }
}
