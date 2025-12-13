/**
 * @file financial-kpi-cards.tsx
 * @description Grupo de tarjetas KPI financieras
 * 
 * ✨ Server Component
 */

import { FinancialKPICard, FinancialKPICardSkeleton } from './financial-kpi-card';
import type { FinancialSummary } from '../api/financiero.types';

interface FinancialKPICardsProps {
  summary: FinancialSummary;
}

export function FinancialKPICards({ summary }: FinancialKPICardsProps) {
  const kpis = [
    {
      label: 'Ingresos Totales',
      value: summary.totalIngresos,
      trend: {
        value: summary.tendenciaIngresos,
        isPositive: summary.tendenciaIngresos > 0,
      },
      type: 'ingresos' as const,
    },
    {
      label: 'Egresos Totales',
      value: summary.totalEgresos,
      trend: {
        value: summary.tendenciaEgresos,
        isPositive: summary.tendenciaEgresos < 0, // Menos egresos es positivo
      },
      type: 'egresos' as const,
    },
    {
      label: 'Utilidad Neta',
      value: summary.totalUtilidad,
      trend: {
        value: summary.tendenciaUtilidad,
        isPositive: summary.tendenciaUtilidad > 0,
      },
      type: 'utilidad' as const,
    },
    {
      label: 'Margen Promedio',
      value: summary.promedioMargen,
      trend: {
        value: 0, // Estable
        isPositive: true,
      },
      type: 'margen' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <FinancialKPICard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}

// Skeleton
export function FinancialKPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <FinancialKPICardSkeleton key={i} />
      ))}
    </div>
  );
}
