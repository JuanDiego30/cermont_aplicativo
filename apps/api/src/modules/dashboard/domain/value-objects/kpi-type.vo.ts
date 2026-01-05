/**
 * @valueObject KpiType
 *
 * Representa el tipo de KPI con metadata y configuración.
 */

import { ValidationError } from "../exceptions";
import { DashboardRoleEnum } from "./dashboard-role.vo";

export enum KpiTypeEnum {
  ORDENES_TOTALES = "ORDENES_TOTALES",
  ORDENES_COMPLETADAS = "ORDENES_COMPLETADAS",
  ORDENES_PENDIENTES = "ORDENES_PENDIENTES",
  ORDENES_VENCIDAS = "ORDENES_VENCIDAS",
  COSTOS_TOTALES = "COSTOS_TOTALES",
  COSTOS_POR_TIPO = "COSTOS_POR_TIPO",
  RENTABILIDAD_PROMEDIO = "RENTABILIDAD_PROMEDIO",
  USUARIOS_ACTIVOS = "USUARIOS_ACTIVOS",
  CHECKLISTS_COMPLETADOS = "CHECKLISTS_COMPLETADOS",
  TIEMPO_PROMEDIO_ORDEN = "TIEMPO_PROMEDIO_ORDEN",
}

export class KpiType {
  private static readonly KPI_METADATA: Record<
    KpiTypeEnum,
    {
      label: string;
      requiresRole: DashboardRoleEnum[];
      cacheTTL: number;
      unit: string;
    }
  > = {
    [KpiTypeEnum.ORDENES_TOTALES]: {
      label: "Órdenes Totales",
      requiresRole: [DashboardRoleEnum.ADMIN, DashboardRoleEnum.COORDINADOR],
      cacheTTL: 300, // 5 minutos
      unit: "count",
    },
    [KpiTypeEnum.ORDENES_COMPLETADAS]: {
      label: "Órdenes Completadas",
      requiresRole: [
        DashboardRoleEnum.ADMIN,
        DashboardRoleEnum.COORDINADOR,
        DashboardRoleEnum.CLIENTE,
      ],
      cacheTTL: 300,
      unit: "count",
    },
    [KpiTypeEnum.ORDENES_PENDIENTES]: {
      label: "Órdenes Pendientes",
      requiresRole: [
        DashboardRoleEnum.ADMIN,
        DashboardRoleEnum.COORDINADOR,
        DashboardRoleEnum.TECNICO,
      ],
      cacheTTL: 180, // 3 minutos (más dinámico)
      unit: "count",
    },
    [KpiTypeEnum.ORDENES_VENCIDAS]: {
      label: "Órdenes Vencidas",
      requiresRole: [DashboardRoleEnum.ADMIN, DashboardRoleEnum.COORDINADOR],
      cacheTTL: 180,
      unit: "count",
    },
    [KpiTypeEnum.COSTOS_TOTALES]: {
      label: "Costos Totales",
      requiresRole: [DashboardRoleEnum.ADMIN, DashboardRoleEnum.COORDINADOR],
      cacheTTL: 600, // 10 minutos
      unit: "money",
    },
    [KpiTypeEnum.COSTOS_POR_TIPO]: {
      label: "Costos por Tipo",
      requiresRole: [DashboardRoleEnum.ADMIN, DashboardRoleEnum.COORDINADOR],
      cacheTTL: 600,
      unit: "money",
    },
    [KpiTypeEnum.RENTABILIDAD_PROMEDIO]: {
      label: "Rentabilidad Promedio",
      requiresRole: [DashboardRoleEnum.ADMIN],
      cacheTTL: 600,
      unit: "percentage",
    },
    [KpiTypeEnum.USUARIOS_ACTIVOS]: {
      label: "Usuarios Activos",
      requiresRole: [DashboardRoleEnum.ADMIN, DashboardRoleEnum.COORDINADOR],
      cacheTTL: 900, // 15 minutos
      unit: "count",
    },
    [KpiTypeEnum.CHECKLISTS_COMPLETADOS]: {
      label: "Checklists Completados",
      requiresRole: [
        DashboardRoleEnum.ADMIN,
        DashboardRoleEnum.COORDINADOR,
        DashboardRoleEnum.TECNICO,
      ],
      cacheTTL: 300,
      unit: "count",
    },
    [KpiTypeEnum.TIEMPO_PROMEDIO_ORDEN]: {
      label: "Tiempo Promedio por Orden",
      requiresRole: [DashboardRoleEnum.ADMIN, DashboardRoleEnum.COORDINADOR],
      cacheTTL: 600,
      unit: "hours",
    },
  };

  private constructor(private readonly _value: KpiTypeEnum) {
    Object.freeze(this);
  }

  /**
   * Crea un tipo de KPI desde string
   */
  public static create(value: string): KpiType {
    const normalized = value.toUpperCase();
    if (!Object.values(KpiTypeEnum).includes(normalized as KpiTypeEnum)) {
      throw new ValidationError(
        `Invalid KPI type: ${value}. Valid values: ${Object.values(KpiTypeEnum).join(", ")}`,
        "kpiType",
      );
    }
    return new KpiType(normalized as KpiTypeEnum);
  }

  /**
   * Obtiene el valor del tipo
   */
  public getValue(): KpiTypeEnum {
    return this._value;
  }

  /**
   * Obtiene la etiqueta del KPI
   */
  public getLabel(): string {
    return KpiType.KPI_METADATA[this._value].label;
  }

  /**
   * Verifica si un rol puede ver este KPI
   */
  public requiresRole(role: DashboardRoleEnum): boolean {
    const metadata = KpiType.KPI_METADATA[this._value];
    return metadata.requiresRole.includes(role);
  }

  /**
   * Obtiene la clave de cache para este KPI
   */
  public getCacheKey(period: string): string {
    return `dashboard:kpi:${this._value}:${period}`;
  }

  /**
   * Obtiene el TTL de cache en segundos
   */
  public getTTL(): number {
    return KpiType.KPI_METADATA[this._value].cacheTTL;
  }

  /**
   * Obtiene la unidad del KPI
   */
  public getUnit(): string {
    return KpiType.KPI_METADATA[this._value].unit;
  }

  /**
   * Compara con otro tipo
   */
  public equals(other: KpiType): boolean {
    if (!other || !(other instanceof KpiType)) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * Serialización JSON
   */
  public toJSON(): string {
    return this._value;
  }

  /**
   * Representación string
   */
  public toString(): string {
    return this._value;
  }
}
