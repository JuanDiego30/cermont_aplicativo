/**
 * @interfaces KPI Response
 * 
 * Interfaces para métricas y KPIs del dashboard.
 * Uso: Supervisores visualizan estado operativo en tiempo real.
 */

export interface IKpiOverview {
    /** Total de órdenes en el sistema */
    ordenes_totales: number;

    /** Órdenes completadas */
    ordenes_completadas: number;

    /** Órdenes en progreso */
    ordenes_en_progreso: number;

    /** Órdenes en planeación */
    ordenes_en_planeacion: number;

    /** Tasa de cumplimiento (%) */
    tasa_cumplimiento: number;

    /** Tiempo promedio de ciclo (horas) */
    tiempo_promedio_ciclo: number;

    /** Promedio de días para completar */
    promedio_dias_completar: number;
}

export interface IKpiCostos {
    /** Presupuesto total estimado */
    presupuestado_total: number;

    /** Costo real total */
    costo_real_total: number;

    /** Desviación porcentual (positivo = sobre presupuesto) */
    desviacion_porcentaje: number;

    /** Total de impuestos aplicados */
    impuestos_total: number;

    /** Margen de utilidad (%) */
    margen_utilidad: number;

    /** Facturado total */
    facturado_total: number;

    /** Pendiente por facturar */
    pendiente_facturar: number;
}

export interface IKpiTecnicos {
    /** Técnicos activos */
    tecnicos_activos: number;

    /** Técnicos con órdenes asignadas */
    tecnicos_ocupados: number;

    /** Promedio de órdenes por técnico */
    promedio_ordenes_por_tecnico: number;

    /** Técnico con más órdenes completadas */
    top_tecnico?: {
        id: string;
        nombre: string;
        ordenes_completadas: number;
    };
}

export type AlertaSeveridad = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type AlertaTipo = 
    | 'SOBRECOSTO' 
    | 'RETRASO' 
    | 'INCUMPLIMIENTO' 
    | 'CUELLO_BOTELLA'
    | 'VENCIMIENTO_PROXIMO';

export interface IAlerta {
    /** Tipo de alerta */
    tipo: AlertaTipo;

    /** ID de la entidad afectada (orden, usuario, etc.) */
    entidad_id: string;

    /** Tipo de entidad */
    entidad_tipo: 'ORDEN' | 'USUARIO' | 'GLOBAL';

    /** Mensaje descriptivo */
    mensaje: string;

    /** Severidad de la alerta */
    severidad: AlertaSeveridad;

    /** Datos adicionales */
    metadata?: Record<string, unknown>;

    /** Timestamp de generación */
    timestamp: Date;
}

export interface IKpiMetrics {
    /** Métricas de overview */
    overview: IKpiOverview;

    /** Métricas de costos */
    costos: IKpiCostos;

    /** Métricas de técnicos */
    tecnicos: IKpiTecnicos;

    /** Alertas activas */
    alertas: IAlerta[];

    /** Timestamp de cálculo */
    timestamp: Date;

    /** Período de datos */
    periodo?: {
        desde: Date;
        hasta: Date;
    };
}

export interface ITendencia {
    /** Fecha del punto de datos */
    fecha: string;

    /** Valor del KPI */
    valor: number;

    /** Comparación con período anterior (%) */
    variacion?: number;
}

export interface IKpiTendencias {
    /** Tendencia de órdenes completadas */
    ordenes_completadas: ITendencia[];

    /** Tendencia de costos */
    costos: ITendencia[];

    /** Tendencia de tiempo de ciclo */
    tiempo_ciclo: ITendencia[];

    /** Período de los datos */
    periodo: {
        desde: Date;
        hasta: Date;
        granularidad: 'DIA' | 'SEMANA' | 'MES';
    };
}

export interface ICostoDesglosado {
    /** ID de la orden */
    orden_id: string;

    /** Número de la orden */
    numero_orden: string;

    /** Cliente */
    cliente: string;

    /** Presupuesto estimado */
    presupuesto: number;

    /** Costo real */
    costo_real: number;

    /** Desglose por tipo */
    desglose: {
        mano_obra: number;
        materiales: number;
        equipos: number;
        transporte: number;
        otros: number;
    };

    /** Desviación */
    desviacion: number;

    /** Estado */
    estado: string;
}
