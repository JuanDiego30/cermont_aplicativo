/**
 * @file page.tsx
 * @description Página de Reportes Financieros - Refactorizada con Server Components
 * 
 * ✨ Server Component - Fetch de datos en el servidor
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import {
  FinancialKPICards,
  FinancialKPICardsSkeleton,
  FinancialChart,
  FinancialChartSkeleton,
  FinancialTable,
  FinancialTableSkeleton,
  calculateMargin,
} from '@/features/reportes-financieros';
import type { FinancialData, FinancialSummary, PeriodoTipo } from '@/features/reportes-financieros';
import { ReportesFinancierosClient } from './client';

// Mock data - Será reemplazado por fetch al backend
const mockData: FinancialData[] = [
  { periodo: 'Enero 2024', periodoKey: '2024-01', ingresos: 45000000, egresos: 32000000, utilidad: 13000000, margen: 28.9, fecha: '2024-01-01' },
  { periodo: 'Febrero 2024', periodoKey: '2024-02', ingresos: 52000000, egresos: 35000000, utilidad: 17000000, margen: 32.7, fecha: '2024-02-01' },
  { periodo: 'Marzo 2024', periodoKey: '2024-03', ingresos: 48000000, egresos: 33500000, utilidad: 14500000, margen: 30.2, fecha: '2024-03-01' },
  { periodo: 'Abril 2024', periodoKey: '2024-04', ingresos: 61000000, egresos: 41000000, utilidad: 20000000, margen: 32.8, fecha: '2024-04-01' },
  { periodo: 'Mayo 2024', periodoKey: '2024-05', ingresos: 55000000, egresos: 38000000, utilidad: 17000000, margen: 30.9, fecha: '2024-05-01' },
  { periodo: 'Junio 2024', periodoKey: '2024-06', ingresos: 67000000, egresos: 45000000, utilidad: 22000000, margen: 32.8, fecha: '2024-06-01' },
];

interface PageProps {
  searchParams: Promise<{
    periodo?: PeriodoTipo;
  }>;
}

// Función para calcular resumen
function calculateSummary(data: FinancialData[]): FinancialSummary {
  const totalIngresos = data.reduce((acc, item) => acc + item.ingresos, 0);
  const totalEgresos = data.reduce((acc, item) => acc + item.egresos, 0);
  const totalUtilidad = data.reduce((acc, item) => acc + item.utilidad, 0);
  const promedioMargen = data.reduce((acc, item) => acc + item.margen, 0) / data.length;

  // Calcular tendencias (comparando con período anterior)
  const tendenciaIngresos = 12.5; // Placeholder
  const tendenciaEgresos = 8.2;
  const tendenciaUtilidad = 18.3;

  return {
    totalIngresos,
    totalEgresos,
    totalUtilidad,
    promedioMargen,
    tendenciaIngresos,
    tendenciaEgresos,
    tendenciaUtilidad,
  };
}

// Función para obtener datos según período
async function getFinancialData(periodo: PeriodoTipo): Promise<{
  data: FinancialData[];
  summary: FinancialSummary;
}> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${API_URL}/reportes/financieros?periodo=${periodo}`, {
      cache: 'no-store',
      next: { revalidate: 60, tags: ['reportes-financieros'] },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch financial data');
    }

    const result = await response.json();
    return {
      data: result.data || [],
      summary: result.summary || calculateSummary([]),
    };
  } catch (error) {
    console.error('Error fetching financial data:', error);
    
    // Fallback to mock data if API fails
    let filteredData = [...mockData];

    switch (periodo) {
      case '1m':
        filteredData = mockData.slice(-1);
        break;
      case '3m':
        filteredData = mockData.slice(-3);
        break;
      case '6m':
        filteredData = mockData.slice(-6);
        break;
      case '1y':
      default:
        filteredData = mockData;
    }

    return {
      data: filteredData,
      summary: calculateSummary(filteredData),
    };
  }
}

export default async function ReportesFinancierosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const periodo = params.periodo || '6m';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/reportes"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              💰 Reportes Financieros
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Análisis de ingresos, egresos y rentabilidad
            </p>
          </div>
        </div>
        <ReportesFinancierosClient initialPeriodo={periodo} />
      </div>

      {/* KPI Cards */}
      <Suspense fallback={<FinancialKPICardsSkeleton />}>
        <FinancialKPICardsAsync periodo={periodo} />
      </Suspense>

      {/* Chart */}
      <Suspense fallback={<FinancialChartSkeleton />}>
        <FinancialChartAsync periodo={periodo} />
      </Suspense>

      {/* Table */}
      <Suspense fallback={<FinancialTableSkeleton />}>
        <FinancialTableAsync periodo={periodo} />
      </Suspense>
    </div>
  );
}

// Server Component para KPIs
async function FinancialKPICardsAsync({ periodo }: { periodo: PeriodoTipo }) {
  const { summary } = await getFinancialData(periodo);
  return <FinancialKPICards summary={summary} />;
}

// Server Component para Chart
async function FinancialChartAsync({ periodo }: { periodo: PeriodoTipo }) {
  const { data } = await getFinancialData(periodo);
  return <FinancialChart data={data} />;
}

// Server Component para Table
async function FinancialTableAsync({ periodo }: { periodo: PeriodoTipo }) {
  const { data, summary } = await getFinancialData(periodo);
  return <FinancialTable data={data} summary={summary} />;
}

// Metadata para SEO
export async function generateMetadata() {
  return {
    title: 'Reportes Financieros | Cermont SAS',
    description: 'Análisis de ingresos, egresos y rentabilidad de Cermont SAS',
  };
}
