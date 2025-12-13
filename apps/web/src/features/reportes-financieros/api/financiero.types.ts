/**
 * @file financiero.types.ts
 * @description Tipos TypeScript para el feature de Reportes Financieros
 */

// Período de tiempo
export type PeriodoTipo = '1m' | '3m' | '6m' | '1y' | 'custom';

// Datos financieros por período
export interface FinancialData {
  periodo: string;
  periodoKey: string;
  ingresos: number;
  egresos: number;
  utilidad: number;
  margen: number;
  fecha: string;
}

// KPI Summary
export interface FinancialKPI {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
  icon: 'ingresos' | 'egresos' | 'utilidad' | 'margen';
  color: 'emerald' | 'red' | 'blue' | 'purple';
}

// Resumen financiero
export interface FinancialSummary {
  totalIngresos: number;
  totalEgresos: number;
  totalUtilidad: number;
  promedioMargen: number;
  tendenciaIngresos: number;
  tendenciaEgresos: number;
  tendenciaUtilidad: number;
}

// Parámetros de filtro
export interface FinancialFilters {
  periodo: PeriodoTipo;
  fechaInicio?: string;
  fechaFin?: string;
  categoria?: string;
}

// Respuesta de la API
export interface FinancialResponse {
  data: FinancialData[];
  summary: FinancialSummary;
  periodo: PeriodoTipo;
  fechaGeneracion: string;
}

// Datos para gráficos
export interface ChartDataPoint {
  name: string;
  ingresos: number;
  egresos: number;
  utilidad: number;
}

// Configuración de exportación
export interface ExportConfig {
  formato: 'pdf' | 'excel' | 'csv';
  incluirGraficos: boolean;
  incluirDetalle: boolean;
}
