/**
 * ARCHIVO: index.ts
 * FUNCION: Barrel file para componentes del dashboard
 * IMPLEMENTACION: Re-exporta todos los componentes de visualización
 * DEPENDENCIAS: Componentes locales (CompletionTarget, DashboardMetrics, etc.)
 * EXPORTS: CompletionTarget, DashboardMetrics, MonthlyOrdersChart, RecentOrdersTable, StatisticsChart, StatsCard
 */
export * from './CompletionTarget';
export * from './DashboardMetrics';
export * from './MonthlyOrdersChart';
export * from './RecentOrdersTable';
export * from './StatisticsChart';
export * from './StatsCard';
