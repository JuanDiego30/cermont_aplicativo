/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel file - API pública del feature reportes-financieros
 * IMPLEMENTACION: Re-exporta tipos, API client, hooks, componentes y utilidades
 * DEPENDENCIAS: Todos los módulos internos del feature
 * EXPORTS: financieroApi, hooks (useFinancialData, useFinancialSummary), componentes KPI y utilidades
 */
// API & Types
export * from './api/financiero.types';
export { financieroApi } from './api/financiero.api';

// Hooks
export { useFinancialData, useFinancialSummary } from './hooks/use-financial-data';

// Components
export { FinancialKPICard, FinancialKPICardSkeleton } from './components/financial-kpi-card';
export { FinancialKPICards, FinancialKPICardsSkeleton } from './components/financial-kpi-cards';
export { FinancialChart, FinancialChartSkeleton } from './components/financial-chart';
export { FinancialTable, FinancialTableSkeleton } from './components/financial-table';
export { PeriodSelector } from './components/period-selector';

// Utils
export * from './utils/currency.utils';
