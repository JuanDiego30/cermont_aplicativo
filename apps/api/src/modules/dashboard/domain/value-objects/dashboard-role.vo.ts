/**
 * @valueObject DashboardRole
 *
 * Representa el rol del usuario para el dashboard con permisos por KPI.
 */

import { ValidationError } from "../exceptions";
import { KpiTypeEnum } from "./kpi-type.vo";

export enum DashboardRoleEnum {
  ADMIN = "ADMIN",
  COORDINADOR = "COORDINADOR",
  TECNICO = "TECNICO",
  CLIENTE = "CLIENTE",
}

export class DashboardRole {
  private static readonly ROLE_KPI_PERMISSIONS: Record<
    DashboardRoleEnum,
    KpiTypeEnum[]
  > = {
    [DashboardRoleEnum.ADMIN]: [
      KpiTypeEnum.ORDENES_TOTALES,
      KpiTypeEnum.ORDENES_COMPLETADAS,
      KpiTypeEnum.ORDENES_PENDIENTES,
      KpiTypeEnum.ORDENES_VENCIDAS,
      KpiTypeEnum.COSTOS_TOTALES,
      KpiTypeEnum.COSTOS_POR_TIPO,
      KpiTypeEnum.RENTABILIDAD_PROMEDIO,
      KpiTypeEnum.USUARIOS_ACTIVOS,
      KpiTypeEnum.CHECKLISTS_COMPLETADOS,
      KpiTypeEnum.TIEMPO_PROMEDIO_ORDEN,
    ],
    [DashboardRoleEnum.COORDINADOR]: [
      KpiTypeEnum.ORDENES_TOTALES,
      KpiTypeEnum.ORDENES_COMPLETADAS,
      KpiTypeEnum.ORDENES_PENDIENTES,
      KpiTypeEnum.COSTOS_TOTALES,
      KpiTypeEnum.USUARIOS_ACTIVOS,
      KpiTypeEnum.CHECKLISTS_COMPLETADOS,
      KpiTypeEnum.TIEMPO_PROMEDIO_ORDEN,
    ],
    [DashboardRoleEnum.TECNICO]: [
      KpiTypeEnum.ORDENES_PENDIENTES,
      KpiTypeEnum.CHECKLISTS_COMPLETADOS,
    ],
    [DashboardRoleEnum.CLIENTE]: [KpiTypeEnum.ORDENES_COMPLETADAS],
  };

  private constructor(private readonly _value: DashboardRoleEnum) {
    Object.freeze(this);
  }

  /**
   * Crea un rol desde string
   */
  public static create(value: string): DashboardRole {
    const normalized = value.toUpperCase();
    if (
      !Object.values(DashboardRoleEnum).includes(
        normalized as DashboardRoleEnum,
      )
    ) {
      throw new ValidationError(
        `Invalid dashboard role: ${value}. Valid values: ${Object.values(DashboardRoleEnum).join(", ")}`,
        "dashboardRole",
      );
    }
    return new DashboardRole(normalized as DashboardRoleEnum);
  }

  /**
   * Obtiene el valor del rol
   */
  public getValue(): DashboardRoleEnum {
    return this._value;
  }

  /**
   * Obtiene los KPIs autorizados para este rol
   */
  public getAuthorizedKpis(): KpiTypeEnum[] {
    return DashboardRole.ROLE_KPI_PERMISSIONS[this._value] || [];
  }

  /**
   * Verifica si el rol puede ver un KPI específico
   */
  public canViewKpi(kpiType: KpiTypeEnum): boolean {
    return this.getAuthorizedKpis().includes(kpiType);
  }

  /**
   * Compara con otro rol
   */
  public equals(other: DashboardRole): boolean {
    if (!other || !(other instanceof DashboardRole)) {
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
